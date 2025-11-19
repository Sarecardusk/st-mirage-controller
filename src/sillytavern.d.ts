declare module '@sillytavern/script' {
  export const saveSettingsDebounced: () => void;
}

declare module '@sillytavern/scripts/extensions' {
  export const extension_settings: Record<string, any>;
}
