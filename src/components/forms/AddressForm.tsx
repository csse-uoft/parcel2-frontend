'use client';

import React, { useEffect } from 'react';
import {
    TextField,
    Grid,
    Box,
    Typography, Fade, Collapse
} from '@mui/material';
import { useForm, Controller, Control, useWatch, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { ControlledTextInput } from "@/components/forms/inputs/WrappedInputs";
import { AddressSchema } from "@/components/forms/schema/Address";

export type AddressFormData = z.infer<typeof AddressSchema>;

const ALL_FIELDS: [keyof AddressFormData, string][] = [
    ['unitDesignator', 'Unit'],
    ['streetNumber', 'Street Number'],
    ['streetName', 'Street Name'],
    ['streetType', 'Street Type'],
    ['streetDirection', 'Street Direction'],
    ['postalCode', 'Postal Code'],
    ['localityName', 'City / Locality'],
    ['provinceName', 'Province'],
    ['countryName', 'Country'],


    ['siteName', 'Site Name'],
    ['unitIdentifier', 'Unit Identifier'],
    ['ruralRouteIdentifier', 'Rural Route Identifier'],
    ['postalBoxIdentifier', 'Postal Box'],
    ['postalStationInformation', 'Postal Station Info'],
    // ['provinceCode', 'Province Code'],
    // ['countryCode', 'Country Code'],
    ['lotInformation', 'Lot Info'],
    ['partLotInformation', 'Part Lot Info'],
    ['concessionInformation', 'Concession Info'],
    ['propertyIdentificationNumber', 'Property ID Number'],
    ['stringRepresentation', 'Full Address String'],
    ['locationDescription', 'Location Description'],
    ['latitude', 'Latitude'],
    ['longitude', 'Longitude'],
];

const SIMPLIFIED_KEYS = new Set([
    'streetNumber',
    'streetName',
    'unitDesignator',
    'streetType',
    'streetDirection',
    'localityName',
    'provinceName',
    'postalCode',
    'countryName',
    'latitude',
    'longitude',
]);

const SIMPLIFIED_FIELDS: [keyof AddressFormData, string][] = ALL_FIELDS.filter(([key]) => SIMPLIFIED_KEYS.has(key));

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

    const { control, register, getValues, formState: { errors } } = useFormContext();

    const [simplified, setSimplified] = React.useState(defaultSimplified ?? true);

    const fieldsToShow = simplified
        ? ALL_FIELDS.filter(([key]) => SIMPLIFIED_KEYS.has(key))
        : ALL_FIELDS;

    return (
        // Add animation to the form
        <Fade in={true} timeout={500}>
            <Box sx={{ mt: 0 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={simplified}
                            onChange={(e) => setSimplified(e.target.checked)}
                            disabled={disabled}
                        />
                    }
                    label="Show simplified address fields only"
                />
                <Grid container spacing={2}>
                    {fieldsToShow.map(([key, label]) => {
                        const name = `${baseName}.${key}` as keyof AddressFormData;
                        return (
                            // <Fade in={true} timeout={300} key={key}>
                            <Grid size={{ xs: 12, sm: 4 }} key={key}>
                                <ControlledTextInput control={control} name={name} label={label} disabled={disabled}/>
                            </Grid>
                            // </Fade>
                        );
                    })}
                </Grid>

            </Box>
        </Fade>
    );
}
