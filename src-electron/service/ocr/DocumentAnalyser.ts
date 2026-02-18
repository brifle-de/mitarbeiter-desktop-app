import DocumentConfigData from "./documentsConfig.json";

export default class DocumentAnalyser{

    private documentConfig: DocumentConfig;
    private language: string = "de";

    constructor(language: string = "de") {
        this.documentConfig = DocumentConfigData as DocumentConfig;
        this.language = language;
    }

    extractInvoiceNumber(rawText: string) : string {
        const config = this.documentConfig.languages[this.language.toLocaleLowerCase()];
        if(!config) {
            throw new Error(`No document configuration found for language: ${this.language}`);
        }
        const invoiceNumberConfig = config.invoiceNumber;
        if(!invoiceNumberConfig) {
            throw new Error(`No invoice number configuration found for language: ${this.language}`);
        }
        let invoiceNumber = "";
        for (const pattern of invoiceNumberConfig.regexPatterns) {
            const regex = new RegExp(pattern.pattern, "gi");
            const match = Array.from(rawText.matchAll(regex));
            if (match && match.length > 0) {
                for (const m of match) {                   
                    const expectedGroupContent = m[pattern.group];
                    if (!expectedGroupContent || expectedGroupContent.trim() === '') {
                        console.warn(`Expected group ${pattern.group} is undefined or empty for match: ${m[0]}. Skipping this match.`);
                        continue;
                    }
                    invoiceNumber = expectedGroupContent;
                    break;
                }
            }
        }
        return invoiceNumber.replaceAll("—", "-").trim();
    }
 
    checkDocumentType(rawText: string) {
        const config = this.documentConfig.languages[this.language.toLocaleLowerCase()];
        if(!config) {
            throw new Error(`No document configuration found for language: ${this.language}`);
        }
        const categories = config.categories;
        const normalized = this.normalizeText(rawText);
        const results: { [categoryName: string]: { score: number; isMatch: boolean } } = {};

         
        for (const [categoryName, category] of Object.entries(categories)) {
            let score = 0;

            // KEYWORDS
            for (const keyword of category.keywords) {
            score +=
                this.countOccurrences(normalized, keyword.value) *
                keyword.weight
            }

            // REGEX
            for (const regexRule of category.regexPatterns) {
                const regex = new RegExp(regexRule.pattern, "gi");
                const matches = normalized.match(regex);
                if (matches) {
                    score += matches.length * regexRule.weight;
                }
            }
            results[categoryName] = {
                score,
                isMatch: score > category.threshold
            };
        
        }
        return results;
    }


    private normalizeText(text: string): string {
        return text
            .replace(/\r\n/g, "\n")
            .replace(/\s+/g, " ")
            .trim();
    }

 

    private countOccurrences(text: string, keyword: string): number {
        const regex = new RegExp(this.escapeRegex(keyword), "gi");
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }

    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

}


export interface DocumentConfig {
    version: string;
    languages: {
        [languageCode: string]: {
            invoiceNumber: {
                regexPatterns: {
                    pattern: string;
                    group: number;
                }[];
            };
            categories: {
                [categoryName: string]: CategoryConfig;
            }
        }
    };
    
}

export interface KeywordRule {
  value: string;
  weight: number;
}

export interface RegexRule {
  pattern: string;
  weight: number;
}

export interface StructuralSignal {
  type: string;
  weight: number;
}

export interface CategoryConfig {
  threshold: number;
  keywords: KeywordRule[];
  regexPatterns: RegexRule[];
  structuralSignals: StructuralSignal[];
}

