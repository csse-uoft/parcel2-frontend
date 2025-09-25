'use client';

import * as React from 'react';
import { Stack, Card, CardContent, Skeleton, Typography, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ResultCard from './ResultCard';
import { SearchHit } from './types';

type Props = {
    isLoading: boolean;
    error?: unknown;
    items: SearchHit[];
    total: number;
    page: number;
    hasMore: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    selectedId: string | null;
    onSelect: (hit: SearchHit) => void;
    projectTypes: { id: string; label: string }[];
    projectStages: { id: string; label: string }[];
    roleTypes: { id: string; label: string }[];
    onQuickView: (id: string) => void;
};

export default function ResultsList({
                                        isLoading,
                                        error,
                                        items,
                                        total,
                                        page,
                                        hasMore,
                                        onPrevPage,
                                        onNextPage,
                                        selectedId,
                                        onSelect,
                                        projectTypes,
                                        projectStages,
                                        roleTypes,
                                        onQuickView,
                                    }: Props) {
    if (isLoading) {
        return (
            <Stack spacing={1}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} variant="outlined">
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                            <Skeleton variant="rounded" height={80} />
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    }

    if (error) return <Typography color="error">Failed to load results.</Typography>;
    if (items.length === 0) return <Typography color="text.secondary">No results.</Typography>;

    return (
        <Stack spacing={1}>
            {items.map((hit) => (
                <ResultCard
                    key={hit.id}
                    hit={hit}
                    selected={hit.id === selectedId}
                    onSelect={onSelect}
                    projectTypes={projectTypes}
                    projectStages={projectStages}
                    roleTypes={roleTypes}
                    onQuickView={onQuickView}
                />
            ))}

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ pt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {total} total • Page {page}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={onPrevPage} disabled={page <= 1}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={onNextPage} disabled={!hasMore}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>
        </Stack>
    );
}
