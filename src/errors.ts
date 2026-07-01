/** An error whose message is already user-facing and safe to print as-is. */
export class CliError extends Error {}

interface NodeErrnoException extends Error {
  code?: string;
}

function isErrnoException(error: unknown): error is NodeErrnoException {
  return error instanceof Error && 'code' in error;
}

/** Rewraps a filesystem read failure into a clear, actionable CliError. */
export function toCliFileError(error: unknown, path: string, kind: string): CliError {
  if (isErrnoException(error)) {
    if (error.code === 'ENOENT') {
      return new CliError(`Cannot find ${kind} "${path}"`);
    }
    if (error.code === 'EISDIR') {
      return new CliError(`Expected ${kind} "${path}" to be a file, but it is a directory`);
    }
    if (error.code === 'EACCES') {
      return new CliError(`Permission denied reading ${kind} "${path}"`);
    }
  }
  return new CliError(`Could not read ${kind} "${path}": ${error instanceof Error ? error.message : String(error)}`);
}

/** Rewraps a filesystem write failure into a clear, actionable CliError. */
export function toCliWriteError(error: unknown, path: string): CliError {
  if (isErrnoException(error)) {
    if (error.code === 'ENOENT') {
      return new CliError(`Cannot write output file "${path}": containing directory does not exist`);
    }
    if (error.code === 'EISDIR') {
      return new CliError(`Cannot write output file "${path}": it is a directory`);
    }
    if (error.code === 'EACCES') {
      return new CliError(`Permission denied writing output file "${path}"`);
    }
  }
  return new CliError(
    `Could not write output file "${path}": ${error instanceof Error ? error.message : String(error)}`,
  );
}
