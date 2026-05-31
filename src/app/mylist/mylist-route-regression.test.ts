import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

describe('mylist route migration regression checks', () => {
  it('does not leave conflicting Pages Router mylist routes behind', () => {
    expect(existsSync(join(process.cwd(), 'src/pages/mylist'))).toBe(false);
  });

  it('does not import next/router from migrated App Router mylist files', () => {
    const files = walkFiles(join(process.cwd(), 'src/app/mylist'))
      .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file) && !/\.test\./.test(file));

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/from\s+['"]next\/router['"]/);
    }
  });
});
