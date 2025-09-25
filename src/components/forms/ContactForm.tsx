'use client';

import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';

interface Props {
    /** e.g. "primaryContact" → primaryContact.email */
    baseName?: string;
    disabled?: boolean;
}

const fields = [
    { key: 'contactName', label: 'Contact Name', size: { xs: 12, sm: 6 }, required: true },
    { key: 'email', label: 'Email', size: { xs: 12, sm: 6 }, required: false },
    { key: 'phone', label: 'Phone', size: { xs: 12, sm: 6 }, required: false },
] as const;

export default function ContactForm({ baseName, disabled }: Props) {
    const { control } = useFormContext();

    const path = (k: string) => (baseName ? `${baseName}.${k}` : k);

    return (
        <Box sx={{ mt: 2 }}>
            {/*<Typography variant="h5" gutterBottom>*/}
            {/*    Primary Contact*/}
            {/*</Typography>*/}

            <Grid container spacing={2}>
                {fields.map(({ key, label, size, required }) => (
                    <Grid key={key} size={size}>
                        <ControlledTextInput
                            control={control}
                            name={path(key)}
                            label={label}
                            // required={required}
                            disabled={disabled}
                            required={required}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
