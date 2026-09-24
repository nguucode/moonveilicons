const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="m8.29 18.71-5.12-5.15-.09-.18L3 13l.08-.38.21-.33.33-.21L4 12l.2.02.36.15 4.41 4.38L19.26 5.32l.32-.23.38-.09.38.06.34.2.23.32.09.38-.06.38-.2.34-11 12-.15.13-.18.1-.19.07-.2.02-.2-.02-.19-.05-.18-.1Z"/>
  </svg>
`;

export class MoonveilIconCheck extends HTMLElement {
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

customElements.define('moonveil-icon-check', MoonveilIconCheck);
