
'use strict';

import Uri from 'vscode-uri'
import {exec} from 'child_process'

import {
  createConnection,
  Command,
  Definition,
  IPCMessageReader,
  IPCMessageWriter,
  IConnection,
  TextDocuments,
  TextDocument
} from 'vscode-languageserver';

import {gatherDiagnostics, findRequireAtPosition} from './lib/document-stats'

import {
  OutputUpdateNotificationType,
  NotifyRevalidate,
  NotificationParams,
  InstallModuleRequestType,
  InstallModuleParams,
  InstallModuleResponse,
  InstallModuleError
} from '../../types'

// create a text document manager and feed it to the language server

const connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process))
const documents: TextDocuments = new TextDocuments()

documents.listen(connection)

// set up the connection so it listens to changes to text documents
let workspaceRoot: string = null
connection.onInitialize((params) => {
  workspaceRoot = params.rootPath
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      codeActionProvider: true,
      definitionProvider: true
    }
  }
})

// wire up onRequest to listen for npm-install requests
// start the npm-install, and send back output notifications (client will pipe these to output window)
connection.onRequest(InstallModuleRequestType, (params: InstallModuleParams) => {

  const cwd = workspaceRoot
  const moduleName = params.moduleName
  const save = `${params.save ? '--' + params.save : ''}`

  return new Promise((resolve, reject) => {
    const install = exec(`npm install ${moduleName} ${save}`, {cwd})
    install.stdout.on('data', data => connection.sendNotification(OutputUpdateNotificationType, {data}))
    install.stderr.on('data', data => connection.sendNotification(OutputUpdateNotificationType, {data}))
    install.on('close', code => {
      if (code !== 0) { return reject() }
      resolve()
    })
  })

})

// wire up onCodeAction
// this adds our `install` actions for modules that are not relatively loaded
connection.onCodeAction((params) => {
  let moduleName = <string>params.context.diagnostics[0].code

  // if this is a relative require, don't show code actions to install module
  const start = moduleName.substring(0, 2)
  if (start === './' || start === '..') return []

  // if there are `/` inside the require, only take up to the first one
  moduleName = moduleName.split('/')[0]

  const result: Command[] = []
  result.push(Command.create(`Install ${moduleName}`, 'moduleFixer.installFromNpm', moduleName, null))
  result.push(Command.create(`Install ${moduleName} - save`, 'moduleFixer.installFromNpm', moduleName, 'save'))
  result.push(Command.create(`Install ${moduleName} - save dev`, 'moduleFixer.installFromNpm', moduleName, 'save-dev'))
  return result
})

// wire up onDefinition
// this finds requires in the provided position & routes user to required module
connection.onDefinition((params): Definition => {
  const position = params.position
  const uri = params.textDocument.uri
  const contents = documents.get(uri).getText()
  return findRequireAtPosition(uri, contents, position)
})

// listen for changes to configuration changes, revalidate documents
connection.onDidChangeConfiguration((change) => {
  documents.all().forEach(validate);
});

// add a listener for when a text document changes, revalidate document
documents.onDidChangeContent((change) => {
  validate(change.document)
})

// on close, clear diagnostics for a given textdocument's uri
documents.onDidClose((event) => {
	connection.sendDiagnostics({uri: event.document.uri, diagnostics: []});
});

function validate (textDocument: TextDocument) {
  const uri = textDocument.uri
  const contents = textDocument.getText()
  connection.sendDiagnostics(gatherDiagnostics(uri, contents))
}

// Listen on the connection
connection.listen();
