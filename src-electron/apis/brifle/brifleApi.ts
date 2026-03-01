import { ContextBridge, IpcRenderer } from "electron";
import { AccountInfo, CheckMultipleReceiversResponse, CheckReceiverResponse, ContentActionsResponse, ContentResponse, CoverLetterOverviewItem, CoverLetterOverviewResponse, CreateSignatureReferenceRequest, CreateSignatureReferenceResponse, DeliveryCertificateResponse, InboxFilter, LoginRequest, LoginResponse, MailboxResponse, OutboxFilter, ParsedAddressResponse, PreviewPaperMailRequest, ReceiverRequest, SendContentRequest, SendContentResponse } from "@brifle/brifle-sdk"
import { ApiResponse } from "@brifle/brifle-sdk";

export class BrifleApi{
    registerApi(contextBridge: ContextBridge, ipcRenderer: IpcRenderer){     
        contextBridge.exposeInMainWorld('brifleApi', {
            newApi: (endpoint: string) => ipcRenderer.invoke('brifle:newSession', endpoint),
            authLogin: (apiId: string, request: LoginRequest) => ipcRenderer.invoke('brifle:authLogin', apiId, request),
            contentCheckReceiver: (apiId: string, receiver: ReceiverRequest) => ipcRenderer.invoke('brifle:contentCheckReceiver', apiId, receiver),
            contentCheckReceiverBulk: (apiId: string, receivers: ReceiverRequest[]) => ipcRenderer.invoke('brifle:contentCheckReceiverBulk', apiId, receivers),
            contentSendContent: (apiId: string, tenantId: string, request: SendContentRequest) => ipcRenderer.invoke('brifle:contentSendContent', apiId, tenantId, request),
            getOutbox: (apiId: string, tenantId: string, filter: OutboxFilter, page: number) => ipcRenderer.invoke('brifle:getOutbox', apiId, tenantId, filter, page),
            getInbox: (apiId: string, filter: InboxFilter, page: number) => ipcRenderer.invoke('brifle:getInbox', apiId, filter, page),
            getAccount: (apiId: string, accountId: string) => ipcRenderer.invoke('brifle:getAccount', apiId, accountId),
            contentGetContent: (apiId: string, contentId: string) => ipcRenderer.invoke('brifle:contentGetContent', apiId, contentId),
            contentGetContentActions: (apiId: string,  contentId: string) => ipcRenderer.invoke('brifle:contentGetContentActions', apiId, contentId),
            contentCoverLettersList(apiId: string, tenantId: string) {
                return ipcRenderer.invoke('brifle:contentCoverLettersList', apiId, tenantId);
            },
            contentCoverLetterGet(apiId: string, tenantId: string, type: string, name: string, contentType: 'pdf' | 'html') {
                return ipcRenderer.invoke('brifle:contentCoverLetterGet', apiId, tenantId, type, name, contentType);
            },
            contentCoverLetterCreate(apiId: string, tenantId: string, name: string, content: string, options: {description?: string}) {
                return ipcRenderer.invoke('brifle:contentCoverLetterCreate', apiId, tenantId, name, content, options);
            },
            contentCoverLetterDelete(apiId: string, tenantId: string, name: string) {
                return ipcRenderer.invoke('brifle:contentCoverLetterDelete', apiId, tenantId, name);
            },
            contentCreateSignatureReference(apiId: string, tenantId: string, referenceData : CreateSignatureReferenceRequest) {
                return ipcRenderer.invoke('brifle:contentCreateSignatureReference', apiId, tenantId, referenceData);
             },
            contentGetDeliveryCertificate(apiId: string, contentId: string) {
                return ipcRenderer.invoke('brifle:contentGetDeliveryCertificate', apiId, contentId);
            },
            contentGetDeliveryStatus(apiId: string, contentId: string) {
                return ipcRenderer.invoke('brifle:contentGetDeliveryStatus', apiId, contentId);
            },
            contentPreviewPaperMail(apiId: string, tenantId: string, previewRequest: PreviewPaperMailRequest) {
                return ipcRenderer.invoke('brifle:contentPreviewPaperMail', apiId, tenantId, previewRequest);
            },
            parsePostalAddress(apiId: string, addressString: string) {
                return ipcRenderer.invoke('brifle:parsePostalAddress', apiId, addressString);
             },

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
     * check if the receivers are valid and exist in the brifle API
     * @param apiId - The api id returned from newApi
     * @param receivers - The list of receiver requests
     * @returns the list of check receiver responses
     */
    contentCheckReceiverBulk: (apiId: string, receivers: ReceiverRequest[]) => Promise<ApiResponse<CheckMultipleReceiversResponse>>;

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

    /**
     * list all cover letters for the tenant
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the cover letters for
     * @returns list of cover letters
     */
    contentCoverLettersList(apiId: string, tenantId: string): Promise<ApiResponse<CoverLetterOverviewResponse>>;

    /**
     * get a specific cover letter
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the cover letter for
     * @param type - The type of cover letter
     * @param name - The name of the cover letter
     * @returns the cover letter content
     */
    contentCoverLetterGet(apiId: string, tenantId: string, type: string, name: string): Promise<ApiResponse<string>>;

    /**
     * create a new cover letter
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to create the cover letter for
     * @param name - The name of the cover letter
     * @param content - The content of the cover letter
     * @param options - Additional options for the cover letter
     * @returns the created cover letter overview item
     */
    contentCoverLetterCreate(apiId: string, tenantId: string, name: string, content: string, options: {description?: string}): Promise<ApiResponse<CoverLetterOverviewItem>>;

    /**
     * delete a cover letter
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to delete the cover letter for
     * @param name - The name of the cover letter to delete
     * @returns the deleted cover letter name
     */
    contentCoverLetterDelete(apiId: string, tenantId: string, name: string): Promise<ApiResponse<string>>;


    /**
     * parse addresses with the brifle API
     * @param apiId - The api id returned from newApi
     * @param addressString - The address string to parse
     * @returns the parsed address response
     */
    parsePostalAddress(apiId: string, addressString: string): Promise<ApiResponse<ParsedAddressResponse>>;


    /**
     * create a signature reference with the brifle API
     * @param referenceData - The data to create the signature reference with
     * @returns the created signature reference
     */
    contentCreateSignatureReference(apiId: string, tenantId: string, referenceData : CreateSignatureReferenceRequest): Promise<ApiResponse<CreateSignatureReferenceResponse>>;


    /**
     * get the delivery certificate for a content
     * @param apiId - The api id returned from newApi
     * @param contentId - The content id to get the delivery certificate for
     * @returns the delivery certificate response
     */
    contentGetDeliveryCertificate(apiId: string, contentId: string): Promise<ApiResponse<DeliveryCertificateResponse>>;

    /**
     *  get the delivery status for a content
     * @param apiId the api id returned from newApi
     * @param contentId the content id to get the delivery status for
     */
    contentGetDeliveryStatus(apiId: string, contentId: string): Promise<ApiResponse<string>>;

    /**
     * get a preview of the paper mail that will be sent
     * @param apiId - The api id returned from newApi
     * @param tenantId - The tenant id to get the preview for
     * @param previewRequest - The preview paper mail request
     * @return the preview response containing a link to the preview file
     */
    contentPreviewPaperMail(apiId: string, tenantId: string, previewRequest: PreviewPaperMailRequest): Promise<ApiResponse<string>>;


 }
    
