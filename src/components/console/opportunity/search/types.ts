export type LatLng = { lat: number; lng: number };

export type SearchHit = {
    id: string;
    name: string;
    description?: string;
    projectType?: string | { iri: string; name?: string };
    projectStage?: string | { iri: string; name?: string };
    partnershipRoles?: Array<string | { iri: string; name?: string }>;
    primaryImage?: string;
    images?: string[];
    datePosted?: string;
    dateModified?: string;
    partnersCount?: number;
    lat?: number;
    lng?: number;
};

export type SearchResponse = {
    items: SearchHit[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
};

export type OpportunityDetail = {
    iri: string;
    name: string;
    description?: string;
    partnershipRoles?: Array<{ iri: string; name?: string } | string>;
    projectType?: { iri: string; name?: string } | string;
    projectStage?: { iri: string; name?: string } | string;
    primaryContact?: { contactName?: string };
    land?: { notes?: string };
    additionalInfo?: {
        images?: string[];
        primaryImage?: string;
        isPosted?: boolean;
        isSearchable?: boolean;
        datePosted?: string;
        dateModified?: string;
    };
};
