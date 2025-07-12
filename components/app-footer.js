import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class AppFooter extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-top: 64px;
      padding: 32px 16px;
      border-top: 1px solid var(--border-primary);
      text-align: center;
      background-color: transparent;
    }

    hr {
      display: none;
    }

    p {
      font-size: 15px;
      color: var(--text-secondary);
      font-weight: 500;
      margin: 0;
      letter-spacing: -0.01em;
    }

    a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    a:hover {
      color: var(--link-hover);
      text-decoration: underline;
    }
  `;

  render() {
    return html`
      <hr>
      <p>Daily Feed | GitHub Actions + Gemini AI | <a href="https://github.com/geeksbaek/daily-feed">GitHub</a></p>
    `;
  }
}

customElements.define('app-footer', AppFooter);