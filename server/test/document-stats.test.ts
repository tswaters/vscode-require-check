'use strict'

import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import Uri from 'vscode-uri'
import * as documentStats from '../src/lib/document-stats'

const basePath = process.cwd()
const targetFile = require.resolve(path.join(basePath, 'test', 'fixtures', 'folder-root', 'test-es5.js'))
const targetFileUri = Uri.file(targetFile).toString()
const targetFileContents = fs.readFileSync(targetFile).toString()

describe('lib/document-stats', () => {

  describe('findRequireAtPosition', () => {
    it('should find the correct require at the given position', () => {
      const targetUriFile = require.resolve(path.join(basePath, 'test', 'fixtures', 'folder-root', 'node_modules', 'some-module', 'index.js'))
      const actual = documentStats.findRequireAtPosition(targetFileUri, targetFileContents, {line: 3, character: 19})
      const expected = [{
        uri: Uri.file(targetUriFile).toString(),
        range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}}
      }]
      assert.deepEqual(actual, expected)
    })
  })

  describe('gatherDiagnostics', () => {
    let actual = documentStats.gatherDiagnostics(targetFileUri, targetFileContents)
    let expected = {
      uri: Uri.file(targetFile).toString(),
      diagnostics:[
        {source: "module-fixer", range: {start: {line:1, character:18}, end: {line :1, character:27}}, severity:1, message: "The module invalid cannot be resolved", code:"invalid"},
        {source: "module-fixer", range: {start: {line:7, character:18}, end: {line :7, character:37}}, severity:1, message: "The module ./invalid-require cannot be resolved", code:"./invalid-require"}
      ]
    }
    assert.deepEqual(actual, expected)

  })

})
