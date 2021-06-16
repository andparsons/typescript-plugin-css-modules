import type { CSSExports } from 'icss-utils';
import type { CompilerOptions } from 'typescript/lib/tsserverlibrary';
import type { Options } from '../options';
import type { Logger } from './logger';
import type Processor from 'postcss/lib/processor';
export declare const getClasses: ({ css, fileName, logger, options, processor, compilerOptions, }: {
    css: string;
    fileName: string;
    logger: Logger;
    options: Options;
    processor: Processor;
    compilerOptions: CompilerOptions;
}) => CSSExports;
