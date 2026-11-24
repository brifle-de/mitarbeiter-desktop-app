import type { BirthInformation, FallbackOptions, ParsedAddressResponse, ReceiverRequest, SendContentRequest } from '@brifle/brifle-sdk';
import type ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import type { SendConfirmData, TrackableReceiverRecord } from '../util/types';
import { toContentBodies } from './pdf';

export type ParseAddress = (address: string | null) => Promise<ParsedAddressResponse | null>;

/** "Street, 12345 City, DE" from the record (empty parts left out) */
export function getReceiverAddressString(receiver: ReceiverRecord): string {
  const parts = [
    receiver.addressStreet,
    (receiver.addressPostcode ?? '') + ' ' + (receiver.addressCity ?? ''),
    receiver.addressCountry,
  ];
  return parts.map((part) => part?.trim() ?? '').filter((part) => part).join(', ');
}

export function isReceiverMatch(record1: ReceiverRecord, record2: ReceiverRecord): boolean {
  const nameMatch = record1.firstName === record2.firstName && record1.lastName === record2.lastName;
  const addressMatch = record1.addressStreet === record2.addressStreet
    && record1.addressCity === record2.addressCity
    && record1.email === record2.email
    && record1.phone === record2.phone
    && record1.dateOfBirth === record2.dateOfBirth
    && record1.placeOfBirth === record2.placeOfBirth
    && record1.addressPostcode === record2.addressPostcode;
  return nameMatch && addressMatch;
}

/**
 * Receiver request for the Brifle API: name, e-mail, phone, birth information (when complete)
 * and the postal address parsed by the Brifle address API (when street, house number, postcode
 * and city were found). Sets `validPostalAddress` on the record.
 */
export async function buildReceiverRequest(receiver: TrackableReceiverRecord, parseAddress: ParseAddress): Promise<ReceiverRequest> {
  const birthInfo: BirthInformation = {
    date_of_birth: receiver.dateOfBirth ?? '',
    place_of_birth: receiver.placeOfBirth ?? '',
    last_name: receiver.lastName ?? '',
    given_names: receiver.firstName ?? '',
  };
  const validBirthInfo = Object.values(birthInfo).every((value) => value && value.trim() !== '');
  const parsedAddress = await parseAddress(getReceiverAddressString(receiver));
  const requiredAddressFields = ['street', 'city', 'postcode', 'house_number'];
  const validAddress: boolean = parsedAddress != null && requiredAddressFields.every((field) => {
    if (!(field in parsedAddress)) {
      console.warn(`Parsed address is missing required field: ${field}`);
      return false;
    }
    const value = parsedAddress[field as keyof ParsedAddressResponse];
    return !!value && value.trim() !== '';
  });
  receiver.validPostalAddress = validAddress;

  const req: ReceiverRequest = {
    email: receiver.email ?? '',
    first_name: receiver.firstName ?? '',
    last_name: receiver.lastName ?? '',
    tel: receiver.phone ?? '',
  };
  if (validBirthInfo) req.birth_information = birthInfo;
  if (parsedAddress != null && validAddress) {
    req.postal_address = {
      street: parsedAddress.street ?? '',
      city: parsedAddress.city ?? '',
      postcode: parsedAddress.postcode ?? '',
      country: parsedAddress.country ?? '',
      house_number: parsedAddress.house_number ?? '',
      first_name: receiver.firstName ?? '',
      last_name: receiver.lastName ?? '',
    };
    if (receiver.dateOfBirth) req.postal_address.date_of_birth = receiver.dateOfBirth;
  }
  return req;
}

/** one send request per receiver (same order as `data.receivers`) */
export async function buildSendRequests(data: SendConfirmData, parseAddress: ParseAddress): Promise<SendContentRequest[]> {
  const body = toContentBodies(data.content) as { type: 'application/pdf'; content: string }[];
  const testMode = { enabled: !!data.testMode, email: data.testMode ? (data.testModeEmail ?? '') : '' };
  const requests: SendContentRequest[] = [];

  for (const receiver of data.receivers) {
    const receiverTo = await buildReceiverRequest(receiver, parseAddress);
    const req: SendContentRequest = {
      type: data.documentType as 'invoice' | 'letter' | 'contract',
      subject: data.subject,
      body,
      to: receiverTo,
      delivery_certificate: data.requireDeliveryConfirmation ? 'aes' : 'none',
    };

    // paper mail as fallback, only with a parsed postal address
    if (data.allowSendingPapermail && receiverTo.postal_address) {
      const fallback: FallbackOptions = {
        enabled_physical_delivery: true,
        paper_mail: {
          test_mode: testMode,
          cover_letter: data.includeCoverLetter && data.selectedCoverLetter
            ? { type: data.selectedCoverLetter.type, name: data.selectedCoverLetter.name }
            : undefined,
          recipient: {
            city: receiverTo.postal_address.city,
            country: receiverTo.postal_address.country,
            postal_code: receiverTo.postal_address.postcode,
            address_line1: receiverTo.postal_address.first_name + ' ' + receiverTo.postal_address.last_name,
            address_line2: receiverTo.postal_address.street + ' ' + receiverTo.postal_address.house_number,
          },
        },
      };
      req.fallback = fallback;
    }

    if (data.paymentData && data.documentType === 'invoice' && data.attachInvoiceData) {
      req.payment_info = {
        payable: true,
        details: {
          // amount is in decimal format, the API expects cents
          amount: Math.floor((data.paymentData.amount ?? 0) * 100),
          currency: (data.paymentData.currency ?? 'EUR') as 'EUR',
          iban: data.paymentData.iban ?? '',
          reference: data.paymentData.reference ?? '',
          due_date: data.paymentData.dueDate ?? '',
          description: data.paymentData.description ?? '',
          recipient_name: data.paymentData.paymentReceiverName ?? '',
        },
      };
    }

    if (data.signatureData && data.attachSignatureData) {
      req.signature_info = {
        signature_reference: '',
        requesting_signer: data.signatureData.map((sig) => ({ field: sig.fieldName, signer: sig.signingParty })),
      };
    }
    requests.push(req);
  }
  return requests;
}
