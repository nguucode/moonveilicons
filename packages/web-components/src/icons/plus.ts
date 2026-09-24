const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.02 20.2 11 13l-7.2-.02-.36-.15-.15-.12-.21-.33L3 12l.08-.38.21-.33.33-.21.18-.06L11 11l.02-7.2.15-.36.12-.15.33-.21L12 3l.38.08.18.09.27.27.15.36L13 11l7.2.02.18.06.33.21.21.33.08.38-.08.38-.21.33-.33.21-.18.06L13 13l-.02 7.2-.06.18-.21.33-.33.21L12 21l-.38-.08-.33-.21-.21-.33Z"/>
  </svg>
`;

export class MoonveilIconPlus extends HTMLElement {
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

customElements.define('moonveil-icon-plus', MoonveilIconPlus);
