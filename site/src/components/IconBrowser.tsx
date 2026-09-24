import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { IconEntry, Style } from '../icons';

const STYLES: Style[] = ['outline', 'solid'];
const pascal = (kebab: string) => kebab.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const sized = (svg: string, size: number) => svg.replace('<svg ', `<svg width="${size}" height="${size}" fill="currentColor" aria-hidden="true" `);

function Svg({ svg, size }: { svg: string; size: number }) {
  // Icon sources are linted (no script/style/foreignObject), so inlining them is safe.
  return <span className="inline-flex" dangerouslySetInnerHTML={{ __html: sized(svg, size) }} />;
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-border-input p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`h-10 rounded-md px-4 text-sm capitalize ${value === o ? 'bg-element-active font-medium text-text' : 'text-text-muted hover:bg-element-hover'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CopyRow({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the code stays selectable */
    }
  };
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
        <span>{label}</span>
        <button type="button" onClick={copy} className="rounded px-2 py-1 font-medium text-accent-text hover:bg-accent-subtle">
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-border bg-surface-subtle px-3 py-2 font-mono text-xs"><code>{code}</code></pre>
    </div>
  );
}

function IconDialog({ icon, style: initialStyle, onClose }: { icon: IconEntry; style: Style; onClose: () => void }) {
  const available = STYLES.filter((s) => icon.svg[s]);
  const [style, setStyle] = useState<Style>(icon.svg[initialStyle] ? initialStyle : available[0]);
  const svg = icon.svg[style]!;
  const component = `Mvi${pascal(style)}${pascal(icon.name)}`;
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    a.download = `mvi-${style}-${icon.name}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-border bg-surface p-6 shadow-xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(40rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">{icon.name}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-muted">
                {[icon.category, ...(icon.tags ?? [])].filter(Boolean).join(' · ') || 'No tags yet'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-11 shrink-0 place-items-center rounded-md text-text-muted hover:bg-element-hover" aria-label="Close">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </Dialog.Close>
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-6 text-text">
              {[16, 24, 32, 48].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Svg svg={svg} size={s} />
                  <span className="text-xs text-text-muted">{s}</span>
                </div>
              ))}
            </div>
            {available.length > 1 && <Segmented label="Style" value={style} options={available} onChange={setStyle} />}
          </div>

          <div className="mt-6 grid gap-4">
            <CopyRow label="React" code={`import { ${component} } from '@moonveilicons/react';\n\n<${component} size={24} />`} />
            <CopyRow label="Vue" code={`import { ${component} } from '@moonveilicons/vue';\n\n<${component} :size="24" />`} />
            <CopyRow label="Web Component" code={`<mvi-icon name="${icon.name}"${style === 'outline' ? '' : ` type="${style}"`}></mvi-icon>`} />
            <CopyRow label="Webfont" code={`<i class="mvi mvi-${style}-${icon.name}"></i>`} />
            <CopyRow label="CLI" code={`npx moonveilicons add ${icon.name}${style === 'outline' ? '' : ` --style ${style}`}`} />
            <CopyRow label="SVG" code={svg} />
          </div>

          <button type="button" onClick={download} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-accent px-5 font-medium text-on-accent hover:bg-accent-hover sm:w-auto">
            Download SVG
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function IconBrowser({ icons }: { icons: IconEntry[] }) {
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<Style>('outline');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<IconEntry | null>(null);

  const categories = useMemo(() => ['all', ...new Set(icons.map((i) => i.category).filter((c): c is string => !!c))].sort(), [icons]);
  const q = query.trim().toLowerCase();
  const shown = icons.filter(
    (i) =>
      i.svg[style] &&
      (category === 'all' || i.category === category) &&
      (!q || [i.name, i.category, ...(i.tags ?? [])].some((s) => s?.toLowerCase().includes(q)))
  );

  return (
    <section aria-label="Icon browser">
      <div className="z-30 -mx-4 flex md:sticky md:top-14 flex-wrap items-center gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <label className="relative min-w-60 flex-1">
          <span className="sr-only">Search icons</span>
          <svg className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${icons.length} icons`}
            className="h-11 w-full rounded-lg border border-border-input bg-surface pr-3 pl-10 text-base placeholder:text-text-muted"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <span className="sr-only sm:not-sr-only">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-lg border border-border-input bg-surface px-3 text-text capitalize">
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <Segmented label="Style" value={style} options={STYLES} onChange={setStyle} />
      </div>

      <p className="mt-4 text-sm text-text-muted" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'icon' : 'icons'}
      </p>

      {shown.length ? (
        <ul className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
          {shown.map((icon) => (
            <li key={icon.name}>
              <button
                type="button"
                onClick={() => setSelected(icon)}
                className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-subtle text-text hover:border-border-input hover:bg-element-hover active:bg-element-active"
              >
                <Svg svg={icon.svg[style]!} size={28} />
                <span className="max-w-full truncate px-2 text-xs text-text-muted">{icon.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="font-medium">No {style} icons match “{query || category}”</p>
          <p className="text-sm text-text-muted">Try another word, the other Style, or all categories.</p>
          <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} className="mt-2 h-11 rounded-md border border-border-input px-4 text-sm hover:bg-element-hover">
            Clear filters
          </button>
        </div>
      )}

      {selected && <IconDialog icon={selected} style={style} onClose={() => setSelected(null)} />}
    </section>
  );
}
