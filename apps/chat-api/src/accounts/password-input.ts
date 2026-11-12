// Leitura da senha da entrada padrão sem expô-la. No terminal, o eco é
// desligado durante a digitação; com entrada canalizada, a primeira linha é
// a senha. O texto lido nunca é impresso nem registrado.
import { stderr, stdin } from 'node:process';

export async function readPassword(prompt: string): Promise<string> {
  if (stdin.isTTY === true) {
    return readFromTerminal(prompt);
  }
  return readFirstLine();
}

async function readFirstLine(): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = '';

    const cleanup = () => {
      stdin.off('data', onData);
      stdin.off('end', onEnd);
      stdin.off('error', onError);
      stdin.pause();
    };

    const finish = () => {
      cleanup();
      resolve(buffer.split(/\r\n|\r|\n/, 1)[0] ?? '');
    };

    const onData = (chunk: string) => {
      buffer += chunk;
      if (/[\r\n]/.test(buffer)) {
        finish();
      }
    };

    const onEnd = () => {
      finish();
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    stdin.setEncoding('utf8');
    stdin.resume();
    stdin.on('data', onData);
    stdin.on('end', onEnd);
    stdin.on('error', onError);
  });
}

function readFromTerminal(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = stdin;
    let value = '';

    const finish = () => {
      input.off('data', onData);
      input.off('error', onError);
      input.setRawMode?.(false);
      input.pause();
      stderr.write('\n');
    };

    const onData = (chunk: string) => {
      for (const character of chunk) {
        if (character === '\r' || character === '\n') {
          finish();
          resolve(value);
          return;
        }
        if (character === '\u0003') {
          finish();
          reject(new Error('Leitura da senha cancelada.'));
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        value += character;
      }
    };

    const onError = (error: Error) => {
      finish();
      reject(error);
    };

    input.setRawMode?.(true);
    input.setEncoding('utf8');
    input.resume();
    input.on('data', onData);
    input.on('error', onError);
    stderr.write(prompt);
  });
}
