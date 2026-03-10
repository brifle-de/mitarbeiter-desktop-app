import { ReceiverRequest } from "@brifle/brifle-sdk";
import DocumentRecord from "../documents/documentRecord";
import { DocumentReceiverMappingResult } from "../documents/parsers";

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
    addressHouseNumber?: string,
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

export interface SendDocReceiverReq {
    doc: DocumentReceiverMappingResult,
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
     * parses the record to use all available information to create the most complete receiver request possible, e.g. if email is available, use that, if not, use tel, etc.
     * @param record 
     */
    public static toDynamicRequest(record: ReceiverRecord) : ReceiverRequest {
        const req : ReceiverRequest = {

        }
        if(record.email) {
            req.email = record.email;
            req.first_name = record.firstName ?? '';
            req.last_name = record.lastName ?? '';
        }
        if(record.phone) {
            req.tel = record.phone;
            req.first_name = record.firstName ?? '';
            req.last_name = record.lastName ?? '';
        }
        if(record.dateOfBirth && record.placeOfBirth) {
            req.birth_information = {
                date_of_birth: record.dateOfBirth,
                place_of_birth: record.placeOfBirth,
                given_names: record.firstName ?? '',
                last_name: record.lastName ?? '',
                ...(record.nameAtBirth ? { first_name: record.firstName } : {}),
            }
        }
        const hasPostalAddress = (record.addressHouseNumber && record.addressStreet && record.addressCity && record.addressPostcode) && (record.addressHouseNumber.trim() !== '' && record.addressStreet.trim() !== '' && record.addressCity.trim() !== '' && record.addressPostcode.trim() !== '');
        if(hasPostalAddress) {
            const postalAddress: {
                city: string;
                country: string;
                date_of_birth?: string;
                first_name: string;
                house_number: string;
                last_name: string;
                postcode: string;
                street: string;
            } = {
                street: record.addressStreet ?? '',
                postcode: record.addressPostcode ?? '',
                city: record.addressCity ?? '',
                country: record.addressCountry ?? '',
                first_name: record.firstName ?? '',
                last_name: record.lastName ?? '',
                house_number: record.addressHouseNumber ?? '',
            }
            if(record.dateOfBirth) {
                postalAddress.date_of_birth = record.dateOfBirth;
            }
            req.postal_address = postalAddress;
        }

        return req;
    }
    
    /**
     * converts a receiver record to a receiver request
     * @param record the record
     * @param type the type of the receiver request
     * @returns 
     */
    public static toReceiverRequest(record: ReceiverRecord, type : 'tel' | 'email' | 'birth_info', opts?: ToReceiverRequestsOpts) : ReceiverRequest {
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

            const useBirthInfoWithAddress = opts?.useBirthInfoWithAddress ?? false;

            return {
                birth_information: {
                    place_of_birth: record.placeOfBirth??'',
                    date_of_birth: record.dateOfBirth??'',
                    given_names: record.firstName??'',
                    last_name: record.lastName??'',
                    ...(record.nameAtBirth ? { first_name: record.firstName } : {}),
                    ...(useBirthInfoWithAddress && hasAddress ? { postal_address: address } : {}),
                },
                }             
        }
        return {
        }

    }

}

export interface ToReceiverRequestsOpts {
    useBirthInfoWithAddress?: boolean,
}
