/**
 * Note: It is important to copy the interfaces to avoid to break templates when changing the interfaces in the business logic. The interfaces in the business logic can change more often and we want to avoid breaking templates because of that. Also, the templates should not have to import the business logic to get the interfaces.
 */

interface NonExistingReceiverAction {
  action: 'ignore' | 'papermail';
  testModePaperMail: boolean;
  paperMailTestEmailRecipient: string;
  useCoverLetter: boolean;
  selectedCoverLetter: { name: string; type: 'default' | 'custom'; displayName: string } | null;
}

export interface SubjectData {
    default: string,
    docTypes: Record<string, string> // docType specific subjects
}

export interface AssignmentRules {
    type: 'xml' | 'csv',
    
    filePath?: string, // rule to get the 
    receiverId?: string,
    itemSelector?: string, // used for xml files to get the root element of all receivers items. This is needed for xml files
}


export interface ReceiverSource {
    type: 'file' | 'sftp',
    file?: string | undefined | null,
    sftp?: SftpSelection | undefined | null,
    parserId?: string | undefined | null, // this is used to store the selected parser id in the template, so that it can be loaded when the template is loaded. This allows to keep the selected parser even if the user switch between templates.

}

export interface SftpSelection {
    serverId: string,
    filePath: string,
}


export interface DocumentSource {
    type: 'file' | 'sftp',
    file?: string | undefined | null,
    sftp?: SftpSelection | undefined | null
    destType: 'directory' | 'file',
    dirParser? : string | undefined | null, 
    fileAssignment?: AssignmentRules | undefined | null
}

export interface BulkSendTemplate {
    id: string,
    name: string,
    description: string,
    documentSource: DocumentSource,
    receiverSource: ReceiverSource,
    createdAt: string,
    updatedAt: string
    subjects: SubjectData,
    preScripts: string[], // list of script file names to be executed before the bulk send process starts. The files should be located in the scripts directory.
    postScripts: string[], // list of script file names to be executed after the bulk send process ends. The files should be located in the scripts directory.
    nonExistingReceiverAction: NonExistingReceiverAction
}

export interface BulkSendTemplateMeta {
    id: string,
    size: number,
    createdAt: number, 
    fileName: string,
}
