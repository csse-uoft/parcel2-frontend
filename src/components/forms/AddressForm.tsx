'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid'; // MUI 7 Grid2 API
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import { AddressSchema } from '@/components/forms/schema/Address';

export type AddressFormData = z.infer<typeof AddressSchema>;

type FieldGroup = 'core' | 'details' | 'geo';

interface FieldConfig {
    key: keyof AddressFormData;
    label: string;
    placeholder?: string;
    group: FieldGroup;
    size?: { xs?: number; sm?: number; md?: number };
}

const FIELD_CONFIGS: FieldConfig[] = [
    { key: 'streetNumber', label: 'Street Number', placeholder: 'e.g. 123', group: 'core', size: { xs: 12, sm: 4 } },
    { key: 'streetName', label: 'Street Name', placeholder: 'e.g. Main', group: 'core', size: { xs: 12, sm: 5 } },
    { key: 'streetType', label: 'Street Type', placeholder: 'e.g. Avenue, Road', group: 'core', size: { xs: 12, sm: 3 } },
    { key: 'unitIdentifier', label: 'Unit / Suite', placeholder: 'e.g. 502', group: 'core', size: { xs: 12, sm: 4 } },
    { key: 'postalCode', label: 'Postal / ZIP Code', group: 'core', size: { xs: 12, sm: 4 } },
    { key: 'localityName', label: 'City / Locality', group: 'core', size: { xs: 12, sm: 6 } },
    { key: 'provinceName', label: 'Province / State', group: 'core', size: { xs: 12, sm: 6 } },
    { key: 'countryName', label: 'Country', group: 'core', size: { xs: 12, sm: 6 } },
    { key: 'unitDesignator', label: 'Unit Designator', placeholder: 'Suite, Apt, Unit', group: 'details', size: { xs: 12, sm: 4 } },
    { key: 'streetDirection', label: 'Street Direction', placeholder: 'N, E, S, W', group: 'details', size: { xs: 12, sm: 3 } },
    { key: 'siteName', label: 'Site Name', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'ruralRouteIdentifier', label: 'Rural Route Identifier', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'postalBoxIdentifier', label: 'Postal Box', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'postalStationInformation', label: 'Postal Station Information', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'provinceCode', label: 'Province Code', group: 'details', size: { xs: 12, sm: 4 } },
    { key: 'countryCode', label: 'Country Code', group: 'details', size: { xs: 12, sm: 4 } },
    { key: 'lotInformation', label: 'Lot Information', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'partLotInformation', label: 'Part Lot Information', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'concessionInformation', label: 'Concession Information', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'propertyIdentificationNumber', label: 'Property Identification Number', group: 'details', size: { xs: 12, sm: 6 } },
    { key: 'stringRepresentation', label: 'Full Address (Single Line)', group: 'details', size: { xs: 12 } },
    { key: 'locationDescription', label: 'Location Description', group: 'details', size: { xs: 12 } },
    { key: 'latitude', label: 'Latitude', placeholder: 'Decimal degrees', group: 'geo', size: { xs: 12, sm: 6 } },
    { key: 'longitude', label: 'Longitude', placeholder: 'Decimal degrees', group: 'geo', size: { xs: 12, sm: 6 } },
];

export interface AddressFormProps {
    baseName: string; // Optional base name for form fields
    disabled?: boolean;
    simplified?: boolean;
}

export default function AddressForm({
                                        baseName,
                                        disabled,
                                        simplified: defaultSimplified
                                    }: AddressFormProps) {

    const { control } = useFormContext();

    const initialShowAdvanced = defaultSimplified === false;
    const [showAdvanced, setShowAdvanced] = React.useState(initialShowAdvanced);

    const coreFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'core'),
        []
    );
    const detailFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'details'),
        []
    );
    const geoFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'geo'),
        []
    );

    const renderField = React.useCallback((field: FieldConfig) => {
        const gridSize = field.size ?? { xs: 12, sm: 6 };
        const name = `${baseName}.${field.key}` as keyof AddressFormData;

        return (
            <Grid key={field.key} size={gridSize}>
                <ControlledTextInput
                    control={control}
                    name={name}
                    label={field.label}
                    placeholder={field.placeholder}
                    disabled={disabled}
                />
            </Grid>
        );
    }, [baseName, control, disabled]);

    return (
        <Box sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <Grid container spacing={2}>
                    {coreFields.map(renderField)}
                </Grid>

                <Box>
                    <Button
                        type="button"
                        variant="text"
                        size="small"
                        startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setShowAdvanced(prev => !prev)}
                        disabled={disabled}
                        sx={{ px: 0 }}
                    >
                        {showAdvanced ? 'Hide additional address fields' : 'Show additional address fields'}
                    </Button>
                </Box>

                <Collapse in={showAdvanced} timeout="auto" unmountOnExit>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {detailFields.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                    Additional Details
                                </Typography>
                                <Grid container spacing={2}>
                                    {detailFields.map(renderField)}
                                </Grid>
                            </Box>
                        )}

                        {geoFields.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                    Coordinates (optional)
                                </Typography>
                                <Grid container spacing={2}>
                                    {geoFields.map(renderField)}
                                </Grid>
                            </Box>
                        )}
                    </Stack>
                </Collapse>
            </Stack>
        </Box>
    );
}
