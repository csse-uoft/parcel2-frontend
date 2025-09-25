"use client";

import * as React from "react";
import Link from "next/link";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
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
    Alert,
    Stack,
    Typography,
    TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE ?? "";

// Types adapted to OwlClass.toJSON() shape returned by your backend
interface OpportunityAdditionalInfoDTO {
    images?: string[];
    files?: string[];
    primaryImage?: string;
    isPosted?: boolean | string;
    isSearchable?: boolean | string;
    datePosted?: string;
    dateModified?: string;
}

interface OpportunityDTO {
    iri: string;
    name?: string;
    description?: string;
    additionalInfo?: OpportunityAdditionalInfoDTO;
    partners?: unknown[];
    projectType?: unknown;
    projectStage?: unknown;
    partnershipRoles?: unknown[];
    land?: unknown;
    lands?: unknown[];
}

export default function MyOpportunitiesPage() {
    const [items, setItems] = React.useState<OpportunityDTO[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const [page, setPage] = React.useState<number>(0); // zero-based for TablePagination
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(12);

    const [deleteTarget, setDeleteTarget] = React.useState<OpportunityDTO | null>(null);
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; severity: "success" | "error"; message: string }>(
        { open: false, severity: "success", message: "" }
    );

    const total = items.length;
    const pagedItems = React.useMemo(() => {
        const start = page * rowsPerPage;
        return items.slice(start, start + rowsPerPage);
    }, [items, page, rowsPerPage]);

    React.useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/opportunities/me`, {
            method: "GET",
            credentials: "include", // important for cookie-based session
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `Request failed with ${res.status}`);
                }
                return res.json();
            })
            .then((data: OpportunityDTO[]) => {
                if (!isMounted) return;
                setItems(Array.isArray(data) ? data : []);
                setErrorMessage("");
            })
            .catch((err: unknown) => {
                if (!isMounted) return;
                setErrorMessage(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, []);

    function handleChangePage(_evt: unknown, newPage: number) {
        setPage(newPage);
    }

    function handleChangeRowsPerPage(evt: React.ChangeEvent<HTMLInputElement>) {
        setRowsPerPage(parseInt(evt.target.value, 10));
        setPage(0);
    }

    function openDeleteDialog(op: OpportunityDTO) {
        setDeleteTarget(op);
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            const iri = deleteTarget.iri;
            const resp = await fetch(`${API_BASE_URL}/api/opportunities/${encodeURIComponent(iri)}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || `Delete failed with ${resp.status}`);
            }
            // Remove from local list
            setItems(prev => prev.filter(x => x.iri !== iri));
            setSnackbar({ open: true, severity: "success", message: "Opportunity deleted." });
        } catch (err) {
            setSnackbar({ open: true, severity: "error", message: err instanceof Error ? err.message : String(err) });
        } finally {
            setDeleteTarget(null);
        }
    }

    function getPrimaryImage(op: OpportunityDTO): string | undefined {
        const ai = op.additionalInfo ?? {};
        return ai.primaryImage || (ai.images && ai.images.length > 0 ? ai.images[0] : undefined);
    }

    function formatDate(s?: string) {
        if (!s) return "";
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return s;
        return d.toLocaleString();
    }

    function normalizeBool(v: unknown): boolean | undefined {
        if (typeof v === "boolean") return v;
        if (typeof v === "string") return v.toLowerCase() === "true";
        return undefined;
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h5" fontWeight={600}>My Opportunities</Typography>
                <Button
                    component={Link}
                    href="/console/opportunity/new"
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    Create Opportunity
                </Button>
            </Stack>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : errorMessage ? (
                <Alert severity="error">{errorMessage}</Alert>
            ) : items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" gutterBottom>No opportunities yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Click the button above to create your first opportunity.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {pagedItems.map((op) => {
                            const img = getPrimaryImage(op);
                            const ai = op.additionalInfo ?? {};
                            const isPosted = normalizeBool(ai.isPosted);
                            const isSearchable = normalizeBool(ai.isSearchable);

                            return (
                                <Grid key={op.iri} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3 }}>
                                        {img ? (
                                            <CardMedia
                                                component="img"
                                                image={process.env.NEXT_PUBLIC_API_BASE + img}
                                                alt={op.name || op.iri}
                                                sx={{ aspectRatio: "16 / 9", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <Box sx={{ aspectRatio: "16 / 9", bgcolor: "action.hover" }} />
                                        )}

                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                                                <Typography variant="subtitle1" fontWeight={600} noWrap title={op.name || op.iri} sx={{ flex: 1 }}>
                                                    {op.name || op.iri}
                                                </Typography>
                                                <Stack direction="row" spacing={1}>
                                                    {typeof isPosted !== "undefined" && (
                                                        <Chip size="small" label={isPosted ? "Posted" : "Draft"} color={isPosted ? "success" : "default"} />
                                                    )}
                                                    {typeof isSearchable !== "undefined" && (
                                                        <Chip size="small" label={isSearchable ? "Searchable" : "Hidden"} color={isSearchable ? "primary" : "default"} />
                                                    )}
                                                </Stack>
                                            </Stack>

                                            {ai.dateModified && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Updated: {formatDate(ai.dateModified)}
                                                </Typography>
                                            )}
                                            {ai.datePosted && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Posted: {formatDate(ai.datePosted)}
                                                </Typography>
                                            )}

                                            {op.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                                                    {op.description}
                                                </Typography>
                                            )}
                                        </CardContent>

                                        <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between" }}>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    component={Link}
                                                    href={`/console/opportunity/${encodeURIComponent(op.iri)}`}
                                                    size="small"
                                                    variant="outlined"
                                                    endIcon={<OpenInNewIcon />}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    component={Link}
                                                    href={`/console/opportunity/${encodeURIComponent(op.iri)}/edit`}
                                                    size="small"
                                                    variant="contained"
                                                    startIcon={<EditIcon />}
                                                >
                                                    Edit
                                                </Button>
                                            </Stack>
                                            <IconButton aria-label="delete" color="error" onClick={() => openDeleteDialog(op)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[8, 12, 24, 48]}
                        />
                    </Box>
                </>
            )}

            {/* Delete dialog */}
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Delete opportunity?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This action cannot be undone. The opportunity and its nested resources will be removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
