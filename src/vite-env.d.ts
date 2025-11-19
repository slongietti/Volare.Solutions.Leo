/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ACCESS_CODE: string;
  readonly VITE_NANIT_EMAIL: string;
  readonly VITE_NANIT_PASSWORD: string;
  readonly VITE_PHONE_SUFFIX: string;
  readonly VITE_BABY_ID: string;
  // add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
