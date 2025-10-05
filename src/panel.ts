import Panel from '@/Panel.vue';
import { App } from 'vue';

const app = createApp(Panel);

const pinia = createPinia();
app.use(pinia);

declare module 'vue' {
  interface ComponentCustomProperties {
    t: typeof t;
  }
}
const i18n = {
  install: (app: App) => {
    app.config.globalProperties.t = t;
  },
};
app.use(i18n);

<<<<<<< HEAD
/**
 * 创建 drawer HTML 结构
 */
function createDrawerStructure(): JQuery<HTMLElement> {
  const drawer = $(`
    <div id="mirage-controller-button" class="drawer">
      <div class="drawer-toggle">
        <div class="drawer-icon fa-solid fa-diagram-project fa-fw closedIcon interactable" title="Mirage Controller" data-i18n="[title]Mirage Controller" tabindex="0"></div>
      </div>
      <div class="drawer-content">
        <div id="mirage-controller-panel" class="height100p"></div>
      </div>
    </div>
  `);

  return drawer;
}

/**
 * 设置 drawer 事件处理
 */
function setupDrawerEvents($drawer: JQuery<HTMLElement>): void {
  const $toggle = $drawer.find('.drawer-toggle');
  const $content = $drawer.find('.drawer-content');
  const $icon = $drawer.find('.drawer-icon');

  // 点击切换显示/隐藏
  $toggle.on('click', function () {
    const isOpening = !$content.hasClass('openDrawer');

    // 切换面板显示状态
    $content.toggleClass('openDrawer');

    // 切换图标状态
    if (isOpening) {
      $icon.removeClass('closedIcon').addClass('openIcon');
    } else {
      $icon.removeClass('openIcon').addClass('closedIcon');
    }

    // 关闭其他打开的 drawer（并重置它们的图标状态）
    $('.drawer-content')
      .not($content)
      .each(function () {
        $(this).removeClass('openDrawer');
        $(this).siblings('.drawer-toggle').find('.drawer-icon').removeClass('openIcon').addClass('closedIcon');
      });
  });

  // 点击外部关闭
  $(document).on('click', function (e) {
    if (!$(e.target).closest('#mirage-controller-button').length) {
      $content.removeClass('openDrawer');
      $icon.removeClass('openIcon').addClass('closedIcon');
    }
  });
}

/**
 * 初始化面板
 */
export function initPanel() {
  // 等待 SillyTavern 加载完成
  $(document).ready(() => {
    // 1. 创建 drawer 结构
    const $drawer = createDrawerStructure();

    // 2. 插入到 top-bar（在 Extensions 之后）
    $drawer.insertAfter('#extensions-settings-button');

    // 3. 挂载 Vue 应用
    const $panel = $drawer.find('#mirage-controller-panel');
    app.mount($panel[0]);

    // 4. 设置事件处理
    setupDrawerEvents($drawer);

    console.log('[Mirage Controller] Panel initialized in top-bar');
  });
=======
export function initPanel() {
  const $app = $('<div id="tavern_extension_example">').appendTo('#extensions_settings2');
  app.mount($app[0]);
>>>>>>> 18afb459c3cbd2b75317fb56615376cc0df44554
}
