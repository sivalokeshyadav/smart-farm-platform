/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_PILOT_DISTRICT?: string;
  readonly VITE_PILOT_STATE?: string;
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_DEFAULT_LANGUAGE?: string;
  readonly VITE_HELPLINE_NUMBER?: string;
  readonly VITE_KVK_PHONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
