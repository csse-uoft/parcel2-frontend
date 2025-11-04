import type { AdminOrganization } from '@/components/console/types';
import type { OrganizationFormData } from '@/components/forms/OrganizationForm';
import { createOrganizationFormDefaults } from '@/components/forms/OrganizationForm';
import type { AddressFormData } from '@/components/forms/AddressForm';

const addressKeys: (keyof AddressFormData)[] = [
    'streetNumber',
    'streetName',
    'streetType',
    'streetDirection',
    'unitDesignator',
    'unitIdentifier',
    'siteName',
    'ruralRouteIdentifier',
    'postalBoxIdentifier',
    'postalStationInformation',
    'postalCode',
    'localityName',
    'provinceName',
    'provinceCode',
    'countryName',
    'countryCode',
    'locationDescription',
    'lotInformation',
    'partLotInformation',
    'concessionInformation',
    'propertyIdentificationNumber',
    'stringRepresentation',
    'latitude',
    'longitude',
];

type LegalEntry = OrganizationFormData['legalNames'][number];
type RegistrationEntry = NonNullable<OrganizationFormData['registrationNumbers']>[number];
type AcronymEntry = NonNullable<OrganizationFormData['acronyms']>[number];

type AnyAddress = Partial<Record<keyof AddressFormData, unknown>> | null | undefined;

const toStringSafe = (value: unknown): string => (typeof value === 'string' ? value : '');

const optionalTrim = (value?: string | null): string | undefined => {
    if (value == null) return undefined;
    const trimmed = `${value}`.trim();
    return trimmed.length ? trimmed : undefined;
};

const formatDate = (value: unknown): string => {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const str = String(value);
    if (!str) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    const parsed = new Date(str);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

const emptyAddress = (): AddressFormData => {
    const formDefaults = createOrganizationFormDefaults();
    return { ...formDefaults.primaryAddress };
};

const cloneAddress = (source: AnyAddress): AddressFormData => {
    const address = emptyAddress();
    if (!source) return address;
    for (const key of addressKeys) {
        const value = source[key];
        if (value === undefined || value === null) continue;
        (address as any)[key] = value;
    }
    return address;
};

const hasAddressData = (source: AnyAddress): boolean => {
    if (!source) return false;
    return addressKeys.some(key => {
        const value = source[key];
        if (value == null) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return !Number.isNaN(value);
        return false;
    });
};

const toComparableAddress = (source: AnyAddress): Record<string, string | number> => {
    const result: Record<string, string | number> = {};
    if (!source) return result;
    for (const key of addressKeys) {
        const value = source[key];
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) continue;
            result[key] = trimmed;
        } else if (typeof value === 'number' && !Number.isNaN(value)) {
            result[key] = value;
        }
    }
    return result;
};

const addressesEqual = (a: AnyAddress, b: AnyAddress): boolean => {
    const normalizedA = toComparableAddress(a);
    const normalizedB = toComparableAddress(b);
    const keysA = Object.keys(normalizedA);
    const keysB = Object.keys(normalizedB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => normalizedB[key] === normalizedA[key]);
};

const toLegalEntry = (source: any): LegalEntry => ({
    hasValue: toStringSafe(source?.hasValue ?? source?.value),
    registeringAuthority: toStringSafe(source?.registeringAuthority),
    jurisdiction: toStringSafe(source?.jurisdiction),
    startDate: formatDate(source?.startDate) as any,
    endDate: formatDate(source?.endDate) as any,
});

const toRegistrationEntry = (source: any): RegistrationEntry => ({
    hasValue: toStringSafe(source?.hasValue ?? source?.value),
    registeringAuthority: toStringSafe(source?.registeringAuthority),
    jurisdiction: toStringSafe(source?.jurisdiction),
    startDate: formatDate(source?.startDate) as any,
    endDate: formatDate(source?.endDate) as any,
});

const toAcronymEntries = (source: any): AcronymEntry[] => {
    if (!Array.isArray(source)) return [];
    return source.map((item: any) => ({ value: toStringSafe(typeof item === 'string' ? item : item?.value) }));
};

const extractRoleTypeId = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        if (typeof obj.iri === 'string' && obj.iri) return obj.iri;
        if (typeof obj.id === 'string' && obj.id) return obj.id;
        if (typeof obj['@id'] === 'string' && obj['@id']) return obj['@id'] as string;
        if (typeof obj.value === 'string' && obj.value) return obj.value as string;
    }
    return undefined;
};

export function mapOrganizationToFormData(org?: AdminOrganization | null): OrganizationFormData {
    const form = createOrganizationFormDefaults();
    if (!org) {
        return form;
    }

    form.name = toStringSafe(org.name);
    form.tradeName = toStringSafe((org as any).tradeName);
    form.briefDescription = toStringSafe(org.briefDescription ?? org.description ?? '');
    form.description = toStringSafe(org.description ?? org.briefDescription ?? '');
    form.missionStatement = toStringSafe((org as any).missionStatement);
    form.valuesStatement = toStringSafe((org as any).valuesStatement);

    form.primaryContact = {
        contactName: toStringSafe(org.primaryContact?.contactName),
        email: toStringSafe(org.primaryContact?.email),
        phone: toStringSafe(org.primaryContact?.phone),
    };

    const primaryAddressRaw = org.primaryAddress as AnyAddress;
    form.primaryAddress = cloneAddress(primaryAddressRaw);

    const mailingAddressRaw = org.mailingAddress as AnyAddress;
    const hasMailing = hasAddressData(mailingAddressRaw);
    const mailingSameExplicit = typeof (org as any).mailingSameAsPrimary === 'boolean'
        ? Boolean((org as any).mailingSameAsPrimary)
        : undefined;
    const mailingSame = mailingSameExplicit ?? (!hasMailing || addressesEqual(primaryAddressRaw, mailingAddressRaw));
    form.mailingSameAsPrimary = mailingSame;
    form.mailingAddress = mailingSame ? cloneAddress(form.primaryAddress) : cloneAddress(mailingAddressRaw);

    const deliveryAddressRaw = (org as any).deliveryAddress as AnyAddress;
    const hasDelivery = hasAddressData(deliveryAddressRaw);
    const deliverySameExplicit = typeof (org as any).deliverySameAsPrimary === 'boolean'
        ? Boolean((org as any).deliverySameAsPrimary)
        : undefined;
    const deliverySame = deliverySameExplicit ?? (!hasDelivery || addressesEqual(primaryAddressRaw, deliveryAddressRaw));
    form.deliverySameAsPrimary = deliverySame;
    form.deliveryAddress = deliverySame ? cloneAddress(form.primaryAddress) : cloneAddress(deliveryAddressRaw);

    const legalNames = Array.isArray((org as any).legalNames)
        ? ((org as any).legalNames as any[])
            .map(toLegalEntry)
            .filter((entry: LegalEntry) => entry.hasValue.trim().length > 0)
        : [];
    form.legalNames = legalNames.length ? legalNames : form.legalNames;

    const registrationNumbers = Array.isArray((org as any).registrationNumbers)
        ? ((org as any).registrationNumbers as any[])
            .map(toRegistrationEntry)
            .filter((entry: RegistrationEntry) => entry.hasValue.trim().length > 0)
        : [];
    form.registrationNumbers = registrationNumbers;

    const acronymSource = (org as any).acronym ?? (org as any).acronyms;
    form.acronyms = toAcronymEntries(acronymSource);

    const roleTypeIds = Array.isArray((org as any).roleTypes)
        ? ((org as any).roleTypes as any[])
            .map(extractRoleTypeId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
        : [];
    form.roleTypes = roleTypeIds;

    return form;
}

const mapAddressForPayload = (address: AddressFormData): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key of addressKeys) {
        const value = (address as any)[key];
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) continue;
            result[key] = trimmed;
        } else if (typeof value === 'number') {
            if (!Number.isNaN(value)) result[key] = value;
        }
    }
    return result;
};

const mapLegalForPayload = (entry: LegalEntry) => ({
    hasValue: entry.hasValue.trim(),
    registeringAuthority: optionalTrim(entry.registeringAuthority),
    jurisdiction: optionalTrim(entry.jurisdiction),
    startDate: optionalTrim(entry.startDate),
    endDate: optionalTrim(entry.endDate),
});

const mapRegistrationForPayload = (entry: RegistrationEntry) => ({
    hasValue: entry.hasValue.trim(),
    registeringAuthority: optionalTrim(entry.registeringAuthority),
    jurisdiction: optionalTrim(entry.jurisdiction),
    startDate: optionalTrim(entry.startDate),
    endDate: optionalTrim(entry.endDate),
});

export function buildOrganizationUpdatePayload(values: OrganizationFormData) {
    const payload: Record<string, unknown> = {
        name: values.name.trim(),
        tradeName: optionalTrim(values.tradeName),
        briefDescription: values.briefDescription.trim(),
        description: values.description.trim(),
        missionStatement: optionalTrim(values.missionStatement),
        valuesStatement: optionalTrim(values.valuesStatement),
        primaryContact: {
            contactName: values.primaryContact.contactName.trim(),
            email: optionalTrim(values.primaryContact.email),
            phone: optionalTrim(values.primaryContact.phone),
        },
        primaryAddress: mapAddressForPayload(values.primaryAddress),
        roleTypes: Array.isArray(values.roleTypes) ? values.roleTypes.slice() : [],
        acronyms: (values.acronyms ?? []).map(item => item.value.trim()).filter(text => text.length > 0),
        legalNames: values.legalNames
            .map(mapLegalForPayload)
            .filter(entry => entry.hasValue.length > 0),
    };

    const primaryAddressPayload = payload.primaryAddress as Record<string, unknown>;

    const registration = (values.registrationNumbers ?? [])
        .map(mapRegistrationForPayload)
        .filter(entry => entry.hasValue.length > 0);
    payload.registrationNumbers = registration;

    const mailingAddressPayload = values.mailingSameAsPrimary
        ? { ...primaryAddressPayload }
        : mapAddressForPayload(values.mailingAddress ?? values.primaryAddress);
    payload.mailingAddress = Object.keys(mailingAddressPayload).length ? mailingAddressPayload : null;

    const deliveryAddressPayload = values.deliverySameAsPrimary
        ? { ...primaryAddressPayload }
        : mapAddressForPayload(values.deliveryAddress ?? values.primaryAddress);
    payload.deliveryAddress = Object.keys(deliveryAddressPayload).length ? deliveryAddressPayload : null;

    return payload;
}
