"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import LaunchIcon from "@mui/icons-material/Launch";

import { ApplicationForm } from "@/components/callForProposals/ApplicationForm";
import { useMyApplication, useUpdateApplication, useDeleteApplication } from "@/lib/hooks/useCallForProposals";
import type { ApplicationInput } from "@/lib/callForProposals/types";
import { CALL_FOR_PROPOSAL_STATUSES, APPLICATION_STATUSES, ACCEPTANCE_STATUSES, PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";
import { useUserContext } from "@/contexts/UserContext";

function statusLabel(options: { value: string; label: string }[], value?: string) {
    if (!value) return "";
    return options.find((item) => item.value === value)?.label ?? value;
}

function formatShortDate(value?: string | Date) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
}

export default function ApplicationDetailPage() {
    const params = useParams<{ applicationIri: string }>();
    const applicationIri = React.useMemo(() => decodeURIComponent(params.applicationIri), [params.applicationIri]);
    const router = useRouter();
    const { roles } = useUserContext();

    const { data, error, isLoading, mutate } = useMyApplication(applicationIri);
    const callIri = data?.callForProposal.iri;

    const updateApplication = useUpdateApplication(callIri, applicationIri);
    const deleteApplication = useDeleteApplication(callIri);

    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);

    const allowStatusFields = React.useMemo(
        () => Boolean(data?.isOwner || roles?.includes("admin")),
        [data?.isOwner, roles],
    );
    const allowDecisionFields = allowStatusFields;

    const allowDelete = React.useMemo(
        () => Boolean(roles?.includes("admin") || data?.isOwner || data?.isApplicant),
        [data?.isApplicant, data?.isOwner, roles],
    );

    const initialValue = React.useMemo(() => {
        if (!data) return undefined;
        const coApplicants = Array.isArray(data.application.coApplicants)
            ? data.application.coApplicants.map((entry) => (
                typeof entry === "string" ? entry : entry?.iri ?? ""
            )).filter(Boolean)
            : [];
        return {
            applicationStatus: data.application.applicationStatus,
            acceptanceStatus: data.application.acceptanceStatus,
            coApplicants,
            proposal: {
                title: data.application.proposal?.title ?? "",
                description: data.application.proposal?.description ?? "",
                files: data.application.proposal?.files ?? [],
                proposalStatus: data.application.proposal?.proposalStatus ?? "draft",
            },
        };
    }, [data]);

    const handleSubmit = React.useCallback(async (values: ApplicationInput) => {
        if (!callIri) return;
        try {
            await updateApplication.trigger(values);
            await mutate();
            setSnackbar({ open: true, message: "Application updated.", severity: "success" });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to update application.";
            setSnackbar({ open: true, message, severity: "error" });
            throw err;
        }
    }, [callIri, mutate, updateApplication]);

    const handleDelete = React.useCallback(async () => {
        if (!callIri || !allowDelete) return;
        const confirmed = window.confirm("Delete this application? This action cannot be undone.");
        if (!confirmed) return;
        try {
            await deleteApplication.trigger({ applicationIri });
            setSnackbar({ open: true, message: "Application deleted.", severity: "success" });
            router.replace("/console/applications");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unable to delete application.";
            setSnackbar({ open: true, message, severity: "error" });
        }
    }, [allowDelete, callIri, deleteApplication, applicationIri, router]);

    const closeSnackbar = () => setSnackbar(null);

    const goBack = React.useCallback(() => {
        router.back();
    }, [router]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={goBack}>
                    Back
                </Button>
                {callIri && (
                    <Button endIcon={<LaunchIcon />} onClick={() => router.push(`/console/call-for-proposals/${encodeURIComponent(callIri)}`)}>
                        View Call
                    </Button>
                )}
            </Stack>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error.message}</Alert>
            ) : !data ? (
                <Alert severity="error">Application not found.</Alert>
            ) : (
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Stack spacing={1}>
                                <Typography variant="h5" fontWeight={600}>
                                    {typeof data.callForProposal.forPartnershipOpportunity === "string"
                                        ? data.callForProposal.forPartnershipOpportunity
                                        : data.callForProposal.forPartnershipOpportunity?.name ?? data.callForProposal.iri}
                                </Typography>
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Chip size="small" label={`Call: ${statusLabel(CALL_FOR_PROPOSAL_STATUSES, data.callForProposal.status)}`} />
                                    <Chip size="small" label={`Window: ${formatShortDate(data.callForProposal.startDate)} – ${formatShortDate(data.callForProposal.endDate)}`} />
                                    <Chip size="small" label={`Proposal: ${statusLabel(PROPOSAL_STATUSES, data.application.proposal?.proposalStatus ?? 'draft')}`} />
                                    <Chip size="small" label={`Application: ${statusLabel(APPLICATION_STATUSES, data.application.applicationStatus)}`} />
                                    <Chip size="small" label={`Decision: ${statusLabel(ACCEPTANCE_STATUSES, data.application.acceptanceStatus)}`} />
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <ApplicationForm
                        initialValue={initialValue}
                        onSubmit={handleSubmit}
                        isSubmitting={updateApplication.isMutating}
                        error={updateApplication.error?.message}
                        submitLabel="Save changes"
                        onCancel={goBack}
                        allowStatusFields={allowStatusFields}
                        allowDecisionFields={allowDecisionFields}
                    />

                    {allowDelete && (
                        <Button color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={deleteApplication.isMutating}>
                            Delete application
                        </Button>
                    )}
                </Stack>
            )}

            {snackbar && (
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={closeSnackbar}
                >
                    <Alert severity={snackbar.severity} onClose={closeSnackbar} sx={{ width: "100%" }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
}
