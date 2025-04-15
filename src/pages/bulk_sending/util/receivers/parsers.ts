/**
 * selector rules to pupulate the fields
 */
export interface ReceiverParserRules {
    type: 'xml' | 'csv',
    firstName?: string,
    lastName?: string,
    email?: string,
    fullName?: string,
    phone?: string,
    receiverId?: string,
    dateOfBirth?: string,
    placeOfBirth?: string,
    address?: string,
    addressStreet?: string,
    addressCity?: string,
    addressPostcode?: string,
    // selector for get the root element of all receivers items. This is needed for xml files
    itemSelector?: string,
}

export interface ReceiverParserResult {
    firstName?: string,
    lastName?: string,
    email?: string,
    fullName?: string,
    phone?: string,
    receiverId?: string,
    dateOfBirth?: string,
    placeOfBirth?: string,
    address?: string,
    addressStreet?: string,
    addressCity?: string,
    addressPostcode?: string,
}

export class ReceiverParser {
    static parse(data: string, rules: ReceiverParserRules): ReceiverParserResult[] {
        if(rules.type === 'xml'){
            const p = new XMLReceiverParser(data);
            return p.parse(rules)
        }
        return []; 
    }
} 

class XMLReceiverParser{

    private data: string;

    constructor(data: string) {
        this.data = data;    
    }

    /**
     * parse the data and return the result
     * @param rules the rules to parse the data
     * @returns the parsed data
     * */
    public parse(rules: ReceiverParserRules): ReceiverParserResult[] {
        const domParser = new DOMParser();
        const xmlDoc = domParser.parseFromString(this.data, "text/xml");
        const results: ReceiverParserResult[] = [];
        
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
    private parseNode(node: Element, rules: ReceiverParserRules, xmlDoc: Document): ReceiverParserResult {
        const result: ReceiverParserResult = {};
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
            const xpath = rules[key as keyof ReceiverParserRules] as string;
            const nodes = xmlDoc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < nodes.snapshotLength; i++) {
                const node = nodes.snapshotItem(i) as Element;
                if (node) {
                    const value = node.textContent || '';
                    result[key as keyof ReceiverParserResult] = value;
                }
            }
        });
        return result;
    }
}