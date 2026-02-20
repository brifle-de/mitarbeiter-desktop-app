import { OrcDocumentAnalysisResult } from "app/src-electron/apis/ocr/ocrApi";

export default class OcrService {

    async performOcrOnBase64Data(base64Data: string) {
        return window.ocrApi.performOcrBase64Data(base64Data).then((text: string) => {
            return text;
        });
    }

    async performDocumentAnalysisOnBase64Data(base64DataPages: string[]) {
        return window.ocrApi.performDocumentAnalysisBase64Data(base64DataPages).then((result: OrcDocumentAnalysisResult) => {
            return result;
        });
    }

    async parseAddressesOrcBase64Data(base64Data: string) : Promise<OrcAddressResult> {
        const ocrText = await this.performOcrOnBase64Data(base64Data);
        const containsPostcode = (input: string) => /.*\d{5}.*/.test(input);

        // split by line breaks
        const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);     


        // get line index postcode. Containing 5 digits and at least two letters for the city name is a good indicator for the line containing the receiver address. If no line contains a postcode, we can assume that the first line is the sender address and the rest is the receiver address. If the first line contains a postcode or has more than 5 words, we can assume that it's the sender address and the rest is the receiver address. If there are more than 4 lines, we can assume that the first line is the sender address and the next three lines are the receiver address (name, street, postal code + city). If there are only 3 lines and none of them contains a postcode, we can assume that the first line is the sender address and the next two lines are the receiver address (name + street, postal code + city). If there are only 2 lines and none of them contains a postcode, we can assume that the first line is the sender address and the second line is the receiver address (name + street + postal code + city).;
        // line must not start with another else than a number
        // or city, costcode and a maximum of 3 white spaces
        const checkRegex = /(^\d{5}.*) |(^(.{1,20})([,])([ ]?)(\d{5})$)/;
        
       
        let postcodeLineIndex = -1; 
        for (let i = 0; i < lines.length; i++) {
            const lineContent = lines[i]?.trim() ?? '';
            if (checkRegex.test(lineContent)) {
                postcodeLineIndex = i;
                break;
            }
        }
        // postcodeLineIndex + 1 = Country
        // postcodeLineIndex = City + Postal Code
        // postcodeLineIndex - 1 = Street
        // postcodeLineIndex - 2 = Name
        // postcodeLineIndex - 3 = Sender Address (if first line is sender address)

        const senderLineIndex = postcodeLineIndex - 3 >= 0 ? postcodeLineIndex - 3 : 0;
        const nameLineIndex = postcodeLineIndex - 2 >= 0 ? postcodeLineIndex - 2 : 0;
        const streetLineIndex = postcodeLineIndex - 1 >= 0 ? postcodeLineIndex - 1 : 0;
        const postalCodeCityLineIndex = postcodeLineIndex >= 0 ? postcodeLineIndex : 0;



        // check if first line contains a postcode or has more than 5 words to determine if it's the sender address
        const firstIsSenderAddress = containsPostcode(lines[senderLineIndex] ?? '') || (lines[senderLineIndex] ?? '').split(' ').length >= 5;
        const senderAddress = firstIsSenderAddress ? lines[senderLineIndex] : '';

        const rowIndexName = nameLineIndex;
        const rowIndexStreet = streetLineIndex;
        const rowIndexPostalCodeCity = postalCodeCityLineIndex !== -1 ? postalCodeCityLineIndex : (firstIsSenderAddress ? 3 : 2);

        const postcodeCityLine = lines[rowIndexPostalCodeCity] || '';
        // extract postcode (5 digits) and city (rest of the line after postcode)
        let postalCode = '';
        let city = '';
        if (postcodeCityLine.includes(',')) {
            const parts = postcodeCityLine.split(',', 2);
            const postalCodePartIndex = parts[0]!.trim().match(/\d{5}/) ? 0 : 1;
            postalCode = parts[postalCodePartIndex]!.trim();
            city = parts[1 - postalCodePartIndex]!.trim();
        } else {
             const postcodeMatch = postcodeCityLine.match(/(\d{5})\s*(.*)/);
             postalCode = postcodeMatch ? postcodeMatch[1]! : '';
             city = postcodeMatch ? postcodeMatch[2]!.trim() : '';
        }

        // remove special chars such as [, ], (, ), /, \ , $, | from all fields to improve the accuracy of the extracted data
        const cleanString = (input: string) => input.replace(/[|$\\[\]()%&_\-/]/g, '').trim();
        const senderAddressClean = cleanString(senderAddress ?? '');
        const nameClean = cleanString(lines[rowIndexName] || '');
        const streetClean = cleanString(lines[rowIndexStreet] || '');
        const postalCodeClean = cleanString(postalCode);
        const cityClean = cleanString(city);


        return {
            senderAddress: {
                value: senderAddressClean
            },
            receiverAddress: {
                name: nameClean,
                street: streetClean,
                postalCode: postalCodeClean,
                city: cityClean
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