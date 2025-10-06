/**
 * Mirage Controller 配置类型定义
 */

/** Profile 配置 */
export type ProfileConfig = z.infer<typeof ProfileConfig>;
export const ProfileConfig = z.object({
  /** Profile 名称 */
  name: z.string(),
  /** Profile ID - 可用`/secret-find id`获取api-key */
  id: z.string(),
  /** API 源 (openai/claude/cohere 等) */
  source: z.string().optional(),
  /** API URL */
  apiUrl: z.string().optional(),
  /** 模型名称 */
  model: z.string().optional(),
});

/** 模块通用配置 */
export type ModuleConfig = z.infer<typeof ModuleConfig>;
export const ModuleConfig = z.object({
  /** 是否启用该模块 */
  enabled: z.boolean().default(false),
  /** 该模块使用的 Profile 名称 */
  profileName: z.string().default(''),
});

/** 全局配置 */
export type GlobalConfig = z.infer<typeof GlobalConfig>;
export const GlobalConfig = z.object({
  /** 插件是否启用 */
  enabled: z.boolean().default(true),
  /** 默认 Profile - 若模块自身的 Profile 未设置，则会启用默认 Profile */
  defaultProfile: z.string().default(''),
});

/** 输入优化模块配置 - 将导出到宏`{{additionInput}}` */
export type InputEnhancementConfig = z.infer<typeof InputEnhancementConfig>;
export const InputEnhancementConfig = ModuleConfig.extend({
  /** 提示词模板 */
  promptTemplate: z.string().default(''),
  /** 最大 token 数 */
  maxTokens: z.number().default(500),
});

/** 正文润色模块配置 */
export type ContentRefinementConfig = z.infer<typeof ContentRefinementConfig>;
export const ContentRefinementConfig = ModuleConfig.extend({
  /** 正文 XML 标签名 - 为每张角色卡都独立存储标签状态 */
  contentTag: z.string().default('content'),
  /** 格式约束提示词 - 为每张角色卡都独立存储提示词状态 */
  formatPrompt: z.string().default(''),
  /** 文风约束提示词 - 为每张角色卡都独立存储提示词状态 */
  stylePrompt: z.string().default(''),
  /** 是否流式更新 */
  streamUpdate: z.boolean().default(false),
});

/** MVU 更新模块配置 */
export type MvuUpdateConfig = z.infer<typeof MvuUpdateConfig>;
export const MvuUpdateConfig = ModuleConfig.extend({
  /** 更新延迟（毫秒） */
  updateDelay: z.number().default(0),
});

/** 主配置结构 */
export type Settings = z.infer<typeof Settings>;
export const Settings = z
  .object({
    /** 全局配置 */
    global: GlobalConfig,
    /** 输入优化模块 */
    inputEnhancement: InputEnhancementConfig,
    /** 正文润色模块 */
    contentRefinement: ContentRefinementConfig,
    /** MVU 更新模块 */
    mvuUpdate: MvuUpdateConfig,

    // 保留示例字段（后续可删除）
    button_selected: z.boolean().default(false),
  })
  .prefault({
    global: {
      enabled: true,
      defaultProfile: '',
    },
    inputEnhancement: {
      enabled: false,
      profileName: '',
      promptTemplate: '',
      maxTokens: 500,
    },
    contentRefinement: {
      enabled: false,
      profileName: '',
      contentTag: 'content',
      formatPrompt: '',
      stylePrompt: '',
      streamUpdate: false,
    },
    mvuUpdate: {
      enabled: false,
      profileName: '',
      updateDelay: 0,
    },
    button_selected: false,
  });

export const setting_field = 'st_mirage_controller';
