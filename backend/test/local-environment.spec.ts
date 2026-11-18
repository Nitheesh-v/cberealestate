import { localSecrets, mergeLocalEnvironment, templateValues } from '../scripts/local-environment';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateEnvironment } from '../src/config/environment';
describe('Local environment setup', () => {
  it('replaces duplicate managed keys without changing unrelated credentials', () => {
    const result = mergeLocalEnvironment(
      '# custom\nAPP_URL=old\nexport APP_URL=other\nCLOUDINARY_API_SECRET=keep\n',
      { APP_URL: 'http://localhost:3000' },
    );
    expect(result).toContain('CLOUDINARY_API_SECRET=keep');
    expect(result.match(/APP_URL=/g)).toHaveLength(1);
    expect(result).not.toContain('old');
    expect(result).toContain('# custom');
  });
  it('reads empty local values and fails if a required template key is absent', () => {
    expect(templateValues('REDIS_PASSWORD=\n', ['REDIS_PASSWORD'])).toEqual({ REDIS_PASSWORD: '' });
    expect(() => templateValues('', ['APP_URL'])).toThrow('APP_URL');
  });
  it('generates distinct non-placeholder secrets on each execution', () => {
    const first = localSecrets();
    const second = localSecrets();
    expect(first.JWT_SECRET).toHaveLength(96);
    expect(first.JWT_SECRET).not.toBe(first.JWT_REFRESH_SECRET);
    expect(first.JWT_SECRET).not.toBe(second.JWT_SECRET);
  });
  it('ships a valid localhost backend template after replacing secrets', () => {
    const template = readFileSync(resolve(__dirname, '../.env.example'), 'utf8');
    const keys = [...template.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1] ?? '');
    expect(
      validateEnvironment({ ...templateValues(template, keys), ...localSecrets() }),
    ).toMatchObject({ APP_URL: 'http://localhost:3000', SMTP_AUTH_ENABLED: 'false', PORT: 5000 });
  });
});
