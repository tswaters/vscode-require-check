

import * as esprima from 'esprima'
import * as walk from 'esprima-walk'
import {Position, Range} from 'vscode-languageserver';

export interface ModuleReference {
  name: string,
  range: Range
}

export default function (contents: string): ModuleReference[] {

  const requires: ModuleReference[] = []
  let parsed = null

  try { parsed = esprima.parse(contents, {range: true, loc: true, sourceType: 'script'})}
  catch (e) { }

  try { parsed = esprima.parse(contents, {range: true, loc: true, sourceType: 'module'})}
  catch (e) { }

  if (!parsed) { return requires }

  walk(parsed, (node) => {

    if (node.type === 'CallExpression') {
      let nodeType = <ESTree.CallExpression>node
      let identifier = <ESTree.Identifier>nodeType.callee
      let argument = <ESTree.Literal>nodeType.arguments[0]
      if (identifier.type !== 'Identifier') { return }
      if (identifier.name !== 'require') { return }
      if (argument && argument.value) {
        requires.push(mapRequire(<string>argument.value, argument.loc))
      }
    }

    if (node.type === 'ImportDeclaration') {
      let nodeType = <ESTree.ImportDeclaration>node
      let source = nodeType.source
      requires.push(mapRequire(<string>source.value, source.loc))
    }

  })

  return requires

  function mapRequire (name: string, location: ESTree.SourceLocation):ModuleReference {
    return {
      name,
      range: Range.create({
        line: location.start.line - 1,
        character: location.start.column
      }, {
        line: location.end.line - 1,
        character: location.end.column
      })
    }
  }
}
