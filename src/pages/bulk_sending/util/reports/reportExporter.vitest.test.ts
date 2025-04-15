
import { SendDocReq } from "@src/pages/bulk_sending/util/receivers/receiverRecord";
import { ReportsExporter } from "./exporter";
import fs from 'fs';
import { DefaultCsvExport, DefaultJsonExport, DefaultXmlExport } from "./exampleExports";

import { expect, test } from 'vitest'



test("test json exporter", () => {
    const sampleData: SendDocReq[] = [
        {
            doc: {
                filePath: 'path/sample.pdf',
                receiverId: '123',
                type: 'file'
            },
            exists: true,
            receiver: {
                original: {
                    email: "test@example.com",
                    firstName: "John",
                    lastName: "Doe",
                    dateOfBirth: "1990-01-01",
                    placeOfBirth: "City",
                },
                req: {
                    birth_information: {
                        date_of_birth: "1990-01-01",
                        last_name: "Doe",
                        place_of_birth: "City",
                        given_names: "John",
                    }
                }
            },
        },
        {
            doc: {
                filePath: 'path/sample2.pdf',
                receiverId: '456',
                type: 'file'
            },
            exists: true,
            receiver: {
                original: {
                    email: "jane.doe@example.com",
                    firstName: "Jane",
                    lastName: "Doe",
                    dateOfBirth: "1985-05-15",
                    placeOfBirth: "Town",
                },
                req: {
                    birth_information: {
                        date_of_birth: "1985-05-15",
                        last_name: "Doe",
                        place_of_birth: "Town",
                        given_names: "Jane",
                    }
                }
            },
        },
        {
            doc: {
                filePath: 'path/sample3.pdf',
                receiverId: '789',
                type: 'file'
            },
            exists: false,
            receiver: {
                original: {
                    email: "max.mustermann@example.com",
                    firstName: "Max",
                    lastName: "Mustermann",
                    dateOfBirth: "1978-12-20",
                    placeOfBirth: "Village",
                },
                req: {
                    birth_information: {
                        date_of_birth: "1978-12-20",
                        last_name: "Mustermann",
                        place_of_birth: "Village",
                        given_names: "Max",
                    }
                }
            },
        },
        {
            doc: {
                filePath: 'path/sample4.pdf',
                receiverId: '101',
                type: 'file'
            },
            exists: true,
            receiver: {
                original: {
                    email: "anna.schmidt@example.com",
                    firstName: "Anna",
                    lastName: "Schmidt",
                    dateOfBirth: "1992-03-10",
                    placeOfBirth: "Cityville",
                },
                req: {
                    birth_information: {
                        date_of_birth: "1992-03-10",
                        last_name: "Schmidt",
                        place_of_birth: "Cityville",
                        given_names: "Anna",
                    }
                }
            },
        }
    ];
    
        // test json exporter
        const exporter = new ReportsExporter(sampleData);
        // get json rules
        const jsonRules = DefaultJsonExport;        
        const jsonExport = exporter.export(jsonRules);

        // csv exporter
        const csvRules = DefaultCsvExport;
        const csvExport = exporter.export(csvRules);

        // xml exporter
        const xmlRules = DefaultXmlExport;
        const xmlExport = exporter.export(xmlRules);
        // write json to file

        

        const jsonFilePath = __dirname+'/test/export_test.json';
        const csvFilePath =  __dirname+'/test/export_test.csv';
        const xmlFilePath =  __dirname+'/test/export_test.xml';
        
        // read files and compared with export data
        expect(fs.readFileSync(jsonFilePath, 'utf8')).toBe(jsonExport); 
        expect(fs.readFileSync(csvFilePath, 'utf8')).toBe(csvExport);
        expect(fs.readFileSync(xmlFilePath, 'utf8')).toBe(xmlExport);

        expect(jsonExport).toBeDefined();

});
