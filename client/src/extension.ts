
'use strict';

import {join} from 'path';

import {
  commands,
  workspace,
  Disposable,
  ExtensionContext,
  window,
  Uri,
  OutputChannel
} from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  NotificationType,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient';

import {
  OutputUpdateNotificationType,
  OutputUpdateNotificationParams,
  NotifyRevalidate,
  InstallModuleRequestType,
  InstallModuleParams,
  InstallModuleError,
  InstallModuleResponse
} from '../../types'

export function activate(context: ExtensionContext) {

  const channel = window.createOutputChannel('npm-install')
  channel.show(false)


  // The server is implemented in node
  let serverModule = context.asAbsolutePath(join('out', 'server', 'server', 'src', 'server.js'));

  // The debug options for the server
  let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  let serverOptions: ServerOptions = {
    run : { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
  }

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: ['javascript'],
    synchronize: {
      // Synchronize the setting section 'languageServerExample' to the server
      configurationSection: 'languageServerExample',
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    }
  }

  // Create the language client and start the client.
  let client = new LanguageClient('Language Server Example', serverOptions, clientOptions);

  // listen for output changes required

  client.onNotification(OutputUpdateNotificationType, (params: OutputUpdateNotificationParams) => {
    if (params.data) channel.append(params.data)
    return Promise.resolve()
  })

  context.subscriptions.push(
    client.start(),
    commands.registerCommand('moduleFixer.installFromNpm', requestModuleInstall)
  );


  /**
   * Command for installing the given module from npm
   * @param {string} moduleName name of the module to install
   * @param {string} save blank (dont save), save, or save-dev
   */
  function requestModuleInstall (moduleName: string, save: string) {

    channel.clear()

    const requestType = InstallModuleRequestType

    const requestParams: InstallModuleParams = {moduleName, save}

    // upon response, send a request to revalidate documents with this module
    const requestResponse: (res: InstallModuleResponse) => void = (res) => {
      client.sendNotification(NotifyRevalidate, {moduleName})
    }

    // upon error, let the user know something blowed up.
    const requestError: (err: InstallModuleError) => void = (err) => {
      return window.showErrorMessage(`Failed to install ${moduleName} please see output below or check npm-debug.log`)
    }

    // send the request
    channel.show(false)
    client.sendRequest(requestType, requestParams).then(requestResponse, requestError)

  }

}

