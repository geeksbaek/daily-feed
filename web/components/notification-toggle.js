import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class NotificationToggle extends LitElement {
  static properties = {
    enabled: { type: Boolean },
    permission: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .notification-toggle {
      position: relative;
    }

    .toggle-button {
      padding: 6px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 140px;
      height: 32px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      user-select: none;
    }

    @media (max-width: 768px) {
      .toggle-button {
        min-width: unset;
        width: 100%;
        padding: 6px 4px;
        gap: 4px;
      }
    }

    .toggle-button:hover {
      border-color: var(--accent-color);
      background-color: var(--bg-secondary);
    }

    .toggle-button.enabled {
      background-color: var(--accent-color);
      border-color: var(--accent-color);
      color: white;
    }

    .toggle-button.enabled:hover {
      background-color: #3182ce;
      border-color: #3182ce;
    }

    .toggle-button.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-button.disabled:hover {
      border-color: var(--border-secondary);
      background-color: var(--bg-primary);
    }

    .icon {
      font-size: 11px;
    }

    .status-text {
      font-size: 11px;
      flex: 1;
      text-align: left;
    }
  `;

  constructor() {
    super();
    this.enabled = false;
    this.permission = 'default';
  }

  render() {
    const getButtonClass = () => {
      if (this.permission === 'denied') return 'toggle-button disabled';
      if (this.enabled && this.permission === 'granted') return 'toggle-button enabled';
      return 'toggle-button';
    };

    const getIcon = () => {
      if (this.permission === 'denied') return '🔕';
      if (this.enabled && this.permission === 'granted') return '🔔';
      return '🔔';
    };

    const getText = () => {
      if (this.permission === 'denied') return '차단됨';
      if (this.enabled && this.permission === 'granted') return '켜짐';
      return '꺼짐';
    };

    return html`
      <div class="notification-toggle">
        <button class="${getButtonClass()}" @click=${this.handleToggle}>
          <span class="icon">${getIcon()}</span>
          <span class="status-text">${getText()}</span>
        </button>
      </div>
    `;
  }

  handleToggle() {
    if (this.permission === 'denied') {
      // 브라우저 설정에서 알림을 차단한 경우 안내
      alert('알림이 차단되어 있습니다. 브라우저 설정에서 이 사이트의 알림을 허용해주세요.');
      return;
    }

    this.dispatchEvent(new CustomEvent('notification-toggle', {
      detail: { enabled: !this.enabled },
      bubbles: true
    }));
  }
}

customElements.define('notification-toggle', NotificationToggle);