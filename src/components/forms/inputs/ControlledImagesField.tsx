'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone } from 'react-dropzone';
import { useController, useFormContext } from 'react-hook-form';

type UploadEntry = {
    id: string;
    file: File;
    name: string;
    size: number;
    progress: number; // 0..100
    status: 'uploading' | 'done' | 'error' | 'canceled';
    url?: string;
    error?: string;
    xhr?: XMLHttpRequest;
};

export type ParseResponse = (xhr: XMLHttpRequest) => string | string[];

interface Props {
    nameImages: string;   // e.g. "additionalInfo.images"
    namePrimary: string;  // e.g. "additionalInfo.primaryImage"
    endpoint: string;
    formFieldName?: string;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
    headers?: Record<string, string>;
    parseResponse?: ParseResponse;
    title?: string;
}

export default function ControlledImageUploadDropzone({
                                                          nameImages,
                                                          namePrimary,
                                                          endpoint,
                                                          formFieldName = 'file',
                                                          maxFiles = 12,
                                                          maxSize,
                                                          disabled,
                                                          size = { xs: 12 },
                                                          headers,
                                                          parseResponse,
                                                          title = 'Images',
                                                      }: Props) {
    const { control, getValues, setValue } = useFormContext();

    const imagesCtrl = useController({
        name: nameImages,
        control,
        defaultValue: [],
    });
    const primaryCtrl = useController({
        name: namePrimary,
        control,
        defaultValue: '',
    });

    const [queue, setQueue] = React.useState<UploadEntry[]>([]);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE ?? '';

    const defaultParse = React.useCallback<ParseResponse>((xhr) => {
        try {
            const json = JSON.parse(xhr.responseText);
            if (Array.isArray(json?.urls)) return json.urls as string[];
            if (typeof json?.url === 'string') return json.url as string;
            if (typeof json === 'string') return json;
            if (json?.value) return json.value as string;
        } catch {
            const txt = xhr.responseText?.trim();
            if (txt) return txt;
        }
        throw new Error('Upload succeeded but response did not include URL(s).');
    }, []);

    // Always append using the latest form state (avoid stale closures)
    const addUrls = React.useCallback(
        (urls: string[]) => {
            const current: string[] = (getValues(nameImages) as string[]) ?? [];
            const next = [...current, ...urls.filter(Boolean)];
            setValue(nameImages as any, next, { shouldDirty: true, shouldValidate: true });

            const currentPrimary = (getValues(namePrimary) as string) ?? '';
            if (!currentPrimary && next.length > 0) {
                setValue(namePrimary as any, next[0], { shouldDirty: true, shouldValidate: true });
            }
        },
        [getValues, setValue, nameImages, namePrimary]
    );

    const uploadOne = React.useCallback(
        (entry: UploadEntry) => {
            const xhr = new XMLHttpRequest();
            entry.xhr = xhr;

            xhr.open('POST', `${baseUrl}${endpoint}`);
            xhr.withCredentials = true;
            if (headers) Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));

            xhr.upload.onprogress = (ev) => {
                if (ev.lengthComputable) {
                    const pct = Math.round((ev.loaded / ev.total) * 100);
                    setQueue((q) => q.map((it) => (it.id === entry.id ? { ...it, progress: pct } : it)));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = (parseResponse ?? defaultParse)(xhr);
                        const urls = Array.isArray(result) ? result : [result];
                        addUrls(urls);

                        // clean queue item once done
                        setQueue((q) => q.filter((it) => it.id !== entry.id));
                    } catch (err: any) {
                        setQueue((q) =>
                            q.map((it) =>
                                it.id === entry.id ? {
                                    ...it,
                                    status: 'error',
                                    error: err?.message ?? 'Parse error'
                                } : it
                            )
                        );
                    }
                } else {
                    setQueue((q) =>
                        q.map((it) =>
                            it.id === entry.id ? { ...it, status: 'error', error: `HTTP ${xhr.status}` } : it
                        )
                    );
                }
            };

            xhr.onerror = () => {
                setQueue((q) =>
                    q.map((it) =>
                        it.id === entry.id ? { ...it, status: 'error', error: 'Network error' } : it
                    )
                );
            };

            const fd = new FormData();
            fd.append(formFieldName, entry.file, entry.name);
            xhr.send(fd);
        },
    [baseUrl, endpoint, headers, defaultParse, parseResponse, addUrls, formFieldName]
    );

    const onDrop = React.useCallback((accepted: File[]) => {
        if (!accepted?.length) return;
        const entries: UploadEntry[] = accepted.map((f) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file: f,
            name: f.name,
            size: f.size,
            progress: 0,
            status: 'uploading',
        }));
        setQueue((q) => [...q, ...entries]);
        entries.forEach((e) => uploadOne(e)); // uses latest addUrls via deps
    }, [uploadOne]);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        multiple: true,
        accept: { 'image/*': [] },
        maxFiles,
        maxSize,
        disabled,
    });

    const removeImageAt = (idx: number) => {
        const current: string[] = (getValues(nameImages) as string[]) ?? [];
        const removed = current[idx];
        const next = current.slice(0, idx).concat(current.slice(idx + 1));
        setValue(nameImages as any, next, { shouldDirty: true, shouldValidate: true });

        const primary = (getValues(namePrimary) as string) ?? '';
        if (primary === removed) {
            setValue(namePrimary as any, next[0] ?? '', { shouldDirty: true, shouldValidate: true });
        }
        setQueue((q) => q.filter((it) => it.url !== removed));
    };

    const clearAll = () => {
        setValue(nameImages as any, [], { shouldDirty: true, shouldValidate: true });
        setValue(namePrimary as any, '', { shouldDirty: true, shouldValidate: true });
    };

    const setPrimary = (url: string) => {
        setValue(namePrimary as any, url, { shouldDirty: true, shouldValidate: true });
    };

    const hasError = !!imagesCtrl.fieldState.error || fileRejections.length > 0;

    return (
        <Grid size={size}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {title}
            </Typography>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderStyle: 'dashed',
                    bgcolor: (theme) => (isDragActive ? theme.palette.action.hover : 'transparent'),
                    cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                {...getRootProps()}
            >
                <input {...getInputProps()} />
                <Typography variant="body2" color="text.secondary">
                    {isDragActive ? 'Drop images here' : 'Drag & drop images here, or click to browse'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {(imagesCtrl.field.value ?? []).length}/{maxFiles}
                </Typography>
            </Paper>

            {/* Validation & rejections */}
            {hasError && (
                <Box sx={{ mt: 1 }}>
                    {imagesCtrl.fieldState.error && (
                        <Typography color="error" variant="body2">
                            {imagesCtrl.fieldState.error.message}
                        </Typography>
                    )}
                    {fileRejections.map((rej, i) => (
                        <Typography key={i} color="error" variant="body2">
                            Rejected: {rej.file.name}
                        </Typography>
                    ))}
                </Box>
            )}

            {/* Upload queue (only show items not removed yet; errors stay visible) */}
            {queue.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Uploading
                    </Typography>
                    <Stack spacing={1}>
                        {queue.map((it) => (
                            <Paper key={it.id} variant="outlined" sx={{ p: 1.5 }}>
                                <Typography variant="body2">{it.name}</Typography>
                                {it.status === 'error' ? (
                                    <Typography color="error" variant="caption">
                                        {it.error}
                                    </Typography>
                                ) : (
                                    <LinearProgress value={it.progress} variant="determinate" sx={{ mt: 1 }}/>
                                )}
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Thumbnails */}
            {(imagesCtrl.field.value ?? []).length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Uploaded
                    </Typography>
                    <Grid container spacing={1}>
                        {(imagesCtrl.field.value ?? []).map((url: string, idx: number) => {
                            const isPrimary = primaryCtrl.field.value === url;
                            return (
                                <Grid key={url + idx} size={{ xs: 6, sm: 4, md: 3 }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            border: '2px solid',
                                            borderColor: isPrimary ? 'primary.main' : 'divider',
                                            aspectRatio: '1 / 1',
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={baseUrl + url}
                                            alt={`img-${idx}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />

                                        <Tooltip title={isPrimary ? 'Primary image' : 'Set as primary'}>
                                            <IconButton
                                                size="small"
                                                onClick={() => setPrimary(url)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    left: 4,
                                                    bgcolor: 'rgba(255,255,255,0.9)'
                                                }}
                                            >
                                                {isPrimary ? <StarIcon fontSize="small" color="primary"/> :
                                                    <StarBorderIcon fontSize="small"/>}
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Remove">
                                            <IconButton
                                                size="small"
                                                onClick={() => removeImageAt(idx)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'rgba(255,255,255,0.9)'
                                                }}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>

                                        {isPrimary && (
                                            <Chip
                                                size="small"
                                                label="Primary"
                                                color="primary"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 6,
                                                    left: 6,
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    <Button onClick={clearAll} size="small" sx={{ mt: 1 }}>
                        Clear all
                    </Button>
                </Box>
            )}
        </Grid>
    );
}
