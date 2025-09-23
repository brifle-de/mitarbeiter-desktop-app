
import fs from 'fs';

import { expect, test } from 'vitest'
import CsvReader from "./csvReader";

 

test("test csv parser with comma separator", () => {
    // load file from /test/test.csv
    const pathTest = `${__dirname}/test/test.csv`;
    // read file
    const data = fs.readFileSync(pathTest, 'utf8');

    const csvReader = new CsvReader();

    const csvData = csvReader.parse(data);
    expect(csvData.headers.findIndex(h => h === 'firstName')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'lastName')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'email')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'phone')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'receiverId')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'dateOfBirth')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'placeOfBirth')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'address')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressStreet')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressCity')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressPostcode')).toBeGreaterThan(-1);
    
    expect(csvData.headers.length).toBe(13);
    expect(csvData.records.length).toBe(4);

    const firstRecord = csvData.records[0]!;
    expect(firstRecord).toBeDefined();
    
    const secondRecord = csvData.records[1]!;
    expect(secondRecord).toBeDefined();

    const thirdRecord = csvData.records[2]!;
    expect(thirdRecord).toBeDefined();

    const fourthRecord = csvData.records[3]!;
    expect(fourthRecord).toBeDefined();
    

    expect(firstRecord['firstName']).toBe('John');
    expect(firstRecord['lastName']).toBe('Doe');
    expect(firstRecord['email']).toBe('test@example.com');
    expect(firstRecord['phone']).toBe('');
    expect(firstRecord['receiverId']).toBe('123');
    expect(firstRecord['dateOfBirth']).toBe('1990-01-01');
    expect(firstRecord['placeOfBirth']).toBe('City');

    expect(secondRecord['firstName']).toBe('Jane');
    expect(secondRecord['lastName']).toBe('Doe');
    expect(secondRecord['email']).toBe('jane.doe@example.com');
    expect(secondRecord['phone']).toBe('');
    expect(secondRecord['receiverId']).toBe('456');
    expect(secondRecord['dateOfBirth']).toBe('1985-05-15');
    expect(secondRecord['placeOfBirth']).toBe('Town');

    expect(thirdRecord['firstName']).toBe('Max');
    expect(thirdRecord['lastName']).toBe('Mustermann');
    expect(thirdRecord['email']).toBe('max.mustermann@example.com');
    expect(thirdRecord['phone']).toBe('');
    expect(thirdRecord['receiverId']).toBe('789');
    expect(thirdRecord['dateOfBirth']).toBe('1978-12-20');
    expect(thirdRecord['placeOfBirth']).toBe('Village');

    expect(fourthRecord['firstName']).toBe('Anna');
    expect(fourthRecord['lastName']).toBe('Schmidt');
    expect(fourthRecord['email']).toBe('anna.schmidt@example.com');
    expect(fourthRecord['phone']).toBe('');
    expect(fourthRecord['receiverId']).toBe('101');
    expect(fourthRecord['dateOfBirth']).toBe('1992-03-10');

})

test("test csv parser with semicolon separator", () => {
    // load file from /test/test.csv
    const pathTest = `${__dirname}/test/test_semicolon.csv`;
    // read file
    const data = fs.readFileSync(pathTest, 'utf8');
    const csvReader = new CsvReader(';');
    const csvData = csvReader.parse(data);
    expect(csvData.headers.findIndex(h => h === 'firstName')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'lastName')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'email')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'phone')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'receiverId')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'dateOfBirth')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'placeOfBirth')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'address')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressStreet')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressCity')).toBeGreaterThan(-1);
    expect(csvData.headers.findIndex(h => h === 'addressPostcode')).toBeGreaterThan(-1);
    
    expect(csvData.headers.length).toBe(13);
    expect(csvData.records.length).toBe(4);

    const firstRecord = csvData.records[0]!;
    expect(firstRecord).toBeDefined();
    
    const secondRecord = csvData.records[1]!;
    expect(secondRecord).toBeDefined();

    const thirdRecord = csvData.records[2]!;
    expect(thirdRecord).toBeDefined();

    const fourthRecord = csvData.records[3]!;
    expect(fourthRecord).toBeDefined();
    

    expect(firstRecord['firstName']).toBe('John');
    expect(firstRecord['lastName']).toBe('Doe');
    expect(firstRecord['email']).toBe('test@example.com');
    expect(firstRecord['phone']).toBe('');
    expect(firstRecord['receiverId']).toBe('123');
    expect(firstRecord['dateOfBirth']).toBe('1990-01-01');
    expect(firstRecord['placeOfBirth']).toBe('City');

    expect(secondRecord['firstName']).toBe('Jane');
    expect(secondRecord['lastName']).toBe('Doe');
    expect(secondRecord['email']).toBe('jane.doe@example.com');
    expect(secondRecord['phone']).toBe('');
    expect(secondRecord['receiverId']).toBe('456');
    expect(secondRecord['dateOfBirth']).toBe('1985-05-15');
    expect(secondRecord['placeOfBirth']).toBe('Town');

    expect(thirdRecord['firstName']).toBe('Max');
    expect(thirdRecord['lastName']).toBe('Mustermann');
    expect(thirdRecord['email']).toBe('max.mustermann@example.com');
    expect(thirdRecord['phone']).toBe('');
    expect(thirdRecord['receiverId']).toBe('789');
    expect(thirdRecord['dateOfBirth']).toBe('1978-12-20');
    expect(thirdRecord['placeOfBirth']).toBe('Village');

    expect(fourthRecord['firstName']).toBe('Anna');
    expect(fourthRecord['lastName']).toBe('Schmidt');
    expect(fourthRecord['email']).toBe('anna.schmidt@example.com');
    expect(fourthRecord['phone']).toBe('');
    expect(fourthRecord['receiverId']).toBe('101');
    expect(fourthRecord['dateOfBirth']).toBe('1992-03-10');
})
