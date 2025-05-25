// use browser environment
// @vitest-environment jsdom

import { expect, test } from "vitest";
import { SAMPLE_XML_1, SAMPLE_CSV_1 } from "./sampleParsers";
import {ReceiverParser} from "./parsers";
import fs from 'fs';

test("xml sample parser 1", () => {

    // load file from /test/test.csv
    const pathTest = `${__dirname}/test/xml/sample_personal.xml`;
    // read file
    const xmlData = fs.readFileSync(pathTest, 'utf8');


    const rules = SAMPLE_XML_1;
    const result = ReceiverParser.parse(xmlData, rules);
    expect(result).toBeDefined(); 
    expect(result.length).toBe(5);

  
    expect(result[0]!.firstName).toBe('Anna');
    expect(result[0]!.lastName).toBe('Schmidt');
    expect(result[0]!.dateOfBirth).toBe('1985-01-01');
    expect(result[0]!.placeOfBirth).toBe('München');
    expect(result[0]!.email).toBe('');
    expect(result[0]!.addressStreet).toBe('Musterstraße 2');
    expect(result[0]!.addressCity).toBe('München');
    expect(result[0]!.addressPostcode).toBe('80331');
    expect(result[0]!.phone).toBe('089-7654321');
    expect(result[0]!.receiverId).toBe('654321');

      // Test assertions for the second employee
    // Test assertions for the second employee
    expect(result[1]!.firstName).toBe('Johannes');
    expect(result[1]!.lastName).toBe('Bauer');
    expect(result[1]!.dateOfBirth).toBe('1990-03-15');
    expect(result[1]!.placeOfBirth).toBe('Hamburg');
    expect(result[1]!.email).toBe('johannes.bauer@example.com');
    expect(result[1]!.addressStreet).toBe('Elbchaussee 45');
    expect(result[1]!.addressCity).toBe('Hamburg');
    expect(result[1]!.addressPostcode).toBe('22765');
    expect(result[1]!.phone).toBe('040-9876543');
    expect(result[1]!.receiverId).toBe('123456');

    // Test assertions for the third employee
    expect(result[2]!.firstName).toBe('Sophie');
    expect(result[2]!.lastName).toBe('Keller');
    expect(result[2]!.dateOfBirth).toBe('1988-11-22');
    expect(result[2]!.placeOfBirth).toBe('Berlin');
    expect(result[2]!.email).toBe('sophie.keller@example.com');
    expect(result[2]!.addressStreet).toBe('Unter den Linden 12');
    expect(result[2]!.addressCity).toBe('Berlin');
    expect(result[2]!.addressPostcode).toBe('10117');
    expect(result[2]!.phone).toBe('030-7654321');
    expect(result[2]!.receiverId).toBe('234567');

    // Test assertions for the fourth employee
    expect(result[3]!.firstName).toBe('Maximilian');
    expect(result[3]!.lastName).toBe('Schneider');
    expect(result[3]!.dateOfBirth).toBe('1995-06-10');
    expect(result[3]!.placeOfBirth).toBe('Frankfurt');
    expect(result[3]!.email).toBe('max.schneider@example.com');
    expect(result[3]!.addressStreet).toBe('Zeil 89');
    expect(result[3]!.addressCity).toBe('Frankfurt');
    expect(result[3]!.addressPostcode).toBe('60313');
    expect(result[3]!.phone).toBe('069-1234567');
    expect(result[3]!.receiverId).toBe('345678');

    // Test assertions for the fifth employee
    expect(result[4]!.firstName).toBe('Laura');
    expect(result[4]!.lastName).toBe('Weber');
    expect(result[4]!.dateOfBirth).toBe('1992-04-05');
    expect(result[4]!.placeOfBirth).toBe('Leipzig');
    expect(result[4]!.email).toBe('laura.weber@example.com');
    expect(result[4]!.addressStreet).toBe('Augustusplatz 7');
    expect(result[4]!.addressCity).toBe('Leipzig');
    expect(result[4]!.addressPostcode).toBe('04109');
    expect(result[4]!.phone).toBe('0341-9876543');
    expect(result[4]!.receiverId).toBe('456789');


});


test("csv sample parser 1", () => {

    // load file from /test/test.csv
    const pathTest = `${__dirname}/test/csv/sample_personal.csv`;
    // read file
    const xmlData = fs.readFileSync(pathTest, 'utf8');


    const rules = SAMPLE_CSV_1;
    const result = ReceiverParser.parse(xmlData, rules);
    expect(result).toBeDefined(); 
    expect(result.length).toBe(5);

  
    expect(result[0]!.firstName).toBe('Anna');
    expect(result[0]!.lastName).toBe('Schmidt');
    expect(result[0]!.dateOfBirth).toBe('1985-01-01');
    expect(result[0]!.placeOfBirth).toBe('München');
    expect(result[0]!.email).toBe('');
    expect(result[0]!.addressStreet).toBe('Musterstraße 2');
    expect(result[0]!.addressCity).toBe('München');
    expect(result[0]!.addressPostcode).toBe('80331');
    expect(result[0]!.phone).toBe('089-7654321');
    expect(result[0]!.receiverId).toBe('654321');

      // Test assertions for the second employee
    // Test assertions for the second employee
    expect(result[1]!.firstName).toBe('Johannes');
    expect(result[1]!.lastName).toBe('Bauer');
    expect(result[1]!.dateOfBirth).toBe('1990-03-15');
    expect(result[1]!.placeOfBirth).toBe('Hamburg');
    expect(result[1]!.email).toBe('johannes.bauer@example.com');
    expect(result[1]!.addressStreet).toBe('Elbchaussee 45');
    expect(result[1]!.addressCity).toBe('Hamburg');
    expect(result[1]!.addressPostcode).toBe('22765');
    expect(result[1]!.phone).toBe('040-9876543');
    expect(result[1]!.receiverId).toBe('123456');

    // Test assertions for the third employee
    expect(result[2]!.firstName).toBe('Sophie');
    expect(result[2]!.lastName).toBe('Keller');
    expect(result[2]!.dateOfBirth).toBe('1988-11-22');
    expect(result[2]!.placeOfBirth).toBe('Berlin');
    expect(result[2]!.email).toBe('sophie.keller@example.com');
    expect(result[2]!.addressStreet).toBe('Unter den Linden 12');
    expect(result[2]!.addressCity).toBe('Berlin');
    expect(result[2]!.addressPostcode).toBe('10117');
    expect(result[2]!.phone).toBe('030-7654321');
    expect(result[2]!.receiverId).toBe('234567');

    // Test assertions for the fourth employee
    expect(result[3]!.firstName).toBe('Maximilian');
    expect(result[3]!.lastName).toBe('Schneider');
    expect(result[3]!.dateOfBirth).toBe('1995-06-10');
    expect(result[3]!.placeOfBirth).toBe('Frankfurt');
    expect(result[3]!.email).toBe('max.schneider@example.com');
    expect(result[3]!.addressStreet).toBe('Zeil 89');
    expect(result[3]!.addressCity).toBe('Frankfurt');
    expect(result[3]!.addressPostcode).toBe('60313');
    expect(result[3]!.phone).toBe('069-1234567');
    expect(result[3]!.receiverId).toBe('345678');

    // Test assertions for the fifth employee
    expect(result[4]!.firstName).toBe('Laura');
    expect(result[4]!.lastName).toBe('Weber');
    expect(result[4]!.dateOfBirth).toBe('1992-04-05');
    expect(result[4]!.placeOfBirth).toBe('Leipzig');
    expect(result[4]!.email).toBe('laura.weber@example.com');
    expect(result[4]!.addressStreet).toBe('Augustusplatz 7');
    expect(result[4]!.addressCity).toBe('Leipzig');
    expect(result[4]!.addressPostcode).toBe('04109');
    expect(result[4]!.phone).toBe('0341-9876543');
    expect(result[4]!.receiverId).toBe('456789');


});