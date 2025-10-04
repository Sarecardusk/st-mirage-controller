import { ref } from 'vue';

export function useWasm() {
  const isReady = ref(false);
  const error = ref<Error | null>(null);
  const instance = ref<WebAssembly.Instance | null>(null);

  async function initWasm() {
    try {
      // 导入 WASM 模块（wasm-pack 构建后会生成）
      const { default: init } = await import('../../rust-wasm/pkg/st_mirage_wasm.wasm?init');
      const wasmInstance = await init();
      instance.value = wasmInstance;
      isReady.value = true;
    } catch (e) {
      error.value = e as Error;
      console.error('Failed to initialize WASM:', e);
    }
  }

  return {
    isReady,
    error,
    instance,
    initWasm,
  };
}
