import type { CSSExports } from 'icss-utils';
import type { CustomTemplate, Options } from '../options';
import type { Logger } from './logger';
import { transformClasses } from './classTransforms';
import reserved from 'reserved-words';

const NOT_CAMELCASE_REGEXP = /[\-_]/;

const classNameToProperty = (className: string) => `'${className}': string;`;
const classNameToNamedExport = (className: string) =>
  `export let ${className}: string;`;

const flattenClassNames = (
  previousValue: string[] = [],
  currentValue: string[],
) => previousValue.concat(currentValue);

export const createExports = ({
  classes,
  fileName,
  logger,
  options,
}: {
  classes: CSSExports;
  fileName: string;
  logger: Logger;
  options: Options;
}): string => {
  const isCamelCase = (className: string) =>
    !NOT_CAMELCASE_REGEXP.test(className);
  const isReservedWord = (className: string) => !reserved.check(className);

  const processedClasses = Object.keys(classes)
    .map(transformClasses(options.classnameTransform))
    .reduce(flattenClassNames, []);
  const camelCasedKeys = processedClasses
    .filter(isCamelCase)
    .filter(isReservedWord)
    .map(classNameToNamedExport);

  let dts = `\
declare let classes: {
${processedClasses.map(classNameToProperty).join('\n  ')}
};
export default classes;
`;

  if (options.namedExports !== false && camelCasedKeys.length) {
    dts += camelCasedKeys.join('\n') + '\n';
  }

  if (options.customTemplate) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customTemplate = require(options.customTemplate) as CustomTemplate;
    return customTemplate(dts, {
      classes,
      fileName,
      logger,
    });
  }

  return dts;
};
