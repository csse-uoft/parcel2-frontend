'use client';

import React from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useForm, useFormContext, Control } from 'react-hook-form';
import { z } from 'zod';

import { ControlledTextInput } from '@/components/forms/inputs/WrappedInputs';
import { AddressSchema } from '@/components/forms/schema/Address';
import { FetcherError } from '@/lib/errors';
import { postJSON } from '@/lib/fetcher';
import EmbeddedMap from '@/components/maps/EmbeddedMap';

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

type GeocodeResult = {
    id: string | null;
    title: string | null;
    address: {
        label: string | null;
        houseNumber: string | null;
        street: string | null;
        district: string | null;
        city: string | null;
        county: string | null;
        state: string | null;
        stateCode: string | null;
        postalCode: string | null;
        countryName: string | null;
        countryCode: string | null;
    };
    position: {
        lat: number | null;
        lng: number | null;
    };
};

type GeocodeResponse = {
    items: GeocodeResult[];
};

function formatAddressLine(value?: Partial<AddressFormData> | null) {
    if (!value) return '';
    const parts: string[] = [];
    const street = [value.streetNumber, value.streetName]
        .map(part => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
        .join(' ')
        .trim();

    if (street) parts.push(street);

    const locality = typeof value.localityName === 'string' ? value.localityName.trim() : '';
    if (locality) parts.push(locality);

    const province = typeof value.provinceName === 'string' ? value.provinceName.trim() : '';
    const country = typeof value.countryName === 'string' ? value.countryName.trim() : '';
    const region = [province, country].filter(Boolean).join(', ');
    if (region) parts.push(region);

    const postal = typeof value.postalCode === 'string' ? value.postalCode.trim() : '';
    if (postal) parts.push(postal);

    if (parts.length === 0) {
        const line = typeof value.stringRepresentation === 'string' ? value.stringRepresentation.trim() : '';
        return line;
    }

    return parts.join(', ');
}

function ensureAddressDefaults(value?: Partial<AddressFormData> | null): AddressFormData {
    const base: Partial<AddressFormData> = {};

    FIELD_CONFIGS.forEach(field => {
        const raw = value?.[field.key];
        if (field.key === 'latitude' || field.key === 'longitude') {
            base[field.key] = typeof raw === 'number' ? raw : undefined;
        } else {
            if (typeof raw === 'string') {
                base[field.key] = raw;
            } else if (typeof raw === 'number') {
                base[field.key] = String(raw);
            } else {
                base[field.key] = raw ?? '';
            }
        }
    });

    base.provinceName = typeof value?.provinceName === 'string' ? value.provinceName : '';
    base.countryName = typeof value?.countryName === 'string' ? value.countryName : '';

    const computedLine = formatAddressLine(value);
    const line = typeof value?.stringRepresentation === 'string' && value.stringRepresentation.trim().length > 0
        ? value.stringRepresentation
        : computedLine;
    base.stringRepresentation = line ?? '';

    return base as AddressFormData;
}

function mapHereResultToAddress(result: GeocodeResult): Partial<AddressFormData> {
    const address = result.address ?? {};
    const locality = address.city ?? address.district ?? address.county ?? undefined;
    const province = address.state ?? address.stateCode ?? undefined;
    const country = address.countryName ?? address.countryCode ?? undefined;

    return {
        streetNumber: address.houseNumber ?? undefined,
        streetName: address.street ?? undefined,
        postalCode: address.postalCode ?? undefined,
        localityName: locality ?? undefined,
        provinceName: province ?? '',
        provinceCode: address.stateCode ?? undefined,
        countryName: country ?? '',
        countryCode: address.countryCode ?? undefined,
        stringRepresentation: result.title ?? address.label ?? undefined,
        latitude: typeof result.position?.lat === 'number' ? result.position.lat : undefined,
        longitude: typeof result.position?.lng === 'number' ? result.position.lng : undefined,
    };
}

interface AddressFieldsProps {
    control: Control<AddressFormData>;
    disabled?: boolean;
}

function AddressFields({ control, disabled }: AddressFieldsProps) {
    const coreFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'core'),
        [],
    );

    const detailFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'details'),
        [],
    );

    const geoFields = React.useMemo(
        () => FIELD_CONFIGS.filter(field => field.group === 'geo'),
        [],
    );

    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const renderField = React.useCallback((field: FieldConfig) => {
        const gridSize = field.size ?? { xs: 12, sm: 6 };
        const name = field.key as keyof AddressFormData;

        return (
            <Grid key={field.key} size={gridSize}>
                <ControlledTextInput<AddressFormData>
                    control={control}
                    name={name}
                    label={field.label}
                    placeholder={field.placeholder}
                    disabled={disabled}
                />
            </Grid>
        );
    }, [control, disabled]);

    return (
        <Box>
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

interface AddressDialogProps {
    open: boolean;
    initialValue?: Partial<AddressFormData> | null;
    onCancel: () => void;
    onSave: (value: AddressFormData) => void;
    disabled?: boolean;
}

function AddressDialog({ open, initialValue, onCancel, onSave, disabled }: AddressDialogProps) {
    const form = useForm<AddressFormData>({
        defaultValues: ensureAddressDefaults(initialValue),
        mode: 'onBlur',
    });

    const { control, handleSubmit, reset, watch, setValue } = form;

    React.useEffect(() => {
        if (open) {
            reset(ensureAddressDefaults(initialValue));
        }
    }, [initialValue, open, reset]);

    const latitude = watch('latitude');
    const longitude = watch('longitude');
    const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<GeocodeResult[]>([]);
    const [searchLoading, setSearchLoading] = React.useState(false);
    const [searchError, setSearchError] = React.useState<string | null>(null);
    const [selectedResultId, setSelectedResultId] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!open) {
            setSearchResults([]);
            setSearchError(null);
            setSearchTerm('');
            setSelectedResultId(null);
        }
    }, [open]);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            setSearchError('Enter a search term to find an address.');
            return;
        }

        setSearchError(null);
        setSearchLoading(true);
        try {
            const response = await postJSON<GeocodeResponse>('/api/geocode/search', {
                arg: { query: searchTerm.trim(), limit: 5 },
            });
            setSearchResults(Array.isArray(response.items) ? response.items : []);
        } catch (error) {
            const message = error instanceof FetcherError
                ? error.message
                : (error as Error)?.message ?? 'Unable to search addresses.';
            setSearchError(message);
        } finally {
            setSearchLoading(false);
        }
    };

    const applyResultToForm = (result: GeocodeResult) => {
        const mapped = mapHereResultToAddress(result);
        setSelectedResultId(result.id ?? null);

        Object.entries(mapped).forEach(([key, value]) => {
            setValue(key as keyof AddressFormData, value as any, { shouldDirty: true, shouldTouch: true });
        });

        if (!mapped.stringRepresentation) {
            const current = form.getValues();
            const fallback = formatAddressLine({ ...current, ...mapped });
            setValue('stringRepresentation', fallback, { shouldDirty: true, shouldTouch: true });
        }
    };

    const submitForm = handleSubmit(values => {
        const payload: AddressFormData = {
            ...values,
            stringRepresentation: values.stringRepresentation?.trim() || formatAddressLine(values),
        };
        onSave(payload);
    });

    const handleDialogSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        submitForm();
    };

    return (
        <Dialog open={open} onClose={onCancel} fullWidth maxWidth="md">
            <form onSubmit={handleDialogSubmit}>
                <DialogTitle>Set Address</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Search for an address (HERE Geocoding &amp; Search)
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="stretch">
                                <TextField
                                    fullWidth
                                    value={searchTerm}
                                    onChange={event => setSearchTerm(event.target.value)}
                                    placeholder="Start typing an address"
                                    disabled={searchLoading || disabled}
                                    onKeyDown={event => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            if (!searchLoading && !disabled) {
                                                void handleSearch();
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<SearchIcon />}
                                    onClick={handleSearch}
                                    disabled={searchLoading || disabled}
                                >
                                    Search
                                </Button>
                            </Stack>
                            {searchError && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    {searchError}
                                </Alert>
                            )}
                            <Box sx={{ mt: 2 }}>
                                {searchLoading ? (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" color="text.secondary">
                                            Searching address…
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <List dense sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                        {searchResults.map(result => {
                                            const label = result.title ?? result.address.label ?? 'Address result';
                                            const secondary = [result.address.street, result.address.city, result.address.state, result.address.postalCode]
                                                .filter(Boolean)
                                                .join(', ');
                                            return (
                                                <ListItemButton
                                                    key={result.id ?? label}
                                                    selected={selectedResultId === result.id}
                                                    onClick={() => applyResultToForm(result)}
                                                >
                                                    <ListItemText primary={label} secondary={secondary} />
                                                </ListItemButton>
                                            );
                                        })}
                                        {!searchLoading && searchResults.length === 0 && (
                                            <ListItemButton disabled>
                                                <ListItemText
                                                    primary="No search results yet. Try searching above."
                                                />
                                            </ListItemButton>
                                        )}
                                    </List>
                                )}
                            </Box>

                            {hasCoordinates && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Is this location correct?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Review the map. If the marker is incorrect, adjust the latitude and longitude fields below.
                                    </Typography>
                                    <EmbeddedMap
                                        lat={latitude}
                                        lng={longitude}
                                        iframeTitle="Selected address preview"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Address details
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Update any field manually. Required fields: Province / State and Country.
                            </Typography>
                            <AddressFields control={control} disabled={disabled} />
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancel} disabled={disabled}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={disabled}>
                        Save address
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

function hasAnyAddressValue(value?: Partial<AddressFormData> | null) {
    if (!value) return false;
    return Object.entries(value).some(([key, val]) => {
        if (key === 'latitude' || key === 'longitude') {
            return typeof val === 'number' && Number.isFinite(val);
        }
        return typeof val === 'string' && val.trim().length > 0;
    });
}

function renderFieldDetails(label: string, value: React.ReactNode) {
    if (value === undefined || value === null || value === '') return null;
    return (
        <Grid key={label} size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Grid>
    );
}

export interface AddressFormProps {
    baseName: string;
    disabled?: boolean;
}

export default function AddressForm({ baseName, disabled }: AddressFormProps) {
    const { watch, setValue, register } = useFormContext<any>();
    const currentAddress: Partial<AddressFormData> | undefined = watch(baseName);

    React.useEffect(() => {
        FIELD_CONFIGS.forEach(field => {
            register(`${baseName}.${field.key}`);
        });
    }, [baseName, register]);

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);

    const summaryLine = React.useMemo(() => {
        const line = formatAddressLine(currentAddress);
        return line || currentAddress?.stringRepresentation || '';
    }, [currentAddress]);

    const hasAddress = hasAnyAddressValue(currentAddress);

    const handleSave = React.useCallback((value: AddressFormData) => {
        const payload: AddressFormData = {
            ...value,
            stringRepresentation: value.stringRepresentation?.trim() || formatAddressLine(value),
        };
        setValue(baseName, payload, { shouldDirty: true, shouldTouch: true });
        setDialogOpen(false);
        setShowDetails(true);
    }, [baseName, setValue]);

    const handleClear = React.useCallback(() => {
        setValue(baseName, {}, { shouldDirty: true, shouldTouch: true });
        setShowDetails(false);
    }, [baseName, setValue]);

    const detailGrid = React.useMemo(() => {
        if (!currentAddress) return null;
        const entries: React.ReactNode[] = [];
        FIELD_CONFIGS.forEach(field => {
            const value = currentAddress[field.key];
            if (field.key === 'latitude' || field.key === 'longitude') {
                if (typeof value === 'number' && Number.isFinite(value)) {
                    entries.push(renderFieldDetails(field.label, value.toFixed(6)));
                }
            } else if (typeof value === 'string' && value.trim().length > 0) {
                entries.push(renderFieldDetails(field.label, value));
            }
        });
        return entries;
    }, [currentAddress]);

    return (
        <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight={600}>
                            Address
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            {hasAddress && (
                                <Button
                                    type="button"
                                    startIcon={<DeleteOutlineOutlinedIcon />}
                                    onClick={handleClear}
                                    disabled={disabled}
                                    color="error"
                                >
                                    Clear
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="contained"
                                startIcon={hasAddress ? <EditOutlinedIcon /> : <AddLocationAltOutlinedIcon />}
                                onClick={() => setDialogOpen(true)}
                                disabled={disabled}
                            >
                                {hasAddress ? 'Edit address' : 'Add address'}
                            </Button>
                        </Stack>
                    </Stack>

                    {!hasAddress && (
                        <Alert severity="info">
                            No address has been provided yet. Use "Add address" to search or enter details manually.
                        </Alert>
                    )}

                    {hasAddress && (
                        <Stack spacing={1}>
                            {summaryLine ? (
                                <Typography variant="body1">{summaryLine}</Typography>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Address captured. Use "Edit" to view details.
                                </Typography>
                            )}
                            <Button
                                type="button"
                                variant="text"
                                size="small"
                                onClick={() => setShowDetails(prev => !prev)}
                                startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                sx={{ alignSelf: 'flex-start', px: 0 }}
                            >
                                {showDetails ? 'Hide full address details' : 'Show full address details'}
                            </Button>

                            <Collapse in={showDetails} timeout="auto" unmountOnExit>
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    {detailGrid?.length ? detailGrid : (
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No additional details captured.
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Collapse>
                        </Stack>
                    )}
                </Stack>
            </Paper>

            <AddressDialog
                open={dialogOpen}
                initialValue={currentAddress}
                onCancel={() => setDialogOpen(false)}
                onSave={handleSave}
                disabled={disabled}
            />
        </>
    );
}
