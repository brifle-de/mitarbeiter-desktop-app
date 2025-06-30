export interface SignatureMeta {
    baseUrl: string;
    version: string;
}

export interface Transform {
    transform: string;
}

export interface Reference {
    id: string;
    uri: string;
    transforms: Transform[];
    digestMethod: string;
    digestValue: string;
}

export interface SignedInfo {
    canonicalizationMethod: string;
    signatureMethod: string;
    reference: Reference[];
}

export interface X509Data {
    x509Certificate: string;
}

export interface KeyInfo {
    x509Data: X509Data;
}

export interface SigningCertificate {
    certDigest: {
        digestMethod: string;
        digestValue: string;
    };
    issuerSerial: {
        x509IssuerName: string;
        x509SerialNumber: string;
    };
}

export interface SignedSignatureProperties {
    signingTime: string;
    signingCertificate: {
        cert: SigningCertificate;
    };
    signaturePolicyIdentifier: {
        signaturePolicyImplied: string;
    };
    signatureProductionPlace: {
        city: string;
        countryName: string;
    };
    signerRole: {
        claimedRoles: {
            claimedRole: string;
        }[];
        certifiedRoles: {
            certifiedRole: string;
        }[];

    };
}

export interface SignedDataObjectProperties {
    dataObjectFormat: {
        objectReference: string;
        mimeType: string;
        encoding: string;
        objectIdentifier: {
            description: string;
        }
    }
}

export interface QualifyingProperties {
    signedProperties: {
        signedSignatureProperties: SignedSignatureProperties;
        signedDataObjectProperties: SignedDataObjectProperties;
    };
}

export interface SObject {
    qualifyingProperties: QualifyingProperties;
}

export interface ParsedXmlSignature {
    meta: {
      baseUrl: string;
      version: string;
    },
    signature: {
      signedInfo: SignedInfo,
      signatureValue: string;
      keyInfo: KeyInfo,
      object: SObject
    }

  }

export class ParsingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingException';
  }
}

export class XmlSignatureParser {
  private static parseSignedInfo(signedInfo: Element): SignedInfo {
    const canonicalizationMethod = signedInfo.getElementsByTagNameNS('*', 'CanonicalizationMethod')[0]!.getAttribute('Algorithm');
    const signatureMethod = signedInfo.getElementsByTagNameNS('*', 'SignatureMethod')[0]!.getAttribute('Algorithm');

    const reference : Array<Reference> = Array.from(signedInfo.getElementsByTagNameNS('*', 'Reference')).map((ref) => {
      const id = ref.getAttribute('Id') ?? '';
      const uri = ref.getAttribute('URI');
      const transforms : Transform[] = Array.from(ref.getElementsByTagNameNS('*', 'Transform')).map((transform) => {
        const alg = transform.getAttribute('Algorithm');
        if (alg == null) {
          throw new ParsingException('Failed to parse Transform');
        }
        return {
          transform: alg,
        };
      });
      const digestMethod = ref.getElementsByTagNameNS('*', 'DigestMethod')[0]!.getAttribute('Algorithm');
      const digestValue = ref.getElementsByTagNameNS('*', 'DigestValue')[0]!.textContent;

      if (uri === null || digestMethod === null || digestValue === null) {
        throw new ParsingException('Failed to parse Reference');
      }

      return {
        id,
        uri,
        transforms,
        digestMethod,
        digestValue,
      };
    });

    if (canonicalizationMethod === null || signatureMethod === null || reference == null
        || reference.length === 0) {
      throw new ParsingException('Failed to parse SignedInfo');
    }

    return {
      canonicalizationMethod,
      signatureMethod,
      reference,
    };
  }

  private static parseKeyInfo(keyInfo: Element): KeyInfo {
    const x509Data = keyInfo.getElementsByTagNameNS('*', 'X509Data')[0];
    const x509Certificate = x509Data!.getElementsByTagNameNS('*', 'X509Certificate')[0]!.textContent;

    if (x509Certificate === null) {
      throw new ParsingException('Failed to parse KeyInfo');
    }

    return {
      x509Data: {
        x509Certificate,
      },
    };
  }

  private static parseSignedSignatureProperties(signedSignatureProperties: Element)
  : SignedSignatureProperties {
    const signingTime = signedSignatureProperties.getElementsByTagNameNS('*', 'SigningTime')[0]!.textContent;
    const signingCertificate = signedSignatureProperties.getElementsByTagNameNS('*', 'SigningCertificate')[0]!;
    const certDigest = signingCertificate.getElementsByTagNameNS('*', 'CertDigest')[0];
    const digestMethod = certDigest!.getElementsByTagNameNS('*', 'DigestMethod')[0]!.getAttribute('Algorithm');
    const digestValue = certDigest!.getElementsByTagNameNS('*', 'DigestValue')[0]!.textContent;
    const issuerSerial = signingCertificate.getElementsByTagNameNS('*', 'IssuerSerial')[0]!;
    const x509IssuerName = issuerSerial.getElementsByTagNameNS('*', 'X509IssuerName')[0]!.textContent;
    const x509SerialNumber = issuerSerial.getElementsByTagNameNS('*', 'X509SerialNumber')[0]!.textContent;
    const signaturePolicyIdentifier = signedSignatureProperties.getElementsByTagNameNS('*', 'SignaturePolicyIdentifier')[0];
    const signaturePolicyImplied = signaturePolicyIdentifier!.getElementsByTagNameNS('*', 'SignaturePolicyImplied')[0]!.textContent;
    const signatureProductionPlace = signedSignatureProperties.getElementsByTagNameNS('*', 'SignatureProductionPlace')[0];
    const city = signatureProductionPlace!.getElementsByTagNameNS('*', 'City')[0]!.textContent;
    const countryName = signatureProductionPlace!.getElementsByTagNameNS('*', 'CountryName')[0]!.textContent;
    const signerRole = signedSignatureProperties.getElementsByTagNameNS('*', 'SignerRole')[0];
    const claimedRoles = Array.from(signerRole!.getElementsByTagNameNS('*', 'ClaimedRole')).map((role) => {
      const r = role.textContent;
      if (r === null) {
        throw new ParsingException('Failed to parse ClaimedRole');
      }
      return {
        claimedRole: r,
      };
    });
    const certifiedRoles = Array.from(signerRole!.getElementsByTagNameNS('*', 'CertifiedRole')).map((role) => {
      const r = role.textContent;
      if (r === null) {
        throw new ParsingException('Failed to parse CertifiedRole');
      }
      return {
        certifiedRole: r,
      };
    });

    if (signingTime === null || digestMethod === null || digestValue === null
        || x509IssuerName === null
        || x509SerialNumber === null || signaturePolicyImplied === null
        || city === null || countryName === null
        || claimedRoles === null || certifiedRoles === null) {
      throw new ParsingException('Failed to parse SignedSignatureProperties');
    }

    return {
      signingTime,
      signingCertificate: {
        cert: {
          certDigest: {
            digestMethod,
            digestValue,
          },
          issuerSerial: {
            x509IssuerName,
            x509SerialNumber,
          },
        },
      },
      signaturePolicyIdentifier: {
        signaturePolicyImplied,
      },
      signatureProductionPlace: {
        city,
        countryName,
      },
      signerRole: {
        claimedRoles,
        certifiedRoles,
      },
    };
  }

  private static parseSignedDataObjectProperties(signedDataObjectProperties: Element)
    : SignedDataObjectProperties {
    const dataObjectFormat = signedDataObjectProperties.getElementsByTagNameNS('*', 'DataObjectFormat')[0];
    const objectReference = dataObjectFormat!.getAttribute('ObjectReference');
    const mimeType = dataObjectFormat!.getElementsByTagNameNS('*', 'MimeType')[0]!.textContent;
    const encoding = dataObjectFormat!.getElementsByTagNameNS('*', 'Encoding')[0]!.textContent;
    const objectIdentifier = dataObjectFormat!.getElementsByTagNameNS('*', 'ObjectIdentifier')[0];
    const description = objectIdentifier!.getElementsByTagNameNS('*', 'Description')[0]!.textContent;

    if (objectReference === null || mimeType === null
        || encoding === null || description === null) {
      throw new ParsingException('Failed to parse DataObjectFormat');
    }

    return {
      dataObjectFormat: {
        objectReference,
        mimeType,
        encoding,
        objectIdentifier: {
          description,
        },
      },
    };
  }

  private static parseQualifyingProperties(qualifyingProperties: Element): QualifyingProperties {
    const signedProperties = qualifyingProperties.getElementsByTagNameNS('*', 'SignedProperties')[0];
    const signedSignatureProperties = signedProperties!.getElementsByTagNameNS('*', 'SignedSignatureProperties')[0];
    const signedDataObjectProperties = signedProperties!.getElementsByTagNameNS('*', 'SignedDataObjectProperties')[0];

    const signedSPropertiesObj = this.parseSignedSignatureProperties(signedSignatureProperties!);
    const signedDOPropertiesObj = this.parseSignedDataObjectProperties(signedDataObjectProperties!);

    if (signedSPropertiesObj === null || signedDOPropertiesObj === null) {
      throw new ParsingException('Failed to parse SignedProperties');
    }

    return {
      signedProperties: {
        signedSignatureProperties: signedSPropertiesObj,
        signedDataObjectProperties: signedDOPropertiesObj,
      },
    };
  }

  private static parseObject(object: Element): SObject {
    const qualifyingProperties = object.getElementsByTagNameNS('*', 'QualifyingProperties')[0];

    const qualifyingPropertiesObj = this.parseQualifyingProperties(qualifyingProperties!);

    if (qualifyingPropertiesObj === null) {
      throw new ParsingException('Failed to parse QualifyingProperties');
    }

    return {
      qualifyingProperties: qualifyingPropertiesObj,
    };
  }

  public static parseXmlSignature(xml: string): ParsedXmlSignature {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const signature = xmlDoc.getElementsByTagNameNS('*', 'Signature')[0];

    const signedInfo = signature!.getElementsByTagNameNS('*', 'SignedInfo')[0];
    const signatureValue = signature!.getElementsByTagNameNS('*', 'SignatureValue')[0]!.textContent;
    const keyInfo = signature!.getElementsByTagNameNS('*', 'KeyInfo')[0];
    const object = signature!.getElementsByTagNameNS('*', 'Object')[0];

    const signedInfoObj = this.parseSignedInfo(signedInfo!);
    const keyInfoObj = this.parseKeyInfo(keyInfo!);
    const objectObj = this.parseObject(object!);

    if (signedInfoObj === null || signatureValue === null
        || keyInfoObj === null || objectObj === null) {
      throw new ParsingException('Failed to parse Signature');
    }

    const meta = xmlDoc.getElementsByTagNameNS('*', 'Metadata')[0];
    const baseUrl = meta!.getElementsByTagNameNS('*', 'baseUrl')[0]!.textContent;
    const version = meta!.getElementsByTagNameNS('*', 'version')[0]!.textContent;

    return {
      meta: {
        baseUrl: baseUrl ?? '',
        version: version ?? '',
      },
      signature: {
        signedInfo: signedInfoObj,
        signatureValue,
        keyInfo: keyInfoObj,
        object: objectObj,
      },
    };
  }
}
