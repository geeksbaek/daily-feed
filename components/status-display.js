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
      border-radius: 6px;
      border: 1px solid #d0d7de;
      display: none;
    }

    .status.show {
      display: block;
    }

    .status.loading {
      background-color: #ddf4ff;
      border-color: #54aeff;
      color: #0969da;
    }

    .status.error {
      background-color: #ffebe9;
      border-color: #ff818266;
      color: #d1242f;
    }

    .status.offline {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }
  `;

  constructor() {
    super();
    this.message = '';
    this.type = 'loading';
    this.show = false;
  }

  render() {
    return html`
      <div class="status ${this.type} ${this.show ? 'show' : ''}">
        ${this.message}
      </div>
    `;
  }
}

customElements.define('status-display', StatusDisplay);