"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClasses = void 0;
var icss_utils_1 = require("icss-utils");
var getClasses = function (_a) {
    var css = _a.css, fileName = _a.fileName, logger = _a.logger, options = _a.options, processor = _a.processor, compilerOptions = _a.compilerOptions;
    try {
        var transformedCss = '';
        if (options.customRenderer) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            var customRenderer = require(options.customRenderer);
            transformedCss = customRenderer(css, {
                fileName: fileName,
                logger: logger,
                compilerOptions: compilerOptions,
            });
        }
        else {
            transformedCss = css;
        }
        var processedCss = processor.process(transformedCss, {
            from: fileName,
        });
        // @ts-expect-error Forced unknown promise return
        return processedCss.root ? icss_utils_1.extractICSS(processedCss.root).icssExports : {};
    }
    catch (e) {
        logger.error(e);
        return {};
    }
};
exports.getClasses = getClasses;
