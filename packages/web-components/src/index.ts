import { icons } from './icons';

// ponytail: every icon is bundled; add a fetch-from-CDN mode once the bundle passes ~200KB.
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** `<mvi-icon name="heart" type="solid" size="32" color="red" rotate="90" flip="horizontal" title="Like">` */
export class MviIcon extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'type', 'size', 'color', 'rotate', 'flip', 'title'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  private render() {
    const attr = (n: string) => this.getAttribute(n);
    const icon = icons[`${attr('type') ?? 'outline'}/${attr('name')}`];
    const size = attr('size') ?? '24';
    const rotate = attr('rotate');
    const flip = attr('flip');
    const transform = [
      rotate && `rotate(${Number(rotate)}deg)`,
      flip === 'horizontal' && 'scaleX(-1)',
      flip === 'vertical' && 'scaleY(-1)',
    ].filter(Boolean).join(' ');
    const title = attr('title');

    if (title) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', title);
      this.removeAttribute('aria-hidden');
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
    }

    this.shadowRoot!.innerHTML = `<style>
  :host { display: inline-block; line-height: 0; color: inherit; }
  svg { display: block; transform: ${transform || 'none'}; }
</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon?.[0] ?? '0 0 24 24'}" width="${escape(size)}" height="${escape(size)}" fill="${escape(attr('color') ?? 'currentColor')}">${icon?.[1] ?? ''}</svg>`;
  }
}

if (!customElements.get('mvi-icon')) customElements.define('mvi-icon', MviIcon);
