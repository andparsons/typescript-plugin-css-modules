import type { Options } from '../options';
import type { isCSSFn, isRelativeCSSFn } from './cssExtensions';
import type { Logger } from './logger';
interface Matchers {
    isCSS: isCSSFn;
    isRelativeCSS: isRelativeCSSFn;
}
export declare const createMatchers: (logger: Logger, options?: Options) => Matchers;
export {};
