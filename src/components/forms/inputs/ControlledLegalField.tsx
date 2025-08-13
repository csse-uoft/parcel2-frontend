'use client';

import * as React from 'react';
import {
    Box,
    Grid,
    Typography,
    IconButton,
    Button,
    Paper,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { ControlledTextInput } from './WrappedInputs';
import { MAX_LEGAL_NAMES } from '../schema/Organization'

interface Props {
    /** path to the array, e.g. "legalNames" */
    name: string;
    label?: string;
    disabled?: boolean;
    showArrayError?: boolean;
    max?: number; // Maximum number allowed
}

const emptyItem = {
    hasValue: '',
    registeringAuthority: '',
    jurisdiction: '',
    // For date inputs we bind strings in the UI; zod will coerce on submit
    startDate: '' as any,
    endDate: '' as any,
};

export default function ControlledLegalField({
                                                 name,
                                                 label = 'Legal Names',
                                                 disabled,
                                                 showArrayError = true,
                                                 max = MAX_LEGAL_NAMES
                                             }: Props) {
    const { control, formState: { errors } } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name });

    const arrayError = (errors as any)?.[name]?.message as string | undefined;
    console.log(fields)

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>{label}</Typography>
            {showArrayError && arrayError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {arrayError}
                </Typography>
            )}

            {fields.map((field, index) => {
                const base = `${name}.${index}`;
                return (
                    <Paper key={field.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Legal name value (required) */}
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <ControlledTextInput
                                    control={control}
                                    name={`${base}.hasValue`}
                                    label={label.slice(0, -1) + ' ' + (index + 1)}
                                    required
                                    disabled={disabled}
                                />
                            </Grid>

                            {/* Remove button */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton
                                        aria-label={`Remove ${label.slice(0, -1)} ${index + 1}`}
                                        onClick={() => remove(index)}
                                        disabled={disabled}
                                        size="small"
                                    >
                                        <Delete/>
                                    </IconButton>
                                </Box>
                            </Grid>

                            {/* Registering authority / jurisdiction */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput
                                    control={control}
                                    name={`${base}.registeringAuthority`}
                                    label="Registering Authority"
                                    disabled={disabled}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput
                                    control={control}
                                    name={`${base}.jurisdiction`}
                                    label="Jurisdiction"
                                    disabled={disabled}
                                />
                            </Grid>

                            {/* Start / End dates */}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput
                                    control={control}
                                    name={`${base}.startDate`}
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={disabled}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ControlledTextInput
                                    control={control}
                                    name={`${base}.endDate`}
                                    label="End Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    disabled={disabled}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                );
            })}

            <Button
                variant="outlined"
                startIcon={<Add/>}
                onClick={() => append({ ...emptyItem })}
                disabled={disabled || fields.length >= max}
            >
                Add {label.slice(0, -1)}
            </Button>
        </Box>
    );
}
