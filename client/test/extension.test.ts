
import * as path from 'path'
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import {workspace, window} from 'vscode';
import * as myExtension from '../src/extension';

describe("initialization", () => {

  it("should activate properly on js files", () => {

    const testDir = path.join(process.env.VSCODE_CWD, 'test/folder-root')
    return new Promise((resolve, reject) => {
      return workspace.openTextDocument(path.join(testDir, 'test-es5.js'))
        .then((textDocument) => window.showTextDocument(textDocument))
        .then((textEditor) => {
          setTimeout(function () {
            resolve()
          }, 5000)
        }, reject)
    })

  });
});
