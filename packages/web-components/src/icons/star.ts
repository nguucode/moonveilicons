const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m12 3 2.5 6 6.5.5-5 4.3 1.5 6.2-5.5-3.5L6.5 20 8 13.8 3 9.5 9.5 9z"/>
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
