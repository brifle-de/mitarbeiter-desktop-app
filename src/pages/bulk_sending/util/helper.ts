import { ref } from "vue";
import { DocumentSourceDirParserRules } from "./documents/parsers";
import SampleParser from './documents/sampleParsers';
import { BulkSendTemplate } from "app/src-electron/service/send_templates/templates/template";
import { SftpData } from "app/src-electron/models/EncryptedStore";
import { AssignmentRules } from "./documents/assignmentFile";

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
    } else if(templateData.receiverSource.type === 'sftp') {
        receiverSrc.type = 'sftp';
        receiverSrc.sftp = getSftpReceiverSource(templateData.receiverSource.sftp?.serverId ?? '', sftpData);
    }
    receiverSrc.parserId = templateData.receiverSource.parserId ?? '';
    return receiverSrc;
}

/**
 * gets the sftp connection information for the receiver source based on the id stored in the template and the list of available sftp connections. If no connection is found, it returns an object with null connection and empty file path. This allows the component to handle the case where the template references an sftp connection that is no longer available in the account. The user can then select a new connection for the template without losing the file path information.
 * @param id the id of the sftp connection to find
 * @param availableSftpConnections the list of available sftp connections
 * @returns the sftp receiver source information or an object with null connection and empty file path if no connection is found
 */
export function getSftpReceiverSource(id: string, availableSftpConnections: SftpData[]) : SftpReceiverSource {
    const connection = availableSftpConnections.find(conn => conn.id === id);
    if(connection) {
        return {
            connection: connection,
            filePath: ''
        }
    } else {
        return {
            connection: null,
            filePath: ''
        }
    }
}

export function getSftpDocumentSource(id: string, availableSftpConnections: SftpData[]) : SftpDocumentSource {
    const connection = availableSftpConnections.find(conn => conn.id === id);
    if(connection) {
        return {
            connection: connection,
            filePath: ''
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
        } else if(templateData.documentSource.type === 'sftp') {
          documentsSrc.type = 'sftp';
          documentsSrc.sftp = getSftpDocumentSource(templateData.documentSource.sftp?.serverId ?? '', sftpData);           
        }
        
        documentsSrc.destType = templateData.documentSource.destType ?? 'file';        
        if(templateData.documentSource.fileAssignment && documentsSrc.destType === 'file') {
              documentsSrc.fileAssignment = templateData.documentSource.fileAssignment;
        }else if(templateData.documentSource.fileAssignment && documentsSrc.destType === 'directory') {
              // if the dest type is directory, file assignment should not be used, but we can use the rules to assign files to receivers
              documentsSrc.dirParser = findDocumentSourceDirParser(templateData.documentSource.dirParser ?? '', availableDirParsers);
        }
        return documentsSrc;
      }

// const availableDirParsers = ref<{name: string, rules: DocumentSourceDirParserRules}[]>([]);
export function getAllAvailableDirParsers() {

    const availableDirParsers = ref<{id: string, name: string, rules: DocumentSourceDirParserRules}[]>([]);
    // fetch available dir parsers from main process
    SampleParser.forEach(element => {
        availableDirParsers.value.push({
            name: element.name,
            rules: element.rules,
            id: element.id
        });
    });

    
    return availableDirParsers;
}