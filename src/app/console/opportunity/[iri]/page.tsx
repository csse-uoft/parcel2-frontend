'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    ImageList,
    ImageListItem,
    Link as MuiLink,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import LaunchIcon from '@mui/icons-material/Launch';
import BusinessIcon from '@mui/icons-material/Business';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonIcon from '@mui/icons-material/Person';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import BookmarkIcon from '@mui/icons-material/Bookmark';

import { useOpportunity, OpportunityDTO } from '@/lib/hooks/useOpportunity';
import { useOpportunityCallForProposals } from '@/lib/hooks/useCallForProposals';
import type { CallForProposalDTO } from '@/lib/callForProposals/types';
import { CALL_FOR_PROPOSAL_STATUSES, APPLICATION_STATUSES, ACCEPTANCE_STATUSES, PROPOSAL_STATUSES } from '@/lib/callForProposals/constants';
import ImageViewer from "@/components/media/ImageViewer";
import EmbeddedMap from '@/components/maps/EmbeddedMap';
import { useCreateChat } from '@/lib/hooks/useChat';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { FetcherError } from '@/lib/errors';
import { useOpportunityFavourites } from '@/contexts/OpportunityFavouritesContext';

/* ---------------- helpers ---------------- */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

function absUrl(u?: string) {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u)) return u;
    return `${API_BASE}${u}`;
}

function toBool(v: unknown): boolean | undefined {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'string') return v.toLowerCase() === 'true';
    return undefined;
}

function fmtDate(v?: string | Date) {
    if (!v) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    const t = d?.getTime?.();
    if (!t || Number.isNaN(t)) return String(v);
    return d.toLocaleString();
}

function formatShortDate(v?: string | Date) {
    if (!v) return '';
    const d = typeof v === 'string' ? new Date(v) : v;
    const t = d?.getTime?.();
    if (!t || Number.isNaN(t)) return String(v);
    return d.toLocaleDateString();
}

function statusLabel(options: { value: string; label: string }[], value?: string) {
    if (!value) return '';
    const match = options.find((item) => item.value === value);
    return match?.label ?? value;
}

/** Try to get a single lat/lng from land(s).address[] */
function extractLatLng(op: OpportunityDTO): { lat?: number; lng?: number } {
    const lands: any[] = Array.isArray(op.land) ? op.land : (op.lands ?? (op.land ? [op.land] : []));
    for (const land of lands) {
        const addressList: any[] = Array.isArray(land?.addresses)
            ? land.addresses
            : Array.isArray(land?.address)
                ? land.address
                : [];
        for (const addr of addressList) {
            const { lat, lng } = extractLatLngFromAddress(addr);
            if (lat != null && lng != null) {
                return { lat, lng };
            }
        }
    }
    return {};
}

/* ---------------- page ---------------- */

export default function OpportunityDetailsPage() {
    const params = useParams<{ iri: string }>();
    const iri = React.useMemo(() => {
        try { return decodeURIComponent(params.iri); } catch { return params.iri; }
    }, [params.iri]);

    const { opportunity: op, error, isLoading } = useOpportunity(iri);
    const { data: callForProposalsData, isLoading: isLoadingCallForProposals } = useOpportunityCallForProposals(iri);
    const { trigger: createChat, isMutating: creatingChat } = useCreateChat();
    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { isFavourite, toggleFavourite } = useOpportunityFavourites();

    const organization = op?.organization ?? null;
    const organizationIri = organization?.iri ?? op?.organizationIri ?? null;
    const organizationName = organization?.name ?? undefined;
    const opportunityIri = op?.iri ?? null;
    const favouriteMeta = React.useMemo(
        () => (
            opportunityIri
                ? {
                    iri: opportunityIri,
                    name: op?.name ?? undefined,
                    organizationName,
                    projectTypeName: op?.projectType?.name ?? undefined,
                    stageName: op?.projectStage?.name ?? undefined,
                }
                : null
        ),
        [op?.name, op?.projectStage?.name, op?.projectType?.name, opportunityIri, organizationName],
    );

    const isCurrentFavourite = React.useMemo(
        () => (opportunityIri ? isFavourite(opportunityIri) : false),
        [isFavourite, opportunityIri],
    );

    const [favouritePending, setFavouritePending] = React.useState(false);

    const callForProposals = React.useMemo<CallForProposalDTO[]>(
        () => Array.isArray(callForProposalsData) ? callForProposalsData : [],
        [callForProposalsData],
    );
    const showManageCallsLink = React.useMemo(
        () => callForProposals.some((item) => item?.isOwner),
        [callForProposals],
    );
    const goToManageCalls = React.useCallback(() => {
        router.push('/console/call-for-proposals');
    }, [router]);

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
    }, [createChat, enqueueSnackbar, opportunityIri, organizationIri, router]);

    const ai = (op || {}).additionalInfo ?? {};
    const isPosted = toBool(ai.isPosted);
    const isSearchable = toBool(ai.isSearchable);
    const primaryImg = absUrl(ai.primaryImage || (ai.images?.[0] ?? ''));
    const gallery = (ai.images ?? []);

    const allImages = React.useMemo(() => {
        const arr = [ai.primaryImage, ...(ai.images ?? [])].filter(Boolean) as string[];
        // simple de-dup preserving order
        return Array.from(new Set(arr));
    }, [ai.primaryImage, ai.images])

    const [viewerOpen, setViewerOpen] = React.useState(false);
    const [viewerIndex, setViewerIndex] = React.useState(0);
    const openAt = (idx: number) => { setViewerIndex(idx); setViewerOpen(true); };

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h5">Loading…</Typography>
            </Container>
        );
    }

    if (error) {
        if (error.status === 404) {
            return (
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Alert severity="warning">Opportunity not found.</Alert>
                </Container>
            );
        }
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error.message}</Alert>
            </Container>
        );
    }

    if (!op) return null;

    const coords = extractLatLng(op);
    const rawLat = typeof coords.lat === 'number' ? coords.lat : null;
    const rawLng = typeof coords.lng === 'number' ? coords.lng : null;
    const latLng = rawLat !== null && rawLng !== null ? { lat: rawLat, lng: rawLng } : null;
    const coordinatesText = latLng
        ? `Coordinates: ${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`
        : 'No coordinates available';
    const mapsSearchUrl = latLng ? `https://www.google.com/maps/search/?api=1&query=${latLng.lat},${latLng.lng}` : null;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Title + actions */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1, mb: 1 }}>
                        {op.name || op.iri}
                    </Typography>

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {op.projectType?.name && (
                            <Chip icon={<LabelIconSmall />} label={op.projectType.name} size="small" />
                        )}
                        {op.projectStage?.name && (
                            <Chip icon={<PublicIcon fontSize="small" />} label={op.projectStage.name} size="small" />
                        )}

                        {(op.partnershipRoles ?? []).map((r) => (
                            <Chip key={r.iri} label={r.name ?? r.iri} size="small" />
                        ))}

                        {typeof isPosted !== 'undefined' && (
                            <Chip
                                icon={<VisibilityIcon fontSize="small" />}
                                label={isPosted ? 'Posted' : 'Draft'}
                                color={isPosted ? 'success' : 'default'}
                                size="small"
                            />
                        )}
                        {typeof isSearchable !== 'undefined' && (
                            <Chip
                                icon={<PublicIcon fontSize="small" />}
                                label={isSearchable ? 'Searchable' : 'Hidden'}
                                color={isSearchable ? 'primary' : 'default'}
                                size="small"
                            />
                        )}
                    </Stack>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title={isCurrentFavourite ? 'Remove from favourites' : 'Save to favourites'}>
                        <span>
                            <IconButton
                                onClick={handleToggleFavourite}
                                color={isCurrentFavourite ? 'primary' : 'default'}
                                disabled={!opportunityIri || favouritePending}
                            >
                                {isCurrentFavourite ? <BookmarkIcon /> : <BookmarkBorderOutlinedIcon />}
                            </IconButton>
                        </span>
                    </Tooltip>
                    {op.isOwner && (
                        <Tooltip title="Edit opportunity">
                            <span>
                                <IconButton
                                    component={Link}
                                    href={`/console/opportunity/${encodeURIComponent(op.iri)}/edit`}
                                    color="primary"
                                >
                                    <EditIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {/* Left column */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Hero */}
                    <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                        {primaryImg ? (
                            <CardMedia
                                component="img"
                                image={primaryImg}
                                alt={op.name || op.iri}
                                sx={{ aspectRatio: '16 / 9', cursor: 'zoom-in' }}
                                onClick={() => openAt(0)} // primary is first in allImages
                            />
                        ) : (
                            <Box sx={{ height: 320, bgcolor: 'action.hover' }} />
                        )}
                    </Card>

                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">Call for Proposals</Typography>
                                    {showManageCallsLink && (
                                        <Button variant="outlined" size="small" onClick={goToManageCalls}>
                                            Manage Calls
                                        </Button>
                                    )}
                                </Stack>
                                {isLoadingCallForProposals ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : callForProposals.length === 0 ? (
                                    <Alert severity="info">No calls for proposals are linked to this opportunity yet.</Alert>
                                ) : (
                                    <Stack spacing={2}>
                                        {callForProposals.map((call) => {
                                            const yourApplication = call.yourApplication;
                                            const handleViewCall = () => router.push(`/console/call-for-proposals/${encodeURIComponent(call.iri)}`);
                                            const handleApplicationClick = () => {
                                                if (yourApplication) {
                                                    router.push(`/console/applications/${encodeURIComponent(yourApplication.iri)}`);
                                                } else {
                                                    router.push(`/console/applications/new?call=${encodeURIComponent(call.iri)}`);
                                                }
                                            };
                                            return (
                                                <Paper key={call.iri} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Typography variant="subtitle1" fontWeight={600}>
                                                                Call window
                                                            </Typography>
                                                            <Chip size="small" color="primary" label={statusLabel(CALL_FOR_PROPOSAL_STATUSES, call.status)} />
                                                        </Stack>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {formatShortDate(call.startDate)} – {formatShortDate(call.endDate)}
                                                        </Typography>
                                                        {call.organization && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Managed by {(call.organization as any).name ?? (call.organization as any).iri}
                                                            </Typography>
                                                        )}
                                                        {yourApplication && (
                                                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                                                <Chip size="small" label={`Proposal ${statusLabel(PROPOSAL_STATUSES, yourApplication.proposal?.proposalStatus ?? 'draft')}`} />
                                                                <Chip size="small" label={`Application ${statusLabel(APPLICATION_STATUSES, yourApplication.applicationStatus)}`} />
                                                                <Chip size="small" label={`Decision ${statusLabel(ACCEPTANCE_STATUSES, yourApplication.acceptanceStatus)}`} />
                                                            </Stack>
                                                        )}
                                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                                                            <Button variant="text" onClick={handleViewCall} endIcon={<LaunchIcon fontSize="small" />} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
                                                                View details
                                                            </Button>
                                                            {!call.isOwner && (
                                                                <Button variant="contained" onClick={handleApplicationClick} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
                                                                    {yourApplication ? 'Manage application' : 'Submit application'}
                                                                </Button>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Paper>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    {op.description && (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Description</Typography>
                            <Typography variant="body1" color="text.secondary" whiteSpace="pre-line">
                                {op.description}
                            </Typography>
                        </Paper>
                    )}

                    {/* Gallery */}
                    {gallery.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Gallery</Typography>
                            <ImageList variant="masonry" cols={3} gap={8} sx={{
                                '& .MuiImageListItem-root img': {
                                    display: 'block',
                                    width: '100%',
                                    // make all images 4:3 aspect ratio, cropped
                                    aspectRatio: '4 / 3',   // or '16 / 9', '1 / 1'
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                },
                            }}>
                                {gallery.map((src, idx) => {
                                    const u = absUrl(src);
                                    // find its position in allImages
                                    const allIndex = allImages.findIndex(x => x === src || absUrl(x) === u);
                                    return (
                                        <ImageListItem key={`${u}-${idx}`} onClick={() => openAt(Math.max(allIndex, 0))} style={{ cursor: 'zoom-in' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={u} alt={`image-${idx}`} loading="lazy" style={{ borderRadius: 8, width: '100%' }} />
                                        </ImageListItem>
                                    );
                                })}
                            </ImageList>
                        </Paper>
                    )}

                    {/* Land / Location */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Land & Location</Typography>

                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <MapIcon fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                {coordinatesText}
                            </Typography>

                            {mapsSearchUrl && (
                                <MuiLink
                                    href={mapsSearchUrl}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                                >
                                    Open in Maps <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </MuiLink>
                            )}
                        </Stack>

                        {latLng && (
                            <EmbeddedMap
                                lat={latLng.lat}
                                lng={latLng.lng}
                                iframeTitle={`Location map for ${op.name ?? op.iri}`}
                                sx={{ mb: 2, height: 280, borderRadius: 2 }}
                            />
                        )}

                        {renderLand(op)}
                    </Paper>

                    {/* Attachments */}
                    {ai.files && ai.files.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>Attachments</Typography>
                            <List dense>
                                {ai.files.map((f, i) => {
                                    const href = absUrl(f);
                                    const name = decodeURIComponent(href ?? '').split('/').pop();
                                    return (
                                        <ListItem
                                            key={`${f}-${i}`}
                                            secondaryAction={
                                                <MuiLink href={href} target="_blank" rel="noopener" download>
                                                    Download
                                                </MuiLink>
                                            }
                                        >
                                            <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                                            <ListItemText primary={name} secondary={href} />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    )}
                </Grid>

                {/* Right column */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Meta */}
                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Details</Typography>
                            <Stack spacing={1.25}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        Posted: {fmtDate(ai.datePosted)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        Updated: {fmtDate(ai.dateModified)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <VisibilityIcon fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        Status: {isPosted ? 'Posted' : 'Draft'} • {isSearchable ? 'Searchable' : 'Hidden'}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 3, mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Contact Organization</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Start a chat with the organization.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<ChatOutlinedIcon />}
                                onClick={handleContactOrganization}
                                disabled={creatingChat || !organizationIri}
                                fullWidth
                            >
                                Message {organizationName ?? 'organization'}
                            </Button>
                            {!organizationIri && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Organization details are unavailable for this opportunity.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    {(op.primaryContact?.contactName || op.primaryContact?.email || op.primaryContact?.phone) && (
                        <Card sx={{ borderRadius: 3, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Primary Contact</Typography>
                                <List dense>
                                    {op.primaryContact?.contactName && (
                                        <ListItem>
                                            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                                            <ListItemText primary={op.primaryContact.contactName} />
                                        </ListItem>
                                    )}
                                    {op.primaryContact?.email && (
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <MuiLink href={`mailto:${op.primaryContact.email}`}>
                                                        {op.primaryContact.email}
                                                    </MuiLink>
                                                }
                                            />
                                        </ListItem>
                                    )}
                                    {op.primaryContact?.phone && (
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <MuiLink href={`tel:${op.primaryContact.phone}`}>
                                                        {op.primaryContact.phone}
                                                    </MuiLink>
                                                }
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    )}

                    {/* Partners (if provided) */}
                    {Array.isArray((op as any).partners) && (op as any).partners.length > 0 && (
                        <Card sx={{ borderRadius: 3, mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Partners</Typography>
                                <List dense>
                                    {(op as any).partners.map((p: any, idx: number) => (
                                        <React.Fragment key={idx}>
                                            <ListItem alignItems="flex-start">
                                                <BusinessIcon fontSize="small" sx={{ mr: 1 }} />
                                                <ListItemText
                                                    primary={resolvePartnerName(p)}
                                                    secondary={(() => {
                                                        if (!Array.isArray(p.roles) || p.roles.length === 0) return undefined;
                                                        const summaries = summarizePartnerRoles(p.roles);
                                                        if (summaries.length === 0) return undefined;
                                                        if (summaries.length === 1) return summaries[0];
                                                        return summaries.join('\n');
                                                    })()}
                                                    secondaryTypographyProps={{ component: 'span', sx: { whiteSpace: 'pre-line' } }}
                                                />
                                            </ListItem>
                                            {p.notes && (
                                                <Box sx={{ pl: 5, pr: 2, pb: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">{p.notes}</Typography>
                                                </Box>
                                            )}
                                            {idx < (op as any).partners.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
            <ImageViewer
                images={allImages}
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                startIndex={viewerIndex}
                title={op.name || op.iri}
            />
        </Container>
    );
}

/* Small icon to avoid importing @mui/icons-material/Label (keeps bundle tiny) */
function LabelIconSmall() {
    return <span style={{ display: 'inline-block', width: 0, height: 0 }} />;
}

function normalizeNumeric(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
}

function fmtDateOnly(value?: string | Date): string | null {
    if (!value) return null;
    const date = typeof value === 'string' ? new Date(value) : value;
    const timestamp = date?.getTime?.();
    if (!timestamp || Number.isNaN(timestamp)) return String(value);
    return date.toLocaleDateString();
}

function formatDateRange(start?: string | Date, end?: string | Date): string | null {
    const startLabel = fmtDateOnly(start);
    const endLabel = fmtDateOnly(end);
    if (startLabel && endLabel) return `${startLabel} – ${endLabel}`;
    return startLabel ?? endLabel ?? null;
}

function formatTaxonomyLabel(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return value.name ?? value.label ?? value.title ?? value.iri ?? null;
}

function formatTaxonomyList(value: any): string | null {
    if (!value) return null;
    if (Array.isArray(value)) {
        const labels = value
            .map(item => formatTaxonomyLabel(item))
            .filter((item): item is string => Boolean(item));
        if (labels.length === 0) return null;
        return Array.from(new Set(labels)).join(', ');
    }
    return formatTaxonomyLabel(value);
}

function resolvePartnerName(partner: any): string {
    const organization = partner?.organization ?? null;
    if (typeof organization === 'string') return organization;
    const organizationLabel = organization?.name ?? organization?.label ?? organization?.legalName ?? organization?.title;
    if (organizationLabel) return organizationLabel;
    const fallback = partner?.organizationName ?? partner?.organizationLabel ?? partner?.organizationTitle;
    if (typeof fallback === 'string' && fallback.trim().length > 0) return fallback.trim();
    const organizationIri = organization?.iri ?? partner?.organizationIri ?? partner?.organization ?? partner?.organizationId;
    if (typeof organizationIri === 'string' && organizationIri.trim().length > 0) return organizationIri.trim();
    return 'Organization';
}

function summarizePartnerRoles(roles: any[]): string[] {
    return roles
        .map((role) => {
            const roleTypeLabel = formatTaxonomyList(role?.roleTypes ?? role?.roleType);
            const namedRole = formatTaxonomyLabel(role);
            const baseLabel = roleTypeLabel ?? namedRole ?? (typeof role?.iri === 'string' ? role.iri : null);
            const dateRange = formatDateRange(role?.startDate, role?.endDate);
            if (baseLabel && dateRange) return `${baseLabel} • ${dateRange}`;
            if (baseLabel) return baseLabel;
            return dateRange ?? null;
        })
        .filter((item): item is string => Boolean(item));
}

function formatOpportunityAddressDisplay(address: any): string {
    if (!address) return '';
    if (typeof address === 'string') return address;

    const stringRepresentation = typeof address.stringRepresentation === 'string'
        ? address.stringRepresentation.trim()
        : '';
    if (stringRepresentation) return stringRepresentation;

    const parts: string[] = [];

    const unitDesignator = address.unitDesignator ?? address.unit ?? address.unitType;
    const unitIdentifier = address.unitIdentifier ?? address.unitNumber ?? address.unitId;
    const unitSegment = [unitDesignator, unitIdentifier]
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
    if (unitSegment) parts.push(unitSegment);

    const streetPieces: string[] = [];
    const streetNumber = address.streetNumber ?? address.houseNumber ?? address.number;
    if (streetNumber) streetPieces.push(String(streetNumber).trim());
    const streetDirection = address.streetDirection;
    if (streetDirection) streetPieces.push(String(streetDirection).trim());
    const streetName = address.streetName ?? address.street ?? address.road;
    if (streetName) streetPieces.push(String(streetName).trim());
    const streetType = address.streetType;
    if (streetType) streetPieces.push(String(streetType).trim());

    const streetLine = streetPieces.filter(Boolean).join(' ').trim();
    if (streetLine) {
        parts.push(streetLine);
    } else {
        const line1 = address.line1 ?? address.addressLine1 ?? null;
        if (line1) {
            parts.push(String(line1).trim());
        }
    }

    const line2 = address.line2 ?? address.addressLine2 ?? null;
    if (line2) parts.push(String(line2).trim());

    const locality = address.localityName ?? address.city ?? address.town ?? address.municipality;
    if (locality) parts.push(String(locality).trim());

    const region = address.provinceName ?? address.state ?? address.region ?? address.county;
    const postal = address.postalCode ?? address.zip ?? address.postcode;
    const regionPostal = [region, postal]
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();
    if (regionPostal) parts.push(regionPostal);

    const country = address.countryName ?? address.country;
    if (country) parts.push(String(country).trim());

    const cleaned = parts
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean);

    if (cleaned.length > 0) return cleaned.join(', ');

    if (typeof address.label === 'string') return address.label;

    return '';
}

function extractLatLngFromAddress(address: any): { lat: number | null; lng: number | null } {
    if (!address) return { lat: null, lng: null };
    let lat = normalizeNumeric(
        address.latitude ??
        address.lat ??
        address.latitudeDegrees ??
        address.geo?.latitude ??
        address.position?.lat
    );
    let lng = normalizeNumeric(
        address.longitude ??
        address.lng ??
        address.longitudeDegrees ??
        address.geo?.longitude ??
        address.position?.lng
    );

    if ((lat === null || lng === null) && Array.isArray(address.geometry?.coordinates)) {
        const [maybeLng, maybeLat] = address.geometry.coordinates;
        lat = lat ?? normalizeNumeric(maybeLat);
        lng = lng ?? normalizeNumeric(maybeLng);
    }

    return { lat, lng };
}

/* Render land details defensively (notes, addresses, area, etc. if present) */
function renderLand(op: OpportunityDTO) {
    const lands: any[] = Array.isArray(op.land) ? op.land : (op.lands ?? (op.land ? [op.land] : []));
    if (!lands.length) {
        return <Typography variant="body2" color="text.secondary">No land details.</Typography>;
    }

    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            {lands.map((land, i) => {
                const landKey = typeof land?.iri === 'string' ? land.iri : `land-${i}`;
                const addresses: any[] = Array.isArray(land?.addresses)
                    ? land.addresses
                    : Array.isArray(land?.address)
                        ? land.address
                        : [];
                const rawArea = land?.area?.value ?? land?.area ?? null;
                const areaValue = typeof rawArea === 'number'
                    ? Number.isFinite(rawArea)
                        ? rawArea.toLocaleString()
                        : String(rawArea)
                    : typeof rawArea === 'string'
                        ? rawArea.trim()
                        : null;
                const areaUnit = formatTaxonomyLabel(land?.area?.unit ?? land?.areaUnit ?? land?.unit);
                const legacyUses = formatTaxonomyList(land?.uses ?? land?.landUse);
                const landUseDetails = [
                    { label: 'Current land use', value: formatTaxonomyList(land?.currentLandUse) },
                    { label: 'Designated land use', value: formatTaxonomyList(land?.designatedLandUse) },
                    { label: 'Proposed land use', value: formatTaxonomyList(land?.proposedLandUse) },
                ];
                return (
                    <React.Fragment key={landKey}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Stack spacing={0.75}>
                                {addresses.length > 0 && (
                                    <Stack spacing={0.75}>
                                        {addresses.map((a, idx) => {
                                            const summary = formatOpportunityAddressDisplay(a);
                                            const { lat, lng } = extractLatLngFromAddress(a);
                                            return (
                                                <Stack key={idx} spacing={0.25}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {summary || 'Address on file'}
                                                    </Typography>
                                                    {lat != null && lng != null && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Stack>

                        </Paper>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                            <Stack spacing={0.75}>
                                {land?.notes && (
                                    <Typography variant="body2" color="text.secondary">Notes: {land.notes}</Typography>
                                )}
                                {land?.parcelId && (
                                    <Typography variant="body2" color="text.secondary">Parcel ID: {land.parcelId}</Typography>
                                )}
                                {(areaValue || areaUnit) && (
                                    <Typography variant="body2" color="text.secondary">
                                        Area: <b>{areaValue ?? '-'}</b>{areaUnit ? ` ${areaUnit}` : ''}
                                    </Typography>
                                )}
                                {legacyUses && (
                                    <Typography variant="body2" color="text.secondary">Land use: {legacyUses}</Typography>
                                )}
                                {landUseDetails
                                    .filter(detail => detail.value)
                                    .map(detail => (
                                        <Typography key={detail.label} variant="body2" color="text.secondary">
                                            {detail.label}: {detail.value}
                                        </Typography>
                                    ))}
                            </Stack>
                        </Paper>
                    </React.Fragment>
                );
            })}
        </Stack>
    );
}
