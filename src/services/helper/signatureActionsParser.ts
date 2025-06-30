import { EmbbededSignatureResponse } from "@brifle/brifle-sdk";

class SignatureActionsParser {
  public static getSignatureStatus(embeddedSignature : EmbbededSignatureResponse) : string {
    if (embeddedSignature.status === 'rejected') return 'Abgelehnt';
    if (embeddedSignature.status === 'signed' || embeddedSignature.value !== null) return 'Unterschrieben';
    return 'Offen';
  }

  public static isSigner(embeddedSignature : EmbbededSignatureResponse, accountId: string)
  : boolean {
    return embeddedSignature.signed_by !== accountId;
  }

  public static getSigningDate(embeddedSignature : EmbbededSignatureResponse) : string {
    const isoDateString : string = embeddedSignature.signature_date;
    // parse to german date format
    const date : Date = new Date(isoDateString);
    if (isoDateString == null || isoDateString === '') {
      return 'Noch nicht unterschrieben';
    }
    return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE')} Uhr`;
  }

  public static getRequestDate(embeddedSignature : EmbbededSignatureResponse) : string {
    const isoDateString : string = embeddedSignature.request_date;

    // parse to german date format
    const date : Date = new Date(isoDateString);
    return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE')} Uhr`;
  }

  public static getSignaturePlace(embeddedSignature : EmbbededSignatureResponse): string {
    // parse xml

    if (embeddedSignature.value === null) return 'Noch nicht unterschrieben';

    const xml = new DOMParser().parseFromString(embeddedSignature.value, 'text/xml');

    const cityXpath = xml.evaluate('//*[local-name()="SignatureProductionPlace"]/*[local-name()="City"]', xml, null, XPathResult.STRING_TYPE, null);
    const countryXpath = xml.evaluate('//*[local-name()="SignatureProductionPlace"]/*[local-name()="CountryName"]', xml, null, XPathResult.STRING_TYPE, null);

    const city = cityXpath.stringValue.trim();

    const country = countryXpath.stringValue.trim();

    return `${city}, ${country}`;
  }

  public static getSignatureRoles(embeddedSignature : EmbbededSignatureResponse): string {
    if (embeddedSignature.value === null) return 'Noch nicht unterschrieben';

    const xml = new DOMParser().parseFromString(embeddedSignature.value, 'text/xml');

    const rolesXpath = xml.evaluate('//*[local-name()="ClaimedRoles"]/*[local-name()="ClaimedRole"]', xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

    const roles : string[] = [];

    let role = rolesXpath.iterateNext();
    while (role) {
      if (role.textContent != null) {
        roles.push(role.textContent.trim());
      }
      role = rolesXpath.iterateNext();
    }

    return roles.join(', ');
  }
}
export { SignatureActionsParser };
