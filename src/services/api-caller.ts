/**
 * API 调用器
 * 支持 OpenAI 兼容（DeepSeek）和 Gemini AI Studio
 */

import { profileManager } from './profile-manager';

/**
 * API 任务类型
 */
export enum ApiTaskType {
  /** 聊天任务 */
  Chat = 'chat',
  /** 向量化任务 */
  Embeddings = 'embeddings',
  /** 向量重排任务 */
  Rerank = 'rerank',
}

export interface GenerateOptions {
  /** 提示词内容 */
  prompt: string;
  /** Profile 名称 */
  profileName: string;
  /** 任务类型（默认为聊天） */
  taskType?: ApiTaskType;
  /** 系统提示词（可选） */
  systemPrompt?: string;
  /** 最大 token 数（可选） */
  maxTokens?: number;
  /** 温度参数（可选） */
  temperature?: number;
}

export interface GenerateResult {
  /** 生成的文本 */
  text: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * API 调用器类
 */
export class ApiCaller {
  /**
   * 生成文本（完全异步）
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    try {
      // 获取 Profile 配置
      const profile = await profileManager.getProfileWithSecret(options.profileName);

      if (!profile) {
        throw new Error(`Profile "${options.profileName}" 未找到`);
      }

      if (!profile.apiKey) {
        throw new Error(`Profile "${options.profileName}" 未配置 API Key`);
      }

      // 根据 API 源调用对应的方法
      const source = (profile.source || 'openai').toLowerCase();

      switch (source) {
        case 'gemini':
        case 'google':
          return await this.callGemini(profile, options);

        case 'openai':
        case 'deepseek':
        default:
          // 默认使用 OpenAI 兼容 API
          return await this.callOpenAICompatible(profile, options);
      }
    } catch (error) {
      console.error('[Mirage] 生成失败:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 构建 OpenAI 兼容 API 的完整 URL
   * 根据任务类型自动补全正确的后缀
   */
  private buildOpenAICompatibleUrl(baseUrl: string, taskType: ApiTaskType): string {
    // 确保 baseUrl 以 /v1 结尾
    let normalizedUrl = baseUrl.trim();

    // 移除末尾的斜杠
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }

    // 确保基础 URL 以 /v1 结尾
    if (!normalizedUrl.endsWith('/v1')) {
      if (normalizedUrl.includes('/v1/')) {
        // 如果 URL 中已经包含 /v1/，截取到 /v1
        normalizedUrl = normalizedUrl.substring(0, normalizedUrl.indexOf('/v1') + 3);
      } else {
        // 否则添加 /v1
        normalizedUrl += '/v1';
      }
    }

    // 根据任务类型添加正确的后缀
    switch (taskType) {
      case ApiTaskType.Embeddings:
        return `${normalizedUrl}/embeddings`;
      case ApiTaskType.Rerank:
        return `${normalizedUrl}/rerank`;
      case ApiTaskType.Chat:
      default:
        return `${normalizedUrl}/chat/completions`;
    }
  }

  /**
   * OpenAI 兼容 API 调用（支持 DeepSeek 等）
   */
  private async callOpenAICompatible(
    profile: { apiUrl?: string; apiKey?: string; model?: string },
    options: GenerateOptions,
  ): Promise<GenerateResult> {
    if (!profile.apiKey) {
      throw new Error('API Key 未配置');
    }
    const taskType = options.taskType || ApiTaskType.Chat;
    const baseUrl = profile.apiUrl || 'https://api.deepseek.com/v1';
    const apiUrl = this.buildOpenAICompatibleUrl(baseUrl, taskType);
    const model = profile.model || 'deepseek-chat';

    const messages: Array<{ role: string; content: string }> = [];

    // 添加系统提示词
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    // 添加用户提示词
    messages.push({ role: 'user', content: options.prompt });

    console.log(`[Mirage] 调用 OpenAI 兼容 API: ${apiUrl}`);

    // 发起异步请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profile.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature ?? 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI 兼容 API 错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      success: true,
    };
  }

  /**
   * Gemini AI Studio API 调用
   */
  private async callGemini(
    profile: { apiUrl?: string; apiKey?: string; model?: string },
    options: GenerateOptions,
  ): Promise<GenerateResult> {
    if (!profile.apiKey) {
      throw new Error('API Key 未配置');
    }
    const model = profile.model || 'gemini-2.5-flash';
    const baseUrl = profile.apiUrl || 'https://generativelanguage.googleapis.com/v1beta';
    const apiUrl = `${baseUrl}/models/${model}:generateContent?key=${profile.apiKey}`;

    // 构建 Gemini 请求体
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Gemini 的系统提示词需要放在 systemInstruction 字段
    const requestBody: {
      contents: typeof contents;
      systemInstruction?: { parts: Array<{ text: string }> };
      generationConfig?: {
        maxOutputTokens?: number;
        temperature?: number;
      };
    } = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }],
        },
      ],
    };

    // 添加系统提示词
    if (options.systemPrompt) {
      requestBody.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    // 添加生成配置
    if (options.maxTokens || options.temperature !== undefined) {
      requestBody.generationConfig = {};
      if (options.maxTokens) {
        requestBody.generationConfig.maxOutputTokens = options.maxTokens;
      }
      if (options.temperature !== undefined) {
        requestBody.generationConfig.temperature = options.temperature;
      }
    }

    console.log(`[Mirage] 调用 Gemini API: ${apiUrl.replace(/key=[^&]+/, 'key=***')}`);

    // 发起异步请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API 错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text,
      success: true,
    };
  }

  /**
   * 带重试的生成
   */
  async generateWithRetry(
    options: GenerateOptions,
    maxRetries: number = 3,
    retryDelay: number = 1000,
  ): Promise<GenerateResult> {
    let lastError: string | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        console.log(`[Mirage] 重试第 ${attempt + 1}/${maxRetries} 次`);
        await this.delay(retryDelay);
      }

      const result = await this.generate(options);

      if (result.success) {
        return result;
      }

      lastError = result.error;
    }

    return {
      text: '',
      success: false,
      error: `重试 ${maxRetries} 次后仍然失败。最后错误: ${lastError}`,
    };
  }

  /**
   * 延迟辅助函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 全局 ApiCaller 实例
 */
export const apiCaller = new ApiCaller();
