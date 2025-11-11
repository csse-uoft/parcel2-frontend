// components/forms/LandForm.tsx
'use client';

import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import ControlledTaxonomySelect, { TaxonomyOption } from '@/components/forms/inputs/ControlledTaxonomySelect';
import ControlledAddressesField from '@/components/forms/inputs/ControlledAddressesField';

interface Props {
    baseName?: string;                 // e.g. "land"
    disabled?: boolean;

    // Taxonomies
    unitOptions: TaxonomyOption[];     // 'bedeo:Unit' items (id/label/description)
    landUseOptions: TaxonomyOption[];  // 'bedeo:LandUse' items
}

export default function LandForm({
                                     baseName = '',
                                     disabled,
                                     unitOptions,
                                     landUseOptions,
                                 }: Props) {
    const { control } = useFormContext();
    const path = (k: string) => (baseName ? `${baseName}.${k}` : k);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Land</Typography>

            {/* Notes & Parcel */}
            <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('notes')}
                        label="Notes"
                        multiline
                        minRows={2}
                        required
                        disabled={disabled}
                    />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('parcelId')}
                        label="Parcel / PIN"
                        disabled={disabled}
                    />
                </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Land Use</Typography>
            <Grid container spacing={2}>
                <ControlledTaxonomySelect
                    name={path('currentLandUse')}
                    label="Current Land Use"
                    options={landUseOptions}
                    disabled={disabled}
                />
                <ControlledTaxonomySelect
                    name={path('designatedLandUse')}
                    label="Designated Land Use"
                    options={landUseOptions}
                    disabled={disabled}
                />
                <ControlledTaxonomySelect
                    name={path('proposedLandUse')}
                    label="Proposed Land Use"
                    options={landUseOptions}
                    disabled={disabled}
                />
            </Grid>

            {/* Area + Unit */}
            <Typography variant="subtitle1" sx={{ mt: 3 }}>Area</Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('area')}
                        label="Area"
                        type="number"
                        inputProps={{ step: 'any', min: 0 }}
                        disabled={disabled}
                    />
                </Grid>
                <ControlledTaxonomySelect
                    name={path('areaUnit')}
                    label="Unit"
                    options={unitOptions}
                    disabled={disabled}
                    size={{ xs: 12, sm: 4 }}
                />
            </Grid>

            {/* Addresses (array, min 1) */}
            <ControlledAddressesField name={path('addresses')} disabled={disabled} title={""} />

            {/* Land Uses */}

        </Box>
    );
}
