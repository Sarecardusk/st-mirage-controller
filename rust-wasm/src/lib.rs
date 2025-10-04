use wasm_bindgen::prelude::*;

// 当 wasm_bindgen 功能启用时，提供更好的错误消息
#[cfg(feature = "console_error_panic_hook")]
pub use console_error_panic_hook::set_once as set_panic_hook;

// 添加 Rust 函数，并使用 #[wasm_bindgen] 导出给 JavaScript
