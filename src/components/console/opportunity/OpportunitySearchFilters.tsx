'use client';

import * as React from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    useMediaQuery,
    Theme,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type { TaxonomyOption } from '@/components/forms/inputs/ControlledTaxonomySelect';

export type SortBy = 'datePosted' | 'dateModified' | 'name';
export type SortDir = 'asc' | 'desc';

export type FilterState = {
    q: string;
    projectType: string | null;
    projectStage: string | null;
    roles: string[];
    posted: boolean | null;
    searchable: boolean | null;
    sortBy: SortBy;
    sortDir: SortDir;
    pageSize: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    value: FilterState;
    onChange: (next: FilterState) => void; // called on Apply
    onClear?: () => void;
    taxonomies: {
        projectTypes: TaxonomyOption[];
        projectStages: TaxonomyOption[];
        roleTypes: TaxonomyOption[];
    };
};

export default function OpportunitySearchFilters({
                                                     open,
                                                     onClose,
                                                     value,
                                                     onChange,
                                                     onClear,
                                                     taxonomies,
                                                 }: Props) {
    const t = useTranslations('Console.Search.Filters');
    const isMobile = useMediaQuery((t: Theme) => t.breakpoints.down('sm'));

    const [draft, setDraft] = React.useState<FilterState>(value);

    React.useEffect(() => {
        if (open) setDraft(value);
    }, [open, value]);

    const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
        setDraft((d) => ({ ...d, [k]: v }));

    const triSelect = (v: boolean | null): 'any' | 'true' | 'false' =>
        v === null ? 'any' : v ? 'true' : 'false';

    const fromTri = (v: 'any' | 'true' | 'false'): boolean | null =>
        v === 'any' ? null : v === 'true';

    return (
        <Dialog open={open} onClose={onClose} fullScreen={isMobile} maxWidth="md" fullWidth>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label={t('searchLabel')}
                        value={draft.q}
                        onChange={(e) => set('q', e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        fullWidth
                    />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                options={taxonomies.projectTypes}
                                getOptionLabel={(o) => o.label}
                                value={taxonomies.projectTypes.find((o) => o.id === draft.projectType) ?? null}
                                onChange={(_, v) => set('projectType', v?.id ?? null)}
                                renderInput={(p) => <TextField {...p} label={t('projectType')} />}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Autocomplete
                                options={taxonomies.projectStages}
                                getOptionLabel={(o) => o.label}
                                value={taxonomies.projectStages.find((o) => o.id === draft.projectStage) ?? null}
                                onChange={(_, v) => set('projectStage', v?.id ?? null)}
                                renderInput={(p) => <TextField {...p} label={t('projectStage')} />}
                            />
                        </Grid>
                    </Grid>

                    <Autocomplete
                        multiple
                        options={taxonomies.roleTypes}
                        getOptionLabel={(o) => o.label}
                        value={taxonomies.roleTypes.filter((o) => draft.roles.includes(o.id))}
                        onChange={(_, arr) => set('roles', arr.map((o) => o.id))}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip variant="outlined" label={option.label} {...getTagProps({ index })} key={option.id} />
                            ))
                        }
                        renderInput={(p) => <TextField {...p} label={t('roles')} />}
                    />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel id="posted-label">{t('posted')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="posted-label"
                                    value={triSelect(draft.posted)}
                                    label={t('posted')}
                                    onChange={(e) => set('posted', fromTri(e.target.value as any))}
                                >
                                    <MenuItem value="any">{t('any')}</MenuItem>
                                    <MenuItem value="true">{t('yes')}</MenuItem>
                                    <MenuItem value="false">{t('no')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel id="searchable-label">{t('searchable')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="searchable-label"
                                    value={triSelect(draft.searchable)}
                                    label={t('searchable')}
                                    onChange={(e) => set('searchable', fromTri(e.target.value as any))}
                                >
                                    <MenuItem value="any">{t('any')}</MenuItem>
                                    <MenuItem value="true">{t('yes')}</MenuItem>
                                    <MenuItem value="false">{t('no')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControl fullWidth>
                                <InputLabel id="page-size-label">{t('pageSize')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="page-size-label"
                                    value={draft.pageSize}
                                    label={t('pageSize')}
                                    onChange={(e) => set('pageSize', Number(e.target.value))}
                                >
                                    {[10, 20, 30, 50, 100].map((n) => (
                                        <MenuItem key={n} value={n}>{n}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel id="sort-by-label">{t('sortBy')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="sort-by-label"
                                    value={draft.sortBy}
                                    label={t('sortBy')}
                                    onChange={(e) => set('sortBy', e.target.value as FilterState['sortBy'])}
                                >
                                    <MenuItem value="dateModified">{t('lastUpdated')}</MenuItem>
                                    <MenuItem value="datePosted">{t('datePosted')}</MenuItem>
                                    <MenuItem value="name">{t('name')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel id="sort-dir-label">{t('direction')}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="sort-dir-label"
                                    value={draft.sortDir}
                                    label={t('direction')}
                                    onChange={(e) => set('sortDir', e.target.value as FilterState['sortDir'])}
                                >
                                    <MenuItem value="desc">{t('descending')}</MenuItem>
                                    <MenuItem value="asc">{t('ascending')}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Quick summary */}
                    <Box sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {draft.q && <Chip size="small" label={`q: ${draft.q}`} />}
                            {draft.projectType && (
                                <Chip
                                    size="small"
                                    label={`type: ${taxonomies.projectTypes.find((t) => t.id === draft.projectType)?.label ?? draft.projectType}`}
                                />
                            )}
                            {draft.projectStage && (
                                <Chip
                                    size="small"
                                    label={`stage: ${taxonomies.projectStages.find((t) => t.id === draft.projectStage)?.label ?? draft.projectStage}`}
                                />
                            )}
                            {draft.roles.length > 0 && <Chip size="small" label={`roles: ${draft.roles.length}`} />}
                            {draft.posted !== null && <Chip size="small" label={`posted: ${draft.posted ? 'yes' : 'no'}`} />}
                            {draft.searchable !== null && <Chip size="small" label={`searchable: ${draft.searchable ? 'yes' : 'no'}`} />}
                            <Chip size="small" label={`sort: ${draft.sortBy}/${draft.sortDir}`} />
                            <Chip size="small" label={`pageSize: ${draft.pageSize}`} />
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions>
                {onClear && (
                    <Button
                        onClick={() => {
                            onClear();
                            onClose();
                        }}
                    >
                        {t('clear')}
                    </Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button onClick={onClose}>{t('cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        onChange(draft);
                        onClose();
                    }}
                >
                    {t('apply')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
