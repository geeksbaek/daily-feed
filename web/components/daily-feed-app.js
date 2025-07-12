import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class DailyFeedApp extends LitElement {
  static properties = {
    allDates: { type: Array },
    currentData: { type: Object },
    selectedDate: { type: String },
    currentPreset: { type: String },
    isOffline: { type: Boolean },
    statusMessage: { type: String },
    statusType: { type: String },
    showStatus: { type: Boolean },
    isLoading: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      max-width: 100vw;
      width: 100%;
      margin: 0;
      padding: 24px;
      font-size: 17px;
      font-weight: 400;
      letter-spacing: -0.005em;
      word-break: keep-all;
      overflow-wrap: break-word;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
      padding-top: max(16px, env(safe-area-inset-top));
      padding-bottom: max(16px, env(safe-area-inset-bottom));
      box-sizing: border-box;
    }

    .main-layout {
      display: flex;
      gap: 32px;
      align-items: flex-start;
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
      box-sizing: border-box;
      position: relative;
    }

    .main-content {
      width: 100%;
      background-color: transparent;
      padding: 32px 32px 0 32px;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 24px;
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      :host {
        padding: 12px;
        padding-left: max(12px, env(safe-area-inset-left));
        padding-right: max(12px, env(safe-area-inset-right));
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: max(12px, env(safe-area-inset-bottom));
        font-size: 16px;
      }

      .main-layout {
        flex-direction: column;
        gap: 0;
      }

      .main-content {
        padding: 20px 20px 0 20px;
      }

      .controls-row {
        flex-direction: column;
        gap: 16px;
      }
    }

    /* 태블릿 반응형 */
    @media (min-width: 769px) and (max-width: 1024px) {
      :host {
        padding: 20px;
        padding-left: max(20px, env(safe-area-inset-left));
        padding-right: max(20px, env(safe-area-inset-right));
        padding-top: max(20px, env(safe-area-inset-top));
        padding-bottom: max(20px, env(safe-area-inset-bottom));
        font-size: 17px;
      }

      .main-layout {
        flex-direction: column;
        gap: 0;
      }

      .main-content {
        padding: 24px 24px 0 24px;
      }
    }

    /* 전체 화면 로딩 오버레이 */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .loading-overlay.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .loading-dot {
      width: 12px;
      height: 12px;
      background-color: var(--accent-color);
      border-radius: 50%;
      animation: loading-pulse 1.5s ease-in-out infinite;
    }

    .loading-dot:nth-child(1) {
      animation-delay: -0.3s;
    }

    .loading-dot:nth-child(2) {
      animation-delay: -0.15s;
    }

    .loading-dot:nth-child(3) {
      animation-delay: 0s;
    }

    .loading-text {
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 500;
    }

    @keyframes loading-pulse {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
  `;

  constructor() {
    super();
    this.allDates = [];
    this.currentData = {};
    this.selectedDate = null;
    this.currentPreset = 'default';
    this.isOffline = false;
    this.statusMessage = '';
    this.statusType = 'loading';
    this.showStatus = false;
    this.isLoading = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupMobileOptimizations();
    this.setupOfflineHandlers();
    this.loadAvailableDates();
  }

  render() {
    return html`
      <!-- 전체 화면 로딩 오버레이 -->
      <div class="loading-overlay ${this.isLoading ? '' : 'hidden'}">
        <div class="loading-spinner">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
        <div class="loading-text">Daily Feed를 불러오는 중...</div>
      </div>

      <main>
        <div class="main-layout">
          <div class="main-content">
            <div class="controls-row">
              <preset-tabs 
                .currentPreset=${this.currentPreset}
                @preset-changed=${this.handlePresetChange}
              ></preset-tabs>
              
              <date-selector 
                .dates=${this.allDates}
                .selectedDate=${this.selectedDate}
                @date-changed=${this.handleDateChange}
              ></date-selector>
            </div>
            
            <status-display 
              .message=${this.statusMessage}
              .type=${this.statusType}
              .show=${this.showStatus}
            ></status-display>
            
            <content-viewer 
              .data=${this.currentData}
              .preset=${this.currentPreset}
            ></content-viewer>
          </div>
        </div>
      </main>
      
      <app-footer></app-footer>
    `;
  }

  handleDateChange(e) {
    const newDate = e.detail.date;
    if (newDate && newDate !== this.selectedDate) {
      this.selectedDate = newDate;
      this.loadSelectedDate();
    }
  }

  handlePresetChange(e) {
    this.currentPreset = e.detail.preset;
  }

  showStatusMessage(message, type = 'loading') {
    this.statusMessage = message;
    this.statusType = type;
    this.showStatus = true;
  }

  hideStatus() {
    this.showStatus = false;
  }

  // 기존 script.js의 함수들을 이곳으로 이식
  async loadAvailableDates() {
    try {
      this.showStatusMessage('날짜 목록을 불러오는 중...', 'loading');
      
      const basePath = this.getBasePath();
      const url = `${basePath}/data/summaries/index.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json();
          if (errorData.error === 'offline') {
            throw new Error('OFFLINE');
          }
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const index = await response.json();
      this.allDates = index.map(entry => entry.date).sort().reverse();
      
      if (this.allDates.length > 0) {
        this.selectedDate = this.allDates[0];
        await this.loadSelectedDate();
      } else {
        this.showStatusMessage('아직 생성된 요약이 없습니다.', 'error');
      }
      
      // 로딩 완료
      this.isLoading = false;
      
    } catch (error) {
      console.error('날짜 목록 로드 실패:', error);
      
      // 오류 발생 시에도 로딩 숨김
      this.isLoading = false;
      
      if (error.message === 'OFFLINE') {
        this.showStatusMessage('오프라인 상태입니다. 캐시된 데이터가 없습니다.', 'error');
        this.tryLoadFromLocalStorage();
      } else {
        this.showStatusMessage('날짜 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
      }
    }
  }

  async loadSelectedDate() {
    if (!this.selectedDate) return;
    
    try {
      this.showStatusMessage('데이터를 불러오는 중...', 'loading');
      
      const basePath = this.getBasePath();
      const presets = ['default', 'developer', 'casual', 'community'];
      const newData = { date: this.selectedDate, summaries: {} };
      
      const promises = presets.map(async preset => {
        try {
          const response = await fetch(`${basePath}/data/summaries/${this.selectedDate}/${preset}.json`);
          if (response.ok) {
            const data = await response.json();
            newData.summaries[preset] = data;
          }
        } catch (error) {
          console.warn(`${preset} 프리셋 로드 실패:`, error);
        }
      });
      
      await Promise.all(promises);
      
      // 새로운 객체로 할당하여 Lit 리액티브 시스템 트리거
      this.currentData = { ...newData };
      this.saveToLocalStorage();
      this.hideStatus();
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      
      if (!navigator.onLine || error.message.includes('Failed to fetch')) {
        const cachedData = this.tryLoadDateFromLocalStorage(this.selectedDate);
        if (cachedData) {
          this.currentData = { ...cachedData };
          this.showStatusMessage('오프라인 상태 - 캐시된 데이터를 표시합니다.', 'offline');
          return;
        }
      }
      
      this.showStatusMessage('데이터를 불러오는데 실패했습니다.', 'error');
    }
  }

  setupMobileOptimizations() {
    // 기존 script.js의 모바일 최적화 로직
    let lastTouchEnd = 0;
    
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    document.addEventListener('touchstart', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
  }

  setupOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.showStatusMessage('온라인 상태로 변경되었습니다. 데이터를 새로고침합니다.', 'loading');
      setTimeout(() => {
        this.loadAvailableDates();
      }, 1000);
    });
    
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.showStatusMessage('오프라인 상태입니다. 캐시된 데이터를 사용합니다.', 'offline');
    });
    
    this.isOffline = !navigator.onLine;
    if (this.isOffline) {
      this.showStatusMessage('오프라인 상태입니다. 캐시된 데이터를 불러옵니다.', 'offline');
    }
  }

  getBasePath() {
    const path = window.location.pathname;
    
    // GitHub Pages에서 /daily-feed/ 경로로 서빙되는 경우
    if (path.includes('/daily-feed')) {
      return '/daily-feed';
    }
    
    // 로컬 개발 환경
    return '';
  }

  saveToLocalStorage() {
    try {
      const dataToSave = {
        allDates: this.allDates,
        currentData: this.currentData,
        timestamp: Date.now()
      };
      localStorage.setItem('daily-feed-cache', JSON.stringify(dataToSave));
      
      if (this.currentData && this.currentData.date) {
        localStorage.setItem(`daily-feed-${this.currentData.date}`, JSON.stringify(this.currentData));
      }
    } catch (error) {
      console.warn('로컬 스토리지 저장 실패:', error);
    }
  }

  tryLoadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('daily-feed-cache');
      if (savedData) {
        const data = JSON.parse(savedData);
        const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        
        if (ageHours < 24) {
          this.allDates = [...(data.allDates || [])];
          this.currentData = { ...(data.currentData || {}) };
          
          if (this.allDates.length > 0) {
            this.selectedDate = this.allDates[0];
            this.showStatusMessage(`캐시된 데이터를 표시합니다 (${Math.round(ageHours)}시간 전 데이터)`, 'offline');
            return true;
          }
        }
      }
    } catch (error) {
      console.warn('로컬 스토리지 로드 실패:', error);
    }
    return false;
  }

  tryLoadDateFromLocalStorage(date) {
    try {
      const savedData = localStorage.getItem(`daily-feed-${date}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.warn('로컬 스토리지에서 날짜 데이터 로드 실패:', error);
    }
    return null;
  }
}

customElements.define('daily-feed-app', DailyFeedApp);