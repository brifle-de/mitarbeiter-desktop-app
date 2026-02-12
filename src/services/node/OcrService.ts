
export default class OcrService {

    async performOcrOnBase64Data(base64Data: string) {
        return window.ocrApi.performOcrBase64Data(base64Data).then((text: string) => {
            return text;
        });
    }

    async parseAddressesOrcBase64Data(base64Data: string) : Promise<OrcAddressResult> {
        const ocrText = await this.performOcrOnBase64Data(base64Data);
        const containsPostcode = (input: string) => /.*\d{5}.*/.test(input);

        // split by line breaks
        const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);     

        // check if first line contains a postcode or has more than 5 words to determine if it's the sender address
        const firstIsSenderAddress = containsPostcode(lines[0] ?? '') || (lines[0] ?? '').split(' ').length >= 5;
        const senderAddress = firstIsSenderAddress ? lines[0] : '';

        const rowIndexName = firstIsSenderAddress ? 1 : 0;
        const rowIndexStreet = firstIsSenderAddress ? 2 : 1;
        const rowIndexPostalCodeCity = firstIsSenderAddress ? 3 : 2;

        const postcodeCityLine = lines[rowIndexPostalCodeCity] || '';
        // extract postcode (5 digits) and city (rest of the line after postcode)
        const postcodeMatch = postcodeCityLine.match(/(\d{5})\s*(.*)/);
        const postalCode = postcodeMatch ? postcodeMatch[1] : '';
        const city = postcodeMatch ? postcodeMatch[2] : '';


        return {
            senderAddress: {
                value: (senderAddress || '').trim()
            },
            receiverAddress: {
                name: (lines[rowIndexName] || '').trim(),
                street: (lines[rowIndexStreet] || '').trim(),
                postalCode: (postalCode || '').trim(),
                city: (city || '').trim()
            }
        }
    }
}

interface ReceiverAddress {
    name: string;
    street: string;
    postalCode: string;
    city: string;
}

interface SenderAddress {
    value: string;
}

interface OrcAddressResult {
    senderAddress: SenderAddress;
    receiverAddress: ReceiverAddress;
}

export type{
    ReceiverAddress,
    SenderAddress,
    OrcAddressResult
}