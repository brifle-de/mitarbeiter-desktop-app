import { DocumentSourceDirParser, DocumentReceiverMappingResult, DocumentSourceDirParserRules } from "./documents/parsers";
import SampleParser from './documents/sampleParsers';
import { BulkSendTemplate, SftpSelection } from "app/src-electron/service/send_templates/templates/template";
import { SftpData } from "app/src-electron/models/EncryptedStore";
import AssignmentFile, { AssignmentRules } from "./documents/assignmentFile";
import DocumentRecord from "./documents/documentRecord";
import Sftp from "src/services/node/Sftp";
import Files from "src/services/node/Files";
import { FilesLsDirResponse } from "app/src-electron/service/Files";
import { SftpLsDirResponse } from "app/src-electron/service/SftpConnector";
import { SendDocReceiverReq } from "./receivers/receiverRecord";

export interface ReceiverSource {
    type: 'file' | 'sftp',
    file?: string | undefined | null,
    sftp?: SftpReceiverSource | undefined | null
    parserId?: string | undefined | null, // this is used to store the selected parser id in the template, so that it can be loaded when the template is loaded. This allows to keep the selected parser even if the user switch between templates.
}

export interface SftpReceiverSource {
    connection?: SftpData | undefined | null,
    filePath: string,
}

export interface SftpDocumentSource {
    connection?: SftpData | undefined | null,
    filePath: string,
}

export interface SubjectData {
    default: string,
    docTypes: Record<string, string> // docType specific subjects
}



export interface DocumentSource {
    type: 'file' | 'sftp',
    file?: string | undefined | null,
    sftp?: SftpDocumentSource | undefined | null
    destType: 'directory' | 'file',
    dirParser? : DocumentSourceDirParserRules | undefined | null,
    fileAssignment?: AssignmentRules | undefined | null
}

export function computePillColors(doc: {docType: string | null}[]) {
    const availableColors = ['blue', 'orange', 'purple', 'red', 'yellow', 'green'];
    const docTypes = Array.from(new Set(doc.map((d) => d.docType)));
    // hash name and compute a integer. Modulo with available colors to assign a color to each doc type
    const colorMap: Record<string, string> = {};
    docTypes.forEach((type) => {
        if(type == null || type === '') {               
            return; 
        }
        let hash = 0;
        for (let i = 0; i < type.length; i++) {
            hash = type.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color = availableColors[Math.abs(hash) % availableColors.length];
        if(color){
            colorMap[type] = color;
        }
    });

    return colorMap;
}

export function  findDocumentSourceDirParser(id: string, availableDirParsers: {id: string, name: string, rules: DocumentSourceDirParserRules}[]) : DocumentSourceDirParserRules | undefined {        
    
    const res = availableDirParsers
        .find(parser => parser.id === id);
        if(res) {
          return res.rules;
        } else {
          return undefined;
        }
        
}

/**
 * this function takes the receiver source data from the template and transforms it into the format used by the component. This includes finding the correct sftp connection based on the id stored in the template.
 * @param templateData the bulk send template data containing the receiver source information
 * @param sftpData the list of available sftp connections to find the correct connection for the receiver source if the type is sftp
 * @returns 
 */
export function loadReceiverSource(templateData: BulkSendTemplate, sftpData: SftpData[]) : ReceiverSource {
    const receiverSrc: ReceiverSource = {
        type: 'file',
    };
    if(templateData.receiverSource.type === 'file') {
        receiverSrc.type = 'file';
        receiverSrc.file = templateData.receiverSource.file ?? '';
    } else if(templateData.receiverSource.type === 'sftp' && templateData.receiverSource.sftp) {
        receiverSrc.type = 'sftp';
        receiverSrc.sftp = getSftpReceiverSource(templateData.receiverSource.sftp, sftpData);
    }
    receiverSrc.parserId = templateData.receiverSource.parserId ?? '';
    return receiverSrc;
}

/**
 * gets the sftp connection information for the receiver source based on the id stored in the template and the list of available sftp connections. If no connection is found, it returns an object with null connection and empty file path. This allows the component to handle the case where the template references an sftp connection that is no longer available in the account. The user can then select a new connection for the template without losing the file path information.
 * @param sftp the sftp selection data from the template containing the server id and file path information
 * @param availableSftpConnections the list of available sftp connections
 * @returns the sftp receiver source information or an object with null connection and empty file path if no connection is found
 */
export function getSftpReceiverSource(sftp: SftpSelection, availableSftpConnections: SftpData[]) : SftpReceiverSource {
    const connection = availableSftpConnections.find(conn => conn.id === sftp.serverId);
    if(connection) {
        return {
            connection: connection,
            filePath: sftp.filePath ?? ''
        }
    } else {
        return {
            connection: null,
            filePath: ''
        }
    }
}

export function getSftpDocumentSource(sftp: SftpSelection, availableSftpConnections: SftpData[]) : SftpDocumentSource {
    const connection = availableSftpConnections.find(conn => conn.id === sftp.serverId);
    if(connection) {
        return {
            connection: connection,
            filePath: sftp.filePath ?? ''
        }
    } else {
        return {
            connection: null,
            filePath: ''
        }
    }
}


/**
 * this function takes the document source data from the template and transforms it into the format used by the component. This includes finding the correct dir parser rules and sftp connection based on the ids stored in the template.
 * @param templateData the bulk send template data containing the document source information
 * @param availableDirParsers the list of available dir parsers to find the correct rules for the document source if the dest type is directory
 * @param sftpData the list of available sftp connections to find the correct connection for the document source if the type is sftp
 * @returns 
 */

export function loadDocumentSource(templateData: BulkSendTemplate, availableDirParsers: {id: string, name: string, rules: DocumentSourceDirParserRules}[], sftpData: SftpData[]): DocumentSource {
        const documentsSrc: DocumentSource = {
          type: 'file',
          destType: 'file',
        };
        if(templateData.documentSource.type === 'file') {
          documentsSrc.type = 'file';
          documentsSrc.file = templateData.documentSource.file ?? '';
        } else if(templateData.documentSource.type === 'sftp' && templateData.documentSource.sftp) {
          documentsSrc.type = 'sftp';
          documentsSrc.sftp = getSftpDocumentSource(templateData.documentSource.sftp, sftpData);           
        }
        
        documentsSrc.destType = templateData.documentSource.destType ?? 'file';        
        if(templateData.documentSource.fileAssignment && documentsSrc.destType === 'file') {
                console.log('Using file assignment for document source:', templateData.documentSource.fileAssignment);
              documentsSrc.fileAssignment = templateData.documentSource.fileAssignment;
        }else if(documentsSrc.destType === 'directory') {
              // if the dest type is directory, file assignment should not be used, but we can use the rules to assign files to receivers
              documentsSrc.dirParser = findDocumentSourceDirParser(templateData.documentSource.dirParser ?? '', availableDirParsers);
              
        }
        return documentsSrc;
      }

// const availableDirParsers = ref<{name: string, rules: DocumentSourceDirParserRules}[]>([]);
export function getAllAvailableDirParsers() : {id: string, name: string, rules: DocumentSourceDirParserRules}[] {

    const availableDirParsers :{id: string, name: string, rules: DocumentSourceDirParserRules}[] = [];
    // fetch available dir parsers from main process
    SampleParser.forEach(element => {
        availableDirParsers.push({
            name: element.name,
            rules: element.rules,
            id: element.id
        });
    });

    
    return availableDirParsers;
}


async function readLocaleDir(path: string): Promise<string[]> {
    if(path == null) {
        return [];
    }
    return Files.lsDir(path)
    .then((res: FilesLsDirResponse | null) => {
        if(!res) {
            return [];
        }
        return res.files.map((file: { name: string }) => file.name);
    }).catch((err: Error) => {
        console.error(err);
        return [];
    });
}

async function readSftpDir(sftp: SftpDocumentSource | null) : Promise<string[]> {
    console.log('Reading SFTP directory with source:', sftp);
    if(sftp == null || sftp.connection == null) {
        return []   ;
    }
    return Sftp.lsDir(sftp.filePath, sftp.connection)
    .then((sftpRes: SftpLsDirResponse | null) => {
        if(sftpRes == null) {
            return [];
        }
        return sftpRes.files.map((file: { name: string }) => file.name);                
    }).catch((err: Error) => {
        console.error(err);
        return [];
    });
}

async function readDirectory(documentsSource: DocumentSource): Promise<string[]> {
    if(documentsSource.type === 'sftp') {
        return readSftpDir(documentsSource.sftp ?? null);
    } else {
        return readLocaleDir(documentsSource.file ?? '');
    }
}

export async function parseDocumentsDirectoryFiles(documentsSource: DocumentSource | null) : Promise<DocumentReceiverMappingResult[] | undefined> {
        if(!documentsSource){
            console.error('No documents source provided');
            return;
        }
        const rules = documentsSource.dirParser     
        if(!rules || (!documentsSource.file && documentsSource.type === 'file') || (documentsSource.type === 'sftp' && (!documentsSource.sftp || !documentsSource.sftp.connection))) {
            console.error('No rules or file path provided for directory parsing');
            return;
        }

        const files = await readDirectory(documentsSource);
        const parser = new DocumentSourceDirParser(files)
        const res = parser.parse(rules);
        // use placeholder to use the OS aware separator when joining the base path with the file path from the mapping result. This allows to keep the correct file paths even if the template is used on a different OS than it was created on, e.g. if it was created on Windows and used on Linux, or vice versa.
        const placeholderValue = '____PLACEHOLDER____.pdf';
        const basePath = await getFullPath(documentsSource, documentsSource.file ?? '', placeholderValue);
        
        return res.map((element : DocumentReceiverMappingResult) => {
            const fullPath = basePath.replace(placeholderValue, element.filePath);
            element.filePath = fullPath;
            return element;
        })
   }

   export async function readReceiversData(receiverSource: ReceiverSource, encoding: BufferEncoding = 'utf-8') : Promise<string | null> {
    if(receiverSource.type === 'sftp') {
        if(receiverSource.sftp == null || receiverSource.sftp.connection == null) {
            console.error('No SFTP connection available.');
            return Promise.reject(new Error('No SFTP connection available.'));
        }
        console.log('Reading receivers file from SFTP with source:', receiverSource);
        return Sftp.readFile(receiverSource.sftp.filePath, receiverSource.sftp?.connection, encoding);
    } else {
        if(receiverSource?.file == null) {
            console.error('No file path provided.');
            return Promise.reject(new Error('No file path provided.'));
        }
        return Files.readFile(receiverSource.file, encoding)
    }
    }

export async function readDocumentsData(documentsSource: DocumentSource, filePath: string, encoding: BufferEncoding = 'utf-8') : Promise<string | null> {
    if(documentsSource.type === 'sftp') {
        if(documentsSource.sftp == null || documentsSource.sftp.connection == null) {
            console.error('No SFTP connection available.');
            return Promise.reject(new Error('No SFTP connection available.'));
        }
        return Sftp.readFile(filePath, documentsSource.sftp?.connection, encoding);
    } else {
        if(documentsSource?.file == null) {
            console.error('No file path provided.');
            return Promise.reject(new Error('No file path provided.'));
        }            
        return Files.readFile(filePath, encoding)
    }
        
}

 async function getFullPath(documentsSource: DocumentSource, basePath: string, fileName: string) {
        if(documentsSource.type === 'sftp'){
            return Sftp.pathJoin(basePath, fileName);
        }else{
            return Files.pathJoin(basePath, fileName);
        }
    }

/**
 * 
 * @returns the placeholders keys
 */
export function getSubjectPlaceholderkeys() : string[] {
    const dummyValue = getSubjectPlaceholders({doc: {docType: 'default'}} as SendDocReceiverReq);
    return Object.keys(dummyValue);
}


/**
 * get the subject placeholders for the given record. This can be used to replace the placeholders in the subject with the actual values from the record when sending the document. The placeholders include receiver id, document type, current month, current year, current date, current day, next month and next year. The values are computed based on the current date and the information available in the record.
 * @param record the record
 * @returns 
 */
export function getSubjectPlaceholders(record: SendDocReceiverReq) : Record<string, string> {
    const placeholders = {
        receiverId: record.receiver?.original.receiverId ?? '',
        docType: record.doc.docType ?? '',
        currentMonth: new Date().toLocaleString('de-DE', { month: 'long' }),
        currentYear: new Date().getFullYear().toString(),
        currentDate: new Date().toLocaleDateString('de-DE'),
        currentDay: new Date().getDate().toString(),
        nextMonth: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('de-DE', { month: 'long' }),
        nextYear: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).getFullYear().toString(),
        nextDate: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('de-DE'),
        lastMonth: new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('de-DE', { month: 'long' }),
        lastYear: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).getFullYear().toString(),
        lastDate: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('de-DE'),
        // mmm.yyyy
        lastMonthYear: new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('de-DE', { month: 'long', year: 'numeric' }),
        currentMonthAndYear: new Date().toLocaleString('de-DE', { month: 'long', year: 'numeric' }),
        nextMonthYear: new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('de-DE', { month: 'long', year: 'numeric' }),
    };
    return placeholders;
}

export async function parseDocumentsAssignmentFile(documentsSource: DocumentSource, basePath: string) : Promise<DocumentReceiverMappingResult[]> {
        const filePath = documentsSource.type === 'sftp' ? documentsSource.sftp?.filePath : documentsSource.file;

        if(documentsSource?.fileAssignment == null) {
            return [];
        }   

        const parser = new AssignmentFile(documentsSource.fileAssignment);
        if(filePath == null || filePath === '') {
            console.error('No file path provided for assignment file parsing.');
            return [];
        }
        const data = await readDocumentsData(documentsSource, filePath);
        if(data == null || data === '') {
            console.error('No data found in the file for assignment parsing.');
            return [];
        }
        const res : DocumentRecord[] = parser.read(data);

        const m = res.map(async (element: DocumentRecord) => {
            return {
                filePath: await getFullPath(documentsSource, basePath, element.filePath),
                receiverId: element.receiverId,
                date: null,
                docType: element.docType,
            }
        });

        const fileReceiverMapping = await Promise.all(m); 
       
        return fileReceiverMapping;
}