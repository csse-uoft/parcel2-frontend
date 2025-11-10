export interface ChatRoomSummary {
    id: string;
    opportunityIri: string;
    organizationIri: string;
    userId: string;
    lastMessage: string | null;
    lastMessageSender: string | null;
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        username?: string;
        email?: string;
        organizationIRI?: string | null;
    };
}

export interface ChatMessage {
    id: string;
    room: string;
    roomId: string;
    sender: string;
    senderId: string;
    text: string | null;
    fileUrl: string | null;
    timestamp: string;
}

export interface CreateChatPayload {
    opportunityIri: string;
    organizationIri: string;
}

export interface SendChatMessagePayload {
    text?: string | null;
    fileUrl?: string | null;
}
