import { AccountInfo, CheckReceiverResponse, InboxFilter, LoginRequest, LoginResponse, MailboxResponse, OutboxFilter, ReceiverRequest, SendContentRequest, SendContentResponse } from "@brifle/brifle-sdk";
import { ApiResponse } from "@brifle/brifle-sdk";

/**
 * BrifleApi class to interact with the brifle API on the main process
 */
export default class BrifleApi {

    /**
     * creates a new brifle API instance and returns the api id
     * @param endpoint - The endpoint to call the brifle API
     * @returns the api id
     */
    public static async newApi(endpoint: string): Promise<string> {
        return window.brifleApi.newApi(endpoint); 
    }

    /**
     * gets all the available endpoints from the brifle API for the authentication     * 
     * @returns the api id
     */
    public static authentication() : Authentication {
        return new Authentication();
    }   

    /**
     * gets all the available endpoints from the brifle API for the content
     * @returns the api id
     */
    public static content() : Content {
        return new Content();
    }

    /**
     * gets all the available endpoints from the brifle API for the mailbox
     * @returns the api id
     */
    public static mailbox() : Mailbox {
        return new Mailbox();
    }

    public static accounts(): Accounts{
        return new Accounts();
    }

}


export class Authentication {
    /**
     * login to the brifle API
     * @param apiId - The api id returned from newApi
     * @param request - The login request
     * @returns the login response
     */
    public async authLogin(apiId: string, request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        return window.brifleApi.authLogin(apiId, request); 
    }
}

export class Accounts {

    /**
     * get the account data from the brifle API
     * @param apiId - The api id returned from newApi
     * @param accountId - The account id to get
     * @returns the account response
     */
    public async getById(apiId: string, accountId: string): Promise<ApiResponse<AccountInfo>> {
        return window.brifleApi.getAccount(apiId, accountId); 
    }

}

export class Mailbox {
    /**
     * get the outbox of the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the outbox for
     * @param filter - The filter to apply to the outbox
     * @param page - The page to get
     * @returns the outbox response
     */
    public async getOutbox(apiId: string, tenantId: string, filter: OutboxFilter, page: number): Promise<ApiResponse<MailboxResponse>> {
        return window.brifleApi.getOutbox(apiId, tenantId, filter, page); 
    }

    /**
     * get the inbox of the brifle API
     * @param apiId - The api id returned from newApi
     * @param filter - The filter to apply to the inbox
     * @param page - The page to get
     * @returns the inbox response
     */
    public async getInbox(apiId: string, filter: InboxFilter, page: number): Promise<ApiResponse<MailboxResponse>> {
        return window.brifleApi.getInbox(apiId, filter, page);
    }
}

export class Content {
    /**
     * check if the receiver is valid and exists in the brifle API
     * @param apiId - The api id returned from newApi
     * @param receiver - The receiver request
     * @returns the check receiver response
     */
    public async contentCheckReceiver(apiId: string, receiver: ReceiverRequest): Promise<ApiResponse<CheckReceiverResponse>> {
        const serializedRequest = JSON.parse(JSON.stringify(receiver));
        return window.brifleApi.contentCheckReceiver(apiId, serializedRequest); 
    }

    /**
     * send content to the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to send the content to
     * @param request - The send content request
     * @returns the send content response
     */
    public async contentSendContent(apiId: string, tenantId: string, request: SendContentRequest): Promise<ApiResponse<SendContentResponse>> {
        const serializedRequest = JSON.parse(JSON.stringify(request));
        return window.brifleApi.contentSendContent(apiId, tenantId, serializedRequest); 
    }
}

