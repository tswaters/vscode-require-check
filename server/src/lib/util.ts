
import {dirname, join, sep} from 'path'

import Uri from 'vscode-uri'

const splitRe = process.platform === 'win32' ? /[\/\\]/ : /\//;

/**
 * Given a workspaceRoot and directory, finds the closest package.json up to workspaceRoot
 * If nothing found (even in workspaceRoot) return false
 * @param {string} workspaceRoot you shall not pass!
 * @param {string} file file to start search from
 * @returns {string} directory in which the closest package.json resides
 */
export function findNearestPackageJson (workspaceRoot: string, file: string): string {
  let ret: string = null
  const parts = dirname(file).split(splitRe)
  for (let index = parts.length - 1; index >= 0; index--) {
    let checkDir = parts.slice(0, index + 1).join(sep)
    let packageCheck = join(checkDir, 'package.json')
    try { ret = require.resolve(packageCheck) } catch (e) { }
    if (ret) { return dirname(ret) }
    if (checkDir === workspaceRoot) { break }
  }
  return ret
}

/**
 * Turns a vs-code uri into a path node recognizes
 * @param {string} uri the path returned from TextDocument#uri
 * @returns {string} something that node recognizes
 */
export function uriToPath (uri: string): string {
  return dirname(uriToFile(uri))
}

/**
 * Turns a vs-code uri into a file node recognizes
 * @param {string} uri vscode uri
 * @returns {string} something that node recognizes
 */
export function uriToFile (uri: string): string {
  return Uri.parse(uri).fsPath
}

/**
 * Turns a node uri into something vscode recognizes
 * @param {string} uri node-esque uri
 * @returns {string} something that vscode recognizes
 */
export function pathToUri (uri: string): string {
  return Uri.file(uri).toString()
}
