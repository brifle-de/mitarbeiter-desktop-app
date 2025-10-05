
import { describe, expect, test } from 'vitest'
import BirthdayParser from './birthdayParser';

describe("BirthdayParser.parseBirthday/1", () => {
    test("yyyy-MM-dd", () => {
        const dates = [
            "2023-01-01",
            "1990-12-31",
            "2000-06-15",
            "1985-07-20",
            "1975-03-05",
            "1960-11-30",
            "2010-05-25",
            "2005-09-10",
            "1995-04-18",
        ]
        const results = [
            new Date(2023, 0, 1),
            new Date(1990, 11, 31),
            new Date(2000, 5, 15),
            new Date(1985, 6, 20),
            new Date(1975, 2, 5),
            new Date(1960, 10, 30),
            new Date(2010, 4, 25),
            new Date(2005, 8, 10),
            new Date(1995, 3, 18),
        ];

        dates.forEach((date, index) => {
            const result = BirthdayParser.parseBirthday(date);
            expect(result).toEqual(results[index]);
        });
    });

    test("dd/MM/yyyy", () => {
      
        const dates = [
            "01/01/2023",
            "31/12/1990",
            "15/06/2000",
            "20/07/1985",
            "05/03/1975",
            "30/11/1960",
            "25/05/2010",
            "10/09/2005",
            "18/04/1995",
        ];
        const results = [
            new Date(2023, 0, 1),
            new Date(1990, 11, 31),
            new Date(2000, 5, 15),
            new Date(1985, 6, 20),
            new Date(1975, 2, 5),
            new Date(1960, 10, 30),
            new Date(2010, 4, 25),
            new Date(2005, 8, 10),
            new Date(1995, 3, 18),
        ];

        dates.forEach((date, index) => {
            const result = BirthdayParser.parseBirthday(date);
            expect(result).toEqual(results[index]);
        });
    });
    test("dd.MM.yyyy", () => {
        const dates = [
            "01.01.2023",
            "31.12.1990",
            "15.06.2000",
            "20.07.1985",
            "05.03.1975",
            "30.11.1960",
            "25.05.2010",
            "10.09.2005",
            "18.04.1995",
        ];
        const results = [
            new Date(2023, 0, 1),
            new Date(1990, 11, 31),
            new Date(2000, 5, 15),
            new Date(1985, 6, 20),
            new Date(1975, 2, 5),
            new Date(1960, 10, 30),
            new Date(2010, 4, 25),
            new Date(2005, 8, 10),
            new Date(1995, 3, 18),
        ];
         dates.forEach((date, index) => {
            const result = BirthdayParser.parseBirthday(date);
            expect(result).toEqual(results[index]);
        });
    });
    test("yyyy/MM/dd", () => {
        const dates = [
            "2023/01/01",
            "1990/12/31",
            "2000/06/15",
            "1985/07/20",
            "1975/03/05",
            "1960/11/30",
            "2010/05/25",
            "2005/09/10",
            "1995/04/18",
        ]
        const results = [
            new Date(2023, 0, 1),
            new Date(1990, 11, 31),
            new Date(2000, 5, 15),
            new Date(1985, 6, 20),
            new Date(1975, 2, 5),
            new Date(1960, 10, 30),
            new Date(2010, 4, 25),
            new Date(2005, 8, 10),
            new Date(1995, 3, 18),
        ];
         dates.forEach((date, index) => {
            const result = BirthdayParser.parseBirthday(date);
            expect(result).toEqual(results[index]);
        });
    }); 
    test("dd-MM-yyyy", () => {
        const dates = [
            "01-01-2023",
            "31-12-1990",
            "15-06-2000",
            "20-07-1985",
            "05-03-1975",
            "30-11-1960",
            "25-05-2010",
            "10-09-2005",
            "18-04-1995",
        ];
        const results = [
            new Date(2023, 0, 1),
            new Date(1990, 11, 31),
            new Date(2000, 5, 15),
            new Date(1985, 6, 20),
            new Date(1975, 2, 5),
            new Date(1960, 10, 30),
            new Date(2010, 4, 25),
            new Date(2005, 8, 10),
            new Date(1995, 3, 18),
        ];
        dates.forEach((date, index) => {
            const result = BirthdayParser.parseBirthday(date);
            expect(result).toEqual(results[index]);
        });
    });
 
    test("standardizeBirthday/1", () => {
        const dates = [
            "2023-01-01",
            "31/12/1990",
            "15.06.2000",
            "1985/07/20",
        ];
        const results = [
            "01/01/2023",
            "31/12/1990",
            "15/06/2000",
            "20/07/1985",
        ];
        dates.forEach((date, index) => {
            const result = BirthdayParser.standardizeBirthday(date);
            expect(result).toEqual(results[index]);
        });
    });
});