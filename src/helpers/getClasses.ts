import type { CSSExports } from 'icss-utils';
import type { CompilerOptions } from 'typescript/lib/tsserverlibrary';
import type { Options, CustomRenderer } from '../options';
import type { Logger } from './logger';
import type Processor from 'postcss/lib/processor';
import { extractICSS } from 'icss-utils';

export const getClasses = ({
  css,
  fileName,
  logger,
  options,
  processor,
  compilerOptions,
}: {
  css: string;
  fileName: string;
  logger: Logger;
  options: Options;
  processor: Processor;
  compilerOptions: CompilerOptions;
}): CSSExports => {
  try {
    let transformedCss = '';

    if (options.customRenderer) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const customRenderer = require(options.customRenderer) as CustomRenderer;
      transformedCss = customRenderer(css, {
        fileName,
        logger,
        compilerOptions,
      });
    } else {
      transformedCss = css;
    }

    const processedCss: unknown = processor.process(transformedCss, {
      from: fileName,
    });

    // @ts-expect-error Forced unknown promise return
    return processedCss.root ? extractICSS(processedCss.root).icssExports : {};
  } catch (e) {
    logger.error(e);
    return {};
  }
};
