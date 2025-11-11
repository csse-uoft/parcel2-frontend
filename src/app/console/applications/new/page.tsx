"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { ApplicationForm } from "@/components/callForProposals/ApplicationForm";
import { useCallForProposal, useCreateApplication } from "@/lib/hooks/useCallForProposals";
import type { ApplicationInput } from "@/lib/callForProposals/types";
import { CALL_FOR_PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";

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

export default function NewApplicationPage() {
    const router = useRouter();
    const params = useSearchParams();
    const callIri = React.useMemo(() => params.get("call"), [params]);

    const { data: call, error, isLoading } = useCallForProposal(callIri);
    const createApplication = useCreateApplication(callIri);

    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" } | null>(null);

    const handleSubmit = React.useCallback(async (values: ApplicationInput) => {
        if (!callIri) return;
        try {
            const result = await createApplication.trigger(values);
            setSnackbar({ open: true, message: "Application submitted.", severity: "success" });
            if (result?.iri) {
                router.replace(`/console/applications/${encodeURIComponent(result.iri)}`);
            } else {
                router.replace(`/console/call-for-proposals/${encodeURIComponent(callIri)}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save application.";
            setSnackbar({ open: true, message, severity: "error" });
            throw err;
        }
    }, [callIri, createApplication, router]);

    const closeSnackbar = () => setSnackbar(null);

    const goBack = React.useCallback(() => {
        router.back();
    }, [router]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800, mx: "auto" }}>
            <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mb: 2 }}>
                Back
            </Button>

            {!callIri ? (
                <Alert severity="warning">
                    Select a call for proposals from an opportunity detail page to start an application.
                </Alert>
            ) : isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error.message}</Alert>
            ) : !call ? (
                <Alert severity="error">Call for proposals not found.</Alert>
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
                                <Typography variant="body2" color="text.secondary">
                                    Window: {formatShortDate(call.startDate)} – {formatShortDate(call.endDate)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Call status: {statusLabel(CALL_FOR_PROPOSAL_STATUSES, call.status)}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>

                    <ApplicationForm
                        onSubmit={handleSubmit}
                        isSubmitting={createApplication.isMutating}
                        error={createApplication.error?.message}
                        submitLabel="Submit application"
                        onCancel={goBack}
                    />
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
