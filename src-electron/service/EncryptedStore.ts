import { AccountData, EncryptedStoreType } from "../models/EncryptedStore"
import { app } from 'electron'

import fs from 'fs'
import { pbkdf2Sync } from "crypto"
import argon2 from "argon2"
import crypto from "crypto"


export default class EncryptedStore{

    private readonly basePath: string = 'brifle-mitarbeiter/encryptedStore'
    private readonly metaFile: string = 'meta.json'
     
   

    private async getPath(path: string): Promise<string> {
        const full = `${this.basePath}/${path}`
        console.log('getPath', app.getPath('home') + '/' + full)
        return app.getPath('home') + '/' + full;
    }

    private async getMetaPath(): Promise<string> {
        return this.getPath(this.metaFile)
    }

    private async getAccountPath(accountId: string): Promise<string> {
        return this.getPath("accounts/"+accountId + '.bin')
    }

    /**
     * check if the store is initialized
     * @returns {Promise<boolean>} true if the store is initialized, false otherwise
     */
    public async isInitialized(): Promise<boolean> {        
        const checkPath = await this.getMetaPath()
        // check if file exists
        const res = fs.existsSync(checkPath);
        return res;
    }


    /**
     * generate a key from the password
     * @param password the password to use
     * @param salt the salt to use
     * @returns {Buffer} the key as a buffer
     */
    private async generateEncryptionKey(password: string, salt: string): Promise<Buffer> {        
        return pbkdf2Sync(password, salt, 100000, 32, 'sha512')
    }

    /**
     * hash the password using argon2
     * @param password the password to hash
     * @returns {Promise<string>} the hashed password
     */
    async hashPassword(password: string): Promise<string> {     
        return argon2.hash(password)
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return argon2.verify(hash, password)
    }

    async storeMetadata(data: EncryptedStoreType): Promise<void> {
        const js = JSON.stringify(data, null, 2)
        fs.writeFileSync(await this.getMetaPath(), js, 'utf-8')
    }


    async initStore(password: string): Promise<EncryptedStoreType> {
        const checkPath = await this.getMetaPath()
        // check if file exists
        if (fs.existsSync(checkPath)) {
            throw new Error('File already exists')
        }
        // create the directory if it does not exist
        const dir = checkPath.substring(0, checkPath.lastIndexOf('/'))
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        // create the file
        const salt = crypto.randomBytes(24).toString('hex')
        const passwordHash = await this.hashPassword(password);
        const data: EncryptedStoreType = {
            isInitialized: true,
            passwordHash: passwordHash,
            salt: salt,
            version: '1',
            accountIds: []
        }
        await this.storeMetadata(data)
        return data;
    }

    /**
     * encrypt the data using the key
     * @param data the data to encrypt
     * @param encryptionKey the key to use
     * @returns {Buffer} the encrypted data
     */
    async encryptData(data: string, encryptionKey: Buffer){
        const iv = crypto.randomBytes(16)        
        const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv)
        const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
        return Buffer.concat([iv, encryptedData])
    }

    /**
     * decrypt the data using the key
     * @param encryptedData the data to decrypt
     * @param encryptionKey the key to use
     * @returns {string} the decrypted data
     */
    async decryptData(encryptedData: Buffer, encryptionKey: Buffer): Promise<string> {
        const iv = encryptedData.subarray(0, 16)
        const data = encryptedData.subarray(16)
        const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv)
        const decryptedData = Buffer.concat([decipher.update(data), decipher.final()]);
        return decryptedData.toString()
    }

    /**
     * 
     * @param account the account to store
     * @returns 
     */
    async storeAccount(account: AccountData, encryptionKey: string): Promise<void> {
        const js = JSON.stringify(account)       
        const accPath = await this.getAccountPath(account.id)
        const key = Buffer.from(encryptionKey, 'hex')
        const encryptedData = await this.encryptData(js, key)
        const dir = accPath.substring(0, accPath.lastIndexOf('/'))
        // create the directory if it does not exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        fs.writeFileSync(accPath, encryptedData, 'utf-8')
    }

    async addAccount(account: AccountData, encryptionKey: string): Promise<void> {
        const meta = await this.fetchMetadata()
        meta.accountIds.push(account.id)
        await this.storeAccount(account, encryptionKey)
        await this.storeMetadata(meta);

    }


    /**
     * 
     * @param password the password to use
     * @param salt the salt to use
     * @returns {Buffer} the key as a buffer
     */
    async getKey(salt:string, password: string): Promise<string> {
        const buffer = await this.generateEncryptionKey(password, salt)
        console.log('getKey', buffer.length, buffer.toString('hex'))
        return buffer.toString('hex')
    }

    /**
     * 
     * @param accountId 
     * @param encryptionKey key as hex string
     * @returns 
     */
    async getAccount(accountId: string, encryptionKey: string): Promise<AccountData | null> {
        const accPath = await this.getAccountPath(accountId)
        const cipher = fs.readFileSync(accPath, 'utf-8')
        const key = Buffer.from(encryptionKey, 'hex')
        const js = await this.decryptData(Buffer.from(cipher), key)
        return JSON.parse(js) as AccountData
    }

    async deleteAccount(accountId: string): Promise<void> {
        console.log('deleteAccount', accountId)
    }

    async fetchMetadata(): Promise<EncryptedStoreType> {
        const checkPath = await this.getMetaPath()
        // check if file exists
        if (!fs.existsSync(checkPath)) {
            throw new Error('File does not exist')
        }
        const res = fs.readFileSync(checkPath, 'utf-8')
        const meta = JSON.parse(res) as EncryptedStoreType
        return meta;
    }

    async loadMetadata(password: string): Promise<EncryptedStoreType> {
        const checkPath = await this.getMetaPath()
        // check if file exists
        if (!fs.existsSync(checkPath)) {
            throw new Error('File does not exist')
        }
        const res = fs.readFileSync(checkPath, 'utf-8')
        const meta = JSON.parse(res) as EncryptedStoreType
        const expectedPasswordHash = meta.passwordHash
        const isValid = await this.verifyPassword(password, expectedPasswordHash)
        if(isValid === false){
            throw new Error('Invalid password')
        }
        return meta;
    }
}