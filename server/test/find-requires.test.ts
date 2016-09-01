
import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import parse from '../src/lib/find-requires'

const basePath = process.env.VSCODE_CWD
const testEs5Contents = fs.readFileSync(path.join(basePath, 'test/fixtures/test-es5.js')).toString()
const testEs6Contents = fs.readFileSync(path.join(basePath, 'test/fixtures/test-es6.js')).toString()

describe('lib/find-requires', () => {

  it('should pull out requires from a file - es5', () => {
    const actual = parse(testEs5Contents)
    const expected = [
      {name: "module-3",range: {start: {line: 4, character: 8}, end: {line: 4, character: 18}}},
      {name: "module-1",range: {start: {line: 1, character: 18}, end: {line: 1, character: 28}}},
      {name: "module-2",range: {start: {line: 2, character: 14}, end: {line: 2, character: 24}}},
      {name: "module-4",range: {start: {line: 6, character: 16}, end: {line: 6, character: 26}}},
      {name: "module-5",range: {start: {line: 10, character: 12}, end: {line: 10, character: 22}}},
      {name: "module-9",range: {start: {line: 20, character: 21}, end: {line: 20, character: 31}}},
      {name: "module-7",range: {start: {line: 15, character: 10}, end: {line: 15, character: 20}}},
      {name: "module-6",range: {start: {line: 13, character: 24}, end: {line: 13, character: 34}}},
      {name: "module-8",range: {start: {line: 16, character: 18}, end: {line: 16, character: 28}}}
    ]
    assert.deepEqual(actual, expected, 'return values were not the same')
  })

  it('should pull out requires from a file - es6', () => {
    const actual = parse(testEs6Contents)
    const expected = [
      {name: "module-1", range:{start :{line :1, character:25}, end:{line :1, character:35}}},
      {name: "module-2", range:{start :{line :3, character:20}, end:{line :3, character:30}}},
      {name: "module-3", range:{start :{line :5, character:27}, end:{line :5, character:37}}}
    ]
    assert.deepEqual(actual, expected, 'return values were not the same')
  })

})
