import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class DailyFeedApp extends LitElement {
  static properties = {
    allDates: { type: Array },
    currentData: { type: Object },
    selectedDate: { type: String },
    currentPreset: { type: String },
    availablePresets: { type: Array },
    isOffline: { type: Boolean },
    showLoadingOverlay: { type: Boolean },
    loadingMessage: { type: String },
    isLoading: { type: Boolean },
    notificationEnabled: { type: Boolean },
    notificationPermission: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Segoe UI', Roboto, sans-serif;
      line-height: 1.8;
      color: var(--text-primary);
      background-color: var(--bg-primary);
      width: 100%;
      margin: 0;
      padding: 0;
      font-size: 17px;
      font-weight: 400;
      letter-spacing: -0.005em;
      word-break: keep-all;
      overflow-wrap: break-word;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }

    .main-layout {
      display: flex;
      gap: 32px;
      align-items: flex-start;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
      padding-left: max(24px, env(safe-area-inset-left));
      padding-right: max(24px, env(safe-area-inset-right));
      padding-top: max(24px, env(safe-area-inset-top));
      padding-bottom: max(24px, env(safe-area-inset-bottom));
      overflow-x: hidden;
      box-sizing: border-box;
      position: relative;
    }

    .main-content {
      width: 100%;
      background-color: transparent;
      padding: 0 16px 0 16px;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .controls-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .controls-right {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    /* 대형 데스크톱 */
    @media (min-width: 1400px) {
      .main-layout {
        max-width: 1000px;
      }
    }

    /* 모바일 반응형 */
    @media (max-width: 768px) {
      :host {
        font-size: 16px;
      }

      .main-layout {
        flex-direction: column;
        gap: 0;
        padding: 12px;
        padding-left: max(12px, env(safe-area-inset-left));
        padding-right: max(12px, env(safe-area-inset-right));
        padding-top: max(12px, env(safe-area-inset-top));
        padding-bottom: max(12px, env(safe-area-inset-bottom));
      }

      .main-content {
        padding: 0 16px 0 16px;
      }

      .controls-row {
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      }

      .controls-left,
      .controls-right {
        display: contents;
      }

      notification-toggle,
      preset-tabs,
      date-selector {
        flex: 1;
        min-width: 0;
        width: 0;
      }

    }

    /* 태블릿 반응형 */
    @media (min-width: 769px) and (max-width: 1024px) {
      :host {
        font-size: 17px;
      }

      .main-layout {
        flex-direction: column;
        gap: 0;
        padding: 20px;
        padding-left: max(20px, env(safe-area-inset-left));
        padding-right: max(20px, env(safe-area-inset-right));
        padding-top: max(20px, env(safe-area-inset-top));
        padding-bottom: max(20px, env(safe-area-inset-bottom));
      }

      .main-content {
        padding: 0 16px 0 16px;
      }
    }


    /* 로딩 오버레이 */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .loading-content {
      text-align: center;
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 500;
    }

    .loading-dots {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 8px;
    }

    .loading-dot {
      width: 6px;
      height: 6px;
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

    /* 새로운 로딩 오버레이 */
    .simple-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      gap: 16px;
    }

    /* 다크모드 지원 */
    @media (prefers-color-scheme: dark) {
      .simple-loading-overlay {
        background-color: rgba(23, 25, 35, 0.9);
      }
    }

    .simple-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-secondary);
      border-top: 3px solid var(--accent-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .simple-loading-text {
      color: var(--text-secondary);
      font-size: 16px;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.allDates = [];
    this.indexData = {}; // 전체 index 데이터 저장
    this.currentData = {};
    this.selectedDate = null;
    this.currentPreset = this.loadPresetFromStorage();
    this.availablePresets = [];
    this.isOffline = false;
    this.showLoadingOverlay = false;
    this.loadingMessage = '';
    this.isLoading = true;
    this.lastKnownDates = [];
    this.notificationPermission = 'default';
    this.notificationEnabled = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupMobileOptimizations();
    this.setupOfflineHandlers();
    this.setupNotifications();
    this.setupBrowserRefreshHandler();
    this.loadAvailableDates();
    this.setupAutoRefresh();
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="loading-overlay">
          <div class="loading-content">
            Daily Feed를 불러오는 중
            <span class="loading-dots">
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
              <div class="loading-dot"></div>
            </span>
          </div>
        </div>
      `;
    }

    return html`
      <main>
        <div class="main-layout">
          <div class="main-content">
            <div class="controls-row">
              <div class="controls-left">
                <notification-toggle
                  .enabled=${this.notificationEnabled}
                  .permission=${this.notificationPermission}
                  @notification-toggle=${this.handleNotificationToggle}
                ></notification-toggle>
              </div>
              
              <div class="controls-right">
                <preset-tabs 
                  .currentPreset=${this.currentPreset}
                  .availablePresets=${this.availablePresets}
                  @preset-changed=${this.handlePresetChange}
                ></preset-tabs>
                
                <date-selector 
                  .dates=${this.allDates}
                  .selectedDate=${this.selectedDate}
                  @date-changed=${this.handleDateChange}
                ></date-selector>
              </div>
            </div>
            
            <content-viewer 
              .data=${this.currentData}
              .preset=${this.currentPreset}
            ></content-viewer>
          </div>
        </div>
      </main>
      
      ${this.showLoadingOverlay ? html`
        <div class="simple-loading-overlay">
          <div class="simple-spinner"></div>
          <div class="simple-loading-text">${this.loadingMessage}</div>
        </div>
      ` : ''}
      
      <toast-notification id="toast"></toast-notification>
      
      <app-footer></app-footer>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('selectedDate')) {
      this.updateUrl();
    }
  }

  handleDateChange(e) {
    const newDate = e.detail.date;
    if (newDate && newDate !== this.selectedDate) {
      this.selectedDate = newDate;
      this.updateAvailablePresets();
      this.loadSelectedDate();
    }
  }

  handlePresetChange(e) {
    this.currentPreset = e.detail.preset;
    
    // 선택한 프리셋을 로컬 스토리지에 저장
    this.savePresetToStorage(this.currentPreset);
  }

  async handleNotificationToggle(e) {
    const enabled = e.detail.enabled;
    
    if (enabled) {
      // 알림 활성화 요청
      if (this.notificationPermission === 'granted') {
        this.notificationEnabled = true;
        localStorage.setItem('daily-feed-notifications', 'true');
      } else {
        // 권한 요청
        try {
          const permission = await Notification.requestPermission();
          this.notificationPermission = permission;
          
          if (permission === 'granted') {
            this.notificationEnabled = true;
            localStorage.setItem('daily-feed-notifications', 'true');
          } else {
            this.notificationEnabled = false;
            localStorage.setItem('daily-feed-notifications', 'false');
          }
        } catch (error) {
          console.error('알림 권한 요청 실패:', error);
          this.notificationEnabled = false;
        }
      }
    } else {
      // 알림 비활성화
      this.notificationEnabled = false;
      localStorage.setItem('daily-feed-notifications', 'false');
    }
  }

  setupBrowserRefreshHandler() {
    // 페이지 로드/새로고침 시 캐시 제거 및 강제 새 데이터 로드
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
      // 새로고침으로 페이지에 접근한 경우
      this.handleBrowserRefresh();
    }
  }

  async handleBrowserRefresh() {
    try {
      // 모든 캐시 제거
      await this.clearAllCaches();
      
      // Toast로 알림 표시
      this.showToast('캐시가 제거되고 새 데이터를 불러옵니다', 'success');
      
    } catch (error) {
      console.error('브라우저 새로고침 처리 실패:', error);
      this.showToast('캐시 제거 중 오류가 발생했습니다', 'error');
    }
  }

  async clearAllCaches() {
    try {
      // 로컬 스토리지에서 캐시 데이터 제거 (설정은 유지)
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('daily-feed-cache') || key.startsWith('daily-feed-2'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // 브라우저 캐시 제거 (가능한 경우)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
    } catch (error) {
      console.warn('캐시 제거 중 일부 오류 발생:', error);
    }
  }

  loadPresetFromStorage() {
    try {
      const savedPreset = localStorage.getItem('daily-feed-preset');
      const validPresets = ['general', 'casual', 'community', 'default', 'developer'];
      
      if (savedPreset && validPresets.includes(savedPreset)) {
        return savedPreset;
      }
    } catch (error) {
      console.warn('프리셋 로드 실패:', error);
    }
    
    return 'general'; // 기본값
  }

  savePresetToStorage(preset) {
    try {
      localStorage.setItem('daily-feed-preset', preset);
    } catch (error) {
      console.warn('프리셋 저장 실패:', error);
    }
  }

  showLoading(message = '로딩 중...') {
    this.loadingMessage = message;
    this.showLoadingOverlay = true;
  }

  hideLoading() {
    this.showLoadingOverlay = false;
  }

  showToast(message, type = 'success', autoHide = true, duration = 3000) {
    const toast = this.shadowRoot.getElementById('toast');
    if (toast) {
      toast.showToast(message, type, autoHide, duration);
    }
  }

  updateAvailablePresets() {
    if (!this.selectedDate || !this.indexData[this.selectedDate]) {
      this.availablePresets = [];
      return;
    }
    
    this.availablePresets = this.indexData[this.selectedDate].presets || [];
    
    // 현재 선택된 프리셋이 사용 가능한 목록에 없으면 첫 번째 프리셋으로 변경
    if (this.availablePresets.length > 0 && !this.availablePresets.includes(this.currentPreset)) {
      this.currentPreset = this.availablePresets[0];
      this.savePresetToStorage(this.currentPreset);
    }
  }

  // 기존 script.js의 함수들을 이곳으로 이식
  async loadAvailableDates() {
    try {
      this.showLoading('날짜 목록을 불러오는 중...');
      
      const basePath = this.getBasePath();
      const url = `${basePath}/data/summaries/index.json?t=${Date.now()}`;
      const response = await fetch(url, { 
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
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
      
      // index 전체 데이터 저장
      this.indexData = {};
      index.forEach(entry => {
        this.indexData[entry.date] = entry;
      });
      
      const newDates = index.map(entry => entry.date).sort().reverse();
      
      // 새로운 날짜가 추가되었는지 확인
      this.checkForNewDates(newDates);
      
      this.allDates = newDates;

      if (this.allDates.length > 0) {
        const urlDate = this.getDateFromUrl();
        if (urlDate && this.allDates.includes(urlDate)) {
          this.selectedDate = urlDate;
        } else if (this.selectedDate && this.allDates.includes(this.selectedDate)) {
          // keep current selected date
        } else {
          this.selectedDate = this.allDates[0];
        }
        this.updateAvailablePresets();
        await this.loadSelectedDate();
      } else {
        this.showToast('아직 생성된 요약이 없습니다.', 'error');
        this.hideLoading();
      }
      
      // 로딩 완료
      this.isLoading = false;
      this.hideLoading();
      
    } catch (error) {
      console.error('날짜 목록 로드 실패:', error);
      
      // 오류 발생 시에도 로딩 숨김
      this.isLoading = false;
      this.hideLoading();
      
      if (error.message === 'OFFLINE') {
        this.showToast('오프라인 상태입니다. 캐시된 데이터가 없습니다.', 'error', true, 5000);
        this.tryLoadFromLocalStorage();
      } else {
        this.showToast('날짜 목록을 불러오는데 실패했습니다.', 'error', true, 5000);
      }
    }
  }

  async loadSelectedDate() {
    if (!this.selectedDate) return;
    
    try {
      this.showLoading('데이터를 불러오는 중...');
      
      const basePath = this.getBasePath();
      const presets = this.availablePresets || ['general'];
      const newData = { date: this.selectedDate, summaries: {} };
      
      const promises = presets.map(async preset => {
        try {
          const response = await fetch(`${basePath}/data/summaries/${this.selectedDate}/${preset}.json?t=${Date.now()}`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
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
      this.hideLoading();
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      
      if (!navigator.onLine || error.message.includes('Failed to fetch')) {
        const cachedData = this.tryLoadDateFromLocalStorage(this.selectedDate);
        if (cachedData) {
          this.currentData = { ...cachedData };
          this.showToast('오프라인 상태 - 캐시된 데이터를 표시합니다.', 'offline', true, 5000);
          this.hideLoading();
          return;
        }
      }
      
      this.showToast('데이터를 불러오는데 실패했습니다.', 'error');
      this.hideLoading();
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
      this.showToast('온라인 상태로 복원되었습니다', 'success');
      setTimeout(() => {
        this.loadAvailableDates();
      }, 1000);
    });
    
    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.showToast('오프라인 상태입니다', 'offline', true, 5000);
    });
    
    this.isOffline = !navigator.onLine;
    if (this.isOffline) {
      this.showToast('오프라인 상태입니다. 캐시된 데이터를 불러옵니다.', 'offline', true, 5000);
    }
  }

  setupAutoRefresh() {
    // 매 5분마다 새 데이터 확인
    setInterval(() => {
      if (!this.isOffline && navigator.onLine) {
        this.loadAvailableDates();
      }
    }, 5 * 60 * 1000); // 5분

    // 페이지 포커스 시 새로고침
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !this.isOffline && navigator.onLine) {
        this.loadAvailableDates();
      }
    });
  }

  async setupNotifications() {
    // Notification API 지원 확인
    if (!('Notification' in window)) {
      return;
    }

    // 현재 브라우저 권한 상태 확인
    this.notificationPermission = Notification.permission;

    // 저장된 알림 설정 확인
    const notificationEnabled = localStorage.getItem('daily-feed-notifications');
    if (notificationEnabled === 'true' && this.notificationPermission === 'granted') {
      this.notificationEnabled = true;
    } else {
      this.notificationEnabled = false;
    }
  }


  checkForNewDates(newDates) {
    // 첫 로드시에는 알림 보내지 않음
    if (this.lastKnownDates.length === 0) {
      this.lastKnownDates = [...newDates];
      return;
    }

    // 새로운 날짜가 추가되었는지 확인
    const hasNewDate = newDates.some(date => !this.lastKnownDates.includes(date));
    
    if (hasNewDate && this.notificationEnabled && this.notificationPermission === 'granted') {
      const latestDate = newDates[0];
      this.showNewDataNotification(latestDate);
    }

    this.lastKnownDates = [...newDates];
  }

  showNewDataNotification(date) {
    if (!('Notification' in window) || this.notificationPermission !== 'granted') {
      return;
    }

    try {
      const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const notification = new Notification('🗞️ Daily Feed 새 요약', {
        body: `${formattedDate}의 새로운 기술 뉴스 요약이 준비되었습니다!`,
        icon: '/favicon-32x32.png',
        badge: '/favicon-16x16.png',
        tag: 'daily-feed-new-data',
        renotify: true,
        requireInteraction: false,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // 새로운 날짜로 이동
        if (this.selectedDate !== date) {
          this.selectedDate = date;
          this.loadSelectedDate();
        }
      };

      // 5초 후 자동 닫기
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('알림 표시 실패:', error);
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

  getDateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('date');
  }

  updateUrl() {
    const url = new URL(window.location);
    if (this.selectedDate) {
      url.searchParams.set('date', this.selectedDate);
    } else {
      url.searchParams.delete('date');
    }
    window.history.replaceState({}, '', url);
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
            const urlDate = this.getDateFromUrl();
            if (urlDate && this.allDates.includes(urlDate)) {
              this.selectedDate = urlDate;
            } else {
              this.selectedDate = this.allDates[0];
            }
            this.showToast(`캐시된 데이터를 표시합니다 (${Math.round(ageHours)}시간 전 데이터)`, 'offline', true, 5000);
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