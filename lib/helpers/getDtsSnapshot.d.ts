import type ts from 'typescript/lib/tsserverlibrary';
import type { CompilerOptions, IScriptSnapshot } from 'typescript/lib/tsserverlibrary';
import type { Options } from '../options';
import type { Logger } from './logger';
import type Processor from 'postcss/lib/processor';
export declare const getDtsSnapshot: (typeSystem: typeof ts, processor: Processor, fileName: string, scriptSnapshot: IScriptSnapshot, options: Options, logger: Logger, compilerOptions: CompilerOptions) => IScriptSnapshot;
