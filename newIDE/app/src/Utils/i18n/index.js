import * as Lingui from '@lingui/react';
import { rtl } from './languages';

const { I18n } = Lingui;

const $I18n = I18n.prototype;

const _visited = new WeakSet;

$I18n.getI18n = function() {
  const lingui = this.context?.linguiPublisher ?? {};
  
  if (!_visited.has(lingui)) {
    const i18n = lingui.i18n ?? {};
  
    i18n.lang = /^\w{2}/.exec(i18n.language ?? 'en')[0];
    i18n.rtl = rtl.has(i18n.lang);
    i18n.css = i18n.rtl ? 'is-rtl' : '';
    
    lingui.i18n = i18n;
  }
  
  _visited.add(lingui);
  return lingui;
};

export * from '@lingui/react';
