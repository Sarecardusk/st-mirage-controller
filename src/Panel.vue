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

    <!-- API 测试区域 -->
    <div class="example-extension_block">
      <h4>API 测试</h4>

      <!-- Profile 选择 -->
      <div class="flex-container flexFlowColumn alignItemsStart wide100p marginBot10">
        <div class="flex-container alignItemsCenter wide100p marginBot5">
          <label class="flex1">选择 Profile: </label>
          <button
            class="menu_button menu_button_icon"
            :disabled="isLoadingProfiles"
            @click="loadProfiles"
            title="刷新 Profile 列表"
          >
            <i class="fa-solid" :class="isLoadingProfiles ? 'fa-spinner fa-spin' : 'fa-refresh'"></i>
          </button>
        </div>
        <select v-model="selectedProfile" class="text_pole wide100p" @change="onProfileChange">
          <option value="">-- 请选择 Profile --</option>
          <option v-for="profile in profiles" :key="profile" :value="profile">
            {{ profile }}
          </option>
        </select>
      </div>

      <!-- 测试提示词 -->
      <div class="flex-container flexFlowColumn alignItemsStart wide100p marginBot10">
        <label class="marginBot5">测试提示词：</label>
        <textarea v-model="testPrompt" class="text_pole wide100p" rows="4" placeholder="输入测试提示词..."></textarea>
      </div>

      <!-- 系统提示词（可选） -->
      <div class="flex-container flexFlowColumn alignItemsStart wide100p marginBot10">
        <label class="marginBot5">系统提示词（可选）：</label>
        <textarea
          v-model="systemPrompt"
          class="text_pole wide100p"
          rows="2"
          placeholder="输入系统提示词（可选）..."
        ></textarea>
      </div>

      <!-- 发送按钮 -->
      <div class="flex-container marginBot10">
        <button class="menu_button" :disabled="!selectedProfile || !testPrompt || isTesting" @click="sendTest">
          <i class="fa-solid" :class="isTesting ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
          {{ isTesting ? '测试中...' : '发送测试' }}
        </button>
        <button v-if="isTesting" class="menu_button caution marginLeft10" @click="cancelTest">
          <i class="fa-solid fa-stop"></i>
          取消
        </button>
      </div>

      <!-- 结果显示区域 -->
      <div v-if="testResult" class="flex-container flexFlowColumn alignItemsStart wide100p">
        <label class="marginBot5">测试结果：</label>
        <div
          class="text_pole wide100p"
          :class="testResult.success ? 'success-result' : 'error-result'"
          style="padding: 10px; min-height: 100px; white-space: pre-wrap; word-break: break-word"
        >
          <div v-if="testResult.success">
            <strong>✓ 成功</strong>
            <hr style="margin: 10px 0" />
            {{ testResult.text }}
          </div>
          <div v-else>
            <strong>✗ 失败</strong>
            <hr style="margin: 10px 0" />
            {{ testResult.error }}
          </div>
        </div>
      </div>
    </div>

    <!-- 原有内容区域 
    <div class="example-extension_block flex-container">
      <input class="menu_button" type="submit" :value="t`示例按钮`" @click="handle_button_click" />
    </div>

    <div class="example-extension_block flex-container">
      <input v-model="settings.button_selected" type="checkbox" />
      <label for="example_setting">{{ t`示例开关` }}</label>
    </div>
    -->

    <hr class="sysHR" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { profileManager } from '@/services/profile-manager';
import { apiCaller, type GenerateResult } from '@/services/api-caller';

const { settings } = storeToRefs(useSettingsStore());

// 测试相关状态
const profiles = ref<string[]>([]);
const selectedProfile = ref<string>('');
const testPrompt = ref<string>('hi');
const systemPrompt = ref<string>('');
const isTesting = ref<boolean>(false);
const testResult = ref<GenerateResult | null>(null);
const isLoadingProfiles = ref<boolean>(false);

// 用于取消请求的 AbortController
let abortController: AbortController | null = null;

// 加载 Profile 列表
const loadProfiles = async () => {
  if (isLoadingProfiles.value) {
    return; // 避免重复加载
  }

  isLoadingProfiles.value = true;
  try {
    profiles.value = await profileManager.listProfiles();
    console.log('[Mirage] 已加载 Profiles:', profiles.value);
    if (profiles.value.length > 0) {
      toastr.success(`成功加载 ${profiles.value.length} 个 Profile`);
    } else {
      toastr.info('未找到任何 Profile');
    }
  } catch (error) {
    console.error('[Mirage] 加载 Profile 列表失败:', error);
    toastr.error('加载 Profile 列表失败');
  } finally {
    isLoadingProfiles.value = false;
  }
};

// Profile 改变时的处理
const onProfileChange = () => {
  console.log('[Mirage] 选择的 Profile:', selectedProfile.value);
  testResult.value = null;
};

// 发送测试
const sendTest = async () => {
  if (!selectedProfile.value || !testPrompt.value) {
    toastr.warning('请选择 Profile 并输入测试提示词');
    return;
  }

  isTesting.value = true;
  testResult.value = null;
  abortController = new AbortController();

  try {
    console.log('[Mirage] 开始 API 测试...');

    const result = await apiCaller.generate({
      prompt: testPrompt.value,
      profileName: selectedProfile.value,
      systemPrompt: systemPrompt.value || undefined,
    });

    testResult.value = result;

    if (result.success) {
      toastr.success('API 测试成功');
      console.log('[Mirage] API 测试成功，响应长度:', result.text.length);
    } else {
      toastr.error('API 测试失败');
      console.error('[Mirage] API 测试失败:', result.error);
    }
  } catch (error) {
    console.error('[Mirage] API 测试异常:', error);
    testResult.value = {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
    toastr.error('API 测试异常');
  } finally {
    isTesting.value = false;
    abortController = null;
  }
};

// 取消测试
const cancelTest = () => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  isTesting.value = false;
  toastr.info('已取消测试');
};

// 原有示例按钮
const handle_button_click = () => {
  toastr.success('你好呀!');
};

// 组件挂载时加载 Profile 列表
onMounted(() => {
  loadProfiles();
});
</script>

<style scoped>
.success-result {
  background-color: rgba(0, 255, 0, 0.1);
  border: 1px solid rgba(0, 255, 0, 0.3);
  border-radius: 4px;
}

.error-result {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 4px;
}

.marginBot5 {
  margin-bottom: 5px;
}

.marginBot10 {
  margin-bottom: 10px;
}

.marginLeft10 {
  margin-left: 10px;
}
</style>
