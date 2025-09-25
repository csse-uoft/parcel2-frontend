'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid'; // MUI 7 Grid v2
import { Add, Delete } from '@mui/icons-material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import AddressForm from '@/components/forms/AddressForm';

type Props = {
    /** RHF path to the array, e.g. "address" or "land.address" */
    name: string;
    disabled?: boolean;
    /** Forward to AddressForm */
    simplified?: boolean;
    /** Optional heading (defaults to "Addresses") */
    title?: string;
    /** Hard cap on items (undefined = unlimited) */
    maxItems?: number;
};

export default function ControlledAddressesField({
                                                     name,
                                                     disabled,
                                                     simplified = true,
                                                     title = 'Addresses',
                                                     maxItems,
                                                 }: Props) {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { fields, append, remove } = useFieldArray({ control, name });

    // Safely read nested errors at arbitrary dot path
    const getAt = (obj: any, path: string) =>
        path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj);

    const arrayError: string | undefined = getAt(errors, name)?.message;
    console.log(fields)

    const canRemove = (idx: number) => fields.length > 0 && !disabled;
    const canAdd = !disabled && (maxItems == null || fields.length < maxItems);

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>

            {arrayError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {arrayError}
                </Typography>
            )}

            {fields.map((f, idx) => (
                <Paper key={f.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="flex-start">
                        <Grid size={{ xs: 12 }}>
                            <AddressForm
                                baseName={`${name}.${idx}`}
                                simplified={simplified}
                                disabled={disabled}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                                aria-label="Remove address"
                                onClick={() => remove(idx)}
                                disabled={!canRemove(idx)}
                                size="small"
                            >
                                <Delete/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            <Button
                variant="outlined"
                startIcon={<Add/>}
                onClick={() => append({})}
                disabled={!canAdd}
            >
                Add Address
            </Button>
        </Box>
    );
}
