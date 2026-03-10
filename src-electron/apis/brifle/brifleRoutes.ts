
import {  ipcMain } from 'electron'
import { ApiV1, CreateSignatureReferenceRequest, CreateSignatureReferenceResponse, ErrorResponse, InboxFilter, LoginRequest, OutboxFilter, ParsedAddressResponse, PreviewPaperMailRequest, ReceiverRequest, SendContentRequest } from '@brifle/brifle-sdk'
import { ApiResponse } from '@brifle/brifle-sdk'
import LogService from 'app/src-electron/service/LogService'
import { LogLevel } from 'app/src-electron/log/types'

export default class BrifleRoutes{

    readonly apiMap: Map<string, ApiV1> = new Map()

    registerRoutes(){          

        ipcMain.handle('brifle:newSession', async (event, endpoint: string) => {
            const api = new ApiV1(endpoint)
            const randomId = Math.random().toString(36).substring(2, 15)
            this.apiMap.set(randomId, api)
            return randomId            
        })

        ipcMain.handle('brifle:authLogin', async (event, apiId: string, request: LoginRequest) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.authentication().login(request))
        })

        ipcMain.handle('brifle:contentCheckReceiver', async (event, apiId: string, receiver: ReceiverRequest) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().checkReceiver(receiver))
        })

        ipcMain.handle('brifle:contentCheckReceiverBulk', async (event, apiId: string, receivers: ReceiverRequest[]) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().checkMultipleReceivers(receivers))
        })

        ipcMain.handle('brifle:contentSendContent', async (event, apiId: string, tenantId: string, request: SendContentRequest) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().sendContent(tenantId, request))
        })

        ipcMain.handle('brifle:getOutbox', async (event, apiId: string, tenantId: string, filter: OutboxFilter, page: number) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')            
            return await this.castToResponse(api.mailbox().getOutbox(tenantId, filter, page))
        })

        ipcMain.handle('brifle:getInbox', async (event, apiId: string, filter: InboxFilter, page: number) => {        
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.mailbox().getInbox(filter, page))
        })

        ipcMain.handle('brifle:getAccount', async (event, apiId: string, accountId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.accounts().getById(accountId))
        })

        ipcMain.handle('brifle:contentGetContent', async (event, apiId: string, contentId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().getContent(contentId))
        })

        ipcMain.handle('brifle:contentGetContentActions', async (event, apiId: string, contentId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().getContentActions(contentId))
        })

        ipcMain.handle('brifle:contentCoverLettersList', async (event, apiId: string, tenantId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().listCoverLetters(tenantId))
        })

        ipcMain.handle('brifle:contentCoverLetterGet', async (event, apiId: string, tenantId: string, type: "custom" | "default", name: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().getCoverLetterContent(tenantId, type, name, 'base64')
            .then(res => {              
                return ApiResponse.success(res.data as unknown as string);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentCoverLetterCreate', async (event, apiId: string, tenantId: string, name: string, content: string, options: {description?: string}) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().createCoverLetter(tenantId, name, content, options.description)
            .then(res => {
                console.log('Cover letter created successfully:', res);
                return ApiResponse.success(res.data as unknown as string);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentCoverLetterDelete', async (event, apiId: string, tenantId: string, name: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().deleteCoverLetter(tenantId, name)
            .then(res => {
                return ApiResponse.success(res.data as unknown as string);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentCreateSignatureReference', async (event, apiId: string, tenantId: string, referenceData : CreateSignatureReferenceRequest) => {
           
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.signature().createSignatureReference(tenantId, referenceData)
            .then(res => {
                return ApiResponse.success(res.data as unknown as CreateSignatureReferenceResponse);
            })
            .catch(err => {
                console.error('Error creating signature reference:', err);
                return ApiResponse.error(err.data as unknown as ErrorResponse);
            });
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentGetDeliveryCertificate', async (event, apiId: string, contentId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().getDeliveryCertificate(contentId)
            .then(res => {
                return ApiResponse.success(res.data as unknown as string);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentGetDeliveryStatus', async (event, apiId: string, contentId: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().getDeliveryStatus(contentId)
            .then(res => {
                return ApiResponse.success(res.data as unknown as string);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:contentPreviewPaperMail', async (event, apiId: string, tenantId: string, previewRequest: PreviewPaperMailRequest) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.content().getPaperMailPreview(tenantId, previewRequest)
            .then(res => {
                const buffer : ArrayBuffer = res.data as unknown as ArrayBuffer;           
                    // blob to base64 conversion
                
                const base64String = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                return ApiResponse.success(base64String);
               
            })
            .catch(err => {
                console.error('Error previewing paper mail:', err);
                return ApiResponse.error(err.data as unknown as ErrorResponse);
            })
            return await this.castToResponse(response)
        })

        ipcMain.handle('brifle:parsePostalAddress', async (event, apiId: string, addressString: string) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            const response = api.address().parseAddress({address: addressString})
            .then(res => {
                return ApiResponse.success(res.data as unknown as ParsedAddressResponse);
            })
            .catch(err => {
                console.error('Error parsing postal address:', err);
                return ApiResponse.error(err.data as unknown as ErrorResponse);
            })
            return await this.castToResponse(response)
        })
    }

    // cast the response to the correct type
    private castToResponse<T>(response: Promise<ApiResponse<T>>) {        
        return response.then((res) => {      
            LogService.writeLog({
                level: LogLevel.DEBUG,
                message: 'API call successful: ' + JSON.stringify(res),
            });      
            return {
                data: res.data,
                error: res.error,
                isSuccess: res.isSuccess,
                isError: res.isError,
            }
        }).catch((err) => {
            LogService.writeLog({
                level: LogLevel.ERROR,
                message: 'Error in API call: ' + err.message,
            });
        });
    }

}