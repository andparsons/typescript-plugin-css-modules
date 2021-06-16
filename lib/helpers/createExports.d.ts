import type { CSSExports } from 'icss-utils';
import type { Options } from '../options';
import type { Logger } from './logger';
export declare const createExports: ({ classes, fileName, logger, options, }: {
    classes: CSSExports;
    fileName: string;
    logger: Logger;
    options: Options;
}) => string;
