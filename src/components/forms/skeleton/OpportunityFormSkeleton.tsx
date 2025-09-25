'use client';

import * as React from 'react';
import {
    Box, Container,
    Paper,
    Skeleton,
    Typography,
} from '@mui/material';
import { Grid } from '@mui/material';

type Props = {
    elevation?: number;
    showSubmit?: boolean;
    dense?: boolean;
};

const SectionTitle = ({ width = 240, sx }: { width?: number | string; sx?: any }) => (
    <Box sx={sx}>
        <Skeleton width={width} height={28}/>
    </Box>
);

const Field = ({ rows = 1 }: { rows?: number }) => {
    const height = rows > 1 ? rows * 24 + 12 : 56; // approximate MUI input heights
    return <Skeleton variant="rounded" height={height}/>;
};

const Chip = () => <Skeleton variant="rounded" width={72} height={24}/>;

export default function OpportunityFormSkeleton({
                                                    elevation = 3,
                                                    showSubmit = true,
                                                    dense = false,
                                                }: Props) {
    const gap = dense ? 1.5 : 2;

    return (
        <Container maxWidth="md" sx={{ my: 4 }}>
            <Paper elevation={elevation} sx={{ p: 3 }}>
                {/* Basic Information */}
                <SectionTitle/>
                <Grid container spacing={gap}>
                    <Grid size={{ xs: 12 }}>
                        <Field/>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Field rows={3}/>
                    </Grid>
                </Grid>

                {/* Classification */}
                <SectionTitle sx={{ mt: 4 }}/>
                <Grid container spacing={gap}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Field/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Field/>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Field/>
                    </Grid>
                </Grid>

                {/* Primary Contact */}
                <SectionTitle sx={{ mt: 4 }}/>
                <Grid container spacing={gap}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Field/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Field/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Field/>
                    </Grid>
                </Grid>

                {/* Partners */}
                <SectionTitle sx={{ mt: 4 }}/>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Grid container spacing={gap} alignItems="center">
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <Field/>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Skeleton variant="circular" width={32} height={32}/>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Field/>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            <Skeleton width={180}/>
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
                            <Grid container spacing={gap}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field/>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Field/>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Field rows={2}/>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Field/>
                                </Grid>
                            </Grid>
                        </Paper>

                        <Skeleton variant="rounded" height={36} width={160}/>
                    </Box>
                </Paper>

                {/* Land */}
                <SectionTitle sx={{ mt: 4 }}/>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Grid container spacing={gap}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field/>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Field/>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Field/>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Field rows={2}/>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Additional Info */}
                <SectionTitle sx={{ mt: 4 }}/>
                <Grid container spacing={gap}>
                    <Grid size={{ xs: 12 }}>
                        {/* images grid placeholder */}
                        <Skeleton variant="rounded" height={120}/>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {/* files list placeholder */}
                        <Skeleton variant="rounded" height={64}/>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {/* flags */}
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Chip/>
                            <Chip/>
                        </Box>
                    </Grid>
                </Grid>

                {showSubmit && (
                    <Box sx={{ mt: 4 }}>
                        <Skeleton variant="rounded" height={40} width={180}/>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
