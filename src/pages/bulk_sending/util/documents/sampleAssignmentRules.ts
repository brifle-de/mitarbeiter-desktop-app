import { AssignmentRules } from "./assignmentFile"

const SAMPLE_CSV_1 : AssignmentRules = {
    type: 'csv',
    filePath: 'path',
    receiverId: 'employeeNumber',
}

export {
    SAMPLE_CSV_1,
}

const ALL: {rules: AssignmentRules, name: string, description: string}[] = [
    {
        name: "CSV Mitarbeiter Parser: employeeNumber,path",
        description: "CSV file with employeeNumber and path",
        rules: SAMPLE_CSV_1,
    }
] 


export default ALL;