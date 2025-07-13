import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class RefreshButton extends LitElement {
  static properties = {
    isRefreshing: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .refresh-button {
      padding: 6px 8px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      user-select: none;
    }

    @media (max-width: 768px) {
      .refresh-button {
        width: 100%;
        padding: 6px 4px;
      }
    }

    .refresh-button:hover {
      border-color: var(--accent-color);
      background-color: var(--bg-secondary);
      color: var(--accent-color);
    }

    .refresh-button:active {
      transform: scale(0.95);
    }

    .refresh-button.refreshing {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .refresh-button.refreshing:hover {
      border-color: var(--border-secondary);
      background-color: var(--bg-primary);
      color: var(--text-tertiary);
      transform: none;
    }

    .refresh-icon {
      font-size: 14px;
      line-height: 1;
      transition: transform 0.3s ease;
    }

    .refresh-button.refreshing .refresh-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `;

  constructor() {
    super();
    this.isRefreshing = false;
  }

  render() {
    return html`
      <button 
        class="refresh-button ${this.isRefreshing ? 'refreshing' : ''}"
        @click=${this.handleRefresh}
        ?disabled=${this.isRefreshing}
        title="캐시 제거 후 강제 새로고침"
      >
        <span class="refresh-icon">🔄</span>
      </button>
    `;
  }

  handleRefresh() {
    if (this.isRefreshing) return;

    this.dispatchEvent(new CustomEvent('force-refresh', {
      bubbles: true
    }));
  }
}

customElements.define('refresh-button', RefreshButton);