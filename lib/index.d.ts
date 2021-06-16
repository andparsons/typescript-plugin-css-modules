import type ts from 'typescript/lib/tsserverlibrary';
import type { server } from 'typescript/lib/tsserverlibrary';
declare function init({ typescript: typeSystem }: {
    typescript: typeof ts;
}): {
    create: (info: server.PluginCreateInfo) => ts.LanguageService;
    getExternalFiles: (project: server.ConfiguredProject) => server.NormalizedPath[];
};
export = init;
