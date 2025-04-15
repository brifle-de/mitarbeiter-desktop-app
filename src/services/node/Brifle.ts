import { CheckReceiverResponse, LoginRequest, LoginResponse, ReceiverRequest, SendContentRequest, SendContentResponse } from "brifle-sdk";
import { ApiResponse } from "brifle-sdk/dist/types/endpoints/v1/apiResponse";

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

