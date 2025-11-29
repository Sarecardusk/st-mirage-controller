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

export function initPanel() {
  if ($('#mirage_main_view').length > 0) {
    return;
  }

  const mountPoint = $('<div id="mirage_main_view">');
  const sysSettingsButton = $('#sys-settings-button');

  const attachDrawerHandlers = (drawer: JQuery, drawerContent: JQuery, drawerIcon: JQuery) => {
    const closeOtherDrawers = () => {
      $('.drawer-content')
        .not(drawerContent)
        .filter(`.${'openDrawer'}`)
        .each((_, element) => {
          const $content = $(element);
          $content.removeClass('openDrawer').addClass('closedDrawer');
          $content.closest('.drawer').find('.drawer-icon').removeClass('openIcon');
        });
    };

    const setDrawerState = (open: boolean) => {
      drawerContent.toggleClass('openDrawer', open).toggleClass('closedDrawer', !open);
      drawerIcon.toggleClass('openIcon', open).toggleClass('closedIcon', !open);
    };

    const toggleDrawer = () => setDrawerState(!drawerContent.hasClass('openDrawer'));

    // 默认 closed
    setDrawerState(false);

    drawer.find('.drawer-toggle').on('click', event => {
      event.preventDefault();
      closeOtherDrawers();
      toggleDrawer();
    });

    drawer.find('.drawer-toggle').on('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      event.preventDefault();
      closeOtherDrawers();
      toggleDrawer();
    });
  };

  if (sysSettingsButton.length > 0) {
    const drawer = $(`
      <div id="mirage-controller-button" class="drawer">
        <div class="drawer-toggle drawer-header">
          <div
            class="drawer-icon fa-solid fa-diagram-project fa-fw interactable closedIcon"
            title="主设置"
            data-i18n="[title]主设置"
            tabindex="0"
            role="button"
          ></div>
        </div>
        <div class="drawer-content closedDrawer"></div>
      </div>
    `);

    const drawerContent = drawer.find('.drawer-content');
    const drawerIcon = drawer.find('.drawer-icon');

    drawerContent.append(mountPoint);
    sysSettingsButton.after(drawer);

    attachDrawerHandlers(drawer, drawerContent, drawerIcon);
  } else {
    $('#extensions_settings2').append(mountPoint);
  }

  app.mount(mountPoint[0]);
}
