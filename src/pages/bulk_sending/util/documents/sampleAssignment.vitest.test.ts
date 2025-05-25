// use browser environment
// @vitest-environment jsdom
import { expect, test } from "vitest";
import fs from 'fs';
import { SAMPLE_CSV_1 } from "./sampleAssignmentRules";
import AssignmentFile from "./assignmentFile";

test("csv sample parser 1", () => {

    // load file from /test/test.csv
    const pathTest = `${__dirname}/test/assignment_employee.csv`;
    // read file
    const csvData = fs.readFileSync(pathTest, 'utf8');
    const rules = SAMPLE_CSV_1;

    const assigner = new AssignmentFile(rules);
    const result = assigner.read(csvData);
    // check if result is defined
    expect(result).toBeDefined();
    // check if result is an array
    expect(Array.isArray(result)).toBe(true);
    // check if result has 3 elements
    expect(result.length).toBe(3);

    // check if result has 3 elements
    expect(result[0]!.receiverId).toBe('1234');
    expect(result[0]!.filePath).toBe('file1');
    expect(result[1]!.receiverId).toBe('5678');
    expect(result[1]!.filePath).toBe('file2');
    expect(result[2]!.receiverId).toBe('137252');
    expect(result[2]!.filePath).toBe('file3');



});