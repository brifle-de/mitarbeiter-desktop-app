import { SendDocReq } from "../receivers/receiverRecord"


export interface ReportsExporterRules{
    type: 'csv' | 'xml' | 'json'
    csv?: CsvReportRules
    xml?: XmlReportRules
    json?: JsonReportRules,
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
    path: string,
}

export interface CsvReportRules{
    delimiter: string
    headers: string[]
}

export interface XmlReportRules{
    rootElement: string
    itemElement: string    
}

export interface JsonReportRules{
    rootElement: string
}

export interface ReportRecord {
    path?: string
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

}


export class ReportsExporter {
    private data: SendDocReq[]

    constructor(data: SendDocReq[]) {
        this.data = data
    }

    public export(rules: ReportsExporterRules): string {
        if(rules.type === 'csv'){
            return this.exportCsv(rules)
        }else if(rules.type === 'xml'){
            return this.exportXml(rules)
        }else if(rules.type === 'json'){
            return this.exportJson(rules)
        }
        return ''
    }

    private prepareData(data: SendDocReq[]): ReportRecord[] {
        return data.map((item) => {
            return {
                path: item.doc.filePath,
                address: item.receiver?.original.address,
                addressCity: item.receiver?.original.addressCity,
                addressPostcode: item.receiver?.original.addressPostcode,
                addressStreet: item.receiver?.original.addressStreet,
                dateOfBirth: item.receiver?.original.dateOfBirth,
                placeOfBirth: item.receiver?.original.placeOfBirth,
                receiverId: item.doc.receiverId,                
                email: item.receiver?.original.email,
                firstName: item.receiver?.original.firstName,
                fullName: item.receiver?.original.fullName,
                lastName: item.receiver?.original.lastName,
                nameAtBirth: item.receiver?.original.nameAtBirth,
                phone: item.receiver?.original.phone,
            } as ReportRecord
        });
    }

    /**
     * exports the data to csv format
     * @param rules the rules to export the data
     * @returns 
     */
    private exportCsv(rules: ReportsExporterRules): string {
        const csvRules = rules.csv
        if(!csvRules) return ''
        const headers = csvRules.headers.join(csvRules.delimiter)
        const headerMap : Map<string, string> = new Map();
        // remove type, csv, xml, json from the rules
        const rulesWithoutType = Object.entries(rules).filter(([key]) => {
            return key !== 'type' && key !== 'csv' && key !== 'xml' && key !== 'json'
        });
        // add the headers to the map
        rulesWithoutType.forEach(([key, value]) => {
            if(typeof value === 'string'){
                headerMap.set(value, key)
            }
        });

        const resultLines : Array<string> = [];

        // iterate over all data and add them to the result
        this.prepareData(this.data).forEach((item) => {            
            const values : Array<string> = []
            csvRules.headers.forEach((header) => {
                const key = headerMap.get(header)
                if(!key) return
                const value = item[key as keyof ReportRecord]
                if(!value) {
                    values.push('')
                    return
                }
                values.push(value.toString())                
            })
            resultLines.push(values.join(csvRules.delimiter))
        });

        const result = [headers, ...resultLines].join('\n')
        return result
    }

    /**
     * exports the data to xml format
     * @param rules the rules to export the data
     * @returns 
     */
    private exportXml(rules: ReportsExporterRules): string {
        const xmlRules = rules.xml
        if(!xmlRules) return ''
        const rootElement = xmlRules.rootElement 
        const itemElement = xmlRules.itemElement
        const items = this.prepareData(this.data).map((item) => {
            if(!item) return ''
            return `<${itemElement}>${Object.entries(item)
                .map(([key, value]) => value? `<${key}>${value}</${key}>`: '')
                .join('')}</${itemElement}>`
        })
        .join('')
        return `<${rootElement}>${items}</${rootElement}>`
    }

    /**
     * exports the data to json format
     * @param rules the rules to export the data
     * @returns 
     */
    private exportJson(rules: ReportsExporterRules): string {
        const jsonRules = rules.json
        if(!jsonRules) return ''
        const rootElement = jsonRules.rootElement
        const items = this.prepareData(this.data).map((item) => {
            return Object.entries(item).reduce((acc, [key, value]) => {                
                // @ts-expect-error it is expected to be of type any
                acc[key] = value
                return acc
            }, {})
        })
        return JSON.stringify({ [rootElement]: items })
    }
}