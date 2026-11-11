import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

// Both src/ and dist/ have the same depth, so CLI and HTTP startup share one file.
export const environmentFile = fileURLToPath(
  new URL('../../../../.env', import.meta.url),
);

export function loadEnvironment(
  file = environmentFile,
  target: NodeJS.ProcessEnv = process.env,
): void {
  const { error } = config({
    path: file,
    processEnv: target,
    override: false,
    quiet: true,
  });
  // Containers receive their values from Compose; no secret file is baked into images.
  const code = error && 'code' in error ? String(error.code) : undefined;
  if (error && code !== 'ENOENT')
    throw new Error(
      'Could not read the shared environment file. Check its permissions and try again.',
    );
}

loadEnvironment();
