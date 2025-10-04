# WebAssembly 集成指南

本项目已集成 WebAssembly (WASM) 支持，使用 Rust + wasm-pack 构建高性能模块。

## 📁 项目结构

```
st-mirage-controller/
├── rust-wasm/              # Rust WASM 项目目录
│   ├── Cargo.toml          # Rust 项目配置
│   ├── src/
│   │   └── lib.rs          # Rust 源代码入口
│   └── pkg/                # wasm-pack 构建输出（自动生成，已忽略）
├── src/
│   └── composables/
│       └── useWasm.ts      # Vue Composable 封装
├── rust-toolchain.toml     # Rust 工具链配置
└── docs/
    └── WASM.md             # 本文档
```

## 🚀 快速开始

### 1. 编写 Rust 代码

在 `rust-wasm/src/lib.rs` 中添加你的 Rust 函数：

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

### 2. 构建 WASM 模块

```bash
# 开发模式（快速构建，包含调试信息）
npm run wasm:dev

# 生产模式（优化构建，体积更小）
npm run wasm:build
```

### 3. 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { useWasm } from '@/composables/useWasm'

const { isReady, error, instance, initWasm } = useWasm()

// 初始化 WASM
await initWasm()

// 调用 WASM 函数
if (isReady.value && instance.value) {
  const result = instance.value.exports.greet('World')
  console.log(result) // "Hello, World!"
  
  const sum = instance.value.exports.add(1, 2)
  console.log(sum) // 3
}
</script>
```

### 4. 直接导入 WASM（高级用法）

```typescript
// 方式 1: 自动初始化（推荐）
import init from '../rust-wasm/pkg/st_mirage_wasm.wasm?init'

const instance = await init()
instance.exports.greet('Alice')

// 方式 2: 手动控制（用于多次实例化）
import wasmUrl from '../rust-wasm/pkg/st_mirage_wasm.wasm?url'

const { instance } = await WebAssembly.instantiateStreaming(
  fetch(wasmUrl)
)
instance.exports.add(5, 3)
```

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run wasm:dev` | 开发模式构建 WASM（快速，带调试） |
| `npm run wasm:build` | 生产模式构建 WASM（优化，体积小） |
| `npm run dev` | 构建 WASM + 启动开发服务器 |
| `npm run release` | 构建 WASM + 打包生产版本 |

## 🎯 开发工作流

### 日常开发

1. 修改 Rust 代码 (`rust-wasm/src/lib.rs`)
2. 运行 `npm run wasm:dev` 重新构建
3. 刷新浏览器查看效果

### 一键开发模式

```bash
npm run dev
```

此命令会：
1. 构建 WASM（开发模式）
2. 启动 Vite 开发服务器（监听模式）

### 生产构建

```bash
npm run release
```

此命令会：
1. 构建 WASM（优化模式）
2. 打包整个项目到 `dist/`

## 🔧 配置说明

### Rust 工具链 (`rust-toolchain.toml`)

```toml
[toolchain]
channel = "stable"                    # 使用稳定版 Rust
targets = ["wasm32-unknown-unknown"]  # WASM 编译目标
components = ["rustfmt", "rust-src"]  # 额外组件
```

### Cargo 配置 (`rust-wasm/Cargo.toml`)

```toml
[lib]
crate-type = ["cdylib"]  # 编译为动态库

[dependencies]
wasm-bindgen = "0.2"     # JS 绑定核心库
```

### TypeScript 类型支持

项目已配置 WASM 模块的 TypeScript 类型定义：

- `*.wasm?init`: 自动初始化函数
- `*.wasm?url`: WASM 文件 URL

类型定义位于 `global.d.ts`。

## 🎨 最佳实践

### 1. 类型安全

使用 `#[wasm_bindgen]` 导出的函数会自动生成 TypeScript 类型定义：

```rust
#[wasm_bindgen]
pub fn process_data(input: &str) -> String {
    // 实现
}
```

TypeScript 中会有完整的类型提示。

### 2. 错误处理

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn safe_divide(a: f64, b: f64) -> Result<f64, JsValue> {
    if b == 0.0 {
        Err(JsValue::from_str("Division by zero"))
    } else {
        Ok(a / b)
    }
}
```

### 3. 复杂数据类型

```rust
use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct User {
    pub name: String,
    pub age: u32,
}

#[wasm_bindgen]
pub fn create_user(name: String, age: u32) -> JsValue {
    let user = User { name, age };
    serde_wasm_bindgen::to_value(&user).unwrap()
}
```

需要在 `Cargo.toml` 添加依赖：

```toml
[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6"
```

## 🐛 调试技巧

### 1. 启用 Panic Hook

在 `Cargo.toml` 添加：

```toml
[dependencies]
console_error_panic_hook = "0.1"
```

在 `lib.rs` 中使用：

```rust
#[cfg(feature = "console_error_panic_hook")]
pub use console_error_panic_hook::set_once as set_panic_hook;
```

### 2. 日志输出

使用 `web_sys::console::log_1`：

```rust
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn debug_function() {
    console::log_1(&"Debug message".into());
}
```

## ⚡ 性能优化

### 1. Release 构建优化

在 `rust-wasm/Cargo.toml` 添加：

```toml
[profile.release]
opt-level = "z"     # 优化体积
lto = true          # 链接时优化
codegen-units = 1   # 更好的优化（但编译慢）
```

### 2. 减小 WASM 体积

```bash
# 使用 wasm-opt 工具进一步优化
wasm-opt -Oz -o output.wasm input.wasm
```

## 📚 参考资源

- [Rust and WebAssembly Book](https://rustwasm.github.io/docs/book/)
- [wasm-bindgen Guide](https://rustwasm.github.io/wasm-bindgen/)
- [wasm-pack Documentation](https://rustwasm.github.io/wasm-pack/)
- [Vite WASM Support](https://vitejs.dev/guide/features.html#webassembly)

## ❓ 常见问题

### Q: 修改 Rust 代码后没有生效？

A: 需要重新运行 `npm run wasm:dev` 构建 WASM 模块。

### Q: TypeScript 报错找不到 WASM 模块？

A: 确保已经运行过 `npm run wasm:dev` 生成 `pkg/` 目录。

### Q: 如何在 SSR 环境使用？

A: Vite 的 WASM 支持在 Node.js 环境下也能工作，但需要确保使用 `?url` 导入方式。

### Q: WASM 文件太大怎么办？

A: 
1. 使用 `npm run wasm:build` 生产构建
2. 在 `Cargo.toml` 配置 release 优化
3. 使用 `wasm-opt` 工具进一步压缩

## 🎉 总结

本项目使用 Vite 原生 WASM 支持，无需额外插件，配置简单且性能优异。通过 Rust 编写高性能模块，在 Vue 中无缝调用，享受类型安全和现代化开发体验！