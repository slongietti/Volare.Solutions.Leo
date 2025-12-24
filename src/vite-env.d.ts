/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NANIT_ACCOUNTS: string;
  readonly VITE_BABY_ID: string;
  // add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
