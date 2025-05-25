/**
 * Uses a assignment file to create a document record
 */

import CsvReader, { CsvDocument } from "src/utils/csv/csvReader";
import DocumentRecord, { DocumentRecordBase } from "./documentRecord";
import { SftpData } from "app/src-electron/models/EncryptedStore";

export default class AssignmentFile {

    private rules: AssignmentRules;

    public constructor(
        rules: AssignmentRules
    ) {
        this.rules = rules;
    }

    /**
     * parse the data and return the result
     * @param data the data to parse
     * @returns the parsed data
     * */
    public read(data: string) : DocumentRecord[] {
        if(this.rules.type === 'xml'){
            const p = new XMLAssignmentParser(data);
            return p.parse(this.rules)
        }else if(this.rules.type === 'csv'){
            const p = new CsvReader();     
            return this.parseCsv(p.parse(data), this.rules);
            
        }
        return []; 
    }

    /**
     * parse the data and return the result
     * @param rules the rules to parse the data
     * @returns the parsed data
     * */
    private parseCsv(csv: CsvDocument, rules: AssignmentRules) : DocumentRecord[]{
        const results: DocumentRecord[] = [];
        const keys = Object.keys(rules);
        // remove type from keys
        const typeIndex = keys.indexOf('type');
        if (typeIndex > -1) {
            keys.splice(typeIndex, 1);
        }
        // remove itemSelector
        const itemSelectorIndex = keys.indexOf('itemSelector');
        if (itemSelectorIndex > -1) {
            keys.splice(itemSelectorIndex, 1);
        }
        
        // iterate over all rows and get the values from the csv document
        for (const row of csv.records) {
            const result: DocumentRecord = {type: 'file', filePath: "", receiverId: ""};
            keys.forEach((key) => {
                const value = row[rules[key as keyof AssignmentRules] as string] || '';
                const mapKey = key as keyof DocumentRecordBase;
                result[mapKey] = value!;                
            });
            results.push(result);
        }
        return results;
    }
}

export interface AssignmentRules {
    type: 'xml' | 'csv',
    
    filePath?: string, // rule to get the 
    receiverId?: string,
    itemSelector?: string, // used for xml files to get the root element of all receivers items. This is needed for xml files
}


class XMLAssignmentParser{

    private data: string;
    private type: 'file' | 'sftp';
    private sftp?: SftpData; 


    constructor(data: string, type: 'file' | 'sftp' = 'file', sftp?: SftpData) {
        this.data = data;    
        this.type = type;
        if(sftp){
            this.sftp = sftp;
        }
    }

    /**
     * parse the data and return the result
     * @param rules the rules to parse the data
     * @returns the parsed data
     * */
    public parse(rules: AssignmentRules): DocumentRecord[] {
        const domParser = new DOMParser();
        const xmlDoc = domParser.parseFromString(this.data, "text/xml");
        const results: DocumentRecord[] = [];
        
        const rootSelector = rules.itemSelector || '/';
        const nodes = xmlDoc.evaluate(rootSelector, xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        // iterate over all nodes and get the values from the xml document
        for (let i = 0; i < nodes.snapshotLength; i++) {
            const node = nodes.snapshotItem(i) as Element;
            if (node) {
                const result = this.parseNode(node, rules, xmlDoc);
                results.push(result);
            }
        }

        return results;
    }


    /**
     * parse a node and return the result
     * @param node the node to parse
     * @param rules the rules to parse the node
     * @param xmlDoc the xml document to use for parsing
     * @returns the parsed data
     */
    private parseNode(node: Element, rules: AssignmentRules, xmlDoc: Document): DocumentRecord {
        const result: DocumentRecord = {type: this.type, filePath: "", receiverId: ""};
        if(this.sftp){
            result.sftp = this.sftp;
        }
        const keys = Object.keys(rules);
        // remove type from keys
        const typeIndex = keys.indexOf('type');
        if (typeIndex > -1) {
            keys.splice(typeIndex, 1);
        }
        // remove itemSelector
        const itemSelectorIndex = keys.indexOf('itemSelector');
        if (itemSelectorIndex > -1) {
            keys.splice(itemSelectorIndex, 1);
        }
        // iterate over all keys and get the values from the xml document
        keys.forEach((key) => {
            const xpath = rules[key as keyof AssignmentRules] as string;
            const nodes = xmlDoc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < nodes.snapshotLength; i++) {
                const node = nodes.snapshotItem(i) as Element;
                if (node) {
                    const value = node.textContent;
                    if(value){
                        // ignore type
                        result[key as keyof DocumentRecordBase] = value;
                    }
                    
                }
            }
        });
        return result;
    }
}