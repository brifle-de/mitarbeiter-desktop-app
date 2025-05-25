import { ReceiverParserRules } from "./parsers";

const SAMPLE_XML_1 : ReceiverParserRules= {
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


export {
    SAMPLE_XML_1,
    SAMPLE_CSV_1,
}

// enum with the sample parsers
const ALL = [
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
]

export default ALL;
