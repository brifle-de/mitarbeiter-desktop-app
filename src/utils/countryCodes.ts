interface CountryCode{
    code: string;
    name: string;
}


class CountryCodeUtil {
    private static countryCodes: CountryCode[] = [       
        /*
        All European countries
        */
        { code: 'DE', name: 'Deutschland' },
        { code: 'AT', name: 'Österreich' },
        { code: 'CH', name: 'Schweiz' },
        { code: 'FR', name: 'Frankreich' },
        { code: 'IT', name: 'Italien' },
        { code: 'ES', name: 'Spanien' },
        { code: 'PL', name: 'Polen' },
        { code: 'NL', name: 'Niederlande' },
        { code: 'BE', name: 'Belgien' },
        { code: 'SE', name: 'Schweden' },
        { code: 'NO', name: 'Norwegen' },
        { code: 'FI', name: 'Finnland' },
        { code: 'DK', name: 'Dänemark' },
        { code: 'PT', name: 'Portugal' },
        { code: 'CZ', name: 'Tschechische Republik' },
        { code: 'HU', name: 'Ungarn' },
        { code: 'RO', name: 'Rumänien' },
        { code: 'SK', name: 'Slowakei' },
        { code: 'SI', name: 'Slowenien' },
        { code: 'HR', name: 'Kroatien' },
        { code: 'BG', name: 'Bulgarien' },
        { code: 'EE', name: 'Estland' },
        { code: 'LV', name: 'Lettland' },
        { code: 'LT', name: 'Litauen' },
        { code: 'IS', name: 'Island' },
        { code: 'LI', name: 'Liechtenstein' },
        { code: 'MC', name: 'Monaco' },
        { code: 'SM', name: 'San Marino' },
        { code: 'VA', name: 'Vatikanstadt' },
        /**
         * All American Countries
         */
        { code: 'US', name: 'Vereinigte Staaten' },
        { code: 'CA', name: 'Kanada' },
        { code: 'MX', name: 'Mexiko' },
        { code: 'BR', name: 'Brasilien' },
        { code: 'AR', name: 'Argentinien' },
        { code: 'CO', name: 'Kolumbien' },
        { code: 'PE', name: 'Peru' },
        { code: 'VE', name: 'Venezuela' },
        { code: 'CL', name: 'Chile' },
        { code: 'EC', name: 'Ecuador' },
        { code: 'PY', name: 'Paraguay' },
        { code: 'UY', name: 'Uruguay' },
        { code: 'BO', name: 'Bolivien' },
        { code: 'PY', name: 'Paraguay' },
        { code: 'GY', name: 'Guyana' },
        { code: 'SR', name: 'Suriname' },
        { code: 'TT', name: 'Trinidad und Tobago' },
        /**
         * All Asian Countries
         */
        { code: 'CN', name: 'China' },
        { code: 'JP', name: 'Japan' },
        { code: 'IN', name: 'Indien' },
        { code: 'KR', name: 'Südkorea' },
        { code: 'ID', name: 'Indonesien' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'PH', name: 'Philippinen' },
        { code: 'TH', name: 'Thailand' },
        { code: 'VN', name: 'Vietnam' },
        { code: 'SG', name: 'Singapur' },
        { code: 'HK', name: 'Hongkong' },
        { code: 'TW', name: 'Taiwan' },
        { code: 'PK', name: 'Pakistan' },
        { code: 'BD', name: 'Bangladesch' },
        { code: 'LK', name: 'Sri Lanka' },
        { code: 'NP', name: 'Nepal' },
        { code: 'MM', name: 'Myanmar' },
        { code: 'KH', name: 'Kambodscha' },
        { code: 'LA', name: 'Laos' },
        { code: 'MN', name: 'Mongolei' },
        { code: 'BT', name: 'Bhutan' },
        { code: 'MV', name: 'Malediven' },
        { code: 'TL', name: 'Osttimor' },
        /**
         * All African Countries
         */
        { code: 'ZA', name: 'Südafrika' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'EG', name: 'Ägypten' },
        { code: 'KE', name: 'Kenia' },
        { code: 'GH', name: 'Ghana' },
        { code: 'DZ', name: 'Algerien' },
        { code: 'MA', name: 'Marokko' },
        { code: 'TN', name: 'Tunesien' },
        { code: 'ET', name: 'Äthiopien' },
        { code: 'UG', name: 'Uganda' },
        { code: 'TZ', name: 'Tansania' },
        { code: 'CM', name: 'Kamerun' },
        { code: 'CI', name: 'Elfenbeinküste' },
        { code: 'SN', name: 'Senegal' },
        { code: 'ML', name: 'Mali' },
        { code: 'BF', name: 'Burkina Faso' },
        { code: 'NE', name: 'Niger' },
        { code: 'RW', name: 'Ruanda' },
        { code: 'BI', name: 'Burundi' },
        { code: 'SL', name: 'Sierra Leone' },
        { code: 'LR', name: 'Liberia' },
        { code: 'TG', name: 'Togo' },
        { code: 'BJ', name: 'Benin' },
        { code: 'MW', name: 'Malawi' },
        { code: 'ZM', name: 'Sambia' },
        { code: 'ZW', name: 'Simbabwe' },
        { code: 'MZ', name: 'Mosambik' },
        { code: 'AO', name: 'Angola' },
        { code: 'CD', name: 'Demokratische Republik Kongo' },
        { code: 'CG', name: 'Kongo-Brazzaville' },
        { code: 'GA', name: 'Gabun' },
        { code: 'GQ', name: 'Äquatorialguinea' },
        { code: 'ST', name: 'São Tomé und Príncipe' },
        /**
         * All Oceanian Countries
         */
        { code: 'AU', name: 'Australien' },
        { code: 'NZ', name: 'Neuseeland' },
        { code: 'FJ', name: 'Fidschi' },
        { code: 'PG', name: 'Papua-Neuguinea' },
        { code: 'SB', name: 'Salomonen' },
        { code: 'VU', name: 'Vanuatu' },
        { code: 'NC', name: 'Neukaledonien' },
        { code: 'PF', name: 'Französisch-Polynesien' },
    ];

    public static getCountryName(code: string): string | null {
        const normalizedCode = code.trim().toUpperCase();
        const country = this.countryCodes.find(c => c.code === normalizedCode);
        return country ? country.name : null;
    }

    public static getCountryCode(name: string): string | null {
        const normalizedCountryName = name.trim().toLowerCase();
        const country = this.countryCodes.find(c => c.name.toLowerCase() === normalizedCountryName);
        return country ? country.code : null;
    }

    public static getAllCountryCodes(): CountryCode[] {
        return this.countryCodes;
    }
}


export type { CountryCode, CountryCodeUtil };