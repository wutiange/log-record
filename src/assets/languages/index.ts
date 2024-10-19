import { createI18n } from 'vue-i18n';
import en from './en';
import zh from './zh';

// 在渲染进程的JavaScript中
function getBrowserLanguage() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return navigator.language || navigator.userLanguage;
}

console.log(getBrowserLanguage());

const i18n = createI18n({
  locale: getBrowserLanguage(),
  fallbackLocale: 'en-US',
  messages: {
    'en-US': en,
    'zh-CN': zh,
  },
});

export default i18n;
