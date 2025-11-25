'use client';

import * as React from 'react';
import { Link } from '@/i18n/navigation';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Stack,
    Typography,
    Button,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { SearchHit } from './types';
import { absUrl, roleLabels, toLabel } from './utils';

type Props = {
    hit: SearchHit;
    selected?: boolean;
    onSelect: (hit: SearchHit) => void;
    projectTypes: { id: string; label: string }[];
    projectStages: { id: string; label: string }[];
    roleTypes: { id: string; label: string }[];
    onQuickView: (id: string) => void;
};

export default function ResultCard({
                                       hit,
                                       selected,
                                       onSelect,
                                       projectTypes,
                                       projectStages,
                                       roleTypes,
                                       onQuickView,
                                   }: Props) {
    const img = absUrl(hit.primaryImage);
    const typeLabel = toLabel(hit.projectType as any, projectTypes);
    const stageLabel = toLabel(hit.projectStage as any, projectStages);
    const roleChips = roleLabels(hit.partnershipRoles as any, roleTypes);

    // Prevent buttons from triggering the CardActionArea click
    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <Card
            variant={selected ? 'elevation' : 'outlined'}
            sx={{ borderColor: selected ? 'primary.main' : 'divider' }}
        >
            {/* Two-column layout so the media spans the full card height */}
            <Box sx={{ display: 'flex', alignItems: 'stretch', minHeight: 140 }}>
                {/* Left: full-height media column */}
                <Box
                    sx={{
                        flex: '0 0 180px',
                        width: 180,
                        borderTopLeftRadius: 4,
                        borderBottomLeftRadius: 4,
                        overflow: 'hidden',
                        bgcolor: 'action.hover',
                    }}
                >
                    {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={img}
                            alt={hit.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onClick={() => onSelect(hit)}
                        />
                    ) : (
                        <Box
                            onClick={() => onSelect(hit)}
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <RoomIcon color="disabled"/>
                        </Box>
                    )}
                </Box>

                {/* Right: content + actions stacked vertically */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    {/* Clickable content */}
                    <CardActionArea onClick={() => onSelect(hit)} sx={{ textAlign: 'left' }}>
                        <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
                            <Typography variant="subtitle1" noWrap>
                                {hit.name}
                            </Typography>
                            {hit.description && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {hit.description}
                                </Typography>
                            )}
                            <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                                {typeLabel && <Chip size="small" label={typeLabel}/>}
                                {stageLabel && <Chip size="small" label={stageLabel}/>}
                                {roleChips.map((label) => (
                                    <Chip key={label} size="small" label={label}/>
                                ))}
                            </Stack>
                            {typeof hit.partnersCount === 'number' && (
                                <Typography variant="caption" color="text.secondary"
                                            sx={{ display: 'block', mt: 0.25 }}>
                                    Partners: {hit.partnersCount}
                                </Typography>
                            )}
                        </CardContent>
                    </CardActionArea>

                    {/* Actions (same column) so total height includes them */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ px: 1.5, pb: 1, pt: 0.5, mt: 'auto' }}
                        justifyContent="flex-end"
                    >
                        <Button size="small" startIcon={<VisibilityIcon/>} onClick={(e) => {
                            stop(e);
                            onQuickView(hit.id);
                        }}>
                            Quick view
                        </Button>
                        <Button
                            size="small"
                            component={Link}
                            href={`/console/opportunity/${encodeURIComponent(hit.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={stop}
                        >
                            Open
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Card>
    );
}
