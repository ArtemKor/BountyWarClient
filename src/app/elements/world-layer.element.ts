const template = `
<div></div>
`;

export class WorldLayerElement extends HTMLElement {

    connectedCallback() {
        this.innerHTML = template;
    }

    attributeChangedCallback() {
    }

    disconnectedCallback() {
    }
}

window.customElements.define('world-layer', WorldLayerElement);