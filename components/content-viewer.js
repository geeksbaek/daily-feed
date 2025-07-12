import { LitElement, html, css, unsafeCSS } from 'https://unpkg.com/lit@3?module';
import { unsafeHTML } from 'https://unpkg.com/lit@3/directives/unsafe-html.js?module';

export class ContentViewer extends LitElement {
  static properties = {
    data: { type: Object },
    preset: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .content {
      line-height: 1.6;
      overflow-x: hidden;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      width: 100%;
      box-sizing: border-box;
    }

    .summary-section {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .preset-header {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-secondary);
    }


    /* GitHub Flavored Markdown 스타일 */
    .markdown-content {
      overflow-x: hidden;
      word-wrap: break-word;
      overflow-wrap: break-word;
      width: 100%;
      box-sizing: border-box;
    }

    .markdown-content * {
      max-width: 100%;
      box-sizing: border-box;
    }

    .markdown-content h1 {
      font-size: 32px;
      font-weight: 700;
      padding-bottom: 12px;
      margin: 32px 0 20px 0;
      border-bottom: 2px solid var(--border-primary);
      color: var(--text-primary);
      letter-spacing: -0.02em;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .markdown-content h2 {
      font-size: 26px;
      font-weight: 700;
      padding-bottom: 10px;
      margin: 28px 0 18px 0;
      border-bottom: 2px solid var(--border-primary);
      color: var(--text-primary);
      letter-spacing: -0.015em;
    }

    .markdown-content h3 {
      font-size: 22px;
      font-weight: 700;
      margin: 24px 0 16px 0;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .markdown-content h4 {
      font-size: 19px;
      font-weight: 600;
      margin: 20px 0 14px 0;
      color: var(--text-primary);
    }

    .markdown-content h5 {
      font-size: 17px;
      font-weight: 600;
      margin: 18px 0 12px 0;
      color: var(--text-secondary);
    }

    .markdown-content h6 {
      font-size: 15px;
      font-weight: 600;
      margin: 16px 0 10px 0;
      color: var(--text-secondary);
    }

    .markdown-content p {
      margin-bottom: 20px;
      line-height: 1.9;
      font-size: 17px;
      color: var(--text-primary);
      font-weight: 400;
      word-wrap: break-word;
      overflow-wrap: break-word;
      width: 100%;
      box-sizing: border-box;
    }

    .markdown-content ul, .markdown-content ol {
      margin-bottom: 20px;
      padding-left: 24px;
    }

    .markdown-content li {
      margin-bottom: 8px;
      line-height: 1.8;
      font-size: 17px;
    }

    .markdown-content li > p {
      margin-bottom: 12px;
    }

    .markdown-content blockquote {
      padding: 16px 20px;
      margin-bottom: 24px;
      color: #4a5568;
      border-left: 4px solid #4299e1;
      background-color: #f7fafc;
      border-radius: 0 8px 8px 0;
      font-size: 16px;
      line-height: 1.8;
    }

    .markdown-content blockquote > :first-child {
      margin-top: 0;
    }

    .markdown-content blockquote > :last-child {
      margin-bottom: 0;
    }

    .markdown-content code {
      padding: 2px 6px;
      background-color: #f6f8fa;
      border-radius: 6px;
      font-size: 85%;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .markdown-content pre {
      padding: 16px;
      margin-bottom: 16px;
      background-color: #f6f8fa;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 85%;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      max-width: 100%;
      box-sizing: border-box;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .markdown-content pre code {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      font-size: 100%;
    }

    .markdown-content table {
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
      margin-bottom: 16px;
    }

    .markdown-content table th,
    .markdown-content table td {
      padding: 6px 13px;
      border: 1px solid #d0d7de;
    }

    .markdown-content table th {
      font-weight: 600;
      background-color: #f6f8fa;
    }

    .markdown-content table tr:nth-child(even) {
      background-color: #f6f8fa;
    }

    .markdown-content hr {
      height: 4px;
      padding: 0;
      margin: 24px 0;
      background-color: #d0d7de;
      border: 0;
    }

    .markdown-content a {
      color: var(--link-color);
      text-decoration: none;
    }

    .markdown-content a:hover {
      text-decoration: underline;
      color: var(--link-hover);
    }

    .markdown-content strong {
      font-weight: 700;
      color: var(--text-primary);
    }

    .markdown-content em {
      font-style: italic;
    }

    /* Footnote 스타일 */
    .footnote-ref {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.7em;
      vertical-align: baseline;
      position: relative;
      top: -0.3em;
      padding: 0 1px;
      line-height: 0;
      opacity: 0.7;
      font-weight: 400;
      transition: opacity 0.2s ease;
    }

    .footnote-ref:hover {
      opacity: 1;
      color: var(--accent-color);
      text-decoration: none;
    }

    .footnote-definition {
      margin-bottom: 8px;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-secondary);
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-primary);
    }

    .footnote-definition:last-child {
      border-bottom: none;
    }

    .footnote-definition strong {
      color: var(--link-color);
      margin-right: 8px;
    }

    .footnote-definition a {
      color: var(--text-primary);
      text-decoration: none;
    }

    .footnote-definition a:hover {
      color: var(--link-color);
      text-decoration: underline;
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      .markdown-content h1 {
        font-size: 24px;
      }

      .markdown-content h2 {
        font-size: 20px;
      }
    }
  `;

  constructor() {
    super();
    this.data = {};
    this.preset = 'default';
  }

  render() {
    const summaries = this.data.summaries;
    
    if (!summaries || Object.keys(summaries).length === 0) {
      return html`
        <div class="content">
          <p>불러올 수 있는 요약이 없습니다.</p>
        </div>
      `;
    }

    const selectedData = summaries[this.preset];
    if (!selectedData) {
      return html`
        <div class="content">
          <p>조건에 맞는 요약을 찾을 수 없습니다.</p>
        </div>
      `;
    }

    const presetLabels = {
      'default': 'Default',
      'developer': 'Developer', 
      'casual': 'Casual',
      'community': 'Community'
    };

    return html`
      <div class="content">
        <div class="summary-section">
          <div class="markdown-content">
            ${unsafeHTML(this.renderMarkdown(selectedData.summary))}
          </div>
        </div>
      </div>
    `;
  }

  renderMarkdown(content) {
    try {
      // Footnote 전처리
      const processedContent = this.processFootnotes(content);
      
      // Marked.js로 마크다운 파싱 (전역에서 사용 가능하다고 가정)
      const html = marked.parse(processedContent);
      
      // DOMPurify로 XSS 방지 (전역에서 사용 가능하다고 가정)
      return DOMPurify.sanitize(html);
    } catch (error) {
      console.error('마크다운 렌더링 실패:', error);
      // 실패 시 기본 HTML 이스케이프
      return content.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/\n/g, '<br>');
    }
  }

  processFootnotes(content) {
    const footnotes = {};
    let processedContent = content;
    
    // 1. Footnote 정의 수집 및 제거 (맨 아래 [^1]: 링크 형태)
    const footnoteDefRegex = /^\[\^([^\]]+)\]:\s*(.+)$/gm;
    let match;
    
    while ((match = footnoteDefRegex.exec(content)) !== null) {
      const [fullMatch, id, definition] = match;
      footnotes[id] = definition.trim();
      // 정의를 본문에서 제거
      processedContent = processedContent.replace(fullMatch, '');
    }
    
    // 2. Footnote 참조를 링크로 변환 ([^1] 형태)
    const footnoteRefRegex = /\[\^([^\]]+)\]/g;
    processedContent = processedContent.replace(footnoteRefRegex, (match, id) => {
      if (footnotes[id]) {
        return `<a href="#footnote-${id}" class="footnote-ref" title="${this.escapeHtml(footnotes[id])}">[${id}]</a>`;
      }
      return match; // 정의가 없으면 원본 유지
    });
    
    // 3. Footnote 섹션을 맨 아래 추가
    if (Object.keys(footnotes).length > 0) {
      processedContent += '\n\n## 참고 자료\n\n';
      for (const [id, definition] of Object.entries(footnotes)) {
        // 링크 형태 감지 및 처리
        const linkMatch = definition.match(/^(.+?)\s+-\s+(https?:\/\/.+)$/);
        if (linkMatch) {
          const [, title, url] = linkMatch;
          processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(title)}</a></div>\n`;
        } else {
          // URL만 있는 경우도 처리
          const urlMatch = definition.match(/^(https?:\/\/.+)$/);
          if (urlMatch) {
            const url = urlMatch[1];
            processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></div>\n`;
          } else {
            processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> ${this.escapeHtml(definition)}</div>\n`;
          }
        }
      }
    }
    
    return processedContent;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

}

customElements.define('content-viewer', ContentViewer);