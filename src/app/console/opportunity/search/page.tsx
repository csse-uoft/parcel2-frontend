'use client';

import * as React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Stack,
    Divider,
    IconButton,
    Button,
    Tooltip,
    Checkbox,
    FormControlLabel,
    Grid,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    Theme,
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import { useTaxonomy } from '@/lib/hooks/useTaxonomy';
import { useOpportunitySearch } from '@/lib/hooks/useOpportunitySearch';
import OpportunitySearchFilters, {
    FilterState,
    SortBy,
    SortDir
} from '@/components/console/opportunity/OpportunitySearchFilters';

import MapView from '@/components/console/opportunity/search/MapView';
import ResultsList from '@/components/console/opportunity/search/ResultsList';
import QuickViewDialog from '@/components/console/opportunity/search/QuickViewDialog';
import { LatLng, SearchHit } from '@/components/console/opportunity/search/types';
import { useDebounced } from '@/components/console/opportunity/search/utils';

export default function OpportunitySearchPage() {
    const { items: roleTypes } = useTaxonomy('bedeo:RoleType');
    const { items: projectTypes } = useTaxonomy('bedeo:ProjectType');
    const { items: projectStages } = useTaxonomy('bedeo:ProjectStage');

    const theme = (null as unknown as Theme); // just for types
    const isSmall = useMediaQuery<Theme>((t) => t.breakpoints.down('sm'));

    // Filters
    const [filtersOpen, setFiltersOpen] = React.useState(false);
    const [filters, setFilters] = React.useState<FilterState>({
        q: '',
        projectType: null,
        projectStage: null,
        roles: [],
        posted: null,
        searchable: null,
        sortBy: 'dateModified',
        sortDir: 'desc',
        pageSize: 20,
    });
    const [page, setPage] = React.useState(1);

    // Map and selection
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [mapCenter, setMapCenter] = React.useState<LatLng>({ lat: 43.6532, lng: -79.3832 });
    const [mapBounds, setMapBounds] = React.useState<google.maps.LatLngBounds | null>(null);
    const [limitToMap, setLimitToMap] = React.useState(false);
    const [mapVisible, setMapVisible] = React.useState(true);

    // Quick view
    const [quickViewId, setQuickViewId] = React.useState<string | null>(null);

    // Debounced POST body
    const debouncedBody = useDebounced(
        {
            q: filters.q.trim() || undefined,
            projectType: filters.projectType ? [filters.projectType] : undefined,
            projectStage: filters.projectStage ? [filters.projectStage] : undefined,
            partnershipRoles: filters.roles.length ? filters.roles : undefined,
            posted: filters.posted ?? undefined,
            searchable: filters.searchable ?? undefined,
            sortBy: filters.sortBy as SortBy,
            sortDir: filters.sortDir as SortDir,
            page,
            pageSize: filters.pageSize,
            showDetails: false,
        },
        350
    );

    // Fetch
    const {
        data,
        error,
        isLoading,
        refresh,
        refreshing,
    } = useOpportunitySearch(debouncedBody);

    // Filter to map bounds (client-side)
    const rawItems = data?.items ?? [];
    const items = React.useMemo(() => {
        if (!limitToMap || !mapBounds) return rawItems;
        return rawItems.filter((it) => {
            if (typeof it.lat !== 'number' || typeof it.lng !== 'number') return false;
            return mapBounds.contains(new google.maps.LatLng(it.lat, it.lng));
        });
    }, [rawItems, limitToMap, mapBounds]);

    const total = data?.total ?? 0;
    const hasMore = data?.hasMore ?? false;
    const selected = items.find((x) => x.id === selectedId) ?? null;

    // Handlers
    const handleResultClick = (hit: SearchHit) => {
        setSelectedId(hit.id);
        if (typeof hit.lat === 'number' && typeof hit.lng === 'number') {
            setMapCenter({ lat: hit.lat, lng: hit.lng });
        }
    };

    const clearAll = () => {
        setFilters({
            q: '',
            projectType: null,
            projectStage: null,
            roles: [],
            posted: null,
            searchable: null,
            sortBy: 'dateModified',
            sortDir: 'desc',
            pageSize: 20,
        });
        setPage(1);
        setLimitToMap(false);
    };

    // Summary chips (collapse on small screens)
    const summaryChips = React.useMemo(() => {
        const chips: Array<{ key: string; label: string; onDelete: () => void }> = [];
        if (filters.q) chips.push({
            key: 'q',
            label: `q: ${filters.q}`,
            onDelete: () => setFilters((f) => ({ ...f, q: '' }))
        });
        if (filters.projectType) chips.push({
            key: 'projectType',
            label: `type: ${projectTypes.find(t => t.id === filters.projectType)?.label ?? filters.projectType}`,
            onDelete: () => setFilters((f) => ({ ...f, projectType: null })),
        });
        if (filters.projectStage) chips.push({
            key: 'projectStage',
            label: `stage: ${projectStages.find(t => t.id === filters.projectStage)?.label ?? filters.projectStage}`,
            onDelete: () => setFilters((f) => ({ ...f, projectStage: null })),
        });
        if (filters.roles.length) chips.push({
            key: 'roles',
            label: `roles: ${filters.roles.length}`,
            onDelete: () => setFilters((f) => ({ ...f, roles: [] })),
        });
        if (filters.posted !== null) chips.push({
            key: 'posted',
            label: `posted: ${filters.posted ? 'yes' : 'no'}`,
            onDelete: () => setFilters((f) => ({ ...f, posted: null })),
        });
        if (filters.searchable !== null) chips.push({
            key: 'searchable',
            label: `searchable: ${filters.searchable ? 'yes' : 'no'}`,
            onDelete: () => setFilters((f) => ({ ...f, searchable: null })),
        });
        chips.push({
            key: 'sort',
            label: `sort: ${filters.sortBy}/${filters.sortDir}`,
            onDelete: () => setFilters((f) => ({ ...f, sortBy: 'dateModified', sortDir: 'desc' })),
        });
        chips.push({
            key: 'pageSize',
            label: `pageSize: ${filters.pageSize}`,
            onDelete: () => setFilters((f) => ({ ...f, pageSize: 20 })),
        });
        return chips;
    }, [filters, projectTypes, projectStages]);

    // Collapse chips on small screens
    const maxChips = isSmall ? 2 : 8;
    const chipsToShow = summaryChips.slice(0, maxChips);
    const extraChipCount = summaryChips.length - chipsToShow.length;

    // Overflow menu (small screens)
    const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
    const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
    const closeMenu = () => setMenuAnchor(null);

    return (
        <Box sx={{ height: 'calc(100dvh - 114px)' }}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
                {/* Left: list */}
                <Grid
                    size={{
                        xs: 12,
                        md: mapVisible ? 6 : 12, // 50/50 on md when map visible
                        lg: mapVisible ? 6 : 12,
                    }}
                    sx={{ height: { md: '100%' } }}
                >
                    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2, gap: 1.25 }}>
                        {/* Header / toolbar */}
                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                            <Typography variant={isSmall ? 'h6' : 'h5'} sx={{ flex: 1, minWidth: 180 }}>
                                Opportunities
                            </Typography>

                            {/* Filters */}
                            <Button
                                variant="text"
                                size="small"
                                startIcon={<FilterListIcon/>}
                                onClick={() => setFiltersOpen(true)}
                            >
                                Filters
                            </Button>


                            {/* Map toggle: icon-only on small; text button on larger */}
                            {isSmall ? (
                                <Tooltip title={mapVisible ? 'Hide map' : 'Show map'}>
                                    <IconButton onClick={() => setMapVisible((v) => !v)}
                                                color={mapVisible ? 'primary' : 'default'}>
                                        <MapIcon/>
                                    </IconButton>
                                </Tooltip>
                            ) : (
                                <Button size="small" startIcon={<MapIcon/>} onClick={() => setMapVisible((v) => !v)}>
                                    {mapVisible ? 'Hide map' : 'Show map'}
                                </Button>
                            )}

                            {/* On small screens move actions into a menu */}
                            {isSmall ? (
                                <>
                                    <IconButton onClick={openMenu}>
                                        <MoreVertIcon/>
                                    </IconButton>
                                    <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                                        <MenuItem
                                            onClick={() => {
                                                setLimitToMap((v) => !v);
                                                closeMenu();
                                            }}
                                        >
                                            <ListItemIcon>
                                                {limitToMap ? <CheckBoxIcon fontSize="small"/> :
                                                    <CheckBoxOutlineBlankIcon fontSize="small"/>}
                                            </ListItemIcon>
                                            <ListItemText>Limit to map</ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                refresh(debouncedBody);
                                                closeMenu();
                                            }}
                                        >
                                            <ListItemIcon>
                                                <RefreshIcon fontSize="small"/>
                                            </ListItemIcon>
                                            <ListItemText>Refresh</ListItemText>
                                        </MenuItem>
                                        {/*<MenuItem*/}
                                        {/*    onClick={() => {*/}
                                        {/*        clearAll();*/}
                                        {/*        closeMenu();*/}
                                        {/*    }}*/}
                                        {/*>*/}
                                        {/*    <ListItemIcon>*/}
                                        {/*        <ClearAllIcon fontSize="small"/>*/}
                                        {/*    </ListItemIcon>*/}
                                        {/*    <ListItemText>Clear</ListItemText>*/}
                                        {/*</MenuItem>*/}
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    {/*<FormControlLabel*/}
                                    {/*    sx={{ mr: 0 }}*/}
                                    {/*    control={<Checkbox checked={limitToMap} onChange={(_, v) => setLimitToMap(v)}/>}*/}
                                    {/*    label="Limit to map"*/}
                                    {/*/>*/}
                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={limitToMap ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}
                                        onClick={() => setLimitToMap(v => !v)}
                                    >
                                        Limit to map
                                    </Button>

                                    <Button variant="text" size="small" onClick={() => refresh(debouncedBody)}
                                            disabled={refreshing}>
                                        Refresh
                                    </Button>
                                    {/*<Button size="small" onClick={clearAll}>Clear</Button>*/}
                                </>
                            )}
                        </Stack>

                        {/* Active filter chips (collapsed on small) */}
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 0.5 }}>
                            {chipsToShow.map((c) => (
                                <Chip key={c.key} size="small" label={c.label} onDelete={c.onDelete}/>
                            ))}
                            {extraChipCount > 0 && (
                                <Chip
                                    size="small"
                                    label={`+${extraChipCount} more`}
                                    onClick={() => setFiltersOpen(true)}
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        <Divider sx={{ my: 0.5 }}/>

                        {/* Results */}
                        <Box sx={{ overflow: 'auto', flex: 1, pr: 1, pb: 0.5 }}>
                            <ResultsList
                                isLoading={isLoading}
                                error={error}
                                items={items}
                                total={total}
                                page={data?.page ?? 1}
                                hasMore={hasMore}
                                onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                                onNextPage={() => hasMore && setPage((p) => p + 1)}
                                selectedId={selectedId}
                                onSelect={handleResultClick}
                                projectTypes={projectTypes}
                                projectStages={projectStages}
                                roleTypes={roleTypes}
                                onQuickView={(id) => setQuickViewId(id)}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Right: map (md+), 50/50 when visible */}
                {mapVisible && (
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}
                          sx={{ display: { xs: 'none', sm: 'none', md: 'block' }, height: { md: '100%' } }}>
                        <MapView
                            center={mapCenter}
                            items={items}
                            selected={selected}
                            onMarkerClick={(id) => setSelectedId(id || null)}
                            onBoundsChange={(b) => setMapBounds(b)}
                        />
                    </Grid>
                )}
            </Grid>

            {/* Filters */}
            <OpportunitySearchFilters
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                value={filters}
                onChange={(next) => {
                    setFilters(next);
                    setPage(1);
                }}
                onClear={clearAll}
                taxonomies={{ projectTypes, projectStages, roleTypes }}
            />

            {/* Quick view */}
            <QuickViewDialog id={quickViewId} open={Boolean(quickViewId)} onClose={() => setQuickViewId(null)}/>
        </Box>
    );
}
