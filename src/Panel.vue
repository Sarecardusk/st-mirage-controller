<template>
  <div class="example-extension-settings">
    <!-- 标准 top-bar 头部样式 -->
    <div class="flex-container alignItemsBaseline wide100p">
      <div class="flex1 flex-container alignItemsBaseline">
        <h3 class="margin0">
          <span data-i18n="Mirage 控制区">{{ t`Mirage 控制区` }}</span>
          <a
            href="https://github.com/Sarecardusk/st-mirage-controller?tab=readme-ov-file#st-mirage-controller"
            target="_blank"
          >
            <span class="fa-solid fa-circle-question note-link-span"></span>
          </a>
        </h3>
      </div>
      <div class="flex-container">
        <!-- 右侧功能按钮区域（可根据需要添加） -->
      </div>
    </div>

    <!-- 原有内容区域 -->
    <div class="example-extension_block flex-container">
      <input class="menu_button" type="submit" :value="t`示例按钮`" @click="handle_button_click" />
    </div>

    <div class="example-extension_block flex-container">
      <input v-model="settings.button_selected" type="checkbox" />
      <label for="example_setting">{{ t`示例开关` }}</label>
    </div>

    <hr class="sysHR" />
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
