export default class CsvReader {

    private delimiter: string;
    private defaultHeaders: string[] | null = null;
    private skipFirstLine: boolean = true;

    /**
     * constructor for the csv reader
     * @param delimiter the delimiter to use
     * @param skipFirstLine if true, the first line will be skipped as headers
     * @param headers the headers to use, if null, the first line of the csv will be used as headers
     * */
    constructor(delimiter: string = ',', skipFirstLine: boolean = true, headers: string[] | null = null) {
        this.delimiter = delimiter;
        this.defaultHeaders = headers;
        this.skipFirstLine = skipFirstLine;
    }

    /**
     * parse the csv data and return the result
     * @param data the csv data
     * @returns the parsed data
     * */
    public parse(data: string): CsvDocument {

        // split the data into lines
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if(lines.length === 0 || lines[0] == null) {
            return { headers: this.defaultHeaders ?? [], records: [] };
        }
        // parse headers
        const headers = this.defaultHeaders === null ? this.parseHeaders(lines[0]) : this.defaultHeaders;   
        return this.parseRecords(headers, lines);
    }


    /**
     * parse the headers from the first line of the csv
     * @param line the line to parse
     * @returns 
     */
    private parseHeaders(line: string) {
        return line.split(this.delimiter).map(header => header.trim());
    }

    /**
     * parse the records from the csv data
     * @param headers the headers to use
     * @param lines the lines to parse
     * @returns the parsed data
     */
    private parseRecords(headers: string[], lines: string[]) {
        const startIndex = this.skipFirstLine ? 1 : 0;

        // parse records
        const records: CsvRecord[] = lines.slice(startIndex).map(line => {
            const values = line.split(this.delimiter).map(value => value.trim());
            const record: CsvRecord = {};
            headers?.forEach((header, index) => {
                record[header] = values[index] ?? '';
            });
            return record;
        });        
        return { headers: headers ?? [], records };
    }
}

export interface CsvDocument {
    headers: string[];
    records: CsvRecord[];
}

export interface CsvRecord {
    [key: string]: string;

}