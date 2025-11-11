import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { fetcher, postJSON } from "@/lib/fetcher";
import type {
    CallForProposalDTO,
    CallForProposalInput,
    ApplicationDTO,
    ApplicationInput,
    MyApplicationListItem,
    MyApplicationDetail,
} from "@/lib/callForProposals/types";
import { FetcherError } from "@/lib/errors";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export function useCallForProposals() {
    return useSWR<CallForProposalDTO[], FetcherError>("/api/call-for-proposals", fetcher, {
        revalidateOnFocus: false,
    });
}

export function useCallForProposal(iri?: string | null) {
    const key = iri ? `/api/call-for-proposals/${encodeURIComponent(iri)}` : null;
    return useSWR<CallForProposalDTO, FetcherError>(key, fetcher, {
        revalidateOnFocus: false,
    });
}

export function useOpportunityCallForProposals(opportunityIri?: string | null) {
    const key = opportunityIri ? `/api/opportunities/${encodeURIComponent(opportunityIri)}/call-for-proposals` : null;
    return useSWR<CallForProposalDTO[], FetcherError>(key, fetcher, {
        revalidateOnFocus: false,
    });
}

export function useCallForProposalApplications(iri?: string | null) {
    const key = iri ? `/api/call-for-proposals/${encodeURIComponent(iri)}/applications` : null;
    return useSWR<ApplicationDTO[], FetcherError>(key, fetcher, {
        revalidateOnFocus: false,
    });
}

export function useCreateCallForProposal() {
    return useSWRMutation<CallForProposalDTO, FetcherError, string, CallForProposalInput>(
        "/api/call-for-proposals",
        (url, { arg }) => postJSON<CallForProposalDTO>(url, { arg }),
    );
}

export function useUpdateCallForProposal(iri?: string | null) {
    const key = iri ? `/api/call-for-proposals/${encodeURIComponent(iri)}` : null;
    return useSWRMutation<CallForProposalDTO, FetcherError, string, CallForProposalInput>(
        key ?? "",
        (url, { arg }) => postJSON<CallForProposalDTO>(url, { arg }),
    );
}

export function useDeleteCallForProposal() {
    return useSWRMutation<{ message: string }, FetcherError, string, { iri: string }>(
        "/api/call-for-proposals",
        async (_url, { arg }) => {
            const response = await fetch(`${API_BASE}/api/call-for-proposals/${encodeURIComponent(arg.iri)}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) {
                const text = await response.text();
                const error = new FetcherError(text || "Failed to delete call for proposal");
                error.status = response.status;
                throw error;
            }
            return response.json();
        }
    );
}

export function useCreateApplication(iri?: string | null) {
    const key = iri ? `/api/call-for-proposals/${encodeURIComponent(iri)}/applications` : null;
    return useSWRMutation<ApplicationDTO, FetcherError, string, ApplicationInput>(
        key ?? "",
        (url, { arg }) => postJSON<ApplicationDTO>(url, { arg }),
    );
}

export function useUpdateApplication(iri?: string | null, applicationIri?: string | null) {
    const key = iri && applicationIri
        ? `/api/call-for-proposals/${encodeURIComponent(iri)}/applications/${encodeURIComponent(applicationIri)}`
        : null;
    return useSWRMutation<ApplicationDTO, FetcherError, string, ApplicationInput>(
        key ?? "",
        (url, { arg }) => postJSON<ApplicationDTO>(url, { arg }),
    );
}

export function useDeleteApplication(iri?: string | null) {
    return useSWRMutation<{ message: string }, FetcherError, string, { applicationIri: string }>(
        iri ? `/api/call-for-proposals/${encodeURIComponent(iri)}/applications` : "",
        async (_url, { arg }) => {
            if (!iri) {
                throw new FetcherError("Call for proposals IRI missing");
            }
            const response = await fetch(`${API_BASE}/api/call-for-proposals/${encodeURIComponent(iri)}/applications/${encodeURIComponent(arg.applicationIri)}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) {
                const text = await response.text();
                const error = new FetcherError(text || "Failed to delete application");
                error.status = response.status;
                throw error;
            }
            return response.json();
        }
    );
}

export function useMyApplications() {
    return useSWR<MyApplicationListItem[], FetcherError>("/api/applications", fetcher, {
        revalidateOnFocus: false,
    });
}

export function useMyApplication(applicationIri?: string | null) {
    const key = applicationIri ? `/api/applications/${encodeURIComponent(applicationIri)}` : null;
    return useSWR<MyApplicationDetail, FetcherError>(key, fetcher, {
        revalidateOnFocus: false,
    });
}
