class BigNumberCardTest extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);
    const cardConfig = Object.assign({}, config);
    if (!cardConfig.scale) cardConfig.scale = "10px";
    if (!cardConfig.from) cardConfig.from = "left";
    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.id = "value"
    const title = document.createElement('div');
    title.id = "title"
    title.textContent = cardConfig.title;
    const style = document.createElement('style');
    style.textContent = `
      ha-card {
        --bignumber-fill-color: var(--google-red-500);
        --bignumber-percent: 100%;
        --bignumber-direction: ${cardConfig.from};
        --base-unit: ${cardConfig.scale};
        padding: calc(var(--base-unit)*0.6) calc(var(--base-unit)*0.3);
        background: linear-gradient(to var(--bignumber-direction), var(--paper-card-background-color) var(--bignumber-percent), var(--bignumber-fill-color) var(--bignumber-percent));
        border-radius: 8px;
      }
    `;
    card.appendChild(content);
    card.appendChild(title);
    card.appendChild(style);
    root.appendChild(card);
    this._config = cardConfig;
  }

  _computeSeverity(stateValue, sections) {
    const numberValue = Number(stateValue);
    let style;
    sections.forEach(section => {
      if (numberValue <= section.value && !style) {
        style = section.style;
      }
    });
    return style || 'var(--label-badge-blue)';
  }

  _translatePercent(value, min, max) {
    return 100-100 * (value - min) / (max - min);
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;
    const entityState = hass.states[config.entity].state || "";

    if (entityState !== this._entityState) {
      if (config.min !== undefined && config.max !== undefined) {
        root.querySelector("ha-card").style.setProperty('--bignumber-percent', `${this._translatePercent(entityState, config.min, config.max)}%`);
      }
      if (config.severity) {
        root.querySelector("ha-card").style.setProperty('--bignumber-fill-color', `${this._computeSeverity(entityState, config.severity)}`);
      }
    }
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('bignumber-card', BigNumberCardTest);
