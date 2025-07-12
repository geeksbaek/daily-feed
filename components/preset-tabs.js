import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class PresetTabs extends LitElement {
  static properties = {
    currentPreset: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .preset-tabs {
      display: flex;
      margin-bottom: 24px;
      border-bottom: 1px solid #d0d7de;
      overflow-x: auto;
    }

    .tab-button {
      padding: 14px 20px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      color: #718096;
      white-space: nowrap;
      transition: all 0.2s ease;
      letter-spacing: -0.01em;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      -webkit-tap-highlight-color: rgba(66, 153, 225, 0.1);
      position: relative;
    }

    .tab-button:hover {
      color: #2d3748;
      background-color: #f7fafc;
    }

    .tab-button:active {
      transform: scale(0.98);
      background-color: #e2e8f0;
    }

    .tab-button.active {
      color: #4299e1;
      border-bottom-color: #4299e1;
      font-weight: 700;
    }

    /* 태블릿 반응형 */
    @media (min-width: 769px) and (max-width: 1024px) {
      .preset-tabs {
        gap: 8px;
        margin-bottom: 28px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-bottom: none;
      }
      
      .tab-button {
        min-width: 120px;
        padding: 16px 24px;
        font-size: 17px;
        border-radius: 8px;
        border-bottom: none;
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        margin-bottom: 0;
        transition: all 0.2s ease;
      }
      
      .tab-button:hover {
        background-color: #e2e8f0;
        border-color: #d0d7de;
      }
      
      .tab-button.active {
        background-color: #4299e1;
        color: white;
        border-color: #4299e1;
        border-bottom-color: #4299e1;
        box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
      }
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .preset-tabs {
        overflow-x: auto;
        border-bottom: 1px solid #d0d7de;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding-bottom: 0;
      }
      
      .preset-tabs::-webkit-scrollbar {
        display: none;
      }
      
      .tab-button {
        flex: 0 0 auto;
        min-width: 100px;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        margin-bottom: 0;
        padding: 16px 24px;
      }
      
      .tab-button.active {
        border-bottom-color: #0969da;
      }
    }
  `;

  constructor() {
    super();
    this.currentPreset = 'default';
  }

  render() {
    const presets = [
      { key: 'default', label: 'Default' },
      { key: 'developer', label: 'Developer' },
      { key: 'casual', label: 'Casual' },
      { key: 'community', label: 'Community' }
    ];

    return html`
      <div class="preset-tabs">
        ${presets.map(preset => html`
          <button 
            class="tab-button ${preset.key === this.currentPreset ? 'active' : ''}"
            data-preset=${preset.key}
            @click=${() => this.handlePresetClick(preset.key)}
          >
            ${preset.label}
          </button>
        `)}
      </div>
    `;
  }

  handlePresetClick(preset) {
    this.dispatchEvent(new CustomEvent('preset-changed', {
      detail: { preset },
      bubbles: true
    }));
  }
}

customElements.define('preset-tabs', PresetTabs);