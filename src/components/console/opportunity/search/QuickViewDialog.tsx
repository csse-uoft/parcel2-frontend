'use client';

import * as React from 'react';
import useSWR from 'swr';
import {
    Box,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Stack,
    Typography,
    Button,
    useMediaQuery,
    Theme,
    Skeleton,
    Divider,
} from '@mui/material';
import Link from 'next/link';
import { OpportunityDetail } from './types';
import { absUrl } from './utils';
import { fetcher } from '@/lib/fetcher';
import { useCreateChat } from '@/lib/hooks/useChat';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { FetcherError } from '@/lib/errors';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useOpportunityFavourites } from '@/contexts/OpportunityFavouritesContext';

// Reuse the image viewer you already built earlier
import ImageViewer from '@/components/media/ImageViewer';

type Props = {
    id: string | null;
    open: boolean;
    onClose: () => void;
};

export default function QuickViewDialog({ id, open, onClose }: Props) {
    const fullScreen = useMediaQuery((t: Theme) => t.breakpoints.down('sm'));
    const { data, isLoading, error } = useSWR<OpportunityDetail>(
        open && id ? `/api/opportunities/${encodeURIComponent(id)}` : null,
        fetcher
    );
    const { trigger: createChat, isMutating: creatingChat } = useCreateChat();
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { isFavourite, toggleFavourite } = useOpportunityFavourites();

    const organizationIri = data?.organization?.iri ?? data?.organizationIri ?? null;
    const organizationName = data?.organization?.name ?? undefined;
    const opportunityIri = data?.iri ?? null;

    const projectTypeName = typeof data?.projectType === 'object' ? data?.projectType?.name ?? undefined : undefined;
    const stageName = typeof data?.projectStage === 'object' ? data?.projectStage?.name ?? undefined : undefined;

    const favouriteMeta = React.useMemo(
        () => (
            opportunityIri
                ? {
                    iri: opportunityIri,
                    name: data?.name ?? undefined,
                    organizationName,
                    projectTypeName,
                    stageName,
                }
                : null
        ),
        [data?.name, opportunityIri, organizationName, projectTypeName, stageName],
    );

    const isCurrentFavourite = React.useMemo(
        () => (opportunityIri ? isFavourite(opportunityIri) : false),
        [isFavourite, opportunityIri],
    );

    const [favouritePending, setFavouritePending] = React.useState(false);

    const handleToggleFavourite = React.useCallback(async () => {
        if (!opportunityIri || !favouriteMeta) return;
        const wasFavourite = isFavourite(opportunityIri);
        setFavouritePending(true);
        try {
            await toggleFavourite(favouriteMeta);
            enqueueSnackbar(wasFavourite ? 'Removed from favourites.' : 'Added to favourites.', {
                variant: 'success',
            });
        } catch (error) {
            const message = error instanceof FetcherError
                ? error.message
                : (error as Error)?.message ?? 'Unable to update favourites.';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setFavouritePending(false);
        }
    }, [enqueueSnackbar, favouriteMeta, isFavourite, opportunityIri, toggleFavourite]);

    const handleContactOrganization = React.useCallback(async () => {
        if (!opportunityIri || !organizationIri) {
            enqueueSnackbar('Organization information unavailable for this opportunity.', { variant: 'warning' });
            return;
        }

        try {
            const result = await createChat({ opportunityIri, organizationIri });
            const roomId = result?.room?.id;
            enqueueSnackbar('Conversation opened with the organization.', { variant: 'success' });
            onClose();
            if (roomId) {
                router.push(`/console/chat?room=${encodeURIComponent(roomId)}`);
            } else {
                router.push('/console/chat');
            }
        } catch (err) {
            const message = err instanceof FetcherError
                ? err.message
                : (err as Error)?.message ?? 'Unable to start chat.';
            enqueueSnackbar(message, { variant: 'error' });
        }
    }, [createChat, enqueueSnackbar, opportunityIri, organizationIri, router, onClose]);

    // Build a complete, de-duplicated image list: primary first, then the rest
    const allImages = React.useMemo(() => {
        const primary = data?.additionalInfo?.primaryImage ? [data.additionalInfo.primaryImage] : [];
        const others = data?.additionalInfo?.images ?? [];
        const dedup = Array.from(new Set([...primary, ...others].filter(Boolean)));
        return dedup.map(absUrl).filter(Boolean) as string[];
    }, [data]);

    // Lightbox state
    const [viewerOpen, setViewerOpen] = React.useState(false);
    const [viewerIndex, setViewerIndex] = React.useState(0);

    const openViewerAt = (idx: number) => {
        setViewerIndex(idx);
        setViewerOpen(true);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={fullScreen}>
            <DialogTitle>{isLoading ? 'Loading…' : data?.name ?? 'Details'}</DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Stack spacing={2}>
                        <Skeleton variant="rounded" height={220} />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" />
                        <Skeleton variant="text" />
                    </Stack>
                ) : error ? (
                    <Typography color="error">Failed to load details.</Typography>
                ) : data ? (
                    <Stack spacing={2}>
                        {/* Hero image (primary or first available) */}
                        {allImages[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={allImages[0]}
                                alt={data.name}
                                style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                                onClick={() => openViewerAt(0)}
                            />
                        )}

                        {data.description && (
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {data.description}
                            </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {typeof data.projectType === 'object' && data.projectType?.name && (
                                <Chip label={data.projectType.name} />
                            )}
                            {typeof data.projectStage === 'object' && data.projectStage?.name && (
                                <Chip label={data.projectStage.name} />
                            )}
                            {(data.partnershipRoles ?? []).map((r) =>
                                typeof r === 'string' ? <Chip key={r} label={r} /> : <Chip key={r.iri} label={r.name ?? r.iri} />
                            )}
                        </Stack>

                        <Grid container spacing={2}>
                            {data.primaryContact?.contactName && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2">Primary Contact</Typography>
                                    <Typography variant="body2" color="text.secondary">{data.primaryContact.contactName}</Typography>
                                </Grid>
                            )}
                            {data.additionalInfo?.dateModified && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2">Last Updated</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(data.additionalInfo.dateModified).toLocaleString()}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>

                        {/* Full gallery thumbnails (uniform height). Click to open ImageViewer. */}
                        {allImages.length > 0 && (
                            <Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Gallery
                                </Typography>

                                <Grid container spacing={1}>
                                    {allImages.map((src, idx) => (
                                        <Grid key={src} size={{ xs: 4, sm: 3, md: 2 }}>
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    height: 110, // uniform thumb height
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                    cursor: 'zoom-in',
                                                    bgcolor: 'action.hover',
                                                }}
                                                onClick={() => openViewerAt(idx)}
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={src}
                                                    alt={`image-${idx}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Stack>
                ) : null}
            </DialogContent>

            <DialogActions>
                {opportunityIri && (
                    <Button
                        variant={isCurrentFavourite ? 'contained' : 'outlined'}
                        color={isCurrentFavourite ? 'primary' : 'inherit'}
                        startIcon={isCurrentFavourite ? <BookmarkIcon /> : <BookmarkBorderOutlinedIcon />}
                        onClick={handleToggleFavourite}
                        disabled={favouritePending}
                    >
                        {isCurrentFavourite ? 'Favourited' : 'Save to favourites'}
                    </Button>
                )}
                {organizationIri && (
                    <Button
                        variant="contained"
                        startIcon={<ChatOutlinedIcon />}
                        onClick={handleContactOrganization}
                        disabled={creatingChat}
                    >
                        Message {organizationName ?? 'organization'}
                    </Button>
                )}
                {id && (
                    <Button
                        component={Link}
                        href={`/console/opportunity/${encodeURIComponent(id)}`} // ← updated route
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open full page
                    </Button>
                )}
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>

            {/* Image viewer (supports wheel-zoom and controls from your existing component) */}
            {allImages.length > 0 && (
                <ImageViewer
                    open={viewerOpen}
                    images={allImages}
                    startIndex={viewerIndex}
                    onClose={() => setViewerOpen(false)}
                />
            )}
        </Dialog>
    );
}
