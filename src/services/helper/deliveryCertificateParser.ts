import { DeliveryCertificateResponse } from "@brifle/brifle-sdk";

export class DeliveryCertificateParser {
    parseDeliveryCertificate(deliveryCertifcateResponse : DeliveryCertificateResponse | undefined) : { key: string, value: string }[] {
      if (deliveryCertifcateResponse == null) {
        return [];
      }
      const xml = deliveryCertifcateResponse?.certificate;
      // parse xml
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      const certificateContent = xmlDoc.getElementsByTagName('SignatureContent')[0];
      const contentJson = JSON.parse(certificateContent?.textContent ?? '{}');
      return [
        { key: 'Absender Name', value: contentJson.sender_name },
        { key: 'Absender ID', value: contentJson.tenant_id },
        { key: 'Empfänger Name', value: contentJson.receiver_name },
        { key: 'Empfänger ID', value: contentJson.receiver_id },
        { key: 'Zustellungsdatum', value: contentJson.delivery_date },
        { key: 'Versandservice', value: contentJson.delivery_provider },
      ];
    }
}