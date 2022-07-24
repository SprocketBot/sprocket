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
    setCustomAttributes: (customAttributes: unknown) => void;
    deleteCustomAttribute: (customAttribute: string) => void;
    setLabel: (label: string) => void;
    removeLabel: (label: string) => void;
    setLocale: (localeToBeUsed: string) => void;
    reset: () => void;
}
