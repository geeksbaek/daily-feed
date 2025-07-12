import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class StatusDisplay extends LitElement {
  static properties = {
    message: { type: String },
    type: { type: String },
    show: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .status {
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      border: 1px solid var(--border-secondary);
      display: none;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .status.show {
      display: flex;
    }

    .status.loading {
      background-color: var(--status-loading-bg);
      border-color: var(--status-loading-border);
      color: var(--status-loading-text);
    }

    .status.error {
      background-color: var(--status-error-bg);
      border-color: var(--status-error-border);
      color: var(--status-error-text);
    }

    .status.offline {
      background-color: var(--status-offline-bg);
      border-color: var(--status-offline-border);
      color: var(--status-offline-text);
    }

    .spinner {
      width: 40px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .spinner-dot {
      width: 6px;
      height: 6px;
      background-color: currentColor;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .spinner-dot:nth-child(1) {
      animation-delay: -0.3s;
    }

    .spinner-dot:nth-child(2) {
      animation-delay: -0.15s;
    }

    .spinner-dot:nth-child(3) {
      animation-delay: 0s;
    }

    .icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    @keyframes pulse {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .message {
      line-height: 1.4;
    }
  `;

  constructor() {
    super();
    this.message = '';
    this.type = 'loading';
    this.show = false;
  }

  render() {
    const getIcon = () => {
      switch (this.type) {
        case 'loading':
          return html`
            <div class="spinner">
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
            </div>
          `;
        case 'error':
          return html`<div class="icon">⚠️</div>`;
        case 'offline':
          return html`<div class="icon">📡</div>`;
        default:
          return html`
            <div class="spinner">
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
            </div>
          `;
      }
    };

    return html`
      <div class="status ${this.type} ${this.show ? 'show' : ''}">
        ${getIcon()}
        <div class="message">${this.message}</div>
      </div>
    `;
  }
}

customElements.define('status-display', StatusDisplay);