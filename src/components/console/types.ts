export interface ConsoleUser {
    _id: string;
    username?: string;
    email: string;
    roles?: string[];
    organizationIRI?: string | null;
    lastLogin?: string | null;
    isRegistrationComplete?: boolean;
}

export interface ResetResponse {
    message: string;
    newPassword: string;
}

export interface AdminOrganization {
    iri: string;
    name?: string;
    description?: string;
    briefDescription?: string;
    email?: string;
    phone?: string;
    missionStatement?: string;
    valuesStatement?: string;
    organizationStructure?: string;
    tradeName?: string;
    primaryContact?: {
        contactName?: string;
        email?: string;
        phone?: string;
    } | null;
    primaryAddress?: {
        stringRepresentation?: string;
        streetNumber?: string;
        streetName?: string;
        localityName?: string;
        provinceName?: string;
        postalCode?: string;
        countryName?: string;
    } | null;
    [key: string]: unknown;
}
