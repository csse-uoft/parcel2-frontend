'use client';

import * as React from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { GoogleMap, InfoWindowF, LoadScript, MarkerF } from '@react-google-maps/api';
import { LatLng, SearchHit } from './types';
import { absUrl } from './utils';

type Props = {
    center: LatLng;
    items: SearchHit[];
    selected: SearchHit | null;
    onMarkerClick: (id: string) => void;
    onBoundsChange?: (b: google.maps.LatLngBounds | null) => void;
};

export default function MapView({ center, items, selected, onMarkerClick, onBoundsChange }: Props) {
    const mapRef = React.useRef<google.maps.Map | null>(null);

    React.useEffect(() => {
        if (mapRef.current) mapRef.current.panTo(center);
    }, [center]);

    const handleMyLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
            const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            mapRef.current?.panTo(c);
        });
    };

    return (
        <Paper sx={{ height: '100%', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
                <IconButton size="small" onClick={handleMyLocation} title="My location" color="primary">
                    <MyLocationIcon />
                </IconButton>
            </Box>

            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={11}
                    onLoad={(map) => {
                        mapRef.current = map;
                    }}
                    onUnmount={() => {
                        mapRef.current = null;
                    }}
                    onIdle={() => onBoundsChange?.(mapRef.current?.getBounds() ?? null)}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {items
                        .filter((it) => typeof it.lat === 'number' && typeof it.lng === 'number')
                        .map((it) => (
                            <MarkerF
                                key={it.id}
                                position={{ lat: it.lat!, lng: it.lng! }}
                                onClick={() => onMarkerClick(it.id)}
                            />
                        ))}

                    {selected && typeof selected.lat === 'number' && typeof selected.lng === 'number' && (
                        <InfoWindowF
                            position={{ lat: selected.lat, lng: selected.lng }}
                            onCloseClick={() => onMarkerClick('')}
                        >
                            <Box sx={{ maxWidth: 260 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {selected.name}
                                </Typography>
                                {selected.primaryImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={absUrl(selected.primaryImage)}
                                        alt={selected.name}
                                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, marginTop: 8 }}
                                    />
                                )}
                                <Button
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        window.location.href = `/console/opportunity/${encodeURIComponent(selected.id)}`;
                                    }}
                                >
                                    Open
                                </Button>
                            </Box>
                        </InfoWindowF>
                    )}
                </GoogleMap>
            </LoadScript>
        </Paper>
    );
}
