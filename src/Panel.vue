<template>
  <div class="mirage_main-settings">
    <div class="alignitemscenter flex-container wide100p mirage_main-header">
      <h3 class="margin0 flex1">{{ t`主设置` }}</h3>
      <label class="checkbox_label flexNoGap">
        <input v-model="settings.plugin_enabled" type="checkbox" />
        <span>{{ t`启用插件` }}</span>
      </label>
      <label class="checkbox_label flexNoGap">
        <input v-model="settings.debug_mode" type="checkbox" />
        <span>{{ t`调试模式` }}</span>
      </label>
    </div>

    <hr class="sysHR" />

    <div class="inline-drawer">
      <div class="inline-drawer-toggle inline-drawer-header">
        <b>{{ t`插件示例` }}</b>
        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
      </div>
      <div class="inline-drawer-content">
        <div class="mirage_main-block flex-container">
          <input class="menu_button" type="submit" :value="t`示例按钮`" @click="handle_button_click" />
        </div>

        <div class="mirage_main-block flex-container">
          <input v-model="settings.button_selected" type="checkbox" />
          <label for="example_setting">{{ t`示例开关` }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

const { settings } = storeToRefs(useSettingsStore());

const handle_button_click = () => {
  toastr.success('你好呀!');
};
</script>

<style scoped></style>
