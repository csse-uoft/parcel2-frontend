import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { fetcher, postJSON } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';
import type {
    ChatMessage,
    ChatRoomSummary,
    CreateChatPayload,
    SendChatMessagePayload,
} from '@/lib/chat/types';

const EMPTY_ROOMS: ChatRoomSummary[] = [];
const EMPTY_MESSAGES: ChatMessage[] = [];

export function useChatRooms() {
    const { data, error, isLoading, mutate } = useSWR<{ items: ChatRoomSummary[] }, FetcherError>(
        '/api/chats',
        fetcher,
        {
            revalidateOnFocus: true,
        },
    );

    const rooms = data?.items ?? EMPTY_ROOMS;

    return {
        rooms,
        isLoading,
        error,
        mutate,
    };
}

export function useChatMessages(roomId: string | null, { limit }: { limit?: number } = {}) {
    const query = limit ? `?limit=${limit}` : '';
    const key = roomId ? `/api/chats/${roomId}/messages${query}` : null;

    const { data, error, isLoading, mutate } = useSWR<{ items: ChatMessage[] }, FetcherError>(
        key,
        fetcher,
        {
            revalidateOnFocus: false,
        },
    );

    const messages = data?.items ?? EMPTY_MESSAGES;

    return {
        messages,
        isLoading,
        error,
        mutate,
    };
}

export function useCreateChat() {
    return useSWRMutation<{ room: ChatRoomSummary }, FetcherError, string, CreateChatPayload>(
        '/api/chats',
        (url, { arg }) => postJSON(url, { arg }),
    );
}

export async function sendChatMessage(roomId: string, payload: SendChatMessagePayload) {
    const result = await postJSON<{ message: ChatMessage }>(`/api/chats/${roomId}/messages`, {
        arg: payload,
    });
    return result.message;
}
