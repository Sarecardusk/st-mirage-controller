import '@/global.css';
import { initPanel } from '@/panel';

/**
 * 等待 TavernHelper 和 MVU 加载完成
 */
async function waitForDependencies(): Promise<void> {
  return new Promise(resolve => {
    const checkInterval = setInterval(() => {
      // 检查 TavernHelper 是否已加载
      const hasTavernHelper = typeof TavernHelper !== 'undefined';
      // 检查 MVU 是否已加载
      const hasMvu = typeof Mvu !== 'undefined';

      if (hasTavernHelper && hasMvu) {
        clearInterval(checkInterval);
        console.log('[Mirage] TavernHelper 和 Mvu 已加载完成');
        resolve();
      }
    }, 100); // 每 100ms 检查一次

    // 10秒超时保护
    setTimeout(() => {
      clearInterval(checkInterval);
      console.warn('[Mirage] 等待依赖超时，强制继续初始化');
      resolve();
    }, 10000);
  });
}

$(() => {
  // 等待依赖加载后再初始化
  waitForDependencies().then(() => {
    initPanel();
  });
});
