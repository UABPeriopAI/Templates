import { type ChildProcess } from "node:child_process";
export declare function stop(proc: ChildProcess): void;
export declare function bindAbort(proc: ChildProcess, signal?: AbortSignal, onAbort?: () => void): () => void;
