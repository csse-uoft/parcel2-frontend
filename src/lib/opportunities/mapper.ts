import type { OpportunityDTO } from './types';
import type { OpportunityFormData } from '@/components/forms/schema/Opportunity';

function toBool(v: unknown): boolean | undefined {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return undefined;
}

export function dtoToForm(op: OpportunityDTO): OpportunityFormData {
    const ai = op.additionalInfo ?? {};
    return {
        name: op.name ?? '',
        description: op.description ?? '',
        partnershipRoles: Array.isArray(op.partnershipRoles) ? op.partnershipRoles.map(partnershipRoles => partnershipRoles.iri) : [],
        projectType: op.projectType?.iri ?? undefined,
        projectStage: op.projectStage?.iri ?? undefined,
        primaryContact: {
            name: op.primaryContact?.name ?? '',
            email: op.primaryContact?.email ?? '',
            phone: op.primaryContact?.phone ?? '',
            ...op.primaryContact,
        } as any,
        partners: Array.isArray(op.partners) ? op.partners : [],
        land: (op.land ?? {}) as any,
        additionalInfo: {
            images: ai.images ?? [],
            files: ai.files ?? [],
            primaryImage: ai.primaryImage,
            isPosted: toBool(ai.isPosted),
            isSearchable: toBool(ai.isSearchable),
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
