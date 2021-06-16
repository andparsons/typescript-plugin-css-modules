import type ts from 'typescript/lib/tsserverlibrary';
import type {
  CompilerOptions,
  IScriptSnapshot,
} from 'typescript/lib/tsserverlibrary';
import type { Options } from '../options';
import type { Logger } from './logger';
import type Processor from 'postcss/lib/processor';
import { getClasses } from './getClasses';
import { createExports } from './createExports';

export const getDtsSnapshot = (
  typeSystem: typeof ts,
  processor: Processor,
  fileName: string,
  scriptSnapshot: IScriptSnapshot,
  options: Options,
  logger: Logger,
  compilerOptions: CompilerOptions,
): IScriptSnapshot => {
  const css = scriptSnapshot.getText(0, scriptSnapshot.getLength());

  /*
   * TODO: Temporary workaround for:
   * https://github.com/mrmckeb/typescript-plugin-css-modules/issues/41
   * Needs investigation for a more elegant solution.
   */
  if (/export default classes/.test(css)) {
    return scriptSnapshot;
  }

  const classes = getClasses({
    css,
    fileName,
    logger,
    options,
    processor,
    compilerOptions,
  });
  const dts = createExports({ classes, fileName, logger, options });
  return typeSystem.ScriptSnapshot.fromString(dts);
};
