declare namespace NodeJS {
  interface ProcessEnv {
    /** set by electron-vite in development: URL of the renderer dev server */
    ELECTRON_RENDERER_URL?: string;
  }
}
