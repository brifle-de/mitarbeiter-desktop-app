import { AccountInfo, CheckMultipleReceiversResponse, CheckReceiverResponse, ContentActionsResponse, ContentResponse, CoverLetterOverviewItem, CoverLetterOverviewResponse, CreateSignatureReferenceRequest, CreateSignatureReferenceResponse, InboxFilter, LoginRequest, LoginResponse, MailboxResponse, OutboxFilter, ParsedAddressResponse, ReceiverRequest, SendContentRequest, SendContentResponse } from "@brifle/brifle-sdk";
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

    public static signatures(): Signatures {
        return new Signatures();
    }

    public static address() : Address {
        return new Address();
    }

  

}

export class Signatures {

    public async createSignatureReference(apiId: string, tenantId: string, signatureData : CreateSignatureReferenceRequest): Promise<ApiResponse<CreateSignatureReferenceResponse>> {
        return window.brifleApi.contentCreateSignatureReference(apiId, tenantId, signatureData);
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


export class Address {
    /**
     * parse an address string into a structured format using the brifle API
     * @param apiId - The api id returned from newApi
     * @param addressString - The address string to parse
     * @returns the parsed address response
     * */
    public async parsePostalAddress(apiId: string, addressString: string): Promise<ApiResponse<ParsedAddressResponse>> {
        return window.brifleApi.parsePostalAddress(apiId, addressString); 
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
     * check if the receivers are valid and exist in the brifle API
     * @param apiId - The api id returned from newApi
     * @param receivers - The list of receiver requests
     * @return the list of check receiver responses
     */
    public async contentCheckReceiverBulk(apiId: string, receivers: ReceiverRequest[]): Promise<ApiResponse<CheckMultipleReceiversResponse>> {
        const serializedRequest = JSON.parse(JSON.stringify(receivers));
        return window.brifleApi.contentCheckReceiverBulk(apiId, serializedRequest); 
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

    /**
     * get content from the brifle API
     * @param apiId - The api id returned from newApi
     * @param contentId - The content id to get
     * @returns the send content response
     */
    public async contentGetContent(apiId: string, contentId: string): Promise<ApiResponse<ContentResponse>> {
        return window.brifleApi.contentGetContent(apiId, contentId); 
    }

    /**
     * get content actions from the brifle API
     * @param apiId - The api id returned from newApi
     * @param contentId - The content id to get the actions for
     * @returns the content actions response
     */
    public async contentGetContentActions(apiId: string, contentId: string): Promise<ApiResponse<ContentActionsResponse>> {
        return window.brifleApi.contentGetContentActions(apiId, contentId); 
    }

    /**
     * get the cover letter content from the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the cover letter for
     * @param type - The type of the cover letter (custom or default)
     * @param name - The name of the cover letter
     * @returns the cover letter content
     */
    public async contentCoverLetterGet(apiId: string, tenantId: string, type: "custom" | "default", name: string): Promise<ApiResponse<string>> {
        return window.brifleApi.contentCoverLetterGet(apiId, tenantId, type, name); 
    }

    /**
     * list the cover letters from the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to list the cover letters for
     * @returns the cover letter overview response
     */
    public async listCoverLetters(apiId: string, tenantId: string): Promise<ApiResponse<CoverLetterOverviewResponse>> {
        return window.brifleApi.contentCoverLettersList(apiId, tenantId);
    }

    /**
     * create a new cover letter in the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to create the cover letter for
     * @param name - The name of the cover letter
     * @param content - The content of the cover letter
     * @param options - Additional options for the cover letter
     * @returns the created cover letter overview item
     */
    public async createCoverLetter(apiId: string, tenantId: string, name: string, content: string, options: {description?: string}): Promise<ApiResponse<CoverLetterOverviewItem>> {
        return window.brifleApi.contentCoverLetterCreate(apiId, tenantId, name, content, options);
    }

    /**
     * delete a cover letter in the brifle API
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to delete the cover letter for
     * @param name - The name of the cover letter to delete
     * @return the deleted cover letter name
     * 
     */
    public async deleteCoverLetter(apiId: string, tenantId: string, name: string): Promise<ApiResponse<string>> {
        return window.brifleApi.contentCoverLetterDelete(apiId, tenantId, name);
    }


}



