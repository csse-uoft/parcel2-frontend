"use client";

import * as React from "react";
import Link from "next/link";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Snackbar,
    Stack,
    TablePagination,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";

import { useCallForProposals, useDeleteCallForProposal, useCreateCallForProposal, useUpdateCallForProposal } from "@/lib/hooks/useCallForProposals";
import { useMyOpportunities } from "@/lib/hooks/useOpportunities";
import type { CallForProposalDTO, CallForProposalInput } from "@/lib/callForProposals/types";
import { CallForProposalFormDialog } from "@/components/callForProposals/CallForProposalFormDialog";
import { CALL_FOR_PROPOSAL_STATUSES } from "@/lib/callForProposals/constants";

const statusChipColor = (status: string) => {
    switch (status) {
        case "draft":
            return "default" as const;
        case "published":
            return "primary" as const;
        case "closed":
            return "warning" as const;
        default:
            return "default" as const;
    }
};

const formatDate = (value?: string | Date) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
};

function opportunityLabel(opportunity: CallForProposalDTO["forPartnershipOpportunity"]) {
    if (!opportunity) return "Unknown";
    if (typeof opportunity === "string") return opportunity;
    return opportunity.name ?? opportunity.iri;
}

export default function CallForProposalsPage() {
    const { data, error, isLoading, mutate } = useCallForProposals();
    const { data: opportunities } = useMyOpportunities();
    const createMutation = useCreateCallForProposal();
    const [editing, setEditing] = React.useState<CallForProposalDTO | null>(null);
    const updateMutation = useUpdateCallForProposal(editing?.iri ?? null);
    const deleteMutation = useDeleteCallForProposal();

    const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<CallForProposalDTO | null>(null);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(12);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

    const list = React.useMemo(() => Array.isArray(data) ? data : [], [data]);
    const total = list.length;
    const pagedItems = React.useMemo(() => {
        const start = page * rowsPerPage;
        return list.slice(start, start + rowsPerPage);
    }, [list, page, rowsPerPage]);

    const opportunityOptions = React.useMemo(() => {
        return (opportunities ?? []).map((op) => ({
            value: op.iri,
            label: op.name ?? op.iri,
        }));
    }, [opportunities]);

    const handleCreate = async (values: CallForProposalInput) => {
        try {
            await createMutation.trigger(values);
            await mutate();
            setSnackbar({ open: true, severity: "success", message: "Call for proposals created." });
            setCreateDialogOpen(false);
        } catch (err) {
            setSnackbar({ open: true, severity: "error", message: err instanceof Error ? err.message : String(err) });
            throw err;
        }
    };

    const handleUpdate = async (values: CallForProposalInput) => {
        if (!editing) return;
        try {
            await updateMutation.trigger(values);
            await mutate();
            setSnackbar({ open: true, severity: "success", message: "Call for proposals updated." });
            setEditing(null);
        } catch (err) {
            setSnackbar({ open: true, severity: "error", message: err instanceof Error ? err.message : String(err) });
            throw err;
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.trigger({ iri: deleteTarget.iri });
            await mutate();
            setSnackbar({ open: true, severity: "success", message: "Call for proposals deleted." });
        } catch (err) {
            setSnackbar({ open: true, severity: "error", message: err instanceof Error ? err.message : String(err) });
        } finally {
            setDeleteTarget(null);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={600}>Call for Proposals</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    disabled={!opportunityOptions.length}
                >
                    New Call
                </Button>
            </Stack>

            {!opportunityOptions.length && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    You need at least one opportunity before you can create a call.
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error.message}</Alert>
            ) : list.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" gutterBottom>No calls yet</Typography>
                    <Typography variant="body2" color="text.secondary">Create your first call for proposals to collect applications.</Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {pagedItems.map((call) => (
                            <Grid key={call.iri} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="subtitle1" fontWeight={600} noWrap title={call.iri}>
                                                    {opportunityLabel(call.forPartnershipOpportunity)}
                                                </Typography>
                                                <Chip size="small" label={CALL_FOR_PROPOSAL_STATUSES.find((item) => item.value === call.status)?.label ?? call.status} color={statusChipColor(call.status)} />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                Start: {formatDate(call.startDate)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                End: {formatDate(call.endDate)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Applications: {call.applications?.length ?? 0}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                component={Link}
                                                href={`/console/call-for-proposals/${encodeURIComponent(call.iri)}`}
                                                size="small"
                                                variant="outlined"
                                                endIcon={<OpenInNewIcon />}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<EditIcon />}
                                                onClick={() => setEditing(call)}
                                            >
                                                Edit
                                            </Button>
                                        </Stack>
                                        <IconButton color="error" onClick={() => setDeleteTarget(call)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={(_evt, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={[8, 12, 24, 48]}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                        />
                    </Box>
                </>
            )}

            <CallForProposalFormDialog
                open={createDialogOpen}
                title="Create call for proposals"
                opportunityOptions={opportunityOptions}
                onSubmit={handleCreate}
                onClose={() => setCreateDialogOpen(false)}
                isSubmitting={createMutation.isMutating}
                error={createMutation.error?.message}
            />

            <CallForProposalFormDialog
                open={Boolean(editing)}
                title="Edit call for proposals"
                opportunityOptions={opportunityOptions}
                initialValue={editing ? {
                    forPartnershipOpportunity: typeof editing.forPartnershipOpportunity === "string" ? editing.forPartnershipOpportunity : editing.forPartnershipOpportunity.iri,
                    startDate: editing.startDate as any,
                    endDate: editing.endDate as any,
                    status: editing.status,
                } : undefined}
                onSubmit={handleUpdate}
                onClose={() => setEditing(null)}
                isSubmitting={updateMutation.isMutating}
                error={updateMutation.error?.message}
            />

            <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete call for proposals?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action cannot be undone. All nested applications will be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
