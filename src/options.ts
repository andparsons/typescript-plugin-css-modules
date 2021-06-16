import type { CompilerOptions } from 'typescript/lib/tsserverlibrary';
import type { DotenvConfigOptions } from 'dotenv/types';
import type { CSSExports } from 'icss-utils';
import type { Logger } from './helpers/logger';

export interface PostcssOptions {
  excludePlugins?: string[];
  useConfig?: boolean;
}

export interface Options {
  classnameTransform?: ClassnameTransformOptions;
  customMatcher?: string;
  customRenderer?: string;
  customTemplate?: string;
  dotenvOptions?: DotenvConfigOptions;
  namedExports?: boolean;
  postcssOptions?: PostcssOptions;
  /** @deprecated To align with other projects. */
  postCssOptions?: PostcssOptions;
}

export type ClassnameTransformOptions =
  | 'asIs'
  | 'camelCase'
  | 'camelCaseOnly'
  | 'dashes'
  | 'dashesOnly';

export interface CustomRendererOptions {
  fileName: string;
  logger: Logger;
  compilerOptions: CompilerOptions;
}

export type CustomRenderer = (
  css: string,
  options: CustomRendererOptions,
) => string;

export interface CustomTemplateOptions {
  classes: CSSExports;
  fileName: string;
  logger: Logger;
}

export type CustomTemplate = (
  dts: string,
  options: CustomTemplateOptions,
) => string;
