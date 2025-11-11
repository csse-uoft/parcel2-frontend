export interface ProposalDTO {
    iri: string;
    title: string;
    description: string;
    organization: { iri: string; name?: string } | string;
    proposalStatus: string;
    files: string[];
}

export interface ApplicationDTO {
    iri: string;
    applicationStatus: string;
    acceptanceStatus: string;
    principalApplicant: { iri: string; name?: string } | string;
    coApplicants?: Array<{ iri: string; name?: string } | string>;
    proposal: ProposalDTO;
}

export interface CallForProposalDTO {
    iri: string;
    status: string;
    startDate: string | Date;
    endDate: string | Date;
    forPartnershipOpportunity: { iri: string; name?: string } | string;
    applications?: ApplicationDTO[];
    organization?: { iri: string; name?: string };
    yourApplication?: ApplicationDTO | null;
    isOwner?: boolean;
}

export interface CallForProposalInput {
    forPartnershipOpportunity: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface ApplicationInput {
    applicationStatus?: string;
    acceptanceStatus?: string;
    coApplicants?: string[];
    proposal: {
        title: string;
        description: string;
        files?: string[];
        proposalStatus?: string;
    };
}

export interface MyApplicationListItem {
    callForProposal: {
        iri: string;
        status: string;
        startDate: string | Date;
        endDate: string | Date;
        forPartnershipOpportunity: { iri: string; name?: string } | string;
        organization?: { iri: string; name?: string } | null;
    };
    application: ApplicationDTO;
}

export interface MyApplicationDetail extends MyApplicationListItem {
    isOwner?: boolean;
    isApplicant?: boolean;
}
