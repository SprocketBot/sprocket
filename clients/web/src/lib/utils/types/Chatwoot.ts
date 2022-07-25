// =========================
// Our custom types
// =========================
/**
 * String labels (i.e. flags, tags) that are set on a user's conversation using `window.$chatwoot.setLabel('')`.
 * These values do *not* persist across sessions/conversations.
 */
export type ChatwootConversationLabel = "org-mle";

/**
 * Key-value pairs that are set on Chatwoot users using `window.$chatwoot.setCustomAttributes({})`.
 * These values persist across sessions/conversations.
 */
export interface ChatwootCustomAttributes {
    userId: number;
}

// =========================
// Chatwoot's types
// =========================
/** https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/packs/sdk.js#L147 */
export interface ChatwootSDK {
    run: ({websiteToken, baseUrl}: {websiteToken: string; baseUrl: string;}) => void;
}

/** https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup#set-the-user-in-the-widget */
export interface ChatwootUser {
    email?: string;
    name?: string;
    avatar_url?: string;
    phone_number?: string;
}

/** https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/packs/sdk.js#L21 */
export interface Chatwoot {
    baseUrl: string;
    hasLoaded: boolean;
    hideMessageBubble: boolean;
    isOpen: boolean;
    position: "left" | "right";
    websiteToken: string;
    locale: string;
    type: unknown;
    launcherTitle: string;
    showPopoutButon: boolean;
    widgetStyle: unknown;
    resetTriggered: boolean;
    darkMode: boolean;
    toggle: (state: unknown) => void;
    toggleBubbleVisibility: (visibility: unknown) => void;
    popoutChatWindow: () => void;
    setUser: (identifier: string, user: ChatwootUser) => void;
    setCustomAttributes: (customAttributes: Partial<ChatwootCustomAttributes>) => void;
    deleteCustomAttribute: (customAttribute: keyof ChatwootCustomAttributes) => void;
    setLabel: (label: ChatwootConversationLabel) => void;
    removeLabel: (label: ChatwootConversationLabel) => void;
    setLocale: (localeToBeUsed: string) => void;
    reset: () => void;
}
