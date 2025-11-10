'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { fetcher } from '@/lib/fetcher';
import type { ChatMessage } from '@/lib/chat/types';

type SocketHandlers = {
    onHistory?: (messages: ChatMessage[]) => void;
    onMessage?: (message: ChatMessage) => void;
    onError?: (message: string) => void;
};

export function useChatSocket(roomId: string | null, handlers: SocketHandlers) {
    const socketRef = useRef<Socket | null>(null);
    const handlersRef = useRef<SocketHandlers>(handlers);
    const [isConnected, setConnected] = useState(false);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (socketRef.current) return;

        let canceled = false;

        const connect = async () => {
            try {
                const session = await fetcher<{ token?: string }>('/api/auth/session/extend', {
                    method: 'POST',
                });
                if (canceled) return;

                const token = session?.token;
                if (!token) {
                    handlersRef.current.onError?.('Unable to obtain chat session token.');
                    return;
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE;
                const socket = io(baseUrl ?? undefined, {
                    transports: ['websocket'],
                    withCredentials: true,
                    auth: { token },
                });

                socketRef.current = socket;

                const handleConnect = () => setConnected(true);
                const handleDisconnect = () => setConnected(false);
                const handleHistory = (payload: ChatMessage[]) => handlersRef.current.onHistory?.(payload);
                const handleMessage = (payload: ChatMessage) => handlersRef.current.onMessage?.(payload);
                const handleError = (payload: { message?: string }) =>
                    handlersRef.current.onError?.(payload?.message ?? 'Chat error');
                const handleConnectError = (err: Error) =>
                    handlersRef.current.onError?.(err?.message ?? 'Chat connection failed');

                socket.on('connect', handleConnect);
                socket.on('disconnect', handleDisconnect);
                socket.on('chat history', handleHistory);
                socket.on('chat message', handleMessage);
                socket.on('chat error', handleError);
                socket.on('connect_error', handleConnectError);
            } catch (error: any) {
                if (!canceled) {
                    handlersRef.current.onError?.(error?.message ?? 'Unable to connect to chat.');
                }
            }
        };

        connect();

        return () => {
            canceled = true;
            const socket = socketRef.current;
            if (socket) {
                socket.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket || !roomId) return;

        const join = () => socket.emit('join room', { roomId });

        if (socket.connected) {
            join();
        } else {
            socket.once('connect', join);
        }

        return () => {
            socket.off('connect', join);
        };
    }, [roomId]);

    return { isConnected };
}
