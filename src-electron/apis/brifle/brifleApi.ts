import { ContextBridge, IpcRenderer } from "electron";
import { CheckReceiverResponse, LoginRequest, LoginResponse, ReceiverRequest, SendContentRequest, SendContentResponse } from "@brifle/brifle-sdk"
import { ApiResponse } from "@brifle/brifle-sdk";

export class BrifleApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('brifleApi', {
            newApi: (endpoint: string) => ipcRenderer.invoke('brifle:newSession', endpoint),
            authLogin: (apiId: string, request: LoginRequest) => ipcRenderer.invoke('brifle:authLogin', apiId, request),
            contentCheckReceiver: (apiId: string, receiver: ReceiverRequest) => ipcRenderer.invoke('brifle:contentCheckReceiver', apiId, receiver),
            contentSendContent: (apiId: string, tenantId: string, request: SendContentRequest) => ipcRenderer.invoke('brifle:contentSendContent', apiId, tenantId, request),
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

 }
    
