import type { server } from 'typescript/lib/tsserverlibrary';

export interface Logger {
  log: (message: string) => void;
  error: (error: Error) => void;
}

export const createLogger = (info: server.PluginCreateInfo): Logger => {
  const log = (message: string): void => {
    info.project.projectService.logger.info(
      `[typescript-plugin-css-modules] ${message}`,
    );
  };
  const error = (error: Error): void => {
    log(`Failed ${error.toString()}`);
    log(`Stack trace: ${error.stack}`);
  };

  return {
    log,
    error,
  };
};
