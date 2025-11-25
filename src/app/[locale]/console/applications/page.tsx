"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LaunchIcon from "@mui/icons-material/Launch";

import { useMyApplications } from "@/lib/hooks/useCallForProposals";
import { APPLICATION_STATUSES, ACCEPTANCE_STATUSES, PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";

function formatShortDate(value?: string | Date) {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
}

function statusLabel(options: { value: string; label: string }[], value?: string) {
    if (!value) return "";
    return options.find((item) => item.value === value)?.label ?? value;
}

function opportunityLabel(input: any) {
    if (!input) return "Unknown opportunity";
    if (typeof input === "string") return input;
    return input.name ?? input.iri ?? "Unknown opportunity";
}

export default function MyApplicationsPage() {
    const router = useRouter();
    const { data, error, isLoading } = useMyApplications();

    const applications = React.useMemo(() => Array.isArray(data) ? data : [], [data]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={600}>My Applications</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review and manage your submissions across all calls for proposals.
                    </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<LaunchIcon />}
                        onClick={() => router.push("/console/opportunity/search")}
                    >
                        Find Opportunities
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push("/console/applications/new")}
                    >
                        Start Application
                    </Button>
                </Stack>
            </Stack>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error.message}</Alert>
            ) : applications.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" gutterBottom>No applications yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Start from an opportunity&apos;s call for proposals to submit your first application.
                    </Typography>
                    <Button variant="contained" startIcon={<LaunchIcon />} onClick={() => router.push("/console/opportunity/search")}>
                        Browse Opportunities
                    </Button>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {applications.map((item) => {
                        const app = item.application;
                        const call = item.callForProposal;
                        const proposalStatus = statusLabel(PROPOSAL_STATUSES, app.proposal?.proposalStatus ?? "draft");
                        const applicationStatus = statusLabel(APPLICATION_STATUSES, app.applicationStatus);
                        const acceptanceStatus = statusLabel(ACCEPTANCE_STATUSES, app.acceptanceStatus);
                        return (
                            <Grid key={app.iri} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{ height: "100%", borderRadius: 3, display: "flex", flexDirection: "column" }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack spacing={1.5}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {opportunityLabel(call.forPartnershipOpportunity)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Window: {formatShortDate(call.startDate)} – {formatShortDate(call.endDate)}
                                            </Typography>
                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                <Chip size="small" label={`Proposal: ${proposalStatus}`} />
                                                <Chip size="small" label={`Application: ${applicationStatus}`} />
                                                <Chip size="small" label={`Decision: ${acceptanceStatus}`} />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                                                {app.proposal?.description?.slice(0, 180) ?? "No proposal summary provided."}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
                                        <Button size="small" variant="text" onClick={() => router.push(`/console/call-for-proposals/${encodeURIComponent(call.iri)}`)} endIcon={<LaunchIcon fontSize="small" />}>
                                            View Call
                                        </Button>
                                        <Button size="small" variant="contained" onClick={() => router.push(`/console/applications/${encodeURIComponent(app.iri)}`)}>
                                            Manage
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
}
