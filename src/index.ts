import type ts from 'typescript/lib/tsserverlibrary';
import type { SourceFile, server } from 'typescript/lib/tsserverlibrary';
import type { AcceptedPlugin } from 'postcss';
import type { Options } from './options';
import type { isCSSFn } from './helpers/cssExtensions';
import { existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import postcss from 'postcss';
import postcssIcssSelectors from 'postcss-icss-selectors';
import postcssIcssKeyframes from 'postcss-icss-keyframes';
import postcssrc from 'postcss-load-config';
import filter from 'postcss-filter-plugins';
import { createMatchers } from './helpers/createMatchers';
import { getDtsSnapshot } from './helpers/getDtsSnapshot';
import { createLogger } from './helpers/logger';

const getPostCssConfigPlugins = (directory: string) => {
  try {
    return postcssrc.sync({}, directory).plugins;
  } catch (error) {
    return [];
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function init({ typescript: typeSystem }: { typescript: typeof ts }) {
  let _isCSS: isCSSFn;

  function create(info: server.PluginCreateInfo) {
    const logger = createLogger(info);
    const directory = info.project.getCurrentDirectory();
    const compilerOptions = info.project.getCompilerOptions();

    // TypeScript plugins have a `cwd` of `/`, which causes issues with import resolution.
    process.chdir(directory);

    // User options for plugin.
    const options: Options = info.config.options || {};
    logger.log(`options: ${JSON.stringify(options)}`);

    // Load environment variables
    // TODO: Add tests for this option.
    const dotenvOptions = options.dotenvOptions || {};
    if (dotenvOptions) {
      dotenvOptions.path = path.resolve(
        directory,
        dotenvOptions.path || '.env',
      );
    }
    dotenv.config(dotenvOptions);

    // Add postCSS config if enabled.
    const postcssOptions =
      options.postcssOptions || options.postCssOptions || {};

    let userPlugins: AcceptedPlugin[] = [];
    if (postcssOptions.useConfig) {
      const postcssConfig = getPostCssConfigPlugins(directory);
      userPlugins = [
        filter({
          exclude: postcssOptions.excludePlugins,
          silent: true,
        }),
        ...postcssConfig,
      ];
    }

    // If a custom renderer is provided, resolve the path.
    if (options.customRenderer) {
      if (existsSync(path.resolve(directory, options.customRenderer))) {
        options.customRenderer = path.resolve(
          directory,
          options.customRenderer,
        );
      } else if (existsSync(require.resolve(options.customRenderer))) {
        options.customRenderer = require.resolve(options.customRenderer);
      } else {
        logger.error(
          new Error(
            `The file or package for \`customRenderer\` '${options.customRenderer}' could not be resolved.`,
          ),
        );
      }
    }

    // If a custom template is provided, resolve the path.
    if (options.customTemplate) {
      options.customTemplate = path.resolve(directory, options.customTemplate);
    }

    // Create PostCSS processor.
    const processor = postcss([
      ...userPlugins,
      postcssIcssSelectors({ mode: 'local' }),
      postcssIcssKeyframes(),
    ]);

    // Create matchers using options object.
    const { isCSS, isRelativeCSS } = createMatchers(logger, options);
    _isCSS = isCSS;

    // Creates new virtual source files for the CSS modules.
    const _createLanguageServiceSourceFile =
      typeSystem.createLanguageServiceSourceFile;
    typeSystem.createLanguageServiceSourceFile = (
      fileName,
      scriptSnapshot,
      ...rest
    ): SourceFile => {
      if (isCSS(fileName)) {
        scriptSnapshot = getDtsSnapshot(
          typeSystem,
          processor,
          fileName,
          scriptSnapshot,
          options,
          logger,
          compilerOptions,
        );
      }
      const sourceFile = _createLanguageServiceSourceFile(
        fileName,
        scriptSnapshot,
        ...rest,
      );
      if (isCSS(fileName)) {
        sourceFile.isDeclarationFile = true;
      }
      return sourceFile;
    };

    // Updates virtual source files as files update.
    const _updateLanguageServiceSourceFile =
      typeSystem.updateLanguageServiceSourceFile;
    typeSystem.updateLanguageServiceSourceFile = (
      sourceFile,
      scriptSnapshot,
      ...rest
    ): SourceFile => {
      if (isCSS(sourceFile.fileName)) {
        scriptSnapshot = getDtsSnapshot(
          typeSystem,
          processor,
          sourceFile.fileName,
          scriptSnapshot,
          options,
          logger,
          compilerOptions,
        );
      }
      sourceFile = _updateLanguageServiceSourceFile(
        sourceFile,
        scriptSnapshot,
        ...rest,
      );
      if (isCSS(sourceFile.fileName)) {
        sourceFile.isDeclarationFile = true;
      }
      return sourceFile;
    };

    if (info.languageServiceHost.resolveModuleNames) {
      const _resolveModuleNames =
        info.languageServiceHost.resolveModuleNames.bind(
          info.languageServiceHost,
        );

      info.languageServiceHost.resolveModuleNames = (
        moduleNames,
        containingFile,
        ...rest
      ) => {
        const resolvedModules = _resolveModuleNames(
          moduleNames,
          containingFile,
          ...rest,
        );

        return moduleNames.map((moduleName, index) => {
          try {
            if (isRelativeCSS(moduleName)) {
              return {
                extension: '.d.ts',
                isExternalLibraryImport: false,
                resolvedFileName: path.resolve(
                  path.dirname(containingFile),
                  moduleName,
                ),
              };
            } else if (isCSS(moduleName)) {
              // TODO: Move this section to a separate file and add basic tests.
              // Attempts to locate the module using TypeScript's previous search paths. These include "baseUrl" and "paths".
              const failedModule =
                info.project.getResolvedModuleWithFailedLookupLocationsFromCache(
                  moduleName,
                  containingFile,
                );
              const baseUrl = info.project.getCompilerOptions().baseUrl;
              const match = '/index.ts';

              // An array of paths TypeScript searched for the module. All include .ts, .tsx, .d.ts, or .json extensions.
              // NOTE: TypeScript doesn't expose this in their interfaces, which is why the type is unkown.
              // https://github.com/microsoft/TypeScript/issues/28770
              const failedLocations: readonly string[] = (
                failedModule as unknown as {
                  failedLookupLocations: readonly string[];
                }
              ).failedLookupLocations;

              // Filter to only one extension type, and remove that extension. This leaves us with the actual filename.
              // Example: "usr/person/project/src/dir/File.module.css/index.d.ts" > "usr/person/project/src/dir/File.module.css"
              const normalizedLocations = failedLocations.reduce(
                (locations, location) => {
                  if (
                    (baseUrl ? location.includes(baseUrl) : true) &&
                    location.endsWith(match)
                  ) {
                    return [...locations, location.replace(match, '')];
                  }
                  return locations;
                },
                [] as string[],
              );

              // Find the imported CSS module, if it exists.
              const cssModulePath = normalizedLocations.find((location) =>
                existsSync(location),
              );

              if (cssModulePath) {
                return {
                  extension: '.d.ts',
                  isExternalLibraryImport: false,
                  resolvedFileName: path.resolve(cssModulePath),
                };
              }
            }
          } catch (e) {
            logger.error(e);
            return resolvedModules[index];
          }
          return resolvedModules[index];
        });
      };
    }

    return info.languageService;
  }

  function getExternalFiles(project: server.ConfiguredProject) {
    return project.getFileNames().filter(_isCSS);
  }

  return { create, getExternalFiles };
}

export = init;
