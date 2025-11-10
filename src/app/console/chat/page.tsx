'use client';

import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useSnackbar } from 'notistack';

import { useUserContext } from '@/contexts/UserContext';
import { useChatRooms, useChatMessages, useCreateChat, sendChatMessage } from '@/lib/hooks/useChat';
import { useChatSocket } from '@/lib/hooks/useChatSocket';
import type { ChatMessage, ChatRoomSummary } from '@/lib/chat/types';
import { fetcher } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import { useSearchParams } from 'next/navigation';
import { useOrganizationsCatalog, OrganizationCatalogEntry, OrganizationOpportunityOption } from '@/lib/hooks/useOrganizationsCatalog';

function formatTimestamp(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const sameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    return sameDay
        ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
        : new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        }).format(date);
}

function resolveFileUrl(url: string) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
    return `${base}${url}`;
}

function ChatRoomList({
    rooms,
    selected,
    onSelect,
    isLoading,
    onCreate,
}: {
    rooms: ChatRoomSummary[];
    selected: string | null;
    onSelect: (roomId: string) => void;
    isLoading: boolean;
    onCreate: () => void;
}) {
    const sorted = useMemo(() => {
        return [...rooms].sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [rooms]);

    return (
        <Paper
            elevation={0}
            sx={{
                width: { xs: '100%', md: 320 },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: { xs: 420, md: 'calc(100vh - 220px)' },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatOutlinedIcon fontSize="small" /> Conversations
                </Typography>
                <Tooltip title="Start a new conversation">
                    <span>
                        <IconButton size="small" color="primary" onClick={onCreate}>
                            <AddCommentIcon fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
            <Divider />
            {isLoading ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : sorted.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                    <Typography color="text.secondary" align="center">
                        No conversations yet.
                        <br />
                        Start one to begin chatting.
                    </Typography>
                </Box>
            ) : (
                <List sx={{ flex: 1, overflowY: 'auto' }} disablePadding>
                    {sorted.map(room => {
                        const isSelected = room.id === selected;
                        const label = room.user?.username ?? room.user?.email ?? room.opportunityIri;
                        return (
                            <ListItemButton
                                key={room.id}
                                selected={isSelected}
                                onClick={() => onSelect(room.id)}
                                sx={{ alignItems: 'flex-start', py: 1.5, gap: 1 }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" noWrap>
                                            {label}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {room.lastMessage ?? 'No messages yet'}
                                        </Typography>
                                    }
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', mt: 0.5 }}>
                                    {formatTimestamp(room.lastMessageAt)}
                                </Typography>
                            </ListItemButton>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
    const background = isOwn ? 'primary.main' : 'background.paper';
    const color = isOwn ? 'primary.contrastText' : 'text.primary';

    return (
        <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
            <Paper
                elevation={0}
                sx={{
                    maxWidth: '80%',
                    px: 2,
                    py: 1.25,
                    bgcolor: background,
                    color,
                    borderRadius: 2,
                    borderTopRightRadius: isOwn ? 2 : 6,
                    borderTopLeftRadius: isOwn ? 6 : 2,
                    border: isOwn ? 'none' : '1px solid',
                    borderColor: isOwn ? 'transparent' : 'divider',
                }}
            >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {isOwn ? 'You' : message.sender}
                </Typography>
                {message.text && (
                    <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5 }}
                    >
                        {message.text}
                    </Typography>
                )}
                {message.fileUrl && (
                    <Button
                        size="small"
                        component="a"
                        href={resolveFileUrl(message.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        variant={isOwn ? 'outlined' : 'text'}
                        sx={{ mt: 1, color: isOwn ? 'inherit' : 'primary.main' }}
                    >
                        Download attachment
                    </Button>
                )}
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 1 }}>
                    {formatTimestamp(message.timestamp)}
                </Typography>
            </Paper>
        </Box>
    );
}

function NewChatDialog({
    open,
    onClose,
    onCreated,
}: {
    open: boolean;
    onClose: () => void;
    onCreated: (room: ChatRoomSummary) => void;
}) {
    const { organizations, isLoading: loadingOrganizations } = useOrganizationsCatalog();
    const [organizationOption, setOrganizationOption] = useState<OrganizationCatalogEntry | null>(null);
    const [organizationInput, setOrganizationInput] = useState('');
    const [opportunityOption, setOpportunityOption] = useState<OrganizationOpportunityOption | null>(null);
    const [opportunityInput, setOpportunityInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { trigger, isMutating } = useCreateChat();

    const opportunityOptions = useMemo(() => organizationOption?.opportunities ?? [], [organizationOption]);

    useEffect(() => {
        setOpportunityOption(null);
        setOpportunityInput('');
    }, [organizationOption?.iri]);

    useEffect(() => {
        if (!open) {
            setOrganizationOption(null);
            setOrganizationInput('');
            setOpportunityOption(null);
            setOpportunityInput('');
            setError(null);
        }
    }, [open]);

    const resolvedOrganizationIri = (organizationOption?.iri ?? organizationInput).trim();
    const resolvedOpportunityIri = (opportunityOption?.iri ?? opportunityInput).trim();

    const handleSubmit = async (event?: FormEvent) => {
        event?.preventDefault();
        setError(null);
        const payload = {
            opportunityIri: resolvedOpportunityIri,
            organizationIri: resolvedOrganizationIri,
        };

        if (!payload.opportunityIri || !payload.organizationIri) {
            setError('Both fields are required.');
            return;
        }

        try {
            const result = await trigger(payload);
            if (result?.room) {
                onCreated(result.room);
                setOrganizationOption(null);
                setOrganizationInput('');
                setOpportunityOption(null);
                setOpportunityInput('');
                onClose();
            }
        } catch (err: unknown) {
            const message = err instanceof FetcherError ? err.message : 'Unable to create chat.';
            setError(message);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit}>
            <DialogTitle>Start a new chat</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Autocomplete<OrganizationCatalogEntry, false, false, true>
                        options={organizations}
                        loading={loadingOrganizations}
                        value={organizationOption}
                        onChange={(_, newValue) => {
                            if (typeof newValue === 'string') {
                                setOrganizationOption(null);
                                setOrganizationInput(newValue);
                                return;
                            }
                            setOrganizationOption(newValue);
                            setOrganizationInput(newValue?.iri ?? '');
                        }}
                        inputValue={organizationInput}
                        onInputChange={(_, newInput) => setOrganizationInput(newInput)}
                        getOptionLabel={option =>
                            typeof option === 'string' ? option : option.name ?? option.iri
                        }
                        isOptionEqualToValue={(option, value) =>
                            typeof value !== 'string' && option.iri === value.iri
                        }
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Organization"
                                placeholder="Search organizations or paste IRI"
                                required
                            />
                        )}
                        loadingText="Loading organizations..."
                        noOptionsText={
                            organizationInput.trim()
                                ? 'No matching organizations. Paste IRI to continue.'
                                : 'No organizations available.'
                        }
                    />
                    <Autocomplete<OrganizationOpportunityOption, false, false, true>
                        options={opportunityOptions}
                        loading={loadingOrganizations}
                        value={opportunityOption}
                        onChange={(_, newValue) => {
                            if (typeof newValue === 'string') {
                                setOpportunityOption(null);
                                setOpportunityInput(newValue);
                                return;
                            }
                            setOpportunityOption(newValue);
                            setOpportunityInput(newValue?.iri ?? '');
                        }}
                        inputValue={opportunityInput}
                        onInputChange={(_, newInput) => setOpportunityInput(newInput)}
                        getOptionLabel={option =>
                            typeof option === 'string' ? option : option.name ?? option.iri
                        }
                        isOptionEqualToValue={(option, value) =>
                            typeof value !== 'string' && option.iri === value.iri
                        }
                        freeSolo
                        renderInput={params => (
                            <TextField
                                {...params}
                                label="Opportunity"
                                placeholder={
                                    organizationOption
                                        ? 'Select an opportunity or paste IRI'
                                        : 'Select an organization first or paste IRI'
                                }
                                required
                                helperText={
                                    organizationOption && opportunityOptions.length === 0
                                        ? 'This organization has no opportunities yet. Paste an IRI to continue.'
                                        : undefined
                                }
                            />
                        )}
                        loadingText="Loading opportunities..."
                        noOptionsText={
                            opportunityInput.trim()
                                ? 'No matching opportunities. Paste IRI to continue.'
                                : organizationOption
                                    ? 'No opportunities found for this organization.'
                                    : 'Select an organization to view its opportunities.'
                        }
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        if (isMutating) return;
                        setOrganizationOption(null);
                        setOrganizationInput('');
                        setOpportunityOption(null);
                        setOpportunityInput('');
                        setError(null);
                        onClose();
                    }}
                    disabled={isMutating}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isMutating || !resolvedOpportunityIri || !resolvedOrganizationIri}
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ChatPage() {
    const { username } = useUserContext();
    const { enqueueSnackbar } = useSnackbar();
    const { rooms, isLoading: loadingRooms, mutate: mutateRooms } = useChatRooms();
    const searchParams = useSearchParams();
    const roomQueryParam = searchParams?.get('room');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomQueryParam);
    const [newChatOpen, setNewChatOpen] = useState(false);

    const {
        messages: fetchedMessages,
        isLoading: loadingMessages,
        mutate: mutateMessages,
    } = useChatMessages(selectedRoomId, { limit: 100 });

    const [messageList, setMessageList] = useState<ChatMessage[]>(fetchedMessages);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMessageList(prev => (prev === fetchedMessages ? prev : fetchedMessages));
    }, [fetchedMessages]);

    useEffect(() => {
        if (roomQueryParam && roomQueryParam !== selectedRoomId) {
            setSelectedRoomId(roomQueryParam);
            return;
        }
        if (!roomQueryParam && !selectedRoomId && rooms.length > 0) {
            setSelectedRoomId(rooms[0].id);
        }
    }, [roomQueryParam, rooms, selectedRoomId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageList.length]);

    const appendMessage = useCallback((payload: ChatMessage) => {
        setMessageList(prev => {
            if (prev.some(item => item.id === payload.id)) return prev;
            return [...prev, payload];
        });
    }, []);

    const handleHistory = useCallback((history: ChatMessage[]) => {
        setMessageList(history);
    }, []);

    const handleIncomingMessage = useCallback(
        (payload: ChatMessage) => {
            appendMessage(payload);
            mutateRooms();
        },
        [appendMessage, mutateRooms],
    );

    const handleSocketError = useCallback(
        (message: string) => {
            enqueueSnackbar(message, { variant: 'error' });
        },
        [enqueueSnackbar],
    );

    const { isConnected } = useChatSocket(selectedRoomId, {
        onHistory: handleHistory,
        onMessage: handleIncomingMessage,
        onError: handleSocketError,
    });

    const selectedRoom = useMemo(
        () => rooms.find(room => room.id === selectedRoomId) ?? null,
        [rooms, selectedRoomId],
    );

    const handleSendMessage = useCallback(async () => {
        if (!selectedRoomId) {
            enqueueSnackbar('Select a conversation before sending a message.', { variant: 'warning' });
            return;
        }
        const text = inputValue.trim();
        if (!text) return;

        setIsSending(true);
        try {
            const message = await sendChatMessage(selectedRoomId, { text });
            appendMessage(message);
            setInputValue('');
            await mutateMessages();
            await mutateRooms();
        } catch (err: unknown) {
            const message = err instanceof FetcherError ? err.message : 'Unable to send message.';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setIsSending(false);
        }
    }, [appendMessage, enqueueSnackbar, inputValue, mutateMessages, mutateRooms, selectedRoomId]);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void handleSendMessage();
        },
        [handleSendMessage],
    );

    const handleFileUpload = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;

            if (!selectedRoomId) {
                enqueueSnackbar('Select a conversation before uploading files.', { variant: 'warning' });
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            setIsSending(true);
            try {
                const upload = await fetcher<{ url: string }>('/api/uploads/files', {
                    method: 'POST',
                    body: formData,
                });

                if (!upload?.url) {
                    throw new Error('Upload did not return a file URL.');
                }

                const message = await sendChatMessage(selectedRoomId, { fileUrl: upload.url });
                appendMessage(message);
                await mutateMessages();
                await mutateRooms();
            } catch (err: unknown) {
                const message = err instanceof FetcherError ? err.message : 'Unable to upload file.';
                enqueueSnackbar(message, { variant: 'error' });
            } finally {
                setIsSending(false);
            }
        },
        [appendMessage, enqueueSnackbar, mutateMessages, mutateRooms, selectedRoomId],
    );

    const handleNewChatCreated = useCallback(
        (room: ChatRoomSummary) => {
            enqueueSnackbar('Chat created.', { variant: 'success' });
            mutateRooms();
            setSelectedRoomId(room.id);
        },
        [enqueueSnackbar, mutateRooms],
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <ChatRoomList
                rooms={rooms}
                selected={selectedRoomId}
                onSelect={setSelectedRoomId}
                isLoading={loadingRooms}
                onCreate={() => setNewChatOpen(true)}
            />

            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    minHeight: { xs: 420, md: 'calc(100vh - 220px)' },
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {selectedRoom ? (
                    <>
                        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {selectedRoom.user?.username ?? selectedRoom.user?.email ?? 'Chat'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Opportunity: {selectedRoom.opportunityIri}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Organization: {selectedRoom.organizationIri}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {isConnected ? 'Connected' : 'Connecting...'}
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
                            {loadingMessages && messageList.length === 0 ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : messageList.length === 0 ? (
                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography color="text.secondary" align="center">
                                        No messages yet.
                                        <br />
                                        Say hello to get started.
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1.5}>
                                    {messageList.map(message => (
                                        <MessageBubble
                                            key={message.id}
                                            message={message}
                                            isOwn={Boolean(username && message.sender === username)}
                                        />
                                    ))}
                                    <div ref={bottomRef} />
                                </Stack>
                            )}
                        </Box>
                        <Divider />
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                            <Tooltip title="Attach file">
                                <span>
                                    <IconButton onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                                        <AttachFileIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <TextField
                                fullWidth
                                placeholder="Type a message"
                                value={inputValue}
                                onChange={event => setInputValue(event.target.value)}
                                disabled={isSending}
                                multiline
                                minRows={1}
                                maxRows={4}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                endIcon={<SendIcon />}
                                disabled={isSending || !inputValue.trim()}
                            >
                                Send
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, p: 4 }}>
                        <ChatOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
                        <Typography variant="h6" color="text.secondary" align="center">
                            Select a conversation to begin chatting.
                        </Typography>
                        <Button variant="contained" onClick={() => setNewChatOpen(true)} startIcon={<AddCommentIcon />}>
                            Start a new chat
                        </Button>
                    </Box>
                )}
            </Paper>

            <NewChatDialog
                open={newChatOpen}
                onClose={() => setNewChatOpen(false)}
                onCreated={handleNewChatCreated}
            />
        </Box>
    );
}
