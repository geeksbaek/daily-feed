import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';
import { FirebasePushManager } from './firebase-push-manager.js';

export class NotificationToggle extends LitElement {
  static properties = {
    enabled: { type: Boolean },
    permission: { type: String },
    isLoading: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
    }

    .notification-toggle {
      position: relative;
    }

    .toggle-button {
      padding: 6px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 140px;
      height: 32px;
      box-sizing: border-box;
      transition: all 0.2s ease;
      user-select: none;
    }

    @media (max-width: 768px) {
      .toggle-button {
        min-width: unset;
        width: 100%;
        padding: 6px 4px;
        gap: 4px;
      }
    }

    .toggle-button:hover {
      border-color: var(--accent-color);
      background-color: var(--bg-secondary);
    }

    .toggle-button.enabled {
      background-color: var(--accent-color);
      border-color: var(--accent-color);
      color: white;
    }

    .toggle-button.enabled:hover {
      background-color: #3182ce;
      border-color: #3182ce;
    }

    .toggle-button.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .toggle-button.disabled:hover {
      border-color: var(--border-secondary);
      background-color: var(--bg-primary);
    }

    .toggle-button.loading {
      opacity: 0.7;
      cursor: wait;
    }

    .icon {
      font-size: 11px;
    }

    .status-text {
      font-size: 11px;
      flex: 1;
      text-align: left;
    }

    .loading-spinner {
      width: 11px;
      height: 11px;
      border: 1px solid transparent;
      border-top: 1px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  constructor() {
    super();
    this.enabled = false;
    this.permission = 'default';
    this.isLoading = false;
    this.firebasePushManager = new FirebasePushManager();
    this.isInitialized = false;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.initializeFirebasePush();
  }

  async initializeFirebasePush() {
    try {
      await this.firebasePushManager.init();
      this.isInitialized = true;
      this.enabled = this.firebasePushManager.isSubscribed();
      this.permission = Notification.permission;
    } catch (error) {
      console.error('Firebase FCM 초기화 실패:', error);
      console.error('오류 상세:', error.message);
      this.isInitialized = false;
      // Firebase 초기화 실패해도 알림 권한은 확인
      this.permission = Notification.permission;
    }
  }

  render() {
    const getButtonClass = () => {
      if (this.isLoading) return 'toggle-button loading';
      if (this.permission === 'denied') return 'toggle-button disabled';
      if (this.enabled && this.permission === 'granted') return 'toggle-button enabled';
      return 'toggle-button';
    };

    const getIcon = () => {
      if (this.isLoading) return html`<div class="loading-spinner"></div>`;
      if (this.permission === 'denied') return '🔕';
      if (this.enabled && this.permission === 'granted') return '🔔';
      return '🔔';
    };

    const getText = () => {
      if (this.isLoading) return '처리중...';
      if (this.permission === 'denied') return '차단됨';
      if (this.enabled && this.permission === 'granted') return '켜짐';
      return '꺼짐';
    };

    return html`
      <div class="notification-toggle">
        <button class="${getButtonClass()}" @click=${this.handleToggle} ?disabled=${this.isLoading}>
          <span class="icon">${getIcon()}</span>
          <span class="status-text">${getText()}</span>
        </button>
      </div>
    `;
  }

  async handleToggle() {
    if (this.isLoading) return;

    if (!this.isInitialized) {
      // Firebase 초기화가 안되어도 기본 브라우저 알림은 시도
      console.warn('Firebase 초기화 안됨, 기본 알림 권한만 요청');
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        if (permission === 'granted') {
          this.enabled = true;
          this.dispatchEvent(new CustomEvent('notification-toggle', {
            detail: { enabled: true, type: 'basic' },
            bubbles: true
          }));
          alert('기본 알림이 활성화되었습니다. Firebase 설정 후 푸시 알림이 지원됩니다.');
        }
      } catch (error) {
        alert('알림 권한 요청 실패: ' + error.message);
      }
      return;
    }

    if (this.permission === 'denied') {
      alert('알림이 차단되어 있습니다. 브라우저 설정에서 이 사이트의 알림을 허용해주세요.');
      return;
    }

    this.isLoading = true;

    try {
      if (this.enabled) {
        // 구독 해제
        await this.firebasePushManager.unsubscribe();
        this.enabled = false;
        this.dispatchEvent(new CustomEvent('notification-toggle', {
          detail: { enabled: false, type: 'firebase' },
          bubbles: true
        }));
        this.showToast('알림이 해제되었습니다');
      } else {
        // 구독 활성화
        await this.firebasePushManager.requestPermissionAndGetToken();
        this.enabled = true;
        this.permission = 'granted';
        this.dispatchEvent(new CustomEvent('notification-toggle', {
          detail: { enabled: true, type: 'firebase' },
          bubbles: true
        }));
        
        this.showToast('알림이 활성화되었습니다');
      }
    } catch (error) {
      console.error('알림 토글 실패:', error);
      this.showToast('알림 설정 중 오류가 발생했습니다: ' + error.message, 'error');
    } finally {
      this.isLoading = false;
    }
  }

  showToast(message, type = 'success') {
    // 토스트 알림 이벤트 발송
    this.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type },
      bubbles: true
    }));
  }
}

customElements.define('notification-toggle', NotificationToggle);