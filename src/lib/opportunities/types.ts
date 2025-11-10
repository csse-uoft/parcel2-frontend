export interface TaxonomyDTO {
    iri: string;
    name?: string;
    description?: string;
}


export interface OpportunityDTO {
    iri: string;
    name?: string;
    description?: string;
    partnershipRoles?: TaxonomyDTO[];
    projectType?: TaxonomyDTO;
    projectStage?: TaxonomyDTO;
    primaryContact?: { name?: string; email?: string; phone?: string; [k: string]: unknown };
    organization?: {
        iri: string;
        name?: string;
    };
    organizationIri?: string;
    partners?: any[];
    land?: any;
    additionalInfo?: {
        images?: string[];
        files?: string[];
        primaryImage?: string;
        isPosted?: boolean | string;
        isSearchable?: boolean | string;
        datePosted?: string | Date;
        dateModified?: string | Date;
    };
}
