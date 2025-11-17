import { ReceiverParserRules, ReceiversParserDefinition } from "./parsers";

const SAMPLE_XML_1 : ReceiverParserRules= {
    encoding: 'utf8',
    type: 'xml',
    itemSelector: '//employees/employee',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    address: 'address',
    addressCountry: 'address/country',
    dateOfBirth: 'dateOfBirth',
    placeOfBirth: 'placeOfBirth',
    addressStreet: 'address/street',
    addressCity: 'address/city',
    addressPostcode: 'address/zipCode',
    receiverId: 'employeeNumber',
}

const SAMPLE_CSV_1 : ReceiverParserRules= {
    encoding: 'utf8',
    type: 'csv',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    dateOfBirth: 'dateOfBirth',
    placeOfBirth: 'placeOfBirth',
    address: 'address',
    addressStreet: 'street',
    addressCity: 'city',
    addressPostcode: 'zipCode',
    addressCountry: 'country',
    receiverId: 'employeeNumber',
    phone: 'phone',    
}

const GERMAN_SAMPLE_CSV_1 : ReceiverParserRules= {
   
    encoding: 'latin1', //  //encoding: 'windows-1252', does not work with Node TextDecoder
    type: 'csv',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'email',
    dateOfBirth: 'GebDatum',
    placeOfBirth: 'Geburtsort',
    address: 'Straße und Hausnummer',
    addressStreet: 'Straße und Hausnummer',
    addressCity: 'Ort',
    addressPostcode: 'Postleitzahl',
    addressCountry: 'Länderschlüssel',
    receiverId: 'PersNr',
    phone: 'Telefon',
}

export {
    SAMPLE_XML_1,
    SAMPLE_CSV_1,
    GERMAN_SAMPLE_CSV_1,
}

// enum with the sample parsers
const ALL : ReceiversParserDefinition[] = [
    {
        name: 'XML 1',
        description: 'XML file with employees',
        rules: SAMPLE_XML_1,
    },
    {
        name: 'CSV 1',
        description: 'CSV file with employees',
        rules: SAMPLE_CSV_1,
    },
    {
        name: 'SAP Export',
        description: 'German CSV file exported from SAP',
        rules: GERMAN_SAMPLE_CSV_1,
    }
]

export default ALL;
