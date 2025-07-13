import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class PresetTabs extends LitElement {
  static properties = {
    currentPreset: { type: String },
    availablePresets: { type: Array }
  };

  static styles = css`
    :host {
      display: block;
    }

    .preset-selector {
      position: relative;
    }

    .preset-select {
      padding: 6px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 12px;
      padding-right: 32px;
      min-width: 140px;
      transition: all 0.2s ease;
    }

    @media (max-width: 768px) {
      .preset-select {
        min-width: unset;
        width: 100%;
        padding: 6px 20px 6px 4px;
        background-position: right 4px center;
        background-size: 10px;
      }
    }

    .preset-select:hover {
      border-color: var(--accent-color);
      background-color: var(--bg-secondary);
    }

    .preset-select:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
    }
  `;

  constructor() {
    super();
    this.currentPreset = 'general';
    this.availablePresets = [];
  }

  render() {
    const presetLabels = this.getPresetLabels();
    
    if (!this.availablePresets || this.availablePresets.length === 0) {
      return html`
        <div class="preset-selector">
          <select class="preset-select" disabled>
            <option>프리셋 없음</option>
          </select>
        </div>
      `;
    }

    return html`
      <div class="preset-selector">
        <select class="preset-select" @change=${this.handlePresetChange}>
          ${this.availablePresets.map(presetKey => html`
            <option value=${presetKey} ?selected=${presetKey === this.currentPreset}>
              ${presetLabels[presetKey] || presetKey}
            </option>
          `)}
        </select>
      </div>
    `;
  }

  getPresetLabels() {
    return {
      'general': '📰 뉴스',
      'casual': '💬 캐주얼',
      'community': '🏠 커뮤니티',
      'default': '🔍 기본',
      'developer': '👨‍💻 개발자'
    };
  }

  handlePresetChange(e) {
    const newPreset = e.target.value;
    this.dispatchEvent(new CustomEvent('preset-changed', {
      detail: { preset: newPreset },
      bubbles: true
    }));
  }
}

customElements.define('preset-tabs', PresetTabs);