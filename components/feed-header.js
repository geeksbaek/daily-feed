import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class FeedHeader extends LitElement {
  static styles = css`
    :host {
      display: block;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 32px;
      text-align: center;
    }

    h1 {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a202c;
      letter-spacing: -0.05em;
      margin: 0 0 12px 0;
    }

    p {
      font-size: 18px;
      color: #718096;
      font-weight: 500;
      margin: 0;
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      h1 {
        font-size: 24px;
      }
    }
  `;

  render() {
    return html`
      <h1>Daily Feed</h1>
      <p>AI 기반 기술 뉴스 요약</p>
    `;
  }
}

customElements.define('feed-header', FeedHeader);