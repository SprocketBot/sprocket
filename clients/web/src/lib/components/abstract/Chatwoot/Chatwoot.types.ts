// =========================
// Our custom types
// =========================
/**
 * String labels (i.e. flags, tags) that are set on a user's conversation using `window.$chatwoot.setLabel('')`.
 * These values do *not* persist across sessions/conversations.
 */
export type ChatwootConversationLabel = 'org-mle';

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
/** https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup/#sdk-settings */
export interface ChatwootSettings {
  showPopoutButton: boolean;
  hideMessageBubble: boolean;
  position: 'left' | 'right';
  locale: string;
  type: 'standard' | 'expanded_bubble';
  darkMode: 'light' | 'auto';
}

/** https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/packs/sdk.js#L147 */
export interface ChatwootSDK {
  run: ({ websiteToken, baseUrl }: { websiteToken: string; baseUrl: string }) => void;
}

/** https://www.chatwoot.com/docs/product/channels/live-chat/sdk/setup/#identity-validation-using-hmac */
export interface ChatwootUser {
  name?: string;
  avatar_url?: string;
  email?: string;
  identifier_hash?: string;
  phone_number?: string;
  description?: string;
  country_code?: string;
  city?: string;
  company_name?: string;
  social_profiles?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    github?: string;
  };
}

/** https://github.com/chatwoot/chatwoot/blob/develop/app/javascript/packs/sdk.js#L21 */
export interface ChatwootGlobal {
  baseUrl: string;
  hasLoaded: boolean;
  hideMessageBubble: boolean;
  isOpen: boolean;
  position: 'left' | 'right';
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
