import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { localSecrets, mergeLocalEnvironment, templateValues } from './local-environment';
const backendKeys = [
  'NODE_ENV',
  'PORT',
  'API_PREFIX',
  'MONGODB_URI',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'FRONTEND_URL',
  'APP_URL',
  'AUTH_COOKIE_SAME_SITE',
  'TRUST_PROXY_HOPS',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_AUTH_ENABLED',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
] as const;
const frontendKeys = ['NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_APP_URL', 'API_PROXY_TARGET'] as const;
/** Reads an optional environment file without suppressing permission or filesystem errors. */
async function readOptional(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT')
      return null;
    throw error;
  }
}
/** Creates a localhost environment, backing up existing settings before deliberate replacement. */
async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const root = resolve(__dirname, '..', '..');
  const targets = [
    { directory: 'backend', name: '.env', keys: backendKeys },
    { directory: 'frontend', name: '.env.local', keys: frontendKeys },
  ];
  // Read both files before writing either one, so existing settings require explicit consent.
  const files = await Promise.all(
    targets.map(async (target) => {
      const path = resolve(root, target.directory, target.name);
      const existing = await readOptional(path);
      const template = await readFile(resolve(root, target.directory, '.env.example'), 'utf8');
      return { ...target, path, existing, template };
    }),
  );
  if (!apply && files.some((file) => file.existing !== null))
    throw new Error(
      'Existing environment files found. To back them up and switch to localhost, run: npm run setup:local -- --apply',
    );
  const timestamp = `${Date.now()}-${process.pid}`;
  for (const file of files) {
    if (file.existing !== null) {
      const backup = `${file.path}.backup-${timestamp}`;
      await copyFile(file.path, backup);
      console.log(
        `Backup created: ${file.directory}/${file.name}.backup-${timestamp} (keep private)`,
      );
    }
    const values = templateValues(file.template, file.keys);
    if (file.directory === 'backend') Object.assign(values, localSecrets());
    const contents = mergeLocalEnvironment(file.existing ?? file.template, values);
    await writeFile(file.path, contents, { mode: 0o600 });
    console.log(`Configured ${file.directory}/${file.name} for localhost`);
  }
  console.log('Local JWT secrets were regenerated; existing development sessions are invalidated.');
  console.log(
    'Next: npm run services:up, then npm run dev. Start frontend/npm run dev in a second terminal.',
  );
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Local setup failed');
  process.exitCode = 1;
});
