<template>
  <div class="mirage-controller-container flex-container">
    <div class="alignitemscenter flex-container wide100p">
      <h3 class="margin0 flex1">
        <span>{{ t`Mirage Controller` }}</span>
      </h3>
      <div class="menu_button menu_button_icon interactable" tabindex="0" role="button" @click="handle_button_click">
        <i class="fa-solid fa-diagram-project"></i>
        <span>{{ t`示例按钮` }}</span>
      </div>
    </div>

    <hr class="wide100p margin0" />

    <div class="alignitemsflexstart flex-container wide100p">
      <div class="flex-container alignitemscenter">
        <label for="mirage_example_setting" class="checkbox_label flexNoGap">
          <input id="mirage_example_setting" v-model="settings.button_selected" type="checkbox" />
          <span>{{ t`示例开关` }}</span>
        </label>
      </div>
    </div>

    <!-- Router View for future pages -->
    <router-view />
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
