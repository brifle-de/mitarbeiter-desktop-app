
import {  ipcMain } from 'electron'
import { ApiV1, LoginRequest, ReceiverRequest, SendContentRequest } from '@brifle/brifle-sdk'
import { ApiResponse } from '@brifle/brifle-sdk'

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

        ipcMain.handle('brifle:contentSendContent', async (event, apiId: string, tenantId: string, request: SendContentRequest) => {
            const api = this.apiMap.get(apiId)
            if (!api) throw new Error('API not found')
            return await this.castToResponse(api.content().sendContent(tenantId, request))
        })
    }

    // cast the response to the correct type
    private castToResponse<T>(response: Promise<ApiResponse<T>>) {
        return response.then((res) => {
            return {
                data: res.data,
                error: res.error,
                isSuccess: res.isSuccess,
                isError: res.isError,
            }
        });
    }

}