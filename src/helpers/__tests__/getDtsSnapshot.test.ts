import type { CSSExports } from 'icss-utils';
import type { CompilerOptions } from 'typescript';
import type { Logger } from '../logger';
import type { Options } from '../../options';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getClasses } from '../getClasses';
import { createExports } from '../createExports';
import postcss from 'postcss';
import postcssIcssSelectors from 'postcss-icss-selectors';
import postcssImportSync from 'postcss-import-sync2';
import postcssIcssKeyframes from 'postcss-icss-keyframes';

const testFileNames = ['test.module.css', 'import.module.css'];

const logger: Logger = {
  log: jest.fn(),
  error: jest.fn(),
};

const options: Options = {};

const compilerOptions: CompilerOptions = {};

const processor = postcss([
  postcssImportSync(),
  postcssIcssSelectors({ mode: 'local' }),
  postcssIcssKeyframes(),
]);

describe('utils / cssSnapshots', () => {
  testFileNames.forEach((testFile) => {
    let classes: CSSExports;
    const fileName = join(__dirname, 'fixtures', testFile);
    const css = readFileSync(fileName, 'utf8');

    beforeAll(() => {
      classes = getClasses({
        css,
        fileName,
        logger,
        options,
        processor,
        compilerOptions,
      });
    });

    describe(`with file '${testFile}'`, () => {
      describe('getClasses', () => {
        it('should return an object matching expected CSS', () => {
          expect(classes).toMatchSnapshot();
        });
      });

      describe('createExports', () => {
        it('should create an exports file', () => {
          const exports = createExports({
            classes,
            fileName,
            logger,
            options: {},
          });
          expect(exports).toMatchSnapshot();
        });
      });

      describe('with a custom template', () => {
        it('should transform the generated dts', () => {
          const customTemplate = join(
            __dirname,
            'fixtures',
            'customTemplate.js',
          );

          const options: Options = { customTemplate };

          const dts = createExports({
            classes,
            fileName,
            logger,
            options,
          });
          expect(dts).toMatchSnapshot();
        });
      });
    });
  });

  describe('with a custom renderer', () => {
    const fileName = 'exampleFileContents';
    const css = 'exampleFileName';
    const customRenderer = join(__dirname, 'fixtures', 'customRenderer.js');

    const options: Options = { customRenderer };

    it('should process a file and log', () => {
      const classes = getClasses({
        css,
        fileName,
        logger,
        options,
        processor,
        compilerOptions,
      });

      expect(classes).toMatchSnapshot();
      expect(logger.log).toHaveBeenCalledWith('Example log');
    });
  });
});
