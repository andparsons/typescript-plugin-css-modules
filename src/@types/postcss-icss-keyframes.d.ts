declare module 'postcss-icss-keyframes' {
  import type { PluginCreator } from 'postcss';
  const plugin: PluginCreator<{
    generateScopeName: (
      keyframesName: string,
      filepath: string,
      css: string,
    ) => void;
  }>;
  export = plugin;
}
