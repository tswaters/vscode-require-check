
import {TextDocument} from 'vscode-languageserver-types'

import {NotificationType, RequestType, RequestHandler} from 'vscode-jsonrpc'

/**
 * Defines the type for notification of output update request
 * server has output details it needs to send to client's output window
 */
export interface OutputUpdateNotificationParams {data: string}
export const OutputUpdateNotificationType: NotificationType<OutputUpdateNotificationParams> = {method: 'require-verify/update-output'}

//export interface OutputUpdateRequestResponse {}
//export type OutputUpdateRequestHandler = RequestHandler<OutputUpdateNotificationParams, OutputUpdateRequestResponse, any>


/**
 * Defines the type for notification of revalidation request
 * client signaling to server it needs to revalidate documents tagged with the given module
 */
export interface NotificationParams {moduleName: string}
export const NotifyRevalidate: NotificationType<NotificationParams> = {method: 'require-verify/reverify-document'};


/**
 * Defines paramterss for the revalidate request
 */
export interface InstallModuleParams {moduleName: string, save: string}
export interface InstallModuleResponse {}
export interface InstallModuleError {signal: string}
export const InstallModuleRequestType: RequestType<InstallModuleParams, InstallModuleResponse, InstallModuleError> = {method: 'require-verify/install-module'};
export type InstallModuleRequestHandler = RequestHandler<InstallModuleParams, InstallModuleResponse, InstallModuleError>
