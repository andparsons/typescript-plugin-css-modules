declare module 'postcss-filter-plugins' {
    import type { Plugin } from 'postcss';
    interface Options {
        direction?: 'backward' | 'both' | 'forward';
        exclude?: string[];
        silent?: boolean;
    }
    const filter: (options?: Options) => Plugin;
    export = filter;
}
