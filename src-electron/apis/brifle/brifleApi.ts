import { ContextBridge, IpcRenderer } from "electron";
import { AccountInfo, CheckReceiverResponse, ContentActionsResponse, ContentResponse, InboxFilter, LoginRequest, LoginResponse, MailboxResponse, OutboxFilter, ReceiverRequest, SendContentRequest, SendContentResponse } from "@brifle/brifle-sdk"
import { ApiResponse } from "@brifle/brifle-sdk";

export class BrifleApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('brifleApi', {
            newApi: (endpoint: string) => ipcRenderer.invoke('brifle:newSession', endpoint),
            authLogin: (apiId: string, request: LoginRequest) => ipcRenderer.invoke('brifle:authLogin', apiId, request),
            contentCheckReceiver: (apiId: string, receiver: ReceiverRequest) => ipcRenderer.invoke('brifle:contentCheckReceiver', apiId, receiver),
            contentSendContent: (apiId: string, tenantId: string, request: SendContentRequest) => ipcRenderer.invoke('brifle:contentSendContent', apiId, tenantId, request),
            getOutbox: (apiId: string, tenantId: string, filter: OutboxFilter, page: number) => ipcRenderer.invoke('brifle:getOutbox', apiId, tenantId, filter, page),
            getInbox: (apiId: string, filter: InboxFilter, page: number) => ipcRenderer.invoke('brifle:getInbox', apiId, filter, page),
            getAccount: (apiId: string, accountId: string) => ipcRenderer.invoke('brifle:getAccount', apiId, accountId),
            contentGetContent: (apiId: string, contentId: string) => ipcRenderer.invoke('brifle:contentGetContent', apiId, contentId),
            contentGetContentActions: (apiId: string,  contentId: string) => ipcRenderer.invoke('brifle:contentGetContentActions', apiId, contentId),
        }) 
    }

 }
 export interface BrifleApiType {
    
    /**
     * 
     * @param endpoint - The endpoint to call the brifle API
     * @returns the api id
     */
    newApi: (endpoint: string) => Promise<string>;
    
    /**
     * login to the brifle API
     * @param apiId - The api id returned from newApi
     * @param request - The login request
     * @returns the login response
     */
    authLogin: (apiId: string, request: LoginRequest) => Promise<ApiResponse<LoginResponse>>;

    /**
     * check if the receiver is valid and exists in the brifle API
     * @param apiId - The api id returned from newApi
     * @param receiver - The receiver request
     * @returns the check receiver response
     */
    contentCheckReceiver: (apiId: string, receiver: ReceiverRequest) => Promise<ApiResponse<CheckReceiverResponse>>;

    /**
     * send content to the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to send the content to
     * @param request - The send content request
     * @returns the send content response
     */
    contentSendContent: (apiId: string, tenantId: string, request: SendContentRequest) => Promise<ApiResponse<SendContentResponse>>;

    /**
     * get the outbox of the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the outbox for
     * @param filter - The filter to apply to the outbox
     * @param page - The page to get
     * @returns the outbox response
     */
    getOutbox: (apiId: string, tenantId: string, filter: OutboxFilter, page: number) => Promise<ApiResponse<MailboxResponse>>;

    /**
     * get the inbox of the brifle API
     * @param apiId - The api id returned from newApi
     * @param filter - The filter to apply to the inbox
     * @param page - The page to get
     * @returns the inbox response
     */
    getInbox: (apiId: string,filter: InboxFilter, page: number) => Promise<ApiResponse<MailboxResponse>>;

    /**
     * get the account data from the brifle API
     * @param apiId - The api id returned from newApi
     * @param accountId - The account id to get
     * @returns the account data
     */
    getAccount: (apiId: string, accountId: string) => Promise<ApiResponse<AccountInfo>>;

    /**
     * get the content from the brifle API
     * @param apiId - The api id returned from newApi
     * @param contentId - The content id to get
     * @returns the content data
     */
    contentGetContent: (apiId: string, contentId: string) => Promise<ApiResponse<ContentResponse>>;

    /**
     * get the content actions from the brifle API
     * @param apiId - The api id returned from newApi
     * @param contentId - The content id to get the actions for
     * @returns the content actions
     */
    contentGetContentActions: (apiId: string, contentId: string) => Promise<ApiResponse<ContentActionsResponse>>;

 }
    
