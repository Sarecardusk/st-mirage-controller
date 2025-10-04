declare const hljs: typeof import('highlight.js').default;
declare const Popper: typeof import('@popperjs/core');

// WebAssembly module type definitions
declare module '*.wasm?init' {
  export default function initWasm(imports?: WebAssembly.Imports): Promise<WebAssembly.Instance>;
}

declare module '*.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
}
