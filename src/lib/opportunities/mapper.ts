import type { OpportunityDTO } from './types';
import type { OpportunityFormData } from '@/components/forms/schema/Opportunity';

type LandFormData = OpportunityFormData['land'];
type AddressFormData = LandFormData['addresses'][number];
type PartnerFormData = OpportunityFormData['partners'][number];
type RoleFormData = PartnerFormData['roles'][number];

function toBool(v: unknown): boolean | undefined {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return undefined;
}

function toStringValue(value: unknown): string | undefined {
    if (value == null) return undefined;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}

function toIri(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value?.iri === 'string') return value.iri;
    if (typeof value?.id === 'string') return value.id;
    if (typeof value?.['@id'] === 'string') return value['@id'];
    return undefined;
}

function toNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
}

function toStringArray(value: any): string[] {
    if (value == null) return [];
    const list = Array.isArray(value) ? value : [value];
    const ids = list
        .map((item) => toIri(item))
        .filter((item): item is string => Boolean(item));
    return Array.from(new Set(ids));
}

function normalizeAddress(address: any): AddressFormData {
    const streetNumber = toStringValue(address?.streetNumber ?? address?.houseNumber ?? address?.number);
    const streetName = toStringValue(address?.streetName ?? address?.street);
    const latitude = toNumber(
        address?.latitude ??
        address?.lat ??
        address?.geo?.latitude ??
        address?.position?.lat ??
        address?.latitudeDegrees
    );
    const longitude = toNumber(
        address?.longitude ??
        address?.lng ??
        address?.geo?.longitude ??
        address?.position?.lng ??
        address?.longitudeDegrees
    );

    return {
        streetNumber,
        streetName,
        streetType: toStringValue(address?.streetType),
        streetDirection: toStringValue(address?.streetDirection),
        unitDesignator: toStringValue(address?.unitDesignator ?? address?.unitType),
        unitIdentifier: toStringValue(address?.unitIdentifier ?? address?.unitNumber ?? address?.unitId),
        siteName: toStringValue(address?.siteName),
        ruralRouteIdentifier: toStringValue(address?.ruralRouteIdentifier),
        postalBoxIdentifier: toStringValue(address?.postalBoxIdentifier),
        postalStationInformation: toStringValue(address?.postalStationInformation),
        postalCode: toStringValue(address?.postalCode ?? address?.zip ?? address?.postcode),
        localityName: toStringValue(address?.localityName ?? address?.city ?? address?.town ?? address?.municipality),
        provinceName: toStringValue(address?.provinceName ?? address?.state ?? address?.region) ?? '',
        provinceCode: toStringValue(address?.provinceCode ?? address?.stateCode),
        countryName: toStringValue(address?.countryName ?? address?.country) ?? '',
        countryCode: toStringValue(address?.countryCode ?? address?.countryIso3 ?? address?.countryIso2),
        locationDescription: toStringValue(address?.locationDescription ?? address?.description),
        lotInformation: toStringValue(address?.lotInformation),
        partLotInformation: toStringValue(address?.partLotInformation),
        concessionInformation: toStringValue(address?.concessionInformation),
        propertyIdentificationNumber: toStringValue(address?.propertyIdentificationNumber),
        stringRepresentation: toStringValue(address?.stringRepresentation ?? address?.label ?? address?.title),
        latitude,
        longitude,
    } as AddressFormData;
}

function normalizeLand(op: OpportunityDTO): LandFormData {
    const landSource: any = op.land ?? (Array.isArray((op as any).lands) ? (op as any).lands[0] : undefined) ?? {};
    const addressList: any[] = Array.isArray(landSource.addresses)
        ? landSource.addresses
        : Array.isArray(landSource.address)
            ? landSource.address
            : [];

    return {
        notes: toStringValue(landSource.notes) ?? '',
        parcelId: toStringValue(landSource.parcelId ?? landSource.parcelID ?? landSource.pin),
        addresses: addressList.length > 0
            ? addressList.map((addr) => normalizeAddress(addr))
            : [],
        area: toNumber(landSource.area?.value ?? landSource.area),
        areaUnit: toIri(landSource.area?.unit ?? landSource.areaUnit ?? landSource.unit),
        currentLandUse: toIri(landSource.currentLandUse),
        designatedLandUse: toIri(landSource.designatedLandUse),
        proposedLandUse: toIri(landSource.proposedLandUse),
    } as LandFormData;
}

function normalizeRole(role: any): RoleFormData | null {
    const roleTypes = toStringArray(role?.roleTypes ?? role?.roleType);
    if (roleTypes.length === 0) return null;

    const startDateRaw = role?.startDate;
    const endDateRaw = role?.endDate;
    const description = toStringValue(role?.description);

    return {
        roleTypes,
        startDate: typeof startDateRaw === 'string' && startDateRaw.trim().length > 0 ? startDateRaw : undefined,
        endDate: typeof endDateRaw === 'string' && endDateRaw.trim().length > 0 ? endDateRaw : undefined,
        description: description ?? undefined,
    } as RoleFormData;
}

function normalizePartner(partner: any): PartnerFormData | null {
    const roleCandidates: Array<RoleFormData | null> = Array.isArray(partner?.roles)
        ? partner.roles.map((role: any) => normalizeRole(role))
        : [];
    const normalizedRoles: RoleFormData[] = roleCandidates.filter((role): role is RoleFormData => Boolean(role));

    if (normalizedRoles.length === 0) {
        return null;
    }

    const organizationValue =
        toIri(partner?.organization) ??
        toStringValue(partner?.organization) ??
        toStringValue(partner?.organizationId ?? partner?.organizationIri);

    let organizationName = toStringValue(
        partner?.organization?.name ??
        partner?.organization?.label ??
        partner?.organization?.title ??
        partner?.organizationName ??
        partner?.organizationLabel ??
        partner?.organizationTitle ??
        partner?.organizationDisplay
    );

    if (!organizationName && !organizationValue) {
        organizationName = toStringValue(partner?.organization?.iri ?? partner?.iri ?? '') ?? 'Unknown organization';
    }

    return {
        organization: organizationValue ?? '',
        organizationName: organizationName ?? '',
        roles: normalizedRoles,
    } as PartnerFormData;
}

export function dtoToForm(op: OpportunityDTO): OpportunityFormData {
    const ai = op.additionalInfo ?? {};
    const partnershipRoles = Array.isArray(op.partnershipRoles)
        ? op.partnershipRoles
            .map((role: any) => toIri(role))
            .filter((id): id is string => Boolean(id))
        : [];

    const partnerCandidates: Array<PartnerFormData | null> = Array.isArray((op as any).partners)
        ? (op as any).partners.map((partner: any) => normalizePartner(partner))
        : [];
    const partners = partnerCandidates.filter((partner): partner is PartnerFormData => Boolean(partner));

    return {
        name: op.name ?? '',
        description: op.description ?? '',
        partnershipRoles,
        projectType: toIri(op.projectType),
        projectStage: toIri(op.projectStage),
        primaryContact: {
            contactName: toStringValue(op.primaryContact?.contactName) ??
                toStringValue((op.primaryContact as any)?.name) ??
                '',
            email: toStringValue(op.primaryContact?.email) ?? '',
            phone: toStringValue(op.primaryContact?.phone) ?? '',
        },
        partners,
        land: normalizeLand(op),
        additionalInfo: {
            images: ai.images ?? [],
            files: ai.files ?? [],
            primaryImage: ai.primaryImage,
            isPosted: toBool(ai.isPosted) ?? undefined,
            isSearchable: toBool(ai.isSearchable) ?? undefined,
            datePosted: typeof ai.datePosted === 'string' ? new Date(ai.datePosted) : (ai.datePosted as Date | undefined),
            dateModified: typeof ai.dateModified === 'string' ? new Date(ai.dateModified) : (ai.dateModified as Date | undefined),
        },
    };
}

// remove dates before submit; backend sets them
export function formToUpsertBody(data: OpportunityFormData): OpportunityFormData {
    const { additionalInfo, ...rest } = data;
    return {
        ...rest,
        additionalInfo: additionalInfo
            ? { ...additionalInfo, datePosted: undefined, dateModified: undefined }
            : undefined,
    } as OpportunityFormData;
}
