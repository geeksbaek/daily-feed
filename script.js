// 전역 변수
let allDates = [];
let currentData = {};

// DOM 요소
const dateList = document.getElementById('date-list');
let currentPreset = 'default';
let selectedDate = null;
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
    setupEventListeners();
    loadAvailableDates();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 이벤트 위임을 사용하여 동적 요소에도 이벤트 적용
    document.addEventListener('click', function(e) {
        // 탭 버튼 클릭 처리
        if (e.target.classList.contains('tab-button')) {
            // 모든 탭에서 active 클래스 제거
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            // 현재 클릭한 탭에 active 클래스 추가
            e.target.classList.add('active');
            // 프리셋 변경
            currentPreset = e.target.dataset.preset;
            displayContent();
        }
        
    });
}

// 사용 가능한 날짜 목록 로드
async function loadAvailableDates() {
    try {
        showStatus('날짜 목록을 불러오는 중...', 'loading');
        
        const basePath = getBasePath();
        const url = `${basePath}/data/summaries/index.json`;
        console.log('Fetching data from:', url);
        const response = await fetch(url);
        
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const index = await response.json();
        allDates = index.map(entry => entry.date).sort().reverse(); // 최신순
        
        populateDateList();
        
        if (allDates.length > 0) {
            selectedDate = allDates[0];
            await loadSelectedDate();
        } else {
            showStatus('아직 생성된 요약이 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('날짜 목록 로드 실패:', error);
        showStatus('날짜 목록을 불러오는데 실패했습니다.', 'error');
    }
}

// 날짜 리스트 채우기
function populateDateList() {
    dateList.innerHTML = '';
    
    allDates.forEach((date, index) => {
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';
        if (index === 0) dateItem.classList.add('active'); // 처음 날짜를 기본 선택
        dateItem.textContent = formatDateForDisplay(date);
        dateItem.dataset.date = date;
        
        dateItem.addEventListener('click', function() {
            // 모든 날짜 아이템에서 active 클래스 제거
            document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
            // 현재 클릭한 날짜에 active 클래스 추가
            this.classList.add('active');
            // 날짜 변경
            selectedDate = this.dataset.date;
            loadSelectedDate();
        });
        
        dateList.appendChild(dateItem);
    });
}

// 선택된 날짜의 데이터 로드
async function loadSelectedDate() {
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
    const selectedPreset = currentPreset;
    const summaries = currentData.summaries;
    
    if (!summaries || Object.keys(summaries).length === 0) {
        contentDiv.innerHTML = '<p>불러올 수 있는 요약이 없습니다.</p>';
        return;
    }
    
    let html = '';
    
    // 프리셋 필터링
    let summariesToShow = [];
    if (summaries[selectedPreset]) {
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
            </div>
        `;
    });
    
    contentDiv.innerHTML = html;
}

// 마크다운 렌더링 (GitHub Flavored Markdown)
function renderMarkdown(content) {
    try {
        // Footnote 전처리
        const processedContent = processFootnotes(content);
        
        // Marked.js로 마크다운 파싱
        const html = marked.parse(processedContent);
        
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

// Footnote 처리 함수
function processFootnotes(content) {
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
            return `<a href="#footnote-${id}" class="footnote-ref" title="${escapeHtml(footnotes[id])}">[${id}]</a>`;
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
                processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> <a href="${url}">${escapeHtml(title)}</a></div>\n`;
            } else {
                // URL만 있는 경우도 처리
                const urlMatch = definition.match(/^(https?:\/\/.+)$/);
                if (urlMatch) {
                    const url = urlMatch[1];
                    processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> <a href="${url}">${url}</a></div>\n`;
                } else {
                    processedContent += `<div id="footnote-${id}" class="footnote-definition"><strong>[${id}]</strong> ${escapeHtml(definition)}</div>\n`;
                }
            }
        }
    }
    
    return processedContent;
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
    
    // GitHub Pages의 경우: /repository-name/web/에서 접속 시
    if (path.includes('/daily-feed/web')) {
        return '/daily-feed';
    }
    // GitHub Pages의 경우: /repository-name/
    else if (path.includes('/daily-feed')) {
        return '/daily-feed';
    }
    
    // 커스텀 도메인이나 로컬 개발
    return '';
}