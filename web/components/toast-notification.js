import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class ToastNotification extends LitElement {
  static properties = {
    message: { type: String },
    type: { type: String },
    show: { type: Boolean },
    autoHide: { type: Boolean },
    duration: { type: Number }
  };

  static styles = css`
    :host {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    }

    .toast {
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      max-width: 400px;
      word-wrap: break-word;
    }

    .toast.show {
      transform: translateX(0);
      opacity: 1;
    }

    .toast.success {
      background-color: #ecfdf5;
      border-color: #34d399;
      color: #065f46;
    }

    .toast.error {
      background-color: #fef2f2;
      border-color: #f87171;
      color: #dc2626;
    }

    .toast.loading {
      background-color: #eff6ff;
      border-color: #60a5fa;
      color: #1e40af;
    }

    .toast.offline {
      background-color: #fff3cd;
      border-color: #fbbf24;
      color: #92400e;
    }

    .icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
      line-height: 1.4;
    }

    .close-button {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      font-size: 18px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .close-button:hover {
      opacity: 1;
    }

    .spinner {
      width: 16px;
      height: 16px;
      display: flex;
      gap: 2px;
      align-items: center;
      flex-shrink: 0;
    }

    .spinner-dot {
      width: 3px;
      height: 3px;
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

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      :host {
        top: 10px;
        right: 10px;
        left: 10px;
        right: 10px;
      }

      .toast {
        max-width: none;
        margin: 0;
      }
    }
  `;

  constructor() {
    super();
    this.message = '';
    this.type = 'success';
    this.show = false;
    this.autoHide = true;
    this.duration = 3000;
    this._hideTimeout = null;
  }

  updated(changedProperties) {
    if (changedProperties.has('show')) {
      if (this.show && this.autoHide) {
        this._scheduleHide();
      } else if (!this.show) {
        this._clearHideTimeout();
      }
    }
  }

  render() {
    const getIcon = () => {
      switch (this.type) {
        case 'success':
          return html`<span class="icon">✅</span>`;
        case 'error':
          return html`<span class="icon">❌</span>`;
        case 'loading':
          return html`
            <div class="spinner">
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
              <div class="spinner-dot"></div>
            </div>
          `;
        case 'offline':
          return html`<span class="icon">📶</span>`;
        default:
          return html`<span class="icon">ℹ️</span>`;
      }
    };

    return html`
      <div class="toast ${this.type} ${this.show ? 'show' : ''}">
        ${getIcon()}
        <div class="message">${this.message}</div>
        <button class="close-button" @click=${this.hide}>×</button>
      </div>
    `;
  }

  showToast(message, type = 'success', autoHide = true, duration = 3000) {
    this.message = message;
    this.type = type;
    this.autoHide = autoHide;
    this.duration = duration;
    this.show = true;
  }

  hide() {
    this.show = false;
    this._clearHideTimeout();
    
    // 애니메이션 완료 후 이벤트 발송
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('toast-hidden', {
        bubbles: true
      }));
    }, 300);
  }

  _scheduleHide() {
    this._clearHideTimeout();
    this._hideTimeout = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  _clearHideTimeout() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
  }
}

customElements.define('toast-notification', ToastNotification);