"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
import EditIcon from "@mui/icons-material/Edit";

import {
    useCallForProposal,
    useCallForProposalApplications,
    useDeleteApplication,
} from "@/lib/hooks/useCallForProposals";
import { useUserOrg } from "@/lib/hooks/useUser";
import { useUserContext } from "@/contexts/UserContext";
import { ApplicationDTO } from "@/lib/callForProposals/types";
import { ACCEPTANCE_STATUSES, APPLICATION_STATUSES, PROPOSAL_STATUSES, CALL_FOR_PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";

const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
};

const statusLabel = (list: { value: string; label: string }[], value: string) => list.find((item) => item.value === value)?.label ?? value;

export default function CallForProposalDetailPage() {
    const params = useParams<{ iri: string }>();
    const iri = React.useMemo(() => decodeURIComponent(params.iri), [params.iri]);
    const router = useRouter();

    const { data: call, error, isLoading, mutate } = useCallForProposal(iri);
    const { data: applicationData, mutate: mutateApplications } = useCallForProposalApplications(iri);
    const { org } = useUserOrg();
    const { roles } = useUserContext();

    const deleteApplication = useDeleteApplication(iri);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    const applications = applicationData ?? call?.applications ?? [];

    const organizationIri = org && (org as any).iri ? (org as any).iri : undefined;
    const isAdmin = roles?.includes("admin");
    const ownerIri = typeof call?.organization === "object" && call?.organization
        ? (call.organization as any).iri
        : undefined;
    const isOwner = ownerIri && organizationIri && ownerIri === organizationIri;

    const userApplication = applications.find((app) => {
        if (!organizationIri) return false;
        const principal = typeof app.principalApplicant === "string"
            ? app.principalApplicant
            : app.principalApplicant?.iri;
        return principal === organizationIri;
    });

    const allowAcceptanceFields = isOwner || isAdmin;
    const canCreateApplication = !isOwner && !isAdmin && !userApplication;

    const goToCreateApplication = React.useCallback(() => {
        router.push(`/console/applications/new?call=${encodeURIComponent(iri)}`);
    }, [iri, router]);

    const goToEditApplication = React.useCallback((app: ApplicationDTO) => {
        router.push(`/console/applications/${encodeURIComponent(app.iri)}`);
    }, [router]);

    const handleDeleteApplication = async (app: ApplicationDTO) => {
        try {
            await deleteApplication.trigger({ applicationIri: app.iri });
            await Promise.all([mutateApplications(), mutate()]);
            setSnackbar({ open: true, severity: "success", message: "Application deleted." });
        } catch (err) {
            setSnackbar({ open: true, severity: "error", message: err instanceof Error ? err.message : String(err) });
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
                Back
            </Button>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error || !call ? (
                <Alert severity="error">{error?.message ?? "Call for proposals not found."}</Alert>
            ) : (
                <Stack spacing={3}>
                    <Card>
                        <CardContent>
                            <Stack spacing={1}>
                                <Typography variant="h5" fontWeight={600}>
                                    {typeof call.forPartnershipOpportunity === "string"
                                        ? call.forPartnershipOpportunity
                                        : call.forPartnershipOpportunity?.name ?? call.iri}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Chip label={statusLabel(CALL_FOR_PROPOSAL_STATUSES, call.status)} color="primary" />
                                    <Chip label={`Start ${formatDate(call.startDate)}`} />
                                    <Chip label={`End ${formatDate(call.endDate)}`} />
                                </Stack>
                                {call.organization && (
                                    <Typography variant="body2" color="text.secondary">
                                        Owner organization: {(call.organization as any).name ?? (call.organization as any).iri}
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Applications ({applications.length})</Typography>
                        {canCreateApplication && (
                            <Button variant="contained" onClick={goToCreateApplication}>
                                Submit application
                            </Button>
                        )}
                    </Stack>

                    {applications.length === 0 ? (
                        <Alert severity="info">No applications submitted yet.</Alert>
                    ) : (
                        <Stack spacing={2}>
                            {applications.map((app) => {
                                const principal = typeof app.principalApplicant === "string" ? app.principalApplicant : app.principalApplicant?.name ?? app.principalApplicant?.iri;
                                return (
                                    <Card key={app.iri} variant="outlined">
                                        <CardContent>
                                            <Stack spacing={1}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Typography variant="subtitle1" fontWeight={600}>{app.proposal?.title ?? "Untitled proposal"}</Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        <Chip size="small" label={statusLabel(PROPOSAL_STATUSES, app.proposal?.proposalStatus ?? "draft")} />
                                                        <Chip size="small" label={statusLabel(APPLICATION_STATUSES, app.applicationStatus)} />
                                                        <Chip size="small" label={`Decision: ${statusLabel(ACCEPTANCE_STATUSES, app.acceptanceStatus)}`} />
                                                    </Stack>
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary">
                                                    Principal applicant: {principal ?? "Unknown"}
                                                </Typography>
                                                {app.proposal?.description && (
                                                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                        {app.proposal.description}
                                                    </Typography>
                                                )}
                                                <Stack direction="row" spacing={1}>
                                                    {(allowAcceptanceFields || userApplication?.iri === app.iri) && (
                                                        <Button size="small" startIcon={<EditIcon />} onClick={() => goToEditApplication(app)}>
                                                            Manage
                                                        </Button>
                                                    )}
                                                    {(allowAcceptanceFields || userApplication?.iri === app.iri) && (
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<DeleteIcon />}
                                                            onClick={() => handleDeleteApplication(app)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stack>
                    )}
                </Stack>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
