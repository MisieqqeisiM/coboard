import { ERROR_REG } from './constants.ts';

export const addLineNumberWithError = (src: string, log = '') => {
  const matches = [...log.matchAll(ERROR_REG)];
  const lineNoToErrorMap = new Map(matches.map((match, index) => {
    const lineNumber = parseInt(match[1]);
    const next = matches[index + 1];
    const end = next ? next.index : log.length;
    const msg = log.substring(match.index ?? 0, end);

    return [lineNumber - 1, msg];
  }));

  return src.split('\n').map((line, lineNumber) => {
    const error = lineNoToErrorMap.get(lineNumber);

    return `${lineNumber + 1}: ${line}${error ? `\n\n^^^${error}` : ''}`;
  });
};

export const glEnumToString = (gl: Record<string, any> & WebGLRenderingContext, value: string) => {
  const keys: string[] = [];

  Object.keys(gl).forEach((key) => {
    if (gl[key] === value) {
      keys.push(key);
    }
  });

  return keys.length ? keys.join(' | ') : value;
};
