const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="m11.08 2.62.21-.33.16-.12.17-.09L12 2l.38.08.33.21.12.15 2.36 5.61 5.89.45.37.11.17.1.25.3.08.18.05.39-.04.19-.07.18-.24.31-4.53 3.9 1.38 5.8-.06.39-.09.18-.12.15-.32.23-.19.06-.39.02-.37-.15L12 17.69l-5.14 3.24-.39.07-.38-.09-.32-.23-.21-.33-.06-.39.03-.2 1.35-5.6-4.53-3.9-.24-.31-.07-.18-.03-.39.04-.19.08-.18.25-.3.17-.1.37-.11 5.89-.45ZM12 5.6l-1.58 3.78-.08.17-.25.26-.33.16-.18.03-4.1.31 3.17 2.73.23.29.07.16.04.18-.02.37-.91 3.79 3.4-2.17.35-.14.19-.02.37.07.17.09 3.4 2.17-.91-3.79-.02-.37.04-.18.07-.16.23-.29 3.17-2.73-4.1-.31-.18-.03-.33-.16-.25-.26-.08-.17Z"/>
  </svg>
`;

export class MoonveilIconStar extends HTMLElement {
  static get observedAttributes() {
    return ['size', 'color'];
  }

  private svg: SVGSVGElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
    this.svg = shadow.querySelector('svg') as SVGSVGElement;
  }

  connectedCallback() {
    this.applySize();
    this.applyColor();
  }

  attributeChangedCallback(name: string) {
    if (name === 'size') this.applySize();
    if (name === 'color') this.applyColor();
  }

  private applySize() {
    const size = this.getAttribute('size') ?? '24';
    this.svg.setAttribute('width', size);
    this.svg.setAttribute('height', size);
  }

  private applyColor() {
    const color = this.getAttribute('color');
    this.style.color = color ?? '';
  }
}

customElements.define('moonveil-icon-star', MoonveilIconStar);
