/** Columns of the table that shows parsed receiver records (field = key of ReceiverParserResult). */
export function receiverColumnDefs(t: (key: string) => string) {
    return [
        { name: 'id', label: t('ui.bulk.columns.id'), field: 'receiverId' },
        { name: 'firstName', label: t('ui.bulk.columns.firstName'), field: 'firstName' },
        { name: 'lastName', label: t('ui.bulk.columns.lastName'), field: 'lastName' },
        { name: 'dateOfBirth', label: t('ui.bulk.columns.dateOfBirth'), field: 'dateOfBirth' },
        { name: 'placeOfBirth', label: t('ui.bulk.columns.placeOfBirth'), field: 'placeOfBirth' },
        { name: 'email', label: t('ui.bulk.columns.email'), field: 'email' },
        { name: 'phone', label: t('ui.bulk.columns.phone'), field: 'phone' },
    ];
}
