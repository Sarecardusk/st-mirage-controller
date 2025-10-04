# ST Mirage Controller

为简化我的预设【Mirage】的功能而衍化诞生的 SillyTavern 插件。
(大概也兼容大部分其他预设？)

此插件的具体功能将在后续文档中详细记录。

---
## 项目架构

### 技术栈

- **前端框架**: Vue 3 (Composition API)
- **状态管理**: Pinia
- **类型系统**: TypeScript
- **构建工具**: Vite
- **数据验证**: Zod
- **工具库**: VueUse
- **性能优化**: Rust + wasm-pack (WebAssembly)

### 目录结构

```
st-mirage-controller/
├── src/
│   ├── index.ts           # 插件入口
│   ├── panel.ts           # Drawer 面板初始化
│   ├── Panel.vue          # 主 Vue 组件
│   ├── global.css         # 全局样式
│   ├── composables/       # Vue 组合式函数
│   │   └── useWasm.ts     # WASM 模块加载
│   ├── store/             # Pinia 状态管理
│   │   └── settings.ts    # 设置存储（自动持久化）
│   ├── type/              # TypeScript 类型定义
│   └── util/              # 工具函数
├── rust-wasm/             # Rust WASM 模块
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs         # WASM 入口
├── types/                 # 酒馆接口类型声明
│   ├── function/          # 酒馆功能接口
│   └── iframe/            # 酒馆助手接口
├── i18n/                  # 国际化
│   └── en.json
├── dist/                  # 构建输出
├── manifest.json          # 插件配置清单
└── vite.config.ts         # Vite 构建配置
```

### 核心特性

#### 1. Drawer 集成

插件通过 [Drawer 模式](src/panel.ts#L24-L37)集成到 SillyTavern 顶部栏，在 Extensions 按钮之后添加控制按钮。点击按钮可展开/收起控制面板。

#### 2. 自动导入

通过 [`unplugin-auto-import`](vite.config.ts#L31-L42) 和 [`unplugin-vue-components`](vite.config.ts#L43-L48)，自动导入 Vue Composition API、Pinia、VueUse 等常用函数和组件，无需手动 import。

#### 3. 设置持久化

使用 [Pinia 状态管理](src/store/settings.ts)，配合 Zod 数据验证，设置会自动保存到 SillyTavern 的扩展配置中，刷新网页后自动恢复。

#### 4. 酒馆接口访问

通过 [`@sillytavern`](vite.config.ts#L49-L60) 特殊导入路径，可以直接访问 SillyTavern 内部模块和函数，无需通过 `getContext()`。

```typescript
import { uuidv4 } from '@sillytavern/scripts/utils';
import { saveSettingsDebounced } from '@sillytavern/script';
```

#### 5. WebAssembly 优化

集成 Rust + wasm-pack，针对性能关键场景提供 WASM 加速模块：

- [`rust-wasm/`](rust-wasm/src/lib.rs) - Rust 源码
- [`src/composables/useWasm.ts`](src/composables/useWasm.ts) - WASM 加载封装
- `npm run wasm:build` - 构建优化版 WASM
- `npm run dev` - 同时编译 WASM + Vite

详见 [WASM 文档](docs/WASM.md)

### 环境配置

~~其实最省劲的方法是直接使用 [Nix](https://github.com/NixOS/nix)。~~

**1. Node.js 与 pnpm**

需要 Node.js 22+ 和 pnpm。可参考[环境配置指南](https://stagedog.github.io/青空莉/工具经验/实时编写前端界面或脚本/环境准备/)。

```bash
# 安装 pnpm（如果已有 Node.js 22+）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

**2. Rust 工具链**

用于编译 WebAssembly 模块。

```bash
# 安装 Rust（通过 rustup）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 添加 wasm32 目标
rustup target add wasm32-unknown-unknown

# 安装 wasm-pack
cargo install wasm-pack

# （可选）安装 wasm-opt 进行优化
# Ubuntu/Debian:
sudo apt install binaryen
# macOS:
brew install binaryen
# 其他: https://github.com/WebAssembly/binaryen
```

本项目使用 [`rust-toolchain.toml`](rust-toolchain.toml) 指定 Rust 版本，rustup 会自动使用正确的工具链版本。

### 开发工作流

```bash
# 开发模式（自动编译 WASM + 监听文件变化）
npm run dev

# 仅构建 WASM（开发版）
npm run wasm:dev

# 仅构建 WASM（发布版，启用优化）
npm run wasm:build

# 构建插件
pnpm build

# 构建整个项目（WASM + 插件）
npm run release

# 代码检查
npm run check:all
```

## 许可证

- [Aladdin](LICENSE)
