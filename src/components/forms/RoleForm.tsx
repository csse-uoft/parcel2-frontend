'use client';

import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import ControlledTaxonomySelect, { TaxonomyOption } from "@/components/forms/inputs/ControlledTaxonomySelect";

interface Props {
    baseName: string;        // e.g. "partners.0.roles.0"
    roleTypeOptions: TaxonomyOption[];
    disabled?: boolean;
}

export default function RoleForm({ baseName, roleTypeOptions, disabled }: Props) {
    const { control } = useFormContext();
    const path = (k: string) => `${baseName}.${k}`;

    return (
        <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('startDate')}
                        label="Start Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        disabled={disabled}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('endDate')}
                        label="End Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        disabled={disabled}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <ControlledTextInput
                        control={control}
                        name={path('description')}
                        label="Role Description"
                        multiline
                        minRows={2}
                        disabled={disabled}
                    />
                </Grid>

                <ControlledTaxonomySelect
                    label="Partnership Roles"
                    name={path('roleTypes')}
                    options={roleTypeOptions}
                    disabled={disabled}
                    multiple
                    size={{ xs: 12 }}
                />
            </Grid>
        </Box>
    );
}
