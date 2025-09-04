import { DocumentSourceDirParserRules } from "./parsers";

const SAMPLE_1 : DocumentSourceDirParserRules= {
    regexCatch() {
        // <receiverID>.pdf
        // receiverID = alphanumeric string
        return `^([^_]+_)?([a-zA-Z0-9]+)\\.pdf$`;
    },
    regexOutputReceiverID(match: RegExpMatchArray) {        
        // return the first group of the regex
        if(!match || match.length <= 1) {
            return null
        }  
        return match[2]!;
    },
    regexOutputDate() {
        // return null if no date is set
        return null;
    }
}
// Dateiname: HP3-378_EN-SB_z2025-08_d2025-08-20_p00123456_i485846.pdf
const KOMM_ONE_PERSONALAKTE : DocumentSourceDirParserRules= {
    regexCatch() {       
        // <prefix> : HP3-378
        // <type> : EN-SB
        // <month> : 2025-08
        // <date> : 2025-08-20
        // <receiverID> : 00123456
        // <index> : 485846
        return `^([a-zA-Z0-9-]+)_([a-zA-Z0-9-]+)_z([0-9]{4}-[0-9]{2})_d([0-9]{4}-[0-9]{2}-[0-9]{2})_p([a-zA-Z0-9]+)_i([a-zA-Z0-9]+)[.]pdf$`;
    },
    regexOutputReceiverID(match: RegExpMatchArray) {
        // return the first group of the regex
        if(!match || match.length <= 4) {
            return null
        }  
        return match[5]!;
    },
    regexOutputDate(match: RegExpMatchArray) {       
        // return the first group of the regex
        if(!match || match.length <= 3) {
            return null
        }  
        // date is in the format YYYY-MM-DD
        // convert to Date object
        const dateString = match[4]!;
        const date = new Date(dateString);
        return date;
    }
}

const KOMM_ONE_1 : DocumentSourceDirParserRules= {
    // files has the format: 
    // <Sys>_<Mdt>_<Typ>_<PerNr>_<Datum>_<Nr>.pdf
    // PerNr = alphanumeric string
    // Datum = TT.MM.JJJJ, while TT = 1 or 2 digits, MM = 1 or 2 digits, JJJJ = 4 digits
    
    regexCatch() {       
        return `^([a-zA-Z0-9]+)_([a-zA-Z0-9]+)_([a-zA-Z0-9]+)_([a-zA-Z0-9]+)_([0-9]{1,2}[.][0-9]{1,2}[.][0-9]{4})_([a-zA-Z0-9]+)[.]pdf$`;
    },
    regexOutputReceiverID(match: RegExpMatchArray) {
        // return the fourth group of the regex
        if(!match || match.length <= 4) {
            return null
        }
        return match[4]!;
    },
    regexOutputDate(match: RegExpMatchArray) {
        // return the date from the regex
        if(!match || match.length <= 5) {
            return null
        }
        const dateString = match[5]!; // format: TT.MM.JJJJ
        //split the date string into day, month and year by using the dot as separator
        const [day, month, year] = dateString.split('.');
        const prepDay = day?.length === 1 ? `0${day}` : day;
        const prepMonth = month?.length === 1 ? `0${month}` : month;
        const isoDate = `${year}-${prepMonth}-${prepDay}`; // format: YYYY-MM-DD
        // convert the date string to a Date object
        const date = new Date(isoDate);
        return date; 
    }
}


export {
    SAMPLE_1,
    KOMM_ONE_1,
    KOMM_ONE_PERSONALAKTE
}

// enum with the sample parsers

const ALL = [
    {
        name: '<prefix>_<receiverID>.pdf',
        description: 'Präfix_<receiverID>.pdf',
        rules: SAMPLE_1,
    }, 
    {
        name: "KOMM ONE Personalakte - <PerNr>.pdf",
        description: "file is named <PerNr>.pdf",
        rules: KOMM_ONE_PERSONALAKTE,
    },
    {
        name: "KOMM ONE 1 - <Sys>_<Mdt>_<Typ>_<PerNr>_<Datum>_<Nr>.pdf",
        description: "file is named <Sys>_<Mdt>_<Typ>_<PerNr>_<Datum>_<Nr>.pdf",
        rules: KOMM_ONE_1,
    }
]

export default ALL;