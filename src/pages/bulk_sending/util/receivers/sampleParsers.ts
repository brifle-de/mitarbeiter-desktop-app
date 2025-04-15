import { ReceiverParserRules } from "./parsers";

const SAMPLE_XML_1 : ReceiverParserRules= {
    type: 'xml',
    itemSelector: '//employees/employee',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    dateOfBirth: 'dateOfBirth',
    placeOfBirth: 'placeOfBirth',
    addressStreet: 'address/street',
    addressCity: 'address/city',
    addressPostcode: 'address/zipCode',
    receiverId: 'employeeNumber',
}

export {
    SAMPLE_XML_1,
}

// enum with the sample parsers
const ALL = [
    {
        name: 'XML 1',
        description: 'XML file with employees',
        rules: SAMPLE_XML_1,
    }
]

export default ALL;
