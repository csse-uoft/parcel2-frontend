'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid'; // MUI 7 Grid v2
import {
    Autocomplete,
    TextField,
    Box,
    Typography,
    Chip,
    Tooltip,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

export type TaxonomyOption = { id: string; label: string; description?: string };

interface Props {
    /** RHF path. For multi-select this is a string[]; for single a string. */
    name: string;
    label: string;
    options: TaxonomyOption[];
    multiple?: boolean;               // ← set true for multi-select
    disabled?: boolean;
    size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };

    /** Show descriptions in dropdown list items */
    showOptionDescription?: boolean;
    /** For single-select: show selected option description under the field when no error.
     For multi-select: show "N selected" when no error. */
    showSelectedDescription?: boolean;
    // if true, the Autocomplete will take the full width of its container
    fullWidth?: boolean;
    required?: boolean;
}

export default function ControlledTaxonomySelect({
                                                     name,
                                                     label,
                                                     options,
                                                     multiple = false,
                                                     disabled,
                                                     size = { xs: 12, sm: 6 },
                                                     showOptionDescription = true,
                                                     showSelectedDescription = false,
                                                     fullWidth = false,
                                                     required = false,
                                                 }: Props) {
    const { control } = useFormContext();

    return (
        <Grid size={size}>
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => {
                    const value = multiple
                        ? options.filter((o) => Array.isArray(field.value) && field.value.includes(o.id))
                        : options.find((o) => o.id === field.value) ?? null;

                    const helper =
                        fieldState.error?.message ??
                        (showSelectedDescription
                            ? multiple
                                ? `${Array.isArray(field.value) ? field.value.length : 0} selected`
                                : (value as TaxonomyOption | null)?.description
                            : undefined);

                    return (
                        <Autocomplete
                            multiple={multiple}
                            options={options}
                            getOptionLabel={(o) => o.label}
                            isOptionEqualToValue={(a, b) => a.id === b.id}
                            value={value as any}
                            fullWidth={fullWidth}
                            onChange={(_, newVal) => {
                                if (multiple) {
                                    const ids = (newVal as TaxonomyOption[]).map((v) => v.id);
                                    field.onChange(ids);
                                } else {
                                    field.onChange((newVal as TaxonomyOption | null)?.id ?? '');
                                }
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body2">{option.label}</Typography>
                                        {showOptionDescription && option.description && (
                                            <Typography variant="caption" color="text.secondary"
                                                        sx={{ lineHeight: 1.2, pt: 0.5 }}>
                                                {option.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </li>
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                (tagValue as TaxonomyOption[]).map((opt, idx) => (
                                    <Tooltip key={opt.id} title={opt.description ?? ''} arrow
                                             disableHoverListener={!opt.description}>
                                        <Chip label={opt.label} {...getTagProps({ index: idx })} />
                                    </Tooltip>
                                ))
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={label}
                                    error={!!fieldState.error}
                                    helperText={helper}
                                    required={required}
                                />
                            )}
                            disabled={disabled}
                        />
                    );
                }}
            />
        </Grid>
    );
}
