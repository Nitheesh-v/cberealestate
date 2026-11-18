import { randomBytes } from 'node:crypto';
/** Reads simple KEY=value entries from the checked-in local environment template. */
export function templateValues(template: string, keys: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of template.split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (match?.[1] && keys.includes(match[1])) values[match[1]] = match[2] ?? '';
  }
  for (const key of keys)
    if (!(key in values)) throw new Error(`Missing local template setting: ${key}`);
  return values;
}
/** Replaces every managed duplicate while preserving unrelated settings and comments. */
export function mergeLocalEnvironment(existing: string, values: Record<string, string>): string {
  const retained = existing
    .split(/\r?\n/)
    .filter((line) => {
      const key = /^(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=/.exec(line.trim())?.[1];
      return !key || !(key in values);
    })
    .join('\n')
    .trimEnd();
  return `${retained}${retained ? '\n\n' : ''}${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')}\n`;
}
/** Generates independent local signing secrets rather than copying placeholder credentials. */
export function localSecrets(): Record<string, string> {
  return {
    JWT_SECRET: randomBytes(48).toString('hex'),
    JWT_REFRESH_SECRET: randomBytes(48).toString('hex'),
  };
}
