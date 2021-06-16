declare module 'postcss-import-sync2' {
  import type { PluginCreator } from 'postcss';
  const plugin: PluginCreator<unknown>;
  export = plugin;
}
