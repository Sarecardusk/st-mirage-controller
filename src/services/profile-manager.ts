/**
 * Profile 配置管理器
 * 负责读取和解析酒馆助手的 Profile 配置
 */

import type { ProfileConfig } from '@/type/settings';

export class ProfileManager {
  /** 列出所有可用的 Profile */
  async listProfiles(): Promise<string[]> {
    try {
      const result = await TavernHelper.triggerSlash('/profile-list');

      // 解析返回的JSON字符串数组 ["profile1", "profile2", ...]
      if (typeof result === 'string') {
        const parsed = JSON.parse(result);
        return parsed;
      }

      return [];
    } catch (error) {
      console.error('[Mirage] Failed to list profiles:', error);
      return [];
    }
  }

  /**
   * 获取指定 Profile 的配置
   * @param name Profile 名称
   */
  async getProfile(name: string): Promise<ProfileConfig | null> {
    try {
      const result = await TavernHelper.triggerSlash(`/profile-get ${name}`);

      // 解析 Profile 配置
      // 返回的是JSON
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          return this.parseProfileConfig(parsed, name);
        } catch {
          console.warn('[Mirage] Failed to parse profile JSON, trying as text');
        }
      }

      return null;
    } catch (error) {
      console.error(`[Mirage] Failed to get profile "${name}":`, error);
      return null;
    }
  }

  /**
   * 查找 Secret-apiKey
   * @param profileId getProfile返回的JSON中解析出的id键的值
   */
  async findSecret(profileId: string): Promise<string | null> {
    try {
      const result = await TavernHelper.triggerSlash(`/secret-find ${profileId}`);

      if (typeof result === 'string') {
        return result.trim();
      }

      return null;
    } catch (error) {
      console.error(`[Mirage] Failed to find secret "${profileId}":`, error);
      return null;
    }
  }

  /**
   * 解析 Profile 配置
   */
  private parseProfileConfig(data: any, name: string): ProfileConfig {
    return {
      name,
      id: data.id || data.secret_id || '',
      source: data.source || data.api_source,
      apiUrl: data.api_url || data.apiUrl,
      model: data.model,
    };
  }

  /**
   * 获取完整的 Profile 配置（包含 API Key）
   */
  async getProfileWithSecret(name: string): Promise<(ProfileConfig & { apiKey?: string }) | null> {
    const profile = await this.getProfile(name);

    if (!profile || !profile.id) {
      return profile;
    }

    // 读取 API Key
    const apiKey = await this.findSecret(profile.id);

    return {
      ...profile,
      apiKey: apiKey || undefined,
    };
  }
}

/**
 * 全局 ProfileManager 实例
 */
export const profileManager = new ProfileManager();
