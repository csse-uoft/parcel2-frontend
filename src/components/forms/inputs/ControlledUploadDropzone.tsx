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
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDropzone, Accept } from 'react-dropzone';
import { useController, useFormContext } from 'react-hook-form';

type UploadEntry = {
    id: string;
    file: File;
    name: string;
    size: number;
    progress: number;
    status: 'uploading' | 'done' | 'error' | 'canceled';
    url?: string;
    error?: string;
    xhr?: XMLHttpRequest;
};

export type UploadParseResult = string | string[];
export type ParseResponse = (xhr: XMLHttpRequest) => UploadParseResult;

interface Props {
    name: string;
    label: string;
    endpoint: string;
    formFieldName?: string;
    multiple?: boolean;
    accept?: Accept;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    size?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
    showImagePreviews?: boolean;
    parseResponse?: ParseResponse;
    headers?: Record<string, string>;
}

export default function ControlledUploadDropzone({
                                                     name,
                                                     label,
                                                     endpoint,
                                                     formFieldName = 'file',
                                                     multiple = true,
                                                     accept,
                                                     maxFiles,
                                                     maxSize,
                                                     disabled,
                                                     size = { xs: 12 },
                                                     showImagePreviews = false,
                                                     parseResponse,
                                                     headers,
                                                 }: Props) {
    const { control, getValues, setValue } = useFormContext();

    const { field, fieldState } = useController({
        name,
        control,
        defaultValue: [],
    });

    const [queue, setQueue] = React.useState<UploadEntry[]>([]);
    // NEW: map uploaded URL -> original filename
    const [urlNameMap, setUrlNameMap] = React.useState<Record<string, string>>({});

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE ?? '';

    // always append using latest form state (avoid stale closures)
    const addUrls = React.useCallback(
        (urls: string[]) => {
            const current: string[] = (getValues(name) as string[]) ?? [];
            const next = [...current, ...urls.filter(Boolean)];
            setValue(name as any, next, { shouldDirty: true, shouldValidate: true });
        },
        [getValues, setValue, name]
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
        entries.forEach((e) => uploadOne(e));
    }, []); // uploadOne is stable via deps

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        multiple,
        accept,
        maxFiles,
        maxSize,
        disabled,
    });

    const parse = React.useCallback<ParseResponse>((xhr) => {
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
                        const result = (parseResponse ?? parse)(xhr);
                        const urls = Array.isArray(result) ? result : [result];

                        // append to RHF
                        addUrls(urls);
                        // map each resulting URL to the original file name
                        setUrlNameMap((m) => {
                            const next = { ...m };
                            urls.forEach((u) => (next[u] = entry.name));
                            return next;
                        });

                        // ✅ remove finished queue item
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
        [baseUrl, endpoint, headers, parseResponse, parse, addUrls]
    );

    const cancelUpload = (id: string) => {
        setQueue((q) => {
            const it = q.find((x) => x.id === id);
            if (it?.xhr && it.status === 'uploading') it.xhr.abort();
            return q.map((x) => (x.id === id ? { ...x, status: 'canceled' } : x));
        });
    };

    const removeUrlAt = (idx: number) => {
        const current: string[] = (getValues(name) as string[]) ?? [];
        const removed = current[idx];
        const next = current.slice(0, idx).concat(current.slice(idx + 1));
        setValue(name as any, next, { shouldDirty: true, shouldValidate: true });
        setQueue((q) => q.filter((it) => it.url !== removed));
        setUrlNameMap((m) => {
            const n = { ...m };
            delete n[removed];
            return n;
        });
    };

    const clearAll = () => {
        setValue(name as any, [], { shouldDirty: true, shouldValidate: true });
        setUrlNameMap({});
    };

    const hasError = !!fieldState.error || fileRejections.length > 0;

    const displayName = (url: string) =>
        urlNameMap[url] ?? basenameFromUrl(url);

    return (
        <Grid size={size}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {label}
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
                    {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
                </Typography>
                {maxFiles != null && (
                    <Typography variant="caption" color="text.secondary">
                        {(field.value ?? []).length}/{maxFiles}
                    </Typography>
                )}
            </Paper>

            {/* Validation & rejections */}
            {hasError && (
                <Box sx={{ mt: 1 }}>
                    {fieldState.error && (
                        <Typography color="error" variant="body2">
                            {fieldState.error.message}
                        </Typography>
                    )}
                    {fileRejections.map((rej, i) => (
                        <Typography key={i} color="error" variant="body2">
                            Rejected: {rej.file.name}
                        </Typography>
                    ))}
                </Box>
            )}

            {/* Upload queue */}
            {queue.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Uploading
                    </Typography>
                    <Stack spacing={1}>
                        {queue.map((it) => (
                            <Paper key={it.id} variant="outlined"
                                   sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2">{it.name}</Typography>
                                    <LinearProgress variant="determinate" value={it.progress} sx={{ mt: 1 }}/>
                                    {it.status === 'error' && (
                                        <Typography color="error" variant="caption">
                                            {it.error}
                                        </Typography>
                                    )}
                                    {it.status === 'canceled' && (
                                        <Typography color="text.secondary" variant="caption">
                                            Canceled
                                        </Typography>
                                    )}
                                </Box>
                                {it.status === 'uploading' && (
                                    <IconButton onClick={() => cancelUpload(it.id)} size="small">
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                )}
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Existing URLs */}
            {(field.value ?? []).length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Uploaded
                    </Typography>

                    {showImagePreviews ? (
                        <Grid container spacing={1}>
                            {(field.value ?? []).map((url: string, idx: number) => (
                                <Grid key={url + idx} size={{ xs: 4, sm: 3, md: 2 }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            aspectRatio: '1 / 1',
                                        }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url.startsWith('http') ? url : baseUrl + url}
                                            alt={displayName(url)}
                                            title={displayName(url)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        {/* filename overlay */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                px: 0.5,
                                                py: 0.25,
                                                bgcolor: 'rgba(0,0,0,0.55)',
                                                color: 'white',
                                                fontSize: 12,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {displayName(url)}
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => removeUrlAt(idx)}
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'rgba(255,255,255,0.8)'
                                            }}
                                        >
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                            {(field.value ?? []).map((url: string, idx: number) => (
                                <Chip
                                    key={url + idx}
                                    label={displayName(url)}
                                    onDelete={() => removeUrlAt(idx)}
                                    deleteIcon={<DeleteIcon/>}
                                    sx={{ mb: 1 }}
                                />
                            ))}
                        </Stack>
                    )}

                    <Button onClick={clearAll} size="small" sx={{ mt: 1 }}>
                        Clear all
                    </Button>
                </Box>
            )}
        </Grid>
    );
}


function basenameFromUrl(url: string) {
    try {
        const clean = url.split('?')[0].split('#')[0];
        const slash = clean.lastIndexOf('/');
        return slash >= 0 ? clean.slice(slash + 1) : clean;
    } catch {
        return url;
    }
}
