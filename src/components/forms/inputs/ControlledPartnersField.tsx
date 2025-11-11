'use client';

import * as React from 'react';
import {
    Box,
    Grid,
    Typography,
    Paper,
    IconButton,
    Button,
    Autocomplete,
    TextField,
    Divider,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import RoleForm from '../RoleForm';
import { TaxonomyOption } from './ControlledTaxonomySelect';

interface OrgOption {
    id: string;    // Parcel2 org ID / URI
    label: string; // display name
}

interface ControlledPartnersFieldProps {
    name: string; // e.g. "partners"
    orgOptions: OrgOption[];
    roleTypeOptions: TaxonomyOption[];
    disabled?: boolean;
    label?: string;
}

/* ---------------------- Child: one partner card ---------------------- */
function PartnerCard({
                         baseName,             // e.g. "partners.0"
                         index,
                         onRemove,
                         orgOptions,
                         roleTypeOptions,
                         disabled,
                     }: {
    baseName: string;
    index: number;
    onRemove: () => void;
    orgOptions: OrgOption[];
    roleTypeOptions: TaxonomyOption[];
    disabled?: boolean;
}) {
    const { control } = useFormContext();

    // SAFE: this hook is at the top level of the child component,
    // not inside a conditional or loop in the same component.
    const {
        fields: roleFields,
        append: appendRole,
        remove: removeRole,
    } = useFieldArray({ control, name: `${baseName}.roles` });

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
                {/* Organization dropdown (Parcel2) */}
                <Grid size={{ xs: 12, sm: 8 }}>
                    <Controller
                        name={`${baseName}.organization`}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Autocomplete
                                options={orgOptions}
                                getOptionLabel={(o) => o.label}
                                isOptionEqualToValue={(a, b) => a.id === b.id}
                                value={orgOptions.find((o) => o.id === field.value) ?? null}
                                onChange={(_, newVal) => field.onChange(newVal?.id ?? '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Organization"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                                disabled={disabled}
                            />
                        )}
                    />
                </Grid>

                {/* Remove partner */}
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                            aria-label="Remove partner"
                            onClick={onRemove}
                            disabled={disabled}
                            size="small"
                        >
                            <Delete/>
                        </IconButton>
                    </Box>
                </Grid>

                {/* Free-text org name if not on Parcel2 */}
                <Grid size={{ xs: 12 }}>
                    <ControlledTextInput
                        control={control}
                        name={`${baseName}.organizationName`}
                        label="Organization Name"
                        disabled={disabled}
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }}/>

            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Roles for this Partner
            </Typography>

            {roleFields.map((rf, rIdx) => (
                <Paper key={rf.id} variant="outlined" sx={{ p: 2, mb: 1 }}>
                    <RoleForm
                        baseName={`${baseName}.roles.${rIdx}`}
                        roleTypeOptions={roleTypeOptions}
                        disabled={disabled}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                            aria-label="Remove role"
                            onClick={() => removeRole(rIdx)}
                            disabled={disabled}
                            size="small"
                        >
                            <Delete/>
                        </IconButton>
                    </Box>
                </Paper>
            ))}

            <Button
                variant="outlined"
                startIcon={<Add/>}
                onClick={() =>
                    appendRole({ startDate: '', endDate: '', description: '', roleTypes: [] })
                }
                disabled={disabled}
                sx={{ mt: 1 }}
            >
                Add Role
            </Button>
        </Paper>
    );
}

/* ---------------------- Parent: partners array ----------------------- */
export default function ControlledPartnersField({
                                                    name,
                                                    orgOptions,
                                                    roleTypeOptions,
                                                    disabled,
                                                    label,
                                                }: ControlledPartnersFieldProps) {
    const { control, formState: { errors } } = useFormContext();

    // SAFE: only one useFieldArray in this component
    const { fields, append, remove } = useFieldArray({ control, name });

    const arrayError = (errors as any)?.[name]?.message as string | undefined;

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                {label ?? 'Partners'}
            </Typography>
            {arrayError && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {arrayError}
                </Typography>
            )}

            {fields.map((f, idx) => (
                <PartnerCard
                    key={f.id}
                    baseName={`${name}.${idx}`}
                    index={idx}
                    onRemove={() => remove(idx)}
                    orgOptions={orgOptions}
                    roleTypeOptions={roleTypeOptions}
                    disabled={disabled}
                />
            ))}

            <Button
                variant="outlined"
                startIcon={<Add/>}
                onClick={() =>
                    append({ organization: '', organizationName: '', roles: [] })
                }
                disabled={disabled}
            >
                Add Partner
            </Button>
        </Box>
    );
}
