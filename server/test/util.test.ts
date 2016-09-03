
import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import Uri from 'vscode-uri'
import * as util from '../src/lib/util'

const basePath = process.cwd()
const targetFile = require.resolve(path.join(basePath, 'test', 'fixtures', 'folder-root', 'test-es5.js'))
const targetFileUri = Uri.file(targetFile).toString()

describe('util', () => {

  describe('findNearestPackageJson', () => {

    it('should return false if nothing found', () => {
      const workspaceRoot = path.join(basePath, 'test', 'fixtures', 'folder-root-2')
      const targetFile = path.join(workspaceRoot, 'sub-folder', 'index.js')
      const actual = util.findNearestPackageJson(workspaceRoot, targetFile)
      const expected = null
      assert.equal(actual, expected)
    })

    it('should return the path to the nearest package.json', () => {
      const workspaceRoot = path.join(basePath, 'test', 'fixtures', 'folder-root')
      const targetFile = path.join(workspaceRoot, 'sub-folder', 'index.js')
      const actual = util.findNearestPackageJson(workspaceRoot, targetFile)
      if (!actual) { throw new Error('didn\'t work') }
      const expected = path.join(basePath, 'test', 'fixtures', 'folder-root')
      assert.equal(actual.toLowerCase(), expected.toLowerCase())
    })

  })

  describe('uriToPath', () => {
    it('should return a valid path properly', () => {
      const expected = path.dirname(targetFile)
      const actual = util.uriToPath(targetFileUri)
      assert.equal(actual.toLowerCase(), expected.toLowerCase())
    })
  })

  describe('uriToFile', () => {
    it('should return a valid path properly', () => {
      const expected = targetFile
      const actual = util.uriToFile(targetFileUri)
      assert.equal(actual.toLowerCase(), expected.toLowerCase())
    })
  })

  describe('pathToUri', () => {
    it('should return a vscode-uri properly', () => {
      const actual = util.pathToUri(targetFile)
      assert.equal(actual.toLowerCase(), targetFileUri.toLowerCase())
    })
  })

})
