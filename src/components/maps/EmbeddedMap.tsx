import * as React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

export interface EmbeddedMapProps extends Omit<BoxProps, 'children'> {
    lat: number;
    lng: number;
    zoom?: number;
    iframeTitle?: string;
    iframeProps?: React.IframeHTMLAttributes<HTMLIFrameElement>;
}

/** Render a Google Maps embed for a given latitude/longitude pair. */
export default function EmbeddedMap({
    lat,
    lng,
    zoom = 16,
    iframeTitle,
    iframeProps,
    sx,
    ...boxProps
}: EmbeddedMapProps) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
    const defaultSx: SxProps<Theme> = {
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        height: 220,
    };

    const combinedSx = Array.isArray(sx)
        ? [defaultSx, ...sx]
        : sx
            ? [defaultSx, sx]
            : [defaultSx];

    return (
        <Box {...boxProps} sx={combinedSx}>
            <iframe
                title={iframeTitle ?? 'Embedded map'}
                src={src}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                {...iframeProps}
            />
        </Box>
    );
}
