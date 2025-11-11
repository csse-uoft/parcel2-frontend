'use client';

import * as React from 'react';
import {
    Box,
    Dialog,
    IconButton,
    Stack,
    Typography,
    Tooltip,
    useMediaQuery,
    Theme,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'; // Fit to screen
import PercentIcon from '@mui/icons-material/Percent'; // 100%
import RestartAltIcon from '@mui/icons-material/RestartAlt'; // Reset
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export type ImageViewerProps = {
    images: Array<string | undefined | null>; // include primary first
    open: boolean;
    onClose: () => void;
    startIndex?: number;
    title?: string;
    apiBase?: string; // prefix for relative URLs
};

function toAbsUrl(u?: string | null, apiBase?: string) {
    if (!u) return undefined;
    if (/^https?:\/\//i.test(u)) return u;
    const base = apiBase ?? process.env.NEXT_PUBLIC_API_BASE ?? '';
    return `${base}${u}`;
}

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

export default function ImageViewer({
                                        images,
                                        open,
                                        onClose,
                                        startIndex = 0,
                                        title,
                                        apiBase,
                                    }: ImageViewerProps) {
    // Normalize images (dedupe + absolutize)
    const cleaned = React.useMemo(() => {
        const abs = (images ?? []).map(i => toAbsUrl(i, apiBase)).filter(Boolean) as string[];
        // stable order, unique
        return Array.from(new Set(abs));
    }, [images, apiBase]);

    const [index, setIndex] = React.useState(0);
    const isMdUp = useMediaQuery((t: Theme) => t.breakpoints.up('md'));

    // Canvas/container refs and sizes
    const stageRef = React.useRef<HTMLDivElement | null>(null);
    const [stageSize, setStageSize] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });

    // Current image intrinsic size
    const [imgNatural, setImgNatural] = React.useState<{ w: number; h: number }>({ w: 0, h: 0 });

    // Transform state
    const [scale, setScale] = React.useState(1);
    const [tx, setTx] = React.useState(0);
    const [ty, setTy] = React.useState(0);
    const [rot, setRot] = React.useState(0); // degrees

    // Panning
    const panState = React.useRef<{ active: boolean; sx: number; sy: number; tx0: number; ty0: number }>({
        active: false, sx: 0, sy: 0, tx0: 0, ty0: 0,
    });

    const MIN_SCALE = 0.1;
    const MAX_SCALE = 8;

    // Fit to screen scale
    const fitScale = React.useMemo(() => {
        if (!imgNatural.w || !imgNatural.h || !stageSize.w || !stageSize.h) return 1;
        // account for rotation (90/270 swaps w/h)
        const imgW = (Math.abs(rot) / 90) % 2 === 1 ? imgNatural.h : imgNatural.w;
        const imgH = (Math.abs(rot) / 90) % 2 === 1 ? imgNatural.w : imgNatural.h;
        return clamp(Math.min(stageSize.w / imgW, stageSize.h / imgH), MIN_SCALE, MAX_SCALE);
    }, [imgNatural, stageSize, rot]);

    const current = cleaned[index];

    // Keep start index when opened
    React.useEffect(() => {
        if (open) {
            const idx = clamp(startIndex, 0, Math.max(cleaned.length - 1, 0));
            setIndex(idx);
            // Reset transforms on open
            setRot(0);
            setScale(1);
            setTx(0);
            setTy(0);
        }
    }, [open, startIndex, cleaned.length]);

    // Resize observer for stage
    React.useLayoutEffect(() => {
        if (!stageRef.current) return;
        const node = stageRef.current;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0]?.contentRect;
            if (cr) setStageSize({ w: cr.width, h: cr.height });
        });
        ro.observe(node);
        return () => ro.disconnect();
    }, []);

    // Prev/Next
    const goPrev = React.useCallback(() => {
        if (!cleaned.length) return;
        setIndex(i => (i - 1 + cleaned.length) % cleaned.length);
        // reset transforms for new image
        setRot(0); setScale(1); setTx(0); setTy(0);
    }, [cleaned.length]);
    const goNext = React.useCallback(() => {
        if (!cleaned.length) return;
        setIndex(i => (i + 1) % cleaned.length);
        setRot(0); setScale(1); setTx(0); setTy(0);
    }, [cleaned.length]);

    // Keyboard
    // Helpers to zoom around a point p (in stage coords with origin at center)
    const zoomAroundPoint = React.useCallback((factor: number, px: number, py: number) => {
        setScale(prev => {
            const next = clamp(prev * factor, MIN_SCALE, MAX_SCALE);
            if (next === prev) return prev;
            setTx(t => px - (next / prev) * (px - t));
            setTy(t => py - (next / prev) * (py - t));
            return next;
        });
    }, []);

    const zoomAtCenter = React.useCallback((factor: number) => {
        const px = 0, py = 0;
        zoomAroundPoint(factor, px, py);
    }, [zoomAroundPoint]);

    const doFit = React.useCallback(() => {
        setScale(fitScale);
        setTx(0);
        setTy(0);
    }, [fitScale]);

    const set100 = React.useCallback(() => {
        setScale(1);
        setTx(0);
        setTy(0);
    }, []);

    const resetAll = React.useCallback(() => {
        setScale(1);
        setTx(0);
        setTy(0);
        setRot(0);
    }, []);

    const rotateLeft = React.useCallback(() => setRot(r => (r - 90 + 360) % 360), []);
    const rotateRight = React.useCallback(() => setRot(r => (r + 90) % 360), []);

    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
            else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
            else if (e.key === '+') { e.preventDefault(); zoomAtCenter(1.2); }
            else if (e.key === '-') { e.preventDefault(); zoomAtCenter(1 / 1.2); }
            else if (e.key.toLowerCase() === 'f') { e.preventDefault(); doFit(); }
            else if (e.key === '0') { e.preventDefault(); setScale(1); setTx(0); setTy(0); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, goPrev, goNext, onClose, zoomAtCenter, doFit]);

    // Wheel zoom handler (cursor-centered)
    const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const px = e.clientX - rect.left - rect.width / 2;
        const py = e.clientY - rect.top - rect.height / 2;

        // smoother factor; positive deltaY -> zoom out
        const factor = Math.pow(1.0015, -e.deltaY);
        zoomAroundPoint(factor, px, py);
    };

    // Drag to pan
    const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        panState.current = { active: true, sx: e.clientX, sy: e.clientY, tx0: tx, ty0: ty };
    };
    const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (!panState.current.active) return;
        const dx = e.clientX - panState.current.sx;
        const dy = e.clientY - panState.current.sy;
        setTx(panState.current.tx0 + dx);
        setTy(panState.current.ty0 + dy);
    };
    const endPan = () => { panState.current.active = false; };
    React.useEffect(() => {
        if (!open) return;
        const onUp = () => endPan();
        window.addEventListener('mouseup', onUp);
        return () => window.removeEventListener('mouseup', onUp);
    }, [open]);

    // Double-click to toggle 100% / fit
    const onDoubleClick = () => {
        if (Math.abs(scale - 1) < 0.01) doFit();
        else set100();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(0,0,0,0.92)',
                    color: 'common.white',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Top bar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.25 }}>
                <Stack direction="row" spacing={2} alignItems="center" overflow="hidden">
                    {title && (
                        <Typography variant="subtitle1" noWrap title={title} sx={{ maxWidth: { xs: 180, md: 420 } }}>
                            {title}
                        </Typography>
                    )}
                    <Typography variant="body2" color="grey.300">
                        {cleaned.length ? `${index + 1} / ${cleaned.length}` : ''}
                    </Typography>

                    {current && (
                        <Tooltip title="Open original">
                            <IconButton
                                aria-label="open-original"
                                size="small"
                                href={current}
                                target="_blank"
                                rel="noopener"
                                sx={{ color: 'grey.100' }}
                            >
                                <OpenInNewIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>

                {/* Controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                    <Tooltip title="Zoom out">
                        <IconButton onClick={() => zoomAtCenter(1 / 1.2)} sx={ctrlBtnSx}><ZoomOutIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom in">
                        <IconButton onClick={() => zoomAtCenter(1.2)} sx={ctrlBtnSx}><ZoomInIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Fit to screen (F)">
                        <IconButton onClick={doFit} sx={ctrlBtnSx}><CenterFocusStrongIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="100% (0)">
                        <IconButton onClick={set100} sx={ctrlBtnSx}><PercentIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Rotate left">
                        <IconButton onClick={rotateLeft} sx={ctrlBtnSx}><RotateLeftIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Rotate right">
                        <IconButton onClick={rotateRight} sx={ctrlBtnSx}><RotateRightIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Reset">
                        <IconButton onClick={resetAll} sx={ctrlBtnSx}><RestartAltIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Previous (←)">
            <span>
              <IconButton disabled={cleaned.length <= 1} onClick={goPrev} sx={ctrlBtnSx}><ChevronLeftIcon /></IconButton>
            </span>
                    </Tooltip>
                    <Tooltip title="Next (→)">
            <span>
              <IconButton disabled={cleaned.length <= 1} onClick={goNext} sx={ctrlBtnSx}><ChevronRightIcon /></IconButton>
            </span>
                    </Tooltip>
                    <Tooltip title="Close (Esc)">
                        <IconButton onClick={onClose} sx={{ ...ctrlBtnSx, ml: 0.5 }}><CloseIcon /></IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {/* Stage */}
            <Box
                ref={stageRef}
                onWheel={onWheel}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onDoubleClick={onDoubleClick}
                onMouseLeave={endPan}
                sx={{
                    position: 'relative',
                    flex: 1,
                    overflow: 'hidden',
                    cursor: panState.current.active ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
            >
                {/* Current image */}
                {current ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={current}
                        alt={`image-${index + 1}`}
                        onLoad={(e) => {
                            const el = e.currentTarget;
                            setImgNatural({ w: el.naturalWidth || 0, h: el.naturalHeight || 0 });
                            // If first time opening, fit by default
                            if (Math.abs(scale - 1) < 0.001 && tx === 0 && ty === 0 && rot === 0) {
                                // Wait a tick for stage size to be known
                                requestAnimationFrame(() => {
                                    setScale(prev => (Math.abs(prev - 1) < 0.001 ? fitScale : prev));
                                });
                            }
                        }}
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
                            transformOrigin: 'center center',
                            maxWidth: 'unset',
                            maxHeight: 'unset',
                            willChange: 'transform',
                            imageRendering: isMdUp ? 'auto' : 'auto',
                            borderRadius: 8,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        }}
                        draggable={false}
                    />
                ) : null}
            </Box>

            {/* Thumbnails */}
            {!!cleaned.length && (
                <Box sx={{ px: { xs: 1.5, md: 3 }, pb: 2.5, pt: 0.5 }}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            overflowX: 'auto',
                            py: 1,
                            '&::-webkit-scrollbar': { height: 8 },
                            '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.700', borderRadius: 8 },
                        }}
                    >
                        {cleaned.map((u, i) => (
                            <Box
                                key={`${u}-${i}`}
                                onClick={() => {
                                    setIndex(i);
                                    setRot(0); setScale(fitScale); setTx(0); setTy(0);
                                }}
                                sx={{
                                    position: 'relative',
                                    width: 112,
                                    height: 72,
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    outline: i === index ? '2px solid #90caf9' : '1px solid rgba(255,255,255,0.2)',
                                    outlineOffset: 0,
                                    flex: '0 0 auto',
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={u}
                                    alt={`thumb-${i + 1}`}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    draggable={false}
                                />
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Dialog>
    );
}

const ctrlBtnSx = {
    color: 'grey.100',
    bgcolor: 'rgba(255,255,255,0.08)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.16)' },
};
