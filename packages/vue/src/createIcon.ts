import { defineComponent, h, type PropType } from 'vue';

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export function transform(rotate?: number, flip?: string): string | undefined {
  const parts = [
    rotate && `rotate(${rotate}deg)`,
    flip === 'horizontal' && 'scaleX(-1)',
    flip === 'vertical' && 'scaleY(-1)',
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

export function createIcon(name: string, viewBox: string, inner: string) {
  return defineComponent({
    name,
    props: {
      size: { type: [Number, String], default: 24 },
      color: { type: String, default: 'currentColor' },
      rotate: Number as PropType<90 | 180 | 270>,
      flip: String as PropType<'horizontal' | 'vertical'>,
      /** Accessible name. Without it the icon is decorative (aria-hidden). */
      title: String,
    },
    setup(props) {
      return () =>
        h('svg', {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox,
          width: props.size,
          height: props.size,
          fill: props.color,
          style: transform(props.rotate, props.flip) && { transform: transform(props.rotate, props.flip) },
          ...(props.title ? { role: 'img' } : { 'aria-hidden': 'true' }),
          innerHTML: (props.title ? `<title>${escape(props.title)}</title>` : '') + inner,
        });
    },
  });
}
