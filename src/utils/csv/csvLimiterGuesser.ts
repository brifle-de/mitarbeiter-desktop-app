export default class CsvLimiterGuesser {

    private allowedDelimiters: string[] = [',', ';'];
    private defaultDelimiter: string = ';';
    private recordSeparator: string = '\n';
    private sampleSize: number = 3;

    /**
     * creates a guesser to determine the delimiter used in a csv file
     * @param allowedDelimiters the allowed delimiters to guess from, default are , and ;
     * @param defaultDelimiter the default delimiter to use if no delimiter is found, default is ;
     * @param recordSeparator the record separator to use to split the lines, default is \n
     */
    public constructor(allowedDelimiters: string[] = [',', ';'], defaultDelimiter: string = ';', recordSeparator: string = '\n') {
        if(allowedDelimiters && allowedDelimiters.length > 0) {
            this.allowedDelimiters = allowedDelimiters;
        }
        this.defaultDelimiter = defaultDelimiter;
        this.recordSeparator = recordSeparator;
    }

    /** guess the delimiter used in the csv data */
    public guess(data: string): string {
        const lines = data.split(this.recordSeparator).map(line => line.trim()).filter(line => line.length > 0);
        if(lines.length === 0) {
            return this.defaultDelimiter;
        }
        const occuranceMap = this.computeOccuranceMap(lines);
        // find the maximum value in the value and the key
        return this.mostUsedDelimiter(occuranceMap, this.defaultDelimiter);
    }

  

    /** compute the occurance map for each delimiter in the first n lines */
    private computeOccuranceMap(lines: string[]) {
        const occuranceMap = new Map<string, number>();
        for (const delimiter of this.allowedDelimiters) {
            let totalOccurrences = 0;
            for (let i = 0; i < Math.min(this.sampleSize, lines.length); i++) {
                if(lines[i] != null) {
                    totalOccurrences += this.countOccurrences(lines[i]!, delimiter);
                }                
            }
            occuranceMap.set(delimiter, totalOccurrences);
        }
        return occuranceMap;
    }

    /** find the delimiter with the most occurrences */
    private mostUsedDelimiter(occuranceMap: Map<string, number>, defaultDelimiter: string): string {
        // default delimter
        let maxDelimiter = defaultDelimiter;
        let maxOccurrences = occuranceMap.get(defaultDelimiter) ?? 0;
        for(const [delimiter, occurrences] of occuranceMap) {
            if(occurrences > maxOccurrences) {
                maxOccurrences = occurrences;
                maxDelimiter = delimiter;
            }
        }
        return maxDelimiter;
    }

    /** count the occurrences of the delimiter in the line */
    private countOccurrences(line: string, delimiter: string): number {
        return line.split(delimiter).length - 1;
    }

}