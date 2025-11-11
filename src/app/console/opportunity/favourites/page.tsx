'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useOpportunityFavourites } from '@/contexts/OpportunityFavouritesContext';
import { useSnackbar } from 'notistack';
import { FetcherError } from '@/lib/errors';

function formatAddedAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export default function OpportunityFavouritesPage() {
    const { favourites, removeFavourite, isLoading, error } = useOpportunityFavourites();
    const { enqueueSnackbar } = useSnackbar();
    const [removing, setRemoving] = React.useState<string | null>(null);

    const hasFavourites = favourites.length > 0;
    const errorMessage = error instanceof Error ? error.message : error ? 'Failed to load favourites.' : null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Saved opportunities
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Quickly revisit the opportunities you've saved while browsing.
                    </Typography>
                </Box>
                <Button component={Link} href="/console/opportunity/search" variant="outlined">
                    Find more opportunities
                </Button>
            </Stack>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            {isLoading ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={28} />
                        <Typography variant="body2" color="text.secondary">
                            Loading your saved opportunities…
                        </Typography>
                    </Stack>
                </Paper>
            ) : !hasFavourites ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        You haven't saved any opportunities yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Browse the opportunities and choose "Save to favourites" on any listing to store it here.
                    </Typography>
                    <Button component={Link} href="/console/opportunity/search" variant="contained">
                        Browse opportunities
                    </Button>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {favourites.map(fav => (
                        <Paper
                            key={fav.iri}
                            variant="outlined"
                            sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                                        {fav.name ?? fav.iri}
                                    </Typography>
                                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                        {fav.organizationName && (
                                            <Chip size="small" label={fav.organizationName} />
                                        )}
                                        {fav.projectTypeName && (
                                            <Chip size="small" label={fav.projectTypeName} />
                                        )}
                                        {fav.stageName && (
                                            <Chip size="small" label={fav.stageName} />
                                        )}
                                        <Chip
                                            size="small"
                                            color="default"
                                            label={`Saved ${formatAddedAt(fav.addedAt)}`}
                                        />
                                    </Stack>
                                </Box>
                                <Stack direction="column" spacing={1} alignItems="flex-end">
                                    <IconButton
                                        onClick={async () => {
                                            setRemoving(fav.iri);
                                            try {
                                                await removeFavourite(fav.iri);
                                                enqueueSnackbar('Removed from favourites.', { variant: 'success' });
                                            } catch (err) {
                                                const message = err instanceof FetcherError
                                                    ? err.message
                                                    : (err as Error)?.message ?? 'Unable to remove favourite.';
                                                enqueueSnackbar(message, { variant: 'error' });
                                            } finally {
                                                setRemoving(null);
                                            }
                                        }}
                                        color="error"
                                        size="small"
                                        aria-label="Remove favourite"
                                        disabled={removing === fav.iri}
                                    >
                                        {removing === fav.iri ? <CircularProgress size={18} /> : <DeleteOutlineIcon />}
                                    </IconButton>
                                    <Button
                                        component={Link}
                                        href={`/console/opportunity/${encodeURIComponent(fav.iri)}`}
                                        variant="outlined"
                                        endIcon={<OpenInNewIcon />}
                                    >
                                        View details
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}