import Panel from '@/Panel.vue';
import { router } from '@/router';
import { App } from 'vue';

const app = createApp(Panel);

const pinia = createPinia();
app.use(pinia);
app.use(router);

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

export function initPanel() {
  // 创建顶栏 drawer 结构（包含 interactable 类，但不包含 openIcon）
  const drawerHtml = `
    <div id="mirage-controller-button" class="drawer">
      <div class="drawer-toggle">
        <div class="drawer-icon fa-solid fa-diagram-project fa-fw interactable"
             title="Mirage Controller"
             data-i18n="[title]Mirage Controller"
             tabindex="0"
             role="button"></div>
      </div>
      <div id="mirage-controller-panel" class="drawer-content">
        <div id="mirage-controller-app"></div>
      </div>
    </div>
  `;

  // 将 drawer 插入到 Extensions 后
  const $drawer = $(drawerHtml);
  $drawer.insertAfter('#extensions-settings-button');

  const $toggle = $drawer.find('.drawer-toggle');
  const $icon = $drawer.find('.drawer-icon');
  const $content = $drawer.find('.drawer-content');

  // 添加点击事件来切换面板的展开/收起
  $toggle.on('click', function (e) {
    e.stopPropagation();

    // 关闭其他所有 drawer
    $('.drawer')
      .not($drawer)
      .each(function () {
        $(this).find('.drawer-content').removeClass('openDrawer');
        $(this).find('.drawer-icon').removeClass('openIcon');
      });

    // 切换当前 drawer
    $content.toggleClass('openDrawer');
    $icon.toggleClass('openIcon');
  });

  // 监听其他 drawer 的点击，自动关闭当前 drawer
  $(document).on('click', '.drawer-toggle', function () {
    if (!$(this).closest('#mirage-controller-button').length) {
      $content.removeClass('openDrawer');
      $icon.removeClass('openIcon');
    }
  });

  // 挂载 Vue 应用到 drawer 内容区
  const $app = $('#mirage-controller-app');
  app.mount($app[0]);
}
