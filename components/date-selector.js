import { LitElement, html, css } from 'https://unpkg.com/lit@3?module';

export class DateSelector extends LitElement {
  static properties = {
    dates: { type: Array },
    selectedDate: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .content-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 0;
    }

    .date-selector {
      position: relative;
    }

    .date-select {
      padding: 6px 12px;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-secondary);
      border-radius: 6px;
      font-size: 13px;
      color: var(--text-tertiary);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 12px;
      padding-right: 32px;
      min-width: 140px;
      transition: all 0.2s ease;
    }

    .date-select:hover {
      border-color: var(--accent-color);
      background-color: var(--bg-secondary);
    }

    .date-select:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
    }
  `;

  constructor() {
    super();
    this.dates = [];
    this.selectedDate = '';
  }

  render() {
    return html`
      <div class="content-header">
        <div class="date-selector">
          <select class="date-select" @change=${this.handleDateChange}>
            ${this.dates.length === 0 
              ? html`<option value="">날짜 로딩중...</option>`
              : this.dates.map(date => html`
                  <option value=${date} ?selected=${date === this.selectedDate}>
                    ${this.formatDateForDisplay(date)}
                  </option>
                `)
            }
          </select>
        </div>
      </div>
    `;
  }

  handleDateChange(e) {
    const newDate = e.target.value;
    this.dispatchEvent(new CustomEvent('date-changed', {
      detail: { date: newDate },
      bubbles: true
    }));
  }

  formatDateForDisplay(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      });
    } catch {
      return dateString;
    }
  }
}

customElements.define('date-selector', DateSelector);