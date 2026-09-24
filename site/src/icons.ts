// Build-time view of the core package: every Icon with its SVG markup per Style.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

export type Style = 'outline' | 'solid';
export interface IconEntry {
  name: string;
  category?: string;
  tags?: string[];
  svg: Partial<Record<Style, string>>;
}

const core = dirname(createRequire(import.meta.url).resolve('moonveilicons/icons.json'));
const read = (file: string) => readFileSync(join(core, file), 'utf8');

export const version: string = JSON.parse(read('package.json')).version;

export const icons: IconEntry[] = JSON.parse(read('icons.json')).map(
  (i: { name: string; category?: string; tags?: string[]; styles: Style[] }) => ({
    name: i.name,
    category: i.category,
    tags: i.tags,
    svg: Object.fromEntries(i.styles.map((s) => [s, read(`svg/${s}/${i.name}.svg`).trim()])),
  })
);
