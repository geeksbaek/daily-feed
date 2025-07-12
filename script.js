// 전역 변수
let allDates = [];
let currentData = {};
let isOffline = false;
let sidebarOpen = false;

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

// 화면 회전 감지 및 레이아웃 조정
function handleOrientationChange() {
    // 태블릿에서 화면 회전 시 레이아웃 재조정
    if (isTablet()) {
        setTimeout(() => {
            // 사이드바 높이 재계산
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && window.orientation !== undefined) {
                if (Math.abs(window.orientation) === 90) {
                    // 가로 모드
                    sidebar.style.maxHeight = 'calc(100vh - 48px)';
                } else {
                    // 세로 모드
                    sidebar.style.maxHeight = 'none';
                }
            }
        }, 100);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupMobileOptimizations();
    setupOfflineHandlers();
    loadAvailableDates();
    
    // 화면 회전 이벤트 리스너
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
});

// 사이드바 토글 기능
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleArrow = document.querySelector('.toggle-arrow');
    
    if (!overlay) {
        // 오버레이 생성
        const newOverlay = document.createElement('div');
        newOverlay.id = 'sidebar-overlay';
        newOverlay.className = 'sidebar-overlay';
        document.body.appendChild(newOverlay);
        
        // 오버레이 클릭 시 사이드바 닫기
        newOverlay.addEventListener('click', closeSidebar);
    }
    
    sidebarOpen = !sidebarOpen;
    
    if (sidebarOpen) {
        sidebar.style.display = 'block';
        sidebar.classList.add('show');
        document.getElementById('sidebar-overlay').classList.add('show');
        toggleArrow.classList.add('open');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    } else {
        closeSidebar();
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleArrow = document.querySelector('.toggle-arrow');
    
    sidebarOpen = false;
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    if (toggleArrow) toggleArrow.classList.remove('open');
    document.body.style.overflow = ''; // 스크롤 복원
    
    // 애니메이션 완료 후 숨김
    setTimeout(() => {
        if (!sidebarOpen) {
            sidebar.style.display = 'none';
        }
    }, 300);
}

// 현재 선택된 날짜 표시 업데이트
function updateCurrentDateDisplay() {
    const currentDateDisplay = document.getElementById('current-date-display');
    if (currentDateDisplay && selectedDate) {
        const formattedDate = formatDateForDisplay(selectedDate);
        currentDateDisplay.textContent = formattedDate;
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 이벤트 위임을 사용하여 동적 요소에도 이벤트 적용
    document.addEventListener('click', function(e) {
        // 날짜 토글 버튼 클릭
        if (e.target.closest('#date-toggle-btn')) {
            e.preventDefault();
            toggleSidebar();
            return;
        }
        
        // 사이드바 닫기 버튼 클릭
        if (e.target.id === 'sidebar-close') {
            e.preventDefault();
            closeSidebar();
            return;
        }
        
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
    
    // ESC 키로 사이드바 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOpen) {
            closeSidebar();
        }
    });
}

// 디바이스 감지
function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth <= 1366 && 
           ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

function isMobile() {
    return window.innerWidth < 768 && 
           ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

// 모바일/태블릿 UX 최적화
function setupMobileOptimizations() {
    // 완전한 줌 차단 - 모든 제스처 방지
    let lastTouchEnd = 0;
    
    // 더블 탭 줌 방지
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 핀치 줌 방지
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
        // 스크롤 가능한 요소가 아닌 경우에만 방지
        if (!event.target.closest('.sidebar, .main-content, .date-list, .preset-tabs, .markdown-content')) {
            event.preventDefault();
        }
    }, { passive: false });
    
    // 제스처 이벤트 차단
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gesturechange', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('gestureend', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 휠 이벤트 차단 (데스크톱에서 Ctrl+휠 줌)
    document.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // 키보드 줌 차단 (Ctrl +/-)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.keyCode === 61 || e.keyCode === 107 || e.keyCode === 173 || e.keyCode === 109 || e.keyCode === 187 || e.keyCode === 189)) {
            e.preventDefault();
        }
    });
    
    // 상태바 색상 동적 변경 (다크모드 지원)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', '#1a202c');
        }
    }
    
    // 뷰포트 강제 설정 - 디바이스별 최적화
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
        if (isTablet()) {
            // 태블릿은 약간의 줌 허용하되 제한
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.2, minimum-scale=0.8, user-scalable=yes, viewport-fit=cover');
        } else if (isMobile()) {
            // 모바일은 완전 줌 차단
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover, shrink-to-fit=no');
        }
    }
    
    // 태블릿 전용 최적화
    if (isTablet()) {
        document.body.classList.add('tablet-mode');
        
        // 태블릿에서는 터치 하이라이트 더 명확하게
        const style = document.createElement('style');
        style.textContent = `
            .tablet-mode .date-item:active,
            .tablet-mode .tab-button:active {
                transform: scale(0.95);
                transition: transform 0.1s ease;
            }
            
            .tablet-mode .preset-tabs {
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
}

// 오프라인 이벤트 핸들러 설정
function setupOfflineHandlers() {
    // 온라인/오프라인 상태 변경 감지
    window.addEventListener('online', function() {
        isOffline = false;
        showStatus('온라인 상태로 변경되었습니다. 데이터를 새로고침합니다.', 'loading');
        setTimeout(() => {
            loadAvailableDates();
        }, 1000);
    });
    
    window.addEventListener('offline', function() {
        isOffline = true;
        showStatus('오프라인 상태입니다. 캐시된 데이터를 사용합니다.', 'offline');
    });
    
    // 초기 온라인 상태 확인
    isOffline = !navigator.onLine;
    if (isOffline) {
        showStatus('오프라인 상태입니다. 캐시된 데이터를 불러옵니다.', 'offline');
    }
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
            // 503은 오프라인 상태를 의미
            if (response.status === 503) {
                const errorData = await response.json();
                if (errorData.error === 'offline') {
                    throw new Error('OFFLINE');
                }
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const index = await response.json();
        allDates = index.map(entry => entry.date).sort().reverse(); // 최신순
        
        populateDateList();
        
        if (allDates.length > 0) {
            selectedDate = allDates[0];
            await loadSelectedDate();
            updateCurrentDateDisplay();
        } else {
            showStatus('아직 생성된 요약이 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('날짜 목록 로드 실패:', error);
        
        if (error.message === 'OFFLINE') {
            showStatus('오프라인 상태입니다. 캐시된 데이터가 없습니다.', 'error');
            // 로컬 스토리지에서 마지막 데이터 시도
            tryLoadFromLocalStorage();
        } else {
            showStatus('날짜 목록을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        }
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
            // 현재 날짜 표시 업데이트
            updateCurrentDateDisplay();
            // 사이드바 닫기
            closeSidebar();
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
        
        // 성공적으로 로드된 데이터를 로컬 스토리지에 백업
        saveToLocalStorage();
        
        hideStatus();
        displayContent();
        
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        
        // 오프라인이거나 네트워크 오류 시 로컬 스토리지에서 시도
        if (!navigator.onLine || error.message.includes('Failed to fetch')) {
            const cachedData = tryLoadDateFromLocalStorage(selectedDate);
            if (cachedData) {
                currentData = cachedData;
                showStatus('오프라인 상태 - 캐시된 데이터를 표시합니다.', 'offline');
                displayContent();
                return;
            }
        }
        
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

// 로컬 스토리지에 데이터 저장
function saveToLocalStorage() {
    try {
        const dataToSave = {
            allDates: allDates,
            currentData: currentData,
            timestamp: Date.now()
        };
        localStorage.setItem('daily-feed-cache', JSON.stringify(dataToSave));
        
        // 개별 날짜 데이터도 저장
        if (currentData && currentData.date) {
            localStorage.setItem(`daily-feed-${currentData.date}`, JSON.stringify(currentData));
        }
    } catch (error) {
        console.warn('로컬 스토리지 저장 실패:', error);
    }
}

// 로컬 스토리지에서 전체 데이터 로드 시도
function tryLoadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('daily-feed-cache');
        if (savedData) {
            const data = JSON.parse(savedData);
            const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
            
            // 24시간 이내 데이터만 사용
            if (ageHours < 24) {
                allDates = data.allDates || [];
                currentData = data.currentData || {};
                
                if (allDates.length > 0) {
                    populateDateList();
                    selectedDate = allDates[0];
                    displayContent();
                    showStatus(`캐시된 데이터를 표시합니다 (${Math.round(ageHours)}시간 전 데이터)`, 'offline');
                    return true;
                }
            }
        }
    } catch (error) {
        console.warn('로컬 스토리지 로드 실패:', error);
    }
    return false;
}

// 특정 날짜 데이터를 로컬 스토리지에서 로드
function tryLoadDateFromLocalStorage(date) {
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