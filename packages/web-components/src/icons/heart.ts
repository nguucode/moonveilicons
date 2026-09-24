const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; line-height: 0; color: inherit; }
    svg { display: block; }
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="m12 4.96.65-.54.72-.45.89-.38.8-.2.85-.1.96.04.81.16.81.27.85.45.67.48.61.6.51.65.47.84.3.79.2.95.05.82-.02.5-.07.49-.11.51-.15.47-.19.46-.22.44-.34.54-.3.39-.35.39-7.69 7.68-.33.21-.38.08-.38-.08-.33-.21-7.69-7.68-.35-.39-.38-.51-.26-.42-.22-.44-.19-.46-.15-.47-.11-.49-.07-.51-.02-.5.07-.96.18-.81.3-.79.4-.73.58-.76.59-.58.69-.5.85-.45.81-.27.95-.17.85-.03.82.1.93.25.76.33.72.45Zm0 14.13 7.06-7.06.48-.61.3-.59.15-.41.1-.43.06-.77-.09-.76-.23-.74-.37-.67-.49-.6-.59-.49-.68-.36-.63-.21-.76-.1-.77.04-.64.16-.71.31-.54.37-.41.37-.54.68-.15.12-.17.09-.38.07-.38-.07-.17-.09-.15-.12-.54-.68-.32-.3-.44-.33-.49-.26L9 5.46l-.54-.13-.55-.04-.66.04-.54.12-.41.15-.4.19-.46.3-.41.36-.3.33-.31.45-.25.49-.18.52-.09.43-.05.55.03.55.08.43.16.53.23.5.24.37.42.51Z"/>
  </svg>
`;

export class MoonveilIconHeart extends HTMLElement {
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

customElements.define('moonveil-icon-heart', MoonveilIconHeart);
