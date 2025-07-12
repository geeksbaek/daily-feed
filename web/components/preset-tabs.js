import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class PresetTabs extends LitElement {
  static properties = {
    currentPreset: { type: String }
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
    this.currentPreset = 'default';
  }

  render() {
    const presets = [
      { key: 'default', label: '📰 일반' },
      { key: 'developer', label: '🔧 개발자' },
      { key: 'casual', label: '☕ 캐주얼' },
      { key: 'community', label: '💬 커뮤니티' }
    ];

    return html`
      <div class="preset-selector">
        <select class="preset-select" @change=${this.handlePresetChange}>
          ${presets.map(preset => html`
            <option value=${preset.key} ?selected=${preset.key === this.currentPreset}>
              ${preset.label}
            </option>
          `)}
        </select>
      </div>
    `;
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