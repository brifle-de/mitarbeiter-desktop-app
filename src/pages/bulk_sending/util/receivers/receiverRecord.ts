import { ReceiverRequest } from "@brifle/brifle-sdk";
import DocumentRecord from "../documents/documentRecord";

/**
 * record to standardize the receiver data
 */
export default interface ReceiverRecord {
    receiverId?: string,
    firstName?: string,
    lastName?: string,
    nameAtBirth?: string,
    email?: string,
    fullName?: string,
    phone?: string,
    dateOfBirth?: string,
    placeOfBirth?: string,
    address?: string,
    addressStreet?: string,
    addressCity?: string,
    addressPostcode?: string,
    addressCountry?: string,
}

export interface SendDocReq {
    doc: DocumentRecord,
    receiver: {req: ReceiverRequest, original: ReceiverRecord} | null,
    exists: boolean,
    postalAddress?: PostalAddress | null,
}

export interface PostalAddress {
    street: string,
    postcode: string,
    city: string,
    country: string,
}

export class ReceiverRecordConverter {
    
    /**
     * converts a receiver record to a receiver request
     * @param record the record
     * @param type the type of the receiver request
     * @returns 
     */
    public static toReceiverRequest(record: ReceiverRecord, type : 'tel' | 'email' | 'birth_info') : ReceiverRequest {
        if(type === 'tel' ){
            return {
                tel: record.phone??'',
                ...(record.firstName ? { first_name: record.firstName } : {}),
                ...(record.lastName ? { last_name: record.lastName } : {}),                
                ...(record.dateOfBirth ? { date_of_birth: record.dateOfBirth } : {}),               
            }
        }else if(type === 'email'){
            return {
                email: record.email??'',
                ...(record.firstName ? { first_name: record.firstName } : {}),
                ...(record.lastName ? { last_name: record.lastName } : {}),                
                ...(record.dateOfBirth ? { date_of_birth: record.dateOfBirth } : {}),               
            }
        }else if(type === 'birth_info'){
            const hasAddress = record.address || (record.addressStreet && record.addressCity && record.addressPostcode)
            let address = record.address;
            if(!address && hasAddress) {
                address = `${record.addressPostcode} ${record.addressCity}, ${record.addressStreet}`
            }
            return {
                birth_information: {
                    place_of_birth: record.placeOfBirth??'',
                    date_of_birth: record.dateOfBirth??'',
                    given_names: record.firstName??'',
                    last_name: record.lastName??'',
                    ...(record.nameAtBirth ? { first_name: record.firstName } : {}),
                    ...(hasAddress ? { address: address } : {}),
                },
                }             
        }
        return {
        }

    }

}