export interface DocumentSourceDirParserRules {
    // callback: (fileName: string) => string,
    regexCatch: (fileName: string) => string,
    // callback to get the receiver id from the file name
    regexOutputReceiverID: (match: RegExpMatchArray) => string | null,
    // callback to get the date from the file name. Return null if no date is set
    regexOutputDate(match: RegExpMatchArray): Date | null,
}

export interface DocumentParserImportRecord {
    name: string,
    description: string,
    rules: {
        regexCatch: string, // regex as string
        dateFormat: string,  // i.e. 'YYYY-MM-DD' or 'DD.MM.YYYY'
        datePosition: number, // set to -1 if no date is present
        receiverIdPosition: number,
    }
}

export interface DocumentSourceDirParserResult {
    // the file name without the path
    fileName: string,
    // the receiver id from the file name
    receiverId: string,
    // the date from the file name. Return null if no date is set
    date: Date | null,
}

export class DocumentSourceDirParser{
    private data: string[];

    /**
     * 
     * @param data the data to parse. This is the list of file names
     */
    constructor(data: string[]) {
        this.data = data;
    }

    /**
     * parse the data and return the result
     * @param rules the rules to parse the data
     * @returns the parsed data
     * */
    public parse(rules: DocumentSourceDirParserRules): DocumentSourceDirParserResult[] {
        const result: DocumentSourceDirParserResult[] = [];
        for (const fileName of this.data) {
            const regex = new RegExp(rules.regexCatch(fileName));
            const match = fileName.match(regex);
            if (match) {
                const date = rules.regexOutputDate(match);
                const receiverId = rules.regexOutputReceiverID(match);
                // if receiverId is null, skip the file
                if (!receiverId) {
                    continue;
                }
                result.push({
                    fileName: fileName,
                    receiverId: receiverId,
                    date: date
                });
            }
        }
        return result;
    }
}