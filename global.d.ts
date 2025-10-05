declare const hljs: typeof import('highlight.js').default;
declare const Popper: typeof import('@popperjs/core');
<<<<<<< HEAD

// WebAssembly module type definitions
declare module '*.wasm?init' {
  export default function initWasm(imports?: WebAssembly.Imports): Promise<WebAssembly.Instance>;
}

declare module '*.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
}

// Vue single file components
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
=======
>>>>>>> 18afb459c3cbd2b75317fb56615376cc0df44554
