import { DocumentParserImportRecord } from "src/pages/bulk_sending/util/documents/parsers";
import { ReceiversParserDefinition } from "src/pages/bulk_sending/util/receivers/parsers";

export class ParsersProvider {

    /**
     * gets all receivers file parsers
     * @returns 
     */
    getReceiversParsers(): Promise<Record<string, ReceiversParserDefinition>> {
        const rawData = window.parsersProvider.fetchParsersByType('receivers');
        return rawData.then((data) => {
            const jsonData: Record<string, ReceiversParserDefinition> = {};
            for (const key in data) {
                const record = data[key];
                if (!record) {
                    continue;
                }
                jsonData[key] = JSON.parse(record) as ReceiversParserDefinition;
            }
            return jsonData;
        });
    }


    /**     
     *  gets all directory parsers
     * @returns 
     */
    getDirectoriesParsers(): Promise<Record<string, DocumentParserImportRecord>> {
        const rawData = window.parsersProvider.fetchParsersByType('directories');
        return rawData.then((data) => {
            const jsonData: Record<string, DocumentParserImportRecord> = {};
            for (const key in data) {
                const record = data[key];
                if (!record) {
                    continue;
                }
                jsonData[key] = JSON.parse(record) as DocumentParserImportRecord;
            }
            return jsonData;
        });
    }
   
}

