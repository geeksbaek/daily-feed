import { LitElement, html, css, unsafeCSS } from 'https://unpkg.com/lit@3?module';
import { unsafeHTML } from 'https://unpkg.com/lit@3/directives/unsafe-html.js?module';

export class ContentViewer extends LitElement {
  static properties = {
    data: { type: Object },
    preset: { type: String },
    showPromptModal: { type: Boolean }
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

    .prompt-button-container {
      display: flex;
      justify-content: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border-secondary);
    }

    .prompt-button {
      padding: 8px 16px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .prompt-button:hover {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }

    .prompt-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      box-sizing: border-box;
    }

    .prompt-modal-content {
      background-color: var(--bg-primary);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      max-height: 80vh;
      width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* 모바일 환경에서 더 넓게 표시 */
    @media (max-width: 768px) {
      .prompt-modal {
        padding: 8px;
      }
      
      .prompt-modal-content {
        max-height: 95vh;
        border-radius: 12px;
      }
      
      .prompt-modal-header {
        padding: 16px;
      }
      
      .prompt-modal-title {
        font-size: 16px;
      }
      
      .prompt-modal-body {
        padding: 16px;
      }
      
      .prompt-section-title {
        font-size: 15px;
      }
      
      .prompt-text {
        padding: 12px;
        font-size: 12px;
        max-height: 150px;
      }
    }

    .prompt-modal-header {
      padding: 20px;
      border-bottom: 1px solid var(--border-secondary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .prompt-modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .prompt-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .prompt-modal-close:hover {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
    }

    .prompt-modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .prompt-section {
      margin-bottom: 24px;
    }

    .prompt-section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prompt-text {
      background-color: var(--code-bg);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      padding: 16px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 13px;
      line-height: 1.5;
      color: var(--code-text);
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-height: 200px;
      overflow-y: auto;
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
      color: var(--blockquote-text);
      border-left: 4px solid var(--blockquote-border);
      background-color: var(--blockquote-bg);
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
      background-color: var(--code-bg);
      color: var(--code-text);
      border-radius: 6px;
      font-size: 85%;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .markdown-content pre {
      padding: 16px;
      margin-bottom: 16px;
      background-color: var(--code-bg);
      color: var(--code-text);
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
      border: 1px solid var(--table-border);
      color: var(--text-primary);
    }

    .markdown-content table th {
      font-weight: 600;
      background-color: var(--table-header-bg);
    }

    .markdown-content table tr:nth-child(even) {
      background-color: var(--table-row-alt-bg);
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
    this.preset = 'general';
    this.showPromptModal = false;
    this.originalBodyOverflow = '';
    this.originalBodyPosition = '';
    this.originalBodyTop = '';
    this.originalScrollY = 0;
    this.boundFootnoteHandler = this.handleFootnoteClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.shadowRoot) {
      this.shadowRoot.addEventListener('click', this.boundFootnoteHandler);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.shadowRoot) {
      this.shadowRoot.removeEventListener('click', this.boundFootnoteHandler);
    }
    // 컴포넌트 제거 시 바깥 스크롤 복원
    this.enableBodyScroll();
  }

  handleFootnoteClick(e) {
    const path = e.composedPath();
    const link = path.find(el => el.classList && el.classList.contains('footnote-ref'));
    if (link) {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#footnote-')) {
        const targetId = href.substring(1);
        const targetElement = this.shadowRoot.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // 잠깐 하이라이트 효과
          targetElement.style.backgroundColor = 'var(--accent-color)';
          targetElement.style.opacity = '0.3';
          setTimeout(() => {
            targetElement.style.backgroundColor = '';
            targetElement.style.opacity = '';
          }, 1000);
        }
      }
    }
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
          <p style="font-size: 12px; color: #666;">
            (현재 프리셋: ${this.preset}, 사용 가능한 프리셋: ${Object.keys(summaries).join(', ')})
          </p>
        </div>
      `;
    }

    const presetLabels = {
      'general': '📰 뉴스',
      'casual': '💬 캐주얼',
      'community': '🏠 커뮤니티',
      'default': '🔍 기본',
      'developer': '👨‍💻 개발자'
    };

    return html`
      <div class="content">
        <div class="summary-section">
          <div class="markdown-content">
            ${unsafeHTML(this.renderMarkdown(selectedData.summary))}
          </div>
          <div class="prompt-button-container">
            <button class="prompt-button" @click=${this.showPrompt}>
              🤖 프롬프트 보기
            </button>
          </div>
        </div>
      </div>
      
      ${this.showPromptModal ? this.renderPromptModal(selectedData) : ''}
    `;
  }

  renderMarkdown(content) {
    try {
      // Footnote 전처리
      const processedContent = this.processFootnotes(content);
      
      // Marked.js로 마크다운 파싱 (전역에서 사용 가능하다고 가정)
      const html = marked.parse(processedContent);
      
      // DOMPurify로 XSS 방지 (전역에서 사용 가능하다고 가정)
      return DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel']
      });
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
    return div.innerHTML
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  showPrompt() {
    this.showPromptModal = true;
    this.disableBodyScroll();
  }

  hidePrompt() {
    this.showPromptModal = false;
    this.enableBodyScroll();
  }

  disableBodyScroll() {
    // 현재 스크롤 위치 저장
    this.originalScrollY = window.scrollY;
    this.originalBodyOverflow = document.body.style.overflow;
    this.originalBodyPosition = document.body.style.position;
    this.originalBodyTop = document.body.style.top;

    // 스크롤 위치 고정
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.originalScrollY}px`;
    document.body.style.width = '100%';
  }

  enableBodyScroll() {
    // 원래 스타일 복원
    document.body.style.overflow = this.originalBodyOverflow;
    document.body.style.position = this.originalBodyPosition;
    document.body.style.top = this.originalBodyTop;
    document.body.style.width = '';

    // 스크롤 위치 복원
    window.scrollTo(0, this.originalScrollY);
  }

  renderPromptModal(data) {
    if (!data.systemPrompt && !data.userPrompt) {
      return html`
        <div class="prompt-modal" @click=${this.handleModalClick}>
          <div class="prompt-modal-content" @click=${this.handleModalContentClick}>
            <div class="prompt-modal-header">
              <div class="prompt-modal-title">프롬프트 정보</div>
              <button class="prompt-modal-close" @click=${this.hidePrompt}>×</button>
            </div>
            <div class="prompt-modal-body" @scroll=${this.handleModalScroll}>
              <p style="text-align: center; color: var(--text-secondary); padding: 40px;">
                이 데이터에는 프롬프트 정보가 포함되어 있지 않습니다.
              </p>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="prompt-modal" @click=${this.handleModalClick}>
        <div class="prompt-modal-content" @click=${this.handleModalContentClick}>
          <div class="prompt-modal-header">
            <div class="prompt-modal-title">🤖 AI 프롬프트 정보</div>
            <button class="prompt-modal-close" @click=${this.hidePrompt}>×</button>
          </div>
          <div class="prompt-modal-body" @scroll=${this.handleModalScroll}>
            ${data.systemPrompt ? html`
              <div class="prompt-section">
                <div class="prompt-section-title">
                  ⚙️ 시스템 프롬프트
                </div>
                <div class="prompt-text">${data.systemPrompt}</div>
              </div>
            ` : ''}
            
            ${data.userPrompt ? html`
              <div class="prompt-section">
                <div class="prompt-section-title">
                  💬 사용자 프롬프트
                </div>
                <div class="prompt-text">${data.userPrompt}</div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  handleModalClick(e) {
    // 모달 배경 클릭 시 닫기
    if (e.target.classList.contains('prompt-modal')) {
      this.hidePrompt();
    }
  }

  handleModalContentClick(e) {
    // 모달 내용 클릭 시 이벤트 전파 방지
    e.stopPropagation();
  }

  handleModalScroll(e) {
    // 모달 스크롤 이벤트 전파 방지
    e.stopPropagation();
  }

}

customElements.define('content-viewer', ContentViewer);