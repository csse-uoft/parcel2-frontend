'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';

import {
    Alert,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
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

import { fetcher } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import ImageViewer from "@/components/media/ImageViewer";

/* ---------------- types matching your backend payload ---------------- */

type RoleDTO = { iri: string; name?: string; description?: string };
type TaxonomyDTO = { iri: string; name?: string; description?: string };
type ContactDTO = { iri: string; contactName?: string; email?: string; phone?: string; [k: string]: unknown };

type OpportunityDTO = {
    iri: string;
    name?: string;
    description?: string;
    partnershipRoles?: RoleDTO[];           // array of role objects
    primaryContact?: ContactDTO;            // contactName used
    projectType?: TaxonomyDTO;              // object
    projectStage?: TaxonomyDTO;             // object
    land?: any;                             // may contain notes, address[], etc.
    lands?: any[];                          // optional plural
    additionalInfo?: {
        iri?: string;
        isPosted?: boolean | string;
        isSearchable?: boolean | string;
        datePosted?: string | Date;
        dateModified?: string | Date;
        images?: string[];
        files?: string[];
        primaryImage?: string;
    };
};

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

/** Try to get a single lat/lng from land(s).address[] */
function extractLatLng(op: OpportunityDTO): { lat?: number; lng?: number } {
    const lands: any[] = Array.isArray(op.land) ? op.land : (op.lands ?? (op.land ? [op.land] : []));
    for (const land of lands) {
        const addresses: any[] = Array.isArray(land?.address) ? land.address : [];
        for (const addr of addresses) {
            const latS = addr?.latitude ?? addr?.lat ?? addr?.geoLat;
            const lngS = addr?.longitude ?? addr?.lng ?? addr?.geoLng;
            const lat = typeof latS === 'number' ? latS : parseFloat(String(latS ?? ''));
            const lng = typeof lngS === 'number' ? lngS : parseFloat(String(lngS ?? ''));
            if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
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

    const { data: op, error, isLoading } = useSWR<OpportunityDTO, FetcherError>(
        `/api/opportunities/${encodeURIComponent(iri)}`,
        fetcher,
        { revalidateOnFocus: false }
    );

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

                <Tooltip title="Edit">
                    <IconButton component={Link} href={`/console/opportunity/${encodeURIComponent(op.iri)}/edit`} color="primary">
                        <EditIcon />
                    </IconButton>
                </Tooltip>
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
                                {coords.lat && coords.lng
                                    ? `Coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
                                    : 'No coordinates available'}
                            </Typography>

                            {coords.lat && coords.lng && (
                                <MuiLink
                                    href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                                >
                                    Open in Maps <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                                </MuiLink>
                            )}
                        </Stack>

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
                                                    primary={p.organization?.name ?? p.organization ?? 'Organization'}
                                                    secondary={
                                                        Array.isArray(p.roles) && p.roles.length > 0
                                                            ? p.roles.map((r: any) => r.name ?? r.iri ?? String(r)).join(', ')
                                                            : undefined
                                                    }
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

/* Render land details defensively (notes, addresses, area, etc. if present) */
function renderLand(op: OpportunityDTO) {
    const lands: any[] = Array.isArray(op.land) ? op.land : (op.lands ?? (op.land ? [op.land] : []));
    if (!lands.length) {
        return <Typography variant="body2" color="text.secondary">No land details.</Typography>;
    }

    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            {lands.map((land, i) => {
                const addresses: any[] = Array.isArray(land?.address) ? land.address : [];
                const areaVal = land?.area?.value ?? land?.area;
                const unit = land?.area?.unit ?? land?.unit;
                const uses: any[] = Array.isArray(land?.uses) ? land.uses : (Array.isArray(land?.landUse) ? land.landUse : []);
                return (
                    <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Stack spacing={0.75}>
                            {land?.notes && (
                                <Typography variant="body2" color="text.secondary">Notes: {land.notes}</Typography>
                            )}
                            {(areaVal || unit) && (
                                <Typography variant="body2">Area: <b>{areaVal ?? '-'}</b> {unit ?? ''}</Typography>
                            )}
                            {uses.length > 0 && (
                                <Typography variant="body2">Uses: {uses.map(u => u?.name ?? u?.iri ?? String(u)).join(', ')}</Typography>
                            )}
                            {addresses.length > 0 && (
                                <Stack spacing={0.5}>
                                    {addresses.map((a, idx) => (
                                        <Typography key={idx} variant="body2" color="text.secondary">
                                            {[
                                                a.line1, a.line2, a.city, a.region || a.state, a.postalCode, a.country,
                                            ].filter(Boolean).join(', ')}
                                        </Typography>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
}
