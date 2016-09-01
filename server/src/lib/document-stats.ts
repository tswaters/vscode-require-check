
import * as path from 'path'

import resolveFrom = require('resolve-from')

import Uri from 'vscode-uri'

import {Definition, PublishDiagnosticsParams, DiagnosticSeverity, Position} from 'vscode-languageserver';

import findRequires from './find-requires'

/**
 * Cache this for later
 */
let _nativeModules = Object.keys((<any>process).binding('natives')).filter(id => !id.startsWith('internal/'))

/**
 * Turns a vs-code uri into something vscode recognizes
 * @param {string} uri the path returned from TextDocument#uri
 * @returns {string} something that node recognizes
 */
export function uriToPath (uri: string): string {
  return path.dirname(Uri.parse(uri).fsPath)
}

/**
 * Turns a node uri into something vscode recognizes
 * @param {string} uri node-esque uri
 * @returns {string} something that vscode recognizes
 */
export function pathToUri (uri: string): string {
  return Uri.file(uri).toString()
}

/**
 * Finds all requires in a given code block that fall inside the provided position
 * @param {string} uri textDocument.uri for the code in question
 * @param {string} contents code block contents
 * @param {Position} position the position to find requires for
 * @returns {Definition} returns the uri (if resolved) of the module, pointing at 0:0
 */
export function findRequireAtPosition (uri: string, contents: string, position: Position): Definition {

  return findRequires(contents)

     // remove requires that cannot be resolved
    .filter(item => !!resolveFrom(uriToPath(uri), item.name))

     // remove all the requires that do not fall inside the provided position
    .filter(item => {
      if (position.line < item.range.start.line || position.line > item.range.end.line) { return false }
      if (position.line === item.range.start.line && position.character < item.range.start.character) { return false }
      if (position.line === item.range.end.line && position.character > item.range.end.character) { return false }
      return true
    })

    // remove any core node modules
    // node doesn't expose native-module so do the same stuffs
    .filter (item => _nativeModules.indexOf(item.name) === -1)

    // send back the uri of the resolved document, point at the top
    .map(item => {
      return {
        uri: pathToUri(resolveFrom(uriToPath(uri), item.name)),
        range: {
          start: {line: 0, character: 0},
          end: {line: 0, character: 0}
        }
      }
    })
}

/**
 * Parses out any invalid requires from a given textDocument contents
 * Our goal is to parse this as a js document and run it through the ast
 * Pull out any require statements and verify the module exists / path resolves
 * If not, show a diagnostic to the user that hey, you fucked up.
 * If valid, add to a watchers
 * @param {TextDocument} textDocument document to validate
 */
export function gatherDiagnostics (uri: string, contents: string):PublishDiagnosticsParams {

  const diagnostics = findRequires(contents)

    // remove items that can be resolved
    .filter(item => !resolveFrom(uriToPath(uri), item.name))

    // turn it into a diagnostic
    .map(item => {
      return {
        source: 'module-fixer',
        range: item.range,
        severity: DiagnosticSeverity.Error,
        message: `The module ${item.name} cannot be resolved`,
        code: item.name
      }
    })

  return {uri, diagnostics}
}
