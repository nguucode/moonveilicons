const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 11h12.59l-4.42-4.44-.15-.36L12 6l.02-.2.15-.36.12-.15.33-.21L13 5l.38.08.33.21 6 6 .21.33.08.38-.08.38-.21.33-6 6-.33.21L13 19l-.2-.02-.36-.15-.15-.12-.21-.33L12 18l.08-.38.09-.18L16.59 13 3.8 12.98l-.36-.15-.15-.12-.21-.33L3 12l.08-.38.21-.33.33-.21Z"/>
  </svg>
`;

export class MoonveilIconArrowRight extends HTMLElement {
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

customElements.define('moonveil-icon-arrow-right', MoonveilIconArrowRight);
