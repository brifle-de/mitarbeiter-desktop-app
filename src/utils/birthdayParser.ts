interface DateFormat {
    separator: string;
    order: string[]; // e.g., ['DD', 'MM', 'YYYY']
    regex: RegExp;
    format: string;
}

export default class BirthdayParser {


    /** 
     * Parses a birthday string into a Date object.
     * Supports formats: "YYYY-MM-DD", "DD/MM/YYYY", "DD.MM.YYYY", "YYYY/MM/DD", "DD-MM-YYYY"
     * @param input - The birthday string to parse
     * @returns A Date object if parsing is successful, otherwise null
     */
    public static parseBirthday(input: string): Date | null {
        const trimmedInput = input.trim();
        const format = this.detectFormat(trimmedInput);
        if (!format) {
            return null;
        }
        const parts = trimmedInput.split(format.separator);
        if (parts.length !== 3) {
            return null;
        }
        const dateParts: { [key: string]: number } = {};
        for (let i = 0; i < 3; i++) {
            const part = parts[i]!;
            const key = format.order[i]!;
            dateParts[key] = parseInt(part, 10);
        }

        const { DD, MM, YYYY } = dateParts;
        return new Date(YYYY!, MM! - 1, DD);
    }

    public static standardizeBirthday(input: string): string | null {
        const date = this.parseBirthday(input);
        if (!date) {
            return null;
        }

        // DD/MM/YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private static detectFormat(dateStr: string): DateFormat | null {
        const formats: DateFormat[] = [
            { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD', separator: '-', order: ['YYYY', 'MM', 'DD'] },
            { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'DD/MM/YYYY', separator: '/', order: ['DD', 'MM', 'YYYY'] },
            { regex: /^\d{2}\.\d{2}\.\d{4}$/, format: 'DD.MM.YYYY' , separator: '.', order: ['DD', 'MM', 'YYYY'] },
            { regex: /^\d{4}\/\d{2}\/\d{2}$/, format: 'YYYY/MM/DD' , separator: '/', order: ['YYYY', 'MM', 'DD'] },
            { regex: /^\d{2}-\d{2}-\d{4}$/, format: 'DD-MM-YYYY' , separator: '-', order: ['DD', 'MM', 'YYYY'] }
        ];

        for (const f of formats) {
            if (f.regex.test(dateStr)) {
                return f;
            }
        }

        return null;
    }
}