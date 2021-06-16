declare module 'postcss-icss-selectors' {
  import type { PluginCreator } from 'postcss';
  const plugin: PluginCreator<{ mode: 'local' | 'global' }>;
  export = plugin;
}
