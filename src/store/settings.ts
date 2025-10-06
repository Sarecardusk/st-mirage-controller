import { setting_field, Settings } from '@/type/settings';
import { validateInplace } from '@/util/zod';
import { saveSettingsDebounced } from '@sillytavern/script';
import { extension_settings } from '@sillytavern/scripts/extensions';

export const useSettingsStore = defineStore('settings', () => {
  // 尝试加载现有设置，如果验证失败则使用默认值
  let initialSettings;
  try {
    const existingSettings = _.get(extension_settings, setting_field);
    initialSettings = validateInplace(Settings, existingSettings);
  } catch (error) {
    console.warn('[Mirage] 无法验证现有设置，使用默认值:', error);
    // 使用 undefined 触发 prefault 默认值
    initialSettings = Settings.parse(undefined);
    // 清除旧的无效数据
    _.set(extension_settings, setting_field, initialSettings);
    saveSettingsDebounced();
  }

  const settings = ref(initialSettings);

  watch(
    settings,
    new_settings => {
      _.set(extension_settings, setting_field, toRaw(new_settings)); // 用 toRaw 去除 proxy 层
      saveSettingsDebounced();
    },
    { deep: true },
  );
  return {
    settings,
  };
});
