
import fs from 'fs';

import { describe, expect, test } from 'vitest'
import CsvLimiterGuesser from './csvLimiterGuesser';

describe("guess separator", () => {
    test("test comma separator", () => {
        // load file from /test/test.csv
        const pathTest = `${__dirname}/test/test_comma.csv`;
        // read file
        const data = fs.readFileSync(pathTest, 'utf8');
        const csvReader = new CsvLimiterGuesser();
        const separator = csvReader.guess(data);
        expect(separator).toBe(',');
    });

    test("test semicolon separator", () => {
        // load file from /test/test.csv
        const pathTest = `${__dirname}/test/test_semicolon.csv`;
        // read file
        const data = fs.readFileSync(pathTest, 'utf8');
        const csvReader = new CsvLimiterGuesser();
        const separator = csvReader.guess(data);
        expect(separator).toBe(';');
    });

});