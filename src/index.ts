import '@/global.css';
import { initPanel } from '@/panel';
import { greet } from 'wasm';

$(() => {
  initPanel();
  greet();
});
