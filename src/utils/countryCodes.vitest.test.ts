import { describe, expect, test } from 'vitest'
import { CountryCodeUtil } from './countryCodes';

describe("getCountryName/1", () => {
    test("Valid country codes", () => {
        expect(CountryCodeUtil.getCountryName("DE")).toBe("Deutschland");
        expect(CountryCodeUtil.getCountryName("AT")).toBe("Österreich");
        expect(CountryCodeUtil.getCountryName("CH")).toBe("Schweiz");
        expect(CountryCodeUtil.getCountryName("US")).toBe("Vereinigte Staaten");
        expect(CountryCodeUtil.getCountryName("FR")).toBe("Frankreich");
        expect(CountryCodeUtil.getCountryName("IN")).toBe("Indien");
        expect(CountryCodeUtil.getCountryName("CN")).toBe("China");        
    });
    test("Invalid country code", () => {
        expect(CountryCodeUtil.getCountryName("XX")).toBe(null)
        expect(CountryCodeUtil.getCountryName("")).toBe(null);
        expect(CountryCodeUtil.getCountryName("123")).toBe(null);
    });
});

describe("getCountryCode/1", () => {
    test("Valid country names", () => {
        expect(CountryCodeUtil.getCountryCode("Deutschland")).toBe("DE");
        expect(CountryCodeUtil.getCountryCode("Österreich")).toBe("AT");
        expect(CountryCodeUtil.getCountryCode("Schweiz")).toBe("CH");
        expect(CountryCodeUtil.getCountryCode("Vereinigte Staaten")).toBe("US");
        expect(CountryCodeUtil.getCountryCode("Frankreich")).toBe("FR");
        expect(CountryCodeUtil.getCountryCode("Indien")).toBe("IN");
        expect(CountryCodeUtil.getCountryCode("China")).toBe("CN");        
    });
    test("Invalid country name", () => {
        expect(CountryCodeUtil.getCountryCode("Narnia")).toBe(null)
        expect(CountryCodeUtil.getCountryCode("")).toBe(null);
        expect(CountryCodeUtil.getCountryCode("123")).toBe(null);
    });
});

describe("parseCode/1", () => {
    test("Valid country code and name", () => {
        expect(CountryCodeUtil.parseCode("DE")).toBe("DE");
        expect(CountryCodeUtil.parseCode("Deutschland")).toBe("DE");
        expect(CountryCodeUtil.parseCode("AT")).toBe("AT");
        expect(CountryCodeUtil.parseCode("Österreich")).toBe("AT");
        expect(CountryCodeUtil.parseCode("CH")).toBe("CH");
        expect(CountryCodeUtil.parseCode("Schweiz")).toBe("CH");
        expect(CountryCodeUtil.parseCode("US")).toBe("US");
        expect(CountryCodeUtil.parseCode("Vereinigte Staaten")).toBe("US");
        expect(CountryCodeUtil.parseCode("IN")).toBe("IN");
        expect(CountryCodeUtil.parseCode("Indien")).toBe("IN");

    });
    test("Invalid country code or name", () => {
        expect(CountryCodeUtil.parseCode("XX")).toBe(null);
        expect(CountryCodeUtil.parseCode("Narnia")).toBe(null);
        expect(CountryCodeUtil.parseCode("")).toBe(null);
        expect(CountryCodeUtil.parseCode("123")).toBe(null);
    });
});

    