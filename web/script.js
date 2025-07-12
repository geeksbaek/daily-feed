// 전역 변수
let allDates = [];
let currentData = {};

// DOM 요소
const dateSelect = document.getElementById('date-select');
const presetSelect = document.getElementById('preset-select');
const statusDiv = document.getElementById('status');
const contentDiv = document.getElementById('content');

// Marked.js 설정 (GitHub Flavored Markdown)
marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: false, // DOMPurify를 별도로 사용
    renderer: new marked.Renderer()
});

// 인용문법 렌더러 설정
const renderer = new marked.Renderer();
renderer.blockquote = function(quote) {
    return '<blockquote style="border-left: 3px solid #d1d9e0; padding-left: 16px; margin-left: 0; color: #57606a; font-style: italic;">' + quote + '</blockquote>';
};
marked.setOptions({ renderer: renderer });

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadAvailableDates();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    dateSelect.addEventListener('change', loadSelectedDate);
    presetSelect.addEventListener('change', displayContent);
}

// 사용 가능한 날짜 목록 로드
async function loadAvailableDates() {
    try {
        showStatus('날짜 목록을 불러오는 중...', 'loading');
        
        const basePath = getBasePath();
        const response = await fetch(`${basePath}/data/summaries/index.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const index = await response.json();
        allDates = index.map(entry => entry.date).sort().reverse(); // 최신순
        
        populateDateSelect();
        
        if (allDates.length > 0) {
            dateSelect.value = allDates[0];
            await loadSelectedDate();
        } else {
            showStatus('아직 생성된 요약이 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('날짜 목록 로드 실패:', error);
        showStatus('날짜 목록을 불러오는데 실패했습니다.', 'error');
    }
}

// 날짜 선택 드롭다운 채우기
function populateDateSelect() {
    dateSelect.innerHTML = '';
    
    allDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDateForDisplay(date);
        dateSelect.appendChild(option);
    });
}

// 선택된 날짜의 데이터 로드
async function loadSelectedDate() {
    const selectedDate = dateSelect.value;
    if (!selectedDate) return;
    
    try {
        showStatus('데이터를 불러오는 중...', 'loading');
        
        const basePath = getBasePath();
        const presets = ['default', 'developer', 'casual', 'community'];
        currentData = { date: selectedDate, summaries: {} };
        
        // 모든 프리셋 데이터 병렬 로드
        const promises = presets.map(async preset => {
            try {
                const response = await fetch(`${basePath}/data/summaries/${selectedDate}/${preset}.json`);
                if (response.ok) {
                    const data = await response.json();
                    currentData.summaries[preset] = data;
                }
            } catch (error) {
                console.warn(`${preset} 프리셋 로드 실패:`, error);
            }
        });
        
        await Promise.all(promises);
        
        hideStatus();
        displayContent();
        
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        showStatus('데이터를 불러오는데 실패했습니다.', 'error');
    }
}

// 콘텐츠 표시
function displayContent() {
    const selectedPreset = presetSelect.value;
    const summaries = currentData.summaries;
    
    if (!summaries || Object.keys(summaries).length === 0) {
        contentDiv.innerHTML = '<p>불러올 수 있는 요약이 없습니다.</p>';
        return;
    }
    
    let html = '';
    
    // 프리셋 필터링
    let summariesToShow = [];
    if (selectedPreset === 'all') {
        // 모든 프리셋을 순서대로 표시
        const order = ['default', 'developer', 'casual', 'community'];
        order.forEach(preset => {
            if (summaries[preset]) {
                summariesToShow.push([preset, summaries[preset]]);
            }
        });
    } else if (summaries[selectedPreset]) {
        summariesToShow = [[selectedPreset, summaries[selectedPreset]]];
    }
    
    
    if (summariesToShow.length === 0) {
        contentDiv.innerHTML = '<p>조건에 맞는 요약을 찾을 수 없습니다.</p>';
        return;
    }
    
    // 요약 내용 생성
    summariesToShow.forEach(([preset, data], index) => {
        const presetLabels = {
            'default': 'Default',
            'developer': 'Developer', 
            'casual': 'Casual',
            'community': 'Community'
        };
        
        html += `
            <div class="summary-section">
                <h2 class="preset-header">${presetLabels[preset]}</h2>
                <div class="summary-meta">
                    ${formatDateForDisplay(data.date)} • ${data.articles.length}개 기사
                </div>
                <div class="markdown-content">
                    ${renderMarkdown(data.summary)}
                </div>
                <div class="articles-section">
                    <h3>관련 기사</h3>
                    ${renderArticles(data.articles)}
                </div>
            </div>
        `;
    });
    
    contentDiv.innerHTML = html;
}

// 마크다운 렌더링 (GitHub Flavored Markdown)
function renderMarkdown(content) {
    try {
        // Marked.js로 마크다운 파싱
        const html = marked.parse(content);
        
        // DOMPurify로 XSS 방지
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

// 기사 목록 렌더링
function renderArticles(articles) {
    if (!articles || articles.length === 0) {
        return '<p>관련 기사가 없습니다.</p>';
    }
    
    return articles.map(article => `
        <div class="article-item">
            <div class="article-title">
                <a href="${article.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a>
            </div>
            <div class="article-meta">
                ${article.source} • ${article.category} • ${formatDateForDisplay(article.publishedAt)}
            </div>
            ${article.description ? `<div class="article-description">${escapeHtml(truncateText(article.description, 100))}</div>` : ''}
        </div>
    `).join('');
}


// 상태 메시지 표시
function showStatus(message, type = 'loading') {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
}

// 상태 메시지 숨김
function hideStatus() {
    statusDiv.style.display = 'none';
}

// 날짜 포맷팅
function formatDateForDisplay(dateString) {
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

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 텍스트 자르기
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength) + '...';
}

// GitHub Pages 기본 경로 감지
function getBasePath() {
    const path = window.location.pathname;
    
    // GitHub Pages의 경우: /repository-name/
    if (path.includes('/daily-feed')) {
        return '/daily-feed';
    }
    
    // 커스텀 도메인이나 로컬 개발
    return '';
}