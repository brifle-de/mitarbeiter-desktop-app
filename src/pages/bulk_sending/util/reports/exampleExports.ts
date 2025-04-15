import { ReportsExporterRules } from "./exporter"


const DefaultCsvExport :ReportsExporterRules = {
    type: 'csv',
    csv: {
        delimiter: ',',
        headers: [
            'receiverId',
            'firstName',
            'lastName',
            'nameAtBirth',
            'email',
            'fullName',
            'phone',
            'dateOfBirth',
            'placeOfBirth',
            'address',
            'addressStreet',
            'addressCity',
            'addressPostcode'
        ]
    },
    address: "address",
    addressCity: "addressCity",
    addressPostcode: "addressPostcode",
    addressStreet: "addressStreet",
    dateOfBirth: "dateOfBirth",
    email: "email",
    firstName: "firstName",
    fullName: "fullName",
    lastName: "lastName",
    nameAtBirth: "nameAtBirth",
    phone: "phone",
    placeOfBirth: "placeOfBirth",
    receiverId: "receiverId",
    path: 'path',
}

const DefaultJsonExport :ReportsExporterRules = {
    type: 'json',
    json: {
        rootElement: 'receivers',
    },
    address: "address",
    addressCity: "addressCity",
    addressPostcode: "addressPostcode",
    addressStreet: "addressStreet",
    dateOfBirth: "dateOfBirth",
    email: "email",
    firstName: "firstName",
    fullName: "fullName",
    lastName: "lastName",
    nameAtBirth: "nameAtBirth",
    phone: "phone",
    placeOfBirth: "placeOfBirth",
    receiverId: "receiverId",
    path: 'path',
}

const DefaultXmlExport :ReportsExporterRules = {
    type: 'xml',
    xml: {
        rootElement: 'receivers',
        itemElement: 'receiver',
    },
    address: "address",
    addressCity: "addressCity",
    addressPostcode: "addressPostcode",
    addressStreet: "addressStreet",
    dateOfBirth: "dateOfBirth",
    email: "email",
    firstName: "firstName",
    fullName: "fullName",
    lastName: "lastName",
    nameAtBirth: "nameAtBirth",
    phone: "phone",
    placeOfBirth: "placeOfBirth",
    receiverId: "receiverId",
    path: 'path',
}


const Exporters = [
    {
        name: 'Default CSV',
        description: 'Default CSV export with all fields',
        rules: DefaultCsvExport,
    },
    {
        name: 'Default JSON',
        description: 'Default JSON export with all fields',
        rules: DefaultJsonExport,
    },
    {
        name: 'Default XML',
        description: 'Default XML export with all fields',
        rules: DefaultXmlExport,
    },
]

export {
    DefaultCsvExport,
    DefaultJsonExport,
    DefaultXmlExport,
    Exporters
}