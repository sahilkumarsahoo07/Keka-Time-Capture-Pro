// // popup.js

// let appData = {};
// let timerInterval = null;
// let currentDayMode = 'fullDay'; // 'fullDay' or 'halfDay'

// document.addEventListener('DOMContentLoaded', () => {
//     // --- INITIAL SETUP ---
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs[0]?.url?.includes('keka.com')) {
//             chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['content.js'] });
//         } else {
//             showError("This is not a Keka attendance page.");
//         }
//     });

//     // --- EVENT LISTENERS ---
//     document.getElementById('settings-btn').addEventListener('click', () => switchView('settings'));
//     document.getElementById('back-btn').addEventListener('click', () => switchView('app'));

//     // Sidebar Navigation
//     document.querySelectorAll('.nav-item').forEach(navItem => {
//         navItem.addEventListener('click', () => {
//             document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
//             document.querySelectorAll('.view-content').forEach(panel => panel.classList.add('hidden'));
//             navItem.classList.add('active');
//             const viewId = `${navItem.dataset.view}-view-content`;
//             document.getElementById(viewId)?.classList.remove('hidden');
//         });
//     });

//     // Day Mode Toggle
//     document.getElementById('full-day-btn').addEventListener('click', () => setDayMode('fullDay'));
//     document.getElementById('half-day-btn').addEventListener('click', () => setDayMode('halfDay'));

//     // Settings Buttons
//     document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
//     document.getElementById('reset-late-count-btn').addEventListener('click', resetLateCount);
// });

// // --- DATA HANDLING ---
// chrome.runtime.onMessage.addListener((data) => {
//     if (timerInterval) clearInterval(timerInterval);
//     if (data.error) {
//         showError(data.error);
//         return;
//     }

//     appData = data;
//     switchView('app');
//     setupStaticElements();
//     renderWeeklyReport();
//     timerInterval = setInterval(updateDisplay, 1000);
//     updateDisplay();
// });

// function setupStaticElements() {
//     // Late Count Card
//     const lateArrivalCard = document.getElementById('late-arrival-card');
//     const monthKey = `lateCountOffset_${appData.currentMonth}`;
//     chrome.storage.sync.get([monthKey], (settings) => {
//         const offset = settings[monthKey] || 0;
//         const displayCount = Math.max(0, appData.lateCount - offset);

//         if (displayCount > 0) {
//             document.getElementById('late-count').textContent = displayCount;
//             document.getElementById('late-arrival-month').textContent = appData.currentMonth;
//             lateArrivalCard.classList.remove('hidden');
//         } else {
//             lateArrivalCard.classList.add('hidden');
//         }
//     });

//     // Break Details
//     document.getElementById('break-used').textContent = formatBreakTime(appData.breakUsedMillis);
//     document.getElementById('break-remaining').textContent = formatBreakTime(Math.max(0, appData.requiredBreakMillis - appData.breakUsedMillis));

//     const breakListContainer = document.getElementById('break-list');
//     breakListContainer.innerHTML = '';
//     if (appData.breakListMillis?.length > 0) {
//         appData.breakListMillis.forEach((ms, i) => {
//             breakListContainer.innerHTML += `<div class="break-item"><span>Break ${i + 1}</span> <strong>${formatBreakTime(ms)}</strong></div>`;
//         });
//     } else {
//         breakListContainer.innerHTML = `<div class="break-item"><span>No breaks taken yet</span></div>`;
//     }
// }

// function updateDisplay() {
//     chrome.storage.sync.get({
//         shiftHours: '08:00:00',
//         halfDayHours: '05:00:00',
//         timeFormat: '12H'
//     }, (settings) => {
//         const targetMillis = (currentDayMode === 'halfDay') 
//             ? timeStringToMillis(settings.halfDayHours) 
//             : timeStringToMillis(settings.shiftHours);

//         let currentWorkMillis = appData.totalWorkMillis;
//         if (appData.isCurrentlyWorking) {
//             currentWorkMillis += (Date.now() - appData.lastPunchTime);
//         }

//         const remainingWorkMillis = Math.max(0, targetMillis - currentWorkMillis);
//         const dayEndAt = new Date(Date.now() + remainingWorkMillis);
//         const isCompleted = currentWorkMillis >= targetMillis;

//         // --- UPDATE UI ---
//         const progress = targetMillis > 0 ? Math.min(100, (currentWorkMillis / targetMillis) * 100) : 0;
//         const circumference = 2 * Math.PI * 36;
//         document.getElementById('progress-ring-fill').style.strokeDashoffset = circumference - (progress / 100) * circumference;
//         document.getElementById('progress-percent').textContent = `${Math.floor(progress)}%`;

//         document.getElementById('day-end-at').textContent = formatTime(dayEndAt, settings.timeFormat, false);
//         const dayStatusElement = document.getElementById('day-status');
//         const statusIndicator = dayStatusElement.previousElementSibling;
//         dayStatusElement.textContent = isCompleted ? 'Completed' : 'Pending';
//         dayStatusElement.className = isCompleted ? 'status-value status-completed' : 'status-value status-pending';
//         statusIndicator.className = isCompleted ? 'status-indicator completed' : 'status-indicator pending';

//         document.getElementById('total-in-time').textContent = formatMillisToHHMMSS(currentWorkMillis);
//         document.getElementById('remaining-time').textContent = formatMillisToHHMMSS(remainingWorkMillis);

//         if (remainingWorkMillis > 0) {
//             chrome.runtime.sendMessage({ type: 'SET_END_OF_DAY_ALARM', endTime: dayEndAt.getTime() });
//         }
//     });
// }

// function renderWeeklyReport() {
//     if (!appData.weeklyData || appData.weeklyData.length === 0) {
//         document.getElementById('weekly-day-list').innerHTML = '<div style="text-align:center; color: var(--label-color);">No weekly data found.</div>';
//         return;
//     }

//     const weeklyData = appData.weeklyData;
//     const workingDays = weeklyData.filter(day => !day.isOff && day.hours > 0);
//     const totalMillis = workingDays.reduce((acc, day) => acc + day.hours, 0);
//     const totalLates = workingDays.filter(day => day.isLate).length;
//     const avgMillis = workingDays.length > 0 ? totalMillis / workingDays.length : 0;

//     document.getElementById('weekly-total-hours').textContent = formatMillisToHHMMSS(totalMillis);
//     document.getElementById('weekly-avg-hours').textContent = formatMillisToHHMMSS(avgMillis);
//     document.getElementById('weekly-late-count').textContent = totalLates;

//     const listContainer = document.getElementById('weekly-day-list');
//     listContainer.innerHTML = '';
//     weeklyData.forEach(day => {
//         listContainer.innerHTML += `
//             <div class="weekly-day-item">
//                 <span class="day-date">${day.date}</span>
//                 <div style="display: flex; align-items: center;">
//                     ${day.isLate ? '<span class="late-badge">LATE</span>' : ''}
//                     <span class="day-hours time-display">${day.isOff ? 'Weekly Off' : formatMillisToHHMMSS(day.hours)}</span>
//                 </div>
//             </div>
//         `;
//     });
// }


// // --- UI & MODE SWITCHING ---

// function setDayMode(mode) {
//     currentDayMode = mode;
//     const fullDayBtn = document.getElementById('full-day-btn');
//     const halfDayBtn = document.getElementById('half-day-btn');
//     const badge = document.getElementById('day-mode-badge');

//     if (mode === 'halfDay') {
//         fullDayBtn.classList.remove('active');
//         halfDayBtn.classList.add('active');
//         badge.textContent = 'HD';
//     } else {
//         halfDayBtn.classList.remove('active');
//         fullDayBtn.classList.add('active');
//         badge.textContent = 'FD';
//     }
//     updateDisplay();
// }

// function switchView(viewName) {
//     const appView = document.getElementById('app-view');
//     const settingsView = document.getElementById('settings-view');
//     const errorView = document.getElementById('error-view');

//     appView.classList.add('hidden');
//     settingsView.classList.add('hidden');
//     errorView.classList.add('hidden');

//     if (viewName === 'settings') {
//         settingsView.classList.remove('hidden');
//         restoreSettings();
//     } else if (viewName === 'app') {
//         appView.classList.remove('hidden');
//     } else { // error
//         errorView.classList.remove('hidden');
//     }
// }

// function showError(message) {
//     document.getElementById('error-message').textContent = `Error: ${message}`;
//     switchView('error');
//     chrome.runtime.sendMessage({ type: 'CLEAR_ALARM' });
// }

// // --- SETTINGS & HELPERS ---

// function saveSettings() {
//     const settings = {
//         shiftHours: document.getElementById('shift-hours').value, halfDayHours: document.getElementById('half-day-hours').value,
//         breakHours: document.getElementById('break-hours').value, shiftStartTime: document.getElementById('shift-start-time').value,
//         lateGracePeriod: parseInt(document.getElementById('late-grace-period').value, 10),
//         timeFormat: document.querySelector('input[name="time-format"]:checked').value
//     };
//     chrome.storage.sync.set(settings, () => {
//         const status = document.getElementById('settings-status');
//         status.textContent = 'Settings saved!'; status.classList.add('success-message');
//         setTimeout(() => { status.textContent = ''; status.classList.remove('success-message'); }, 1500);
//     });
// }

// function restoreSettings() {
//     chrome.storage.sync.get({
//         shiftHours: '08:00:00', halfDayHours: '05:00:00', breakHours: '01:00:00',
//         shiftStartTime: '02:00:00', lateGracePeriod: 5, timeFormat: '12H'
//     }, (items) => {
//         document.getElementById('shift-hours').value = items.shiftHours;
//         document.getElementById('half-day-hours').value = items.halfDayHours;
//         document.getElementById('break-hours').value = items.breakHours;
//         document.getElementById('shift-start-time').value = items.shiftStartTime;
//         document.getElementById('late-grace-period').value = items.lateGracePeriod;
//         document.querySelector(`input[name="time-format"][value="${items.timeFormat}"]`).checked = true;
//         document.getElementById('reset-month-label').textContent = appData.currentMonth || new Date().toLocaleString('default', { month: 'long' });
//     });
// }

// function resetLateCount() {
//     if (!appData.currentMonth) return;
//     const monthKey = `lateCountOffset_${appData.currentMonth}`;
//     const settings = {};
//     settings[monthKey] = appData.lateCount;
//     chrome.storage.sync.set(settings, () => {
//         const status = document.getElementById('reset-status');
//         status.textContent = `Count reset for ${appData.currentMonth}!`;
//         setTimeout(() => { status.textContent = ''; }, 2500);
//         document.getElementById('late-count').textContent = 0;
//         document.getElementById('late-arrival-card').classList.add('hidden');
//     });
// }

// // --- FORMATTING FUNCTIONS ---

// function timeStringToMillis(timeStr) {
//     if (!timeStr || !/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return 0;
//     const [h, m, s] = timeStr.split(':').map(Number);
//     return (h * 3600 + m * 60 + s) * 1000;
// }

// function formatMillisToHHMMSS(ms) {
//     if (ms < 0) ms = 0;
//     const s = Math.floor((ms / 1000) % 60);
//     const m = Math.floor((ms / (1000 * 60)) % 60);
//     const h = Math.floor(ms / (1000 * 3600));
//     return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
// }

// function formatBreakTime(ms) {
//     if (ms < 0) ms = 0;
//     const s = Math.floor((ms / 1000) % 60);
//     const m = Math.floor((ms / (1000 * 60)) % 60);
//     const h = Math.floor(ms / (1000 * 3600));
//     if (h > 0) return `${h}h : ${m}m : ${s}sec`;
//     return `${m}m : ${s}sec`;
// }

// function formatTime(date, format, showSeconds = true) {
//     const options = { hour: '2-digit', minute: '2-digit' };
//     if (showSeconds) options.second = '2-digit';
//     if (format === '12H') {
//         options.hour12 = true;
//         return date.toLocaleTimeString('en-US', options);
//     }
//     options.hour12 = false;
//     return date.toLocaleTimeString('en-GB', options);
// }
// popup.js

let appData = {};
let originalAppData = {}; // Store current day's data to preserve badge time
let timerInterval = null;
let currentDayMode = 'fullDay'; // 'fullDay' or 'halfDay'
let isViewingLastWeek = false; // true = viewing last week, false = viewing this week
let autoRefreshInterval = null; // Auto-refresh interval ID
let lastSentEndTime = 0; // Track last sent alarm time to avoid spam

// --- AUTO-REFRESH FUNCTION ---
function setupAutoRefresh() {
    // Clear any existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    // Get auto-refresh setting
    chrome.storage.sync.get({ autoRefresh: 0 }, (items) => {
        const refreshMinutes = parseInt(items.autoRefresh, 10);

        if (refreshMinutes > 0) {
            const refreshMs = refreshMinutes * 60 * 1000; // Convert minutes to milliseconds

            autoRefreshInterval = setInterval(() => {

                // Re-inject content script to get fresh data
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]?.url?.includes('keka.com')) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            files: ['content.js']
                        });
                    }
                });
            }, refreshMs);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- INSTANT LOAD (CACHING) ---
    chrome.storage.local.get('latestAppData', (result) => {
        if (result.latestAppData) {
            console.log("Loading cached data...");
            handleDataUpdate(result.latestAppData);
        }
    });

    // --- INITIAL SETUP (FRESH FETCH) ---
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes('keka.com')) {
            chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['content.js'] });
        } else {
            showError("This is not a Keka attendance page.");
        }
    });

    // --- SETUP AUTO-REFRESH ---
    setupAutoRefresh();

    // --- EVENT LISTENERS ---
    document.getElementById('settings-btn').addEventListener('click', () => switchView('settings'));
    document.getElementById('back-btn').addEventListener('click', () => switchView('app'));

    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.view-content').forEach(panel => panel.classList.add('hidden'));
            navItem.classList.add('active');
            const viewId = `${navItem.dataset.view}-view-content`;
            document.getElementById(viewId)?.classList.remove('hidden');
        });
    });

    document.getElementById('full-day-btn').addEventListener('click', () => setDayMode('fullDay'));
    document.getElementById('half-day-btn').addEventListener('click', () => setDayMode('halfDay'));
    const exportWeeklyBtn = document.getElementById('export-weekly-data');
    const exportJsonBtn = document.getElementById('export-json-data');
    const exportExcelBtn = document.getElementById('export-excel-data');
    if (exportWeeklyBtn) exportWeeklyBtn.addEventListener('click', exportWeeklyData);
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportJsonData);
    if (exportExcelBtn) exportExcelBtn.addEventListener('click', exportToExcel);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('reset-late-count-btn').addEventListener('click', resetLateCount);
    document.getElementById('toggle-history-btn').addEventListener('click', () => {
        const historyContent = document.getElementById('history-insights-view');
        const isHidden = historyContent.classList.toggle('hidden');
        document.getElementById('toggle-history-btn').textContent = isHidden ? 'Show Weekly History' : 'Hide Weekly History';
    });

    // --- WEEK NAVIGATION EVENT LISTENERS ---
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', async () => {
            if (!isViewingLastWeek) {
                isViewingLastWeek = true;
                await requestWeekData(-1); // Fetch Last Week
            }
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', async () => {
            if (isViewingLastWeek) {
                isViewingLastWeek = false;
                await requestWeekData(0); // Return to This Week
            }
        });
    }

    // --- THEME HANDLING (UPDATED) ---
    document.querySelectorAll('.theme-option-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            document.querySelectorAll('.theme-option-wrapper').forEach(opt => opt.classList.remove('active'));
            wrapper.classList.add('active');
            let selectedTheme = wrapper.dataset.theme || 'dark';
            applyTheme(selectedTheme);
            chrome.storage.sync.set({ theme: selectedTheme });
        });
    });

    // --- ENHANCED SETTINGS: UNIFIED PERSISTENT TOGGLE HANDLER ---
    function setupPersistentToggle(toggleId, checkboxId, storageKey, defaultValue = true, onSave = null) {
        const toggle = document.getElementById(toggleId);
        const checkbox = document.getElementById(checkboxId);
        if (!toggle || !checkbox) return;

        // 1. Restore saved state (checkbox + visual)
        chrome.storage.sync.get({ [storageKey]: defaultValue }, (items) => {
            const isChecked = !!items[storageKey];
            checkbox.checked = isChecked;
            toggle.classList.toggle('active', isChecked);
        });

        // 2. Handle click
        toggle.addEventListener('click', () => {
            // Toggle check
            checkbox.checked = !checkbox.checked;
            const newVal = checkbox.checked;

            // Sync visual
            toggle.classList.toggle('active', newVal);

            // Save to storage
            const update = {};
            update[storageKey] = newVal;
            chrome.storage.sync.set(update, () => {
                if (onSave) onSave(newVal);
            });
        });
    }

    // Completion Notification
    setupPersistentToggle('completion-notification-toggle', 'completion-notification', 'completionNotification', true, (val) => {
        const status = document.getElementById('settings-status');
        if (status) {
            status.textContent = val ? 'Notifications enabled' : 'Notifications disabled';
            status.classList.add('success-message');
            setTimeout(() => { status.textContent = ''; status.classList.remove('success-message'); }, 1200);
        }
    });

    // Sound Notification
    setupPersistentToggle('sound-notification-toggle', 'sound-notification', 'soundNotification', false); // Default false

    // Badge Icon
    setupPersistentToggle('badge-icon-toggle', 'badge-icon', 'badgeIcon', true); // Default true

    // Auto Backup
    setupPersistentToggle('auto-backup-toggle', 'auto-backup', 'autoBackup', false); // Default false

    // Stepper Button Handlers
    function setupStepper(decreaseId, increaseId, inputId, min = 0, max = 100) {
        const decreaseBtn = document.getElementById(decreaseId);
        const increaseBtn = document.getElementById(increaseId);
        const input = document.getElementById(inputId);

        if (decreaseBtn && increaseBtn && input) {
            decreaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentValue = parseInt(input.value) || min;
                if (currentValue > min) {
                    input.value = currentValue - 1;
                }
            });

            increaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentValue = parseInt(input.value) || min;
                if (currentValue < max) {
                    input.value = currentValue + 1;
                }
            });
        }
    }

    setupStepper('grace-decrease', 'grace-increase', 'late-grace-period', 0, 60);
    setupStepper('overtime-decrease', 'overtime-increase', 'overtime-threshold', 0, 16);

    // Radio Button Group Handler
    const radioButtons = document.querySelectorAll('.radio-button');
    radioButtons.forEach(button => {
        button.addEventListener('click', () => {
            const format = button.dataset.format;
            if (format) {
                // Update visual state
                radioButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update hidden radio inputs
                const radioInput = document.querySelector(`input[name="time-format"][value="${format}"]`);
                if (radioInput) {
                    radioInput.checked = true;
                }
            }
        });
    });

    // Restore Day Mode
    chrome.storage.sync.get({ selectedDayMode: 'fullDay' }, (items) => {
        setDayMode(items.selectedDayMode);
    });

    // --- NOTIFICATION SOUND FUNCTIONALITY ---

    // Test Sound Button Event Listener
    const testSoundBtn = document.getElementById('test-sound-btn');
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', () => {
            testNotificationSound();
        });
    }

    // Test Notification Button Event Listener
    const testNotificationBtn = document.getElementById('test-notification-btn');
    if (testNotificationBtn) {
        testNotificationBtn.addEventListener('click', () => {
            testCompletionNotification();
        });
    }
});


chrome.storage.sync.get({ theme: 'dark' }, (data) => {
    applyTheme(data.theme);
    const activeOption = document.querySelector(`.theme-option-wrapper[data-theme="${data.theme}"]`);
    if (activeOption) {
        document.querySelectorAll('.theme-option-wrapper').forEach(opt => opt.classList.remove('active'));
        activeOption.classList.add('active');
    }
});

function applyTheme(theme) {
    const themeClasses = [
        'dark-theme', 'light-theme', 'purple-theme', 'true-black-theme', 'nord-theme',
        'solarized-theme', 'dracula-theme', 'monokai-theme', 'gruvbox-theme',
        'one-dark-pro-theme', 'catppuccin-theme', 'cyberpunk-theme', 'tokyo-night-theme',
        'material-ocean-theme', 'everforest-theme', 'rose-pine-theme',
        // New attractive themes
        'ocean-breeze-theme', 'sunset-glow-theme', 'forest-green-theme', 'cherry-blossom-theme',
        'neon-cyber-theme', 'pastel-dream-theme', 'galaxy-theme', 'mint-fresh-theme',
        'coral-reef-theme', 'midnight-purple-theme', 'arctic-blue-theme', 'autumn-leaves-theme',
        // Professional work themes
        'corporate-blue-theme', 'executive-gray-theme', 'professional-green-theme', 'business-burgundy-theme',
        'modern-slate-theme', 'clean-white-theme', 'charcoal-theme', 'navy-professional-theme',
        'warm-espresso-theme', 'cool-mint-theme', 'soft-lavender-theme', 'steel-blue-theme'
    ];
    document.body.classList.remove(...themeClasses);
    document.body.classList.add(`${theme}-theme`);
}


// --- DATA HANDLING ---
// --- DATA HANDLING ---
chrome.runtime.onMessage.addListener(async (data) => {
    // Ensure we handle the new typed message or legacy untyped ones (if any)
    if (data.type === 'DATA_UPDATE' || !data.type) {
        handleDataUpdate(data);
    }
});

async function handleDataUpdate(data) {
    if (timerInterval) clearInterval(timerInterval);
    if (data.error) {
        showError(data.error);
        return;
    }

    appData = data;
    originalAppData = { ...data }; // ✅ Save original data for badge preservation

    // Only switch to app view if user is not currently in settings or error view
    const settingsView = document.getElementById('settings-view');
    const errorView = document.getElementById('error-view');
    const isInSettings = settingsView && !settingsView.classList.contains('hidden');
    const isInError = errorView && !errorView.classList.contains('hidden');

    if (!isInSettings && !isInError) {
        switchView('app');
    }

    setupStaticElements();

    // Filter data for This Week on initial load
    // Note: requestWeekData depends on originalAppData being set
    await requestWeekData(isViewingLastWeek ? -1 : 0);

    renderHistoricalInsights();
    renderAchievements();
    renderMonthlySummary();
    renderMissedSwipes(); // NEW: Render missed swipes section
    renderIncompleteHours(); // NEW: Render incomplete hours warnings
    timerInterval = setInterval(() => {
        updateDisplay();
        updateWeeklyProgressRealtime(); // Update weekly progress in real-time (lightweight)
        updateAnalyticsRealtime(); // Update analytics in real-time
    }, 1000);
    updateDisplay();
}

// --- HELPER FUNCTION FOR DATE PARSING ---
function parseDateFromString(dateStr) {
    if (!dateStr) return null;

    // Parse "Mon, 08 Dec" format
    const match = dateStr.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    if (!match) return null;

    const day = parseInt(match[1]);
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    const month = monthMap[match[2]];

    // Determine year
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // If the month is more than 6 months in the future, it's probably last year
    let year = currentYear;
    if (month > currentMonth + 6) {
        year = currentYear - 1;
    }

    return new Date(year, month, day);
}

// --- WEEK DATA REQUEST FUNCTIONS ---
async function requestWeekData(weekOffset) {
    try {
        // Update week label
        updateWeekLabel(weekOffset);

        if (!originalAppData || !originalAppData.weeklyData) {
            return;
        }

        const allData = originalAppData.weeklyData || [];
        const today = new Date();
        const currentDay = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

        // Calculate days since Monday
        const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

        // Get this week's Monday
        const thisWeekMonday = new Date(today);
        thisWeekMonday.setDate(today.getDate() - daysSinceMonday);
        thisWeekMonday.setHours(0, 0, 0, 0);

        // Get this week's Friday
        const thisWeekFriday = new Date(thisWeekMonday);
        thisWeekFriday.setDate(thisWeekMonday.getDate() + 4);
        thisWeekFriday.setHours(23, 59, 59, 999);

        if (weekOffset === 0) {
            // This Week = Current work week Mon-Fri

            const thisWeekData = allData.filter(day => {
                const rowDate = parseDateFromString(day.date);
                if (!rowDate) return false;
                const isInRange = rowDate >= thisWeekMonday && rowDate <= thisWeekFriday;
                const isWeekday = !/(Sat|Sun)/i.test(day.date);
                return isInRange && isWeekday;
            });

            appData = { ...originalAppData };
            appData.weeklyData = thisWeekData;
        } else {
            // Last Week = Previous work week Mon-Fri
            const lastWeekMonday = new Date(thisWeekMonday);
            lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);

            const lastWeekFriday = new Date(lastWeekMonday);
            lastWeekFriday.setDate(lastWeekMonday.getDate() + 4);
            lastWeekFriday.setHours(23, 59, 59, 999);

            const lastWeekData = allData.filter(day => {
                const rowDate = parseDateFromString(day.date);
                if (!rowDate) return false;
                const isInRange = rowDate >= lastWeekMonday && rowDate <= lastWeekFriday;
                const isWeekday = !/(Sat|Sun)/i.test(day.date);
                return isInRange && isWeekday;
            });

            appData = { ...originalAppData };
            appData.weeklyData = lastWeekData;
        }

        // Re-render the weekly report with new data
        renderCurrentWeekReportAndGoal();
        renderWeekComparison();

    } catch (error) {
        console.error("Error in requestWeekData:", error);
        isViewingLastWeek = false;
        updateWeekLabel(0);
    }
}

function updateWeekLabel(offset) {
    const weekLabel = document.getElementById('current-week-label');
    if (!weekLabel) return;

    if (offset === 0) {
        weekLabel.textContent = 'This Week';
    } else if (offset === -1) {
        weekLabel.textContent = 'Last Week';
    } else if (offset < -1) {
        weekLabel.textContent = `${Math.abs(offset)} Weeks Ago`;
    }
}

function setupStaticElements() {
    const lateArrivalCard = document.getElementById('late-arrival-card');
    const monthKey = `lateCountOffset_${appData.currentMonth}`;
    chrome.storage.sync.get([monthKey], (settings) => {
        const offset = settings[monthKey] || 0;
        const displayCount = Math.max(0, appData.lateCount - offset);
        if (displayCount > 0) {
            document.getElementById('late-count').textContent = displayCount;
            document.getElementById('late-arrival-month').textContent = appData.currentMonth;
            lateArrivalCard.classList.remove('hidden');
        } else {
            lateArrivalCard.classList.add('hidden');
        }
    });

    document.getElementById('break-used').textContent = formatBreakTime(appData.breakUsedMillis);
    document.getElementById('break-remaining').textContent = formatBreakTime(Math.max(0, appData.requiredBreakMillis - appData.breakUsedMillis));

    const breakListContainer = document.getElementById('break-list');
    breakListContainer.innerHTML = '';
    if (appData.breakListMillis?.length > 0) {
        appData.breakListMillis.forEach((ms, i) => {
            breakListContainer.innerHTML += `<div class="break-item"><span>Break ${i + 1}</span> <strong>${formatBreakTime(ms)}</strong></div>`;
        });
    } else {
        breakListContainer.innerHTML = `<div class="break-item"><span>No breaks taken yet</span></div>`;
    }
}

function updateDisplay() {
    chrome.storage.sync.get({
        shiftHours: '08:00:00', halfDayHours: '04:30:00', timeFormat: '12H'
    }, (settings) => {
        // Detect if user is viewing a previous month / historical data
        const realNowMonth = new Date().toLocaleString('default', { month: 'long' });
        const viewedMonth = appData.currentMonth || realNowMonth;
        const isHistoricalMonth = viewedMonth !== realNowMonth;

        // When viewing historical month, we'll show a month snapshot instead of live timers
        const targetMillis = (currentDayMode === 'halfDay')
            ? timeStringToMillis(settings.halfDayHours)
            : timeStringToMillis(settings.shiftHours);

        // If historical month, use monthly aggregates instead of live values
        let currentWorkMillis = appData.totalWorkMillis;
        let monthlyTotalMillis = 0;
        let monthlyWorkDays = 0;
        if (isHistoricalMonth) {
            const mdata = appData.currentMonthData || [];
            monthlyTotalMillis = mdata.reduce((acc, d) => acc + (d.hours || 0), 0);
            monthlyWorkDays = mdata.filter(d => d.status === 'Present' && d.hours > 0).length;
            // In historical mode, use monthly totals as the main displayed value
            currentWorkMillis = monthlyTotalMillis;
        } else {
            // --- LIVE TIME CALCULATION ---
            if (appData.isCurrentlyWorking) {
                currentWorkMillis += (Date.now() - appData.lastPunchTime);
            }
        }
        // If on break, we do not add to currentWorkMillis, so the time freezes (as desired)

        // --- DASHBOARD UPDATES ---
        // In historical mode, compute monthly goal progress instead of daily remaining
        let remainingWorkMillis, overtimeMillis, isCompleted;
        if (isHistoricalMonth) {
            const monthGoalMillis = Math.max(0, monthlyWorkDays * timeStringToMillis(settings.shiftHours));
            remainingWorkMillis = Math.max(0, monthGoalMillis - monthlyTotalMillis);
            overtimeMillis = Math.max(0, monthlyTotalMillis - monthGoalMillis);
            isCompleted = monthlyTotalMillis >= monthGoalMillis && monthGoalMillis > 0;
        } else {
            remainingWorkMillis = Math.max(0, targetMillis - currentWorkMillis);
            overtimeMillis = Math.max(0, currentWorkMillis - targetMillis);
            isCompleted = currentWorkMillis >= targetMillis;
        }

        const progressPercent = isHistoricalMonth
            ? (monthlyWorkDays > 0 ? Math.min(100, (monthlyTotalMillis / (monthlyWorkDays * timeStringToMillis(settings.shiftHours))) * 100) : 0)
            : (targetMillis > 0 ? Math.min(100, (currentWorkMillis / targetMillis) * 100) : 0);

        document.getElementById('progress-ring-fill').style.strokeDashoffset =
            (2 * Math.PI * 36) - (progressPercent / 100) * (2 * Math.PI * 36);

        document.getElementById('progress-percent').textContent = `${Math.floor(progressPercent)}%`;

        const dayEndAtEl = document.getElementById('day-end-at');
        let dayEndAt;
        if (isHistoricalMonth) {
            // Historical view: show month name / snapshot instead of a live "day end" time
            dayEndAtEl.textContent = `${viewedMonth} (Historical)`;
        } else {
            if (isCompleted) {
                if (appData.lastPunchTime && appData.isCurrentlyWorking) {
                    const timeRemainingWhenPunched = targetMillis - appData.totalWorkMillis;
                    const completionTimestamp = appData.lastPunchTime + timeRemainingWhenPunched;
                    const completionDate = new Date(completionTimestamp);
                    dayEndAtEl.textContent = formatTime(completionDate, settings.timeFormat, false);
                } else {
                    dayEndAtEl.textContent = 'Completed';
                }
            } else {
                if (appData.isCurrentlyWorking) {
                    dayEndAt = new Date(Date.now() + remainingWorkMillis);
                    dayEndAtEl.textContent = formatTime(dayEndAt, settings.timeFormat, false);
                } else {
                    dayEndAtEl.textContent = '--:--';
                }
            }
        }

        const dayStatusElement = document.getElementById('day-status');
        const statusIndicator = dayStatusElement.previousElementSibling;

        if (isHistoricalMonth) {
            dayStatusElement.textContent = 'Historical';
            dayStatusElement.className = isCompleted ? 'status-value status-completed' : 'status-value status-pending';
            statusIndicator.className = isCompleted ? 'status-indicator completed' : 'status-indicator pending';
            statusIndicator.style.backgroundColor = isCompleted ? '#4cd964' : '#ff9500';
        } else if (appData.isCurrentlyWorking === false && appData.lastPunchTime !== null) {
            dayStatusElement.textContent = 'On Break';
            dayStatusElement.className = 'status-value status-pending';
            statusIndicator.className = 'status-indicator pending';
            statusIndicator.style.backgroundColor = '#ff9500';
        } else {
            dayStatusElement.textContent = isCompleted ? 'Completed' : 'Pending';
            dayStatusElement.className = isCompleted ? 'status-value status-completed' : 'status-value status-pending';
            statusIndicator.className = isCompleted ? 'status-indicator completed' : 'status-indicator pending';
            statusIndicator.style.backgroundColor = isCompleted ? '#4cd964' : '#ff9500';
        }

        // Total display: in historical mode show monthly total, otherwise daily
        if (isHistoricalMonth) {
            document.getElementById('total-in-time').textContent = formatMillisToHHMMSS(monthlyTotalMillis);
        } else {
            const displayWorkMillis = isCompleted ? targetMillis : currentWorkMillis;
            document.getElementById('total-in-time').textContent = formatMillisToHHMMSS(displayWorkMillis);
        }

        const remainingEl = document.getElementById('remaining-time');
        const remainingLabelEl = document.getElementById('remaining-label');
        if (isHistoricalMonth) {
            remainingEl.textContent = formatMillisToHHMMSS(remainingWorkMillis);
            remainingLabelEl.textContent = 'Remaining (month goal)';
        } else if (isCompleted) {
            remainingEl.textContent = formatMillisToHHMMSS(overtimeMillis);
            remainingLabelEl.textContent = 'Overtime';
        } else {
            remainingEl.textContent = formatMillisToHHMMSS(remainingWorkMillis);
            remainingLabelEl.textContent = 'Remaining';
        }

        // Don't schedule alarms when viewing historical month
        if (!isHistoricalMonth && remainingWorkMillis > 0 && dayEndAt && appData.isCurrentlyWorking) {
            // DEBOUNCE: Only send if endTime has changed significantly (e.g. > 2s)
            const newEndTime = dayEndAt.getTime();
            if (Math.abs(newEndTime - lastSentEndTime) > 2000) {
                chrome.runtime.sendMessage({ type: 'SET_END_OF_DAY_ALARM', endTime: newEndTime });
                lastSentEndTime = newEndTime;
            }
        }

        // Check and trigger notifications (completion and overtime)
        if (!isHistoricalMonth) {
            checkAndTriggerNotifications(currentWorkMillis, targetMillis, isCompleted);
        }


        // --- NEW: ONLY UPDATE THE TIME IN THE LIST ---
        const todayListTime = document.getElementById('today-list-time');

        if (todayListTime) {
            // This just updates the numbers.
            // It does NOT touch the badge, so "LATE" stays "LATE".
            todayListTime.textContent = formatMillisToHHMMSS(currentWorkMillis);
        }

        // --- BADGE: SHOW REMAINING TIME OR COMPLETION CHECK ON EXTENSION ICON ---
        // Check if badge icon is enabled in settings
        chrome.storage.sync.get({ badgeIcon: true }, (badgeSettings) => {
            let badgeString = '';
            let badgeColor = '#df3600'; // default pending color (red-orange)

            if (badgeSettings.badgeIcon) {
                // Only show badge if enabled
                if (isCompleted) {
                    // Show a check mark and green background when completed
                    badgeString = '\u2713'; // ✓
                    badgeColor = '#4cd964';
                } else if (!isCompleted && remainingWorkMillis > 0) {
                    const h = Math.floor(remainingWorkMillis / 3600000);
                    const m = Math.floor((remainingWorkMillis % 3600000) / 60000);
                    badgeString = `${h}:${String(m).padStart(2, '0')}`;
                    badgeColor = '#df3600';
                }
            }
            // If badgeIcon is false, badgeString remains empty

            try {
                chrome.action.setBadgeText({ text: badgeString });
                chrome.action.setBadgeBackgroundColor({ color: badgeColor });
            } catch (e) {
                // Ignore errors in non-action contexts
            }
        });

        // Store live badge state for background live updates
        chrome.storage.local.set({
            liveBadgeState: {
                isCurrentlyWorking: appData.isCurrentlyWorking,
                lastPunchTime: appData.lastPunchTime,
                totalWorkMillis: appData.totalWorkMillis,
                currentDayMode,
                shiftHours: settings.shiftHours,
                halfDayHours: settings.halfDayHours
            }
        });
    });
}

function updateWeeklyProgressRealtime() {
    if (!appData.weeklyData || appData.weeklyData.length === 0) return;

    // Use the current week data (already filtered by requestWeekData)
    const currentWeekData = appData.weeklyData;

    // Filter working days: ONLY status='Present' with hours > 0
    const workingDaysInWeek = currentWeekData.filter(day => day.status === 'Present' && day.hours > 0);

    // Calculate total milliseconds (Base + Live increment if viewing This Week)
    let totalMillisThisWeek = workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0);

    // Add live time ONLY if viewing This Week and currently working
    if (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime) {
        totalMillisThisWeek += (Date.now() - appData.lastPunchTime);
    }

    // Calculate Average - EXCLUDE live time, only use completed days
    let avgMillis;
    if (isViewingLastWeek) {
        // Last Week - all days complete
        avgMillis = workingDaysInWeek.length > 0 ? workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0) / workingDaysInWeek.length : 0;
    } else {
        // This Week - exclude today from average if incomplete
        const completedWorkingDays = workingDaysInWeek.filter(day => !day.isToday);
        if (completedWorkingDays.length > 0) {
            const totalCompletedMillis = completedWorkingDays.reduce((acc, day) => acc + day.hours, 0);
            avgMillis = totalCompletedMillis / completedWorkingDays.length;
        } else {
            // No completed days yet (Monday morning) - use base hours only (no live time)
            const baseHoursOnly = workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0);
            avgMillis = workingDaysInWeek.length > 0 ? baseHoursOnly / workingDaysInWeek.length : 0;
        }
    }

    // Update Text Elements
    const totalHoursEl = document.getElementById('weekly-total-hours');
    const avgHoursEl = document.getElementById('weekly-avg-hours');
    const currentWeeklyHoursEl = document.getElementById('current-weekly-hours');

    if (totalHoursEl) totalHoursEl.textContent = formatMillisToHHMMSS(totalMillisThisWeek);
    if (avgHoursEl) avgHoursEl.textContent = formatMillisToHHMMSS(avgMillis);
    if (currentWeeklyHoursEl) currentWeeklyHoursEl.textContent = (totalMillisThisWeek / 3600000).toFixed(1);

    // Update Progress Bars
    chrome.storage.sync.get({
        shiftHours: '08:00:00',
        workWeekDays: 5
    }, (settings) => {
        const dailyGoalMillis = timeStringToMillis(settings.shiftHours);
        let targetDays = parseInt(settings.workWeekDays, 10) || 5;

        // Calculate deductions (holidays/leaves on weekdays)
        let deductions = 0;
        const weekdayRegex = /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i;

        currentWeekData.forEach(day => {
            const match = day.date.match(weekdayRegex);
            const dayName = match ? match[1].slice(0, 3) : null;

            let isWeekday;
            if (targetDays === 6) {
                isWeekday = dayName && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(dayName);
            } else {
                isWeekday = dayName && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName);
            }

            if (isWeekday && (day.status === 'Holiday' || day.status === 'Leave')) {
                deductions++;
            }
        });

        const adjustedDays = Math.max(0, targetDays - deductions);
        const weeklyGoalMillis = adjustedDays * dailyGoalMillis;
        const weeklyProgress = weeklyGoalMillis > 0 ? Math.min(100, (totalMillisThisWeek / weeklyGoalMillis) * 100) : 0;

        // Update progress elements
        const elements = [
            { id: 'weekly-goal-percent', type: 'text', val: `${Math.floor(weeklyProgress)}%` },
            { id: 'weekly-goal-fill', type: 'style', val: `${weeklyProgress}%` },
            { id: 'weekly-target-percent', type: 'text', val: `${Math.floor(weeklyProgress)}%` },
            { id: 'weekly-target-bar', type: 'style', val: `${weeklyProgress}%` }
        ];

        elements.forEach(el => {
            const domEl = document.getElementById(el.id);
            if (domEl) {
                if (el.type === 'style') {
                    domEl.style.width = el.val;
                } else {
                    domEl.textContent = el.val;
                }
            }
        });
    });
}

function updateAnalyticsRealtime() {
    if (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime) {
        const liveIncrement = Date.now() - appData.lastPunchTime;

        // 1. Update Historical/Analytics Total (Last 7 Days)
        const analyticsTotalEl = document.getElementById('analytics-total-hours');
        if (analyticsTotalEl) {
            const last7Days = appData.weeklyData || [];
            const baseTotal = last7Days.reduce((sum, day) => {
                const hours = (typeof day.hours === 'number' && !isNaN(day.hours)) ? day.hours : 0;
                return sum + hours;
            }, 0);
            analyticsTotalEl.textContent = formatMillisToHHMMSS(baseTotal + liveIncrement);
        }

        // 2. Update Comparison Total (Current Week)
        const comparisonTotalEl = document.getElementById('comparison-total-hours');
        if (comparisonTotalEl) {
            const currentWeekData = appData.weeklyData || [];
            const workingDaysInWeek = currentWeekData.filter(day => day.status === 'Present' && day.hours > 0);
            const baseTotal = workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0);
            const totalHours = (baseTotal + liveIncrement) / 3600000;
            comparisonTotalEl.textContent = `${totalHours.toFixed(1)}h`;
        }

        // 3. Update Monthly Summary (already has ID: current-month-total-hours)
        const currentMonthTotalEl = document.getElementById('current-month-total-hours');
        if (currentMonthTotalEl) {
            const currentMonthData = appData.currentMonthData || [];
            const workingDays = currentMonthData.filter(d => d.status === 'Present' && d.hours > 0);
            const baseTotal = workingDays.reduce((sum, day) => sum + (day.hours || 0), 0);
            currentMonthTotalEl.textContent = formatMillisToHHMMSS(baseTotal + liveIncrement);
        }
    }
}


async function renderCurrentWeekReportAndGoal() {
    if (!appData.weeklyData || appData.weeklyData.length === 0) {
        document.getElementById('weekly-day-list').innerHTML = '<div style="text-align:center; color: var(--label-color);">No weekly data found. Open Keka (attendance page) to load your data.</div>';
        return;
    }

    // Use all 7 days from weeklyData (already filtered by requestWeekData for This Week or Last Week)
    const currentWeekData = appData.weeklyData;

    // Filter working days: ONLY status='Present' (excludes Holiday, Leave, Weekly Off)
    const workingDaysInWeek = currentWeekData.filter(day => day.status === 'Present' && day.hours > 0);

    // Calculate total hours from all working days
    let totalMillisThisWeek = workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0);

    // Add today's live work time ONLY if viewing This Week and currently working
    if (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime) {
        const todayLiveTime = Date.now() - appData.lastPunchTime;
        totalMillisThisWeek += todayLiveTime;
    }

    const totalLatesThisWeek = currentWeekData.filter(day => day.isLate).length;

    // Calculate Average based on working days
    // For Last Week: use all completed working days
    // For This Week: exclude today if it's incomplete
    let avgMillis;
    if (isViewingLastWeek) {
        // Last Week - all days are complete, use all working days
        avgMillis = workingDaysInWeek.length > 0 ? totalMillisThisWeek / workingDaysInWeek.length : 0;
    } else {
        // This Week - exclude today from average if it's incomplete
        const completedWorkingDays = workingDaysInWeek.filter(day => !day.isToday);
        if (completedWorkingDays.length > 0) {
            const totalCompletedMillis = completedWorkingDays.reduce((acc, day) => acc + day.hours, 0);
            avgMillis = totalCompletedMillis / completedWorkingDays.length;
        } else {
            // No past days (Monday morning), use current total
            avgMillis = workingDaysInWeek.length > 0 ? totalMillisThisWeek / workingDaysInWeek.length : 0;
        }
    }

    // Update Top Stats
    console.log('📊 Weekly Stats:', {
        totalHours: formatMillisToHHMMSS(totalMillisThisWeek),
        avgHours: formatMillisToHHMMSS(avgMillis),
        lateCount: totalLatesThisWeek,
        workingDays: workingDaysInWeek.length
    });

    document.getElementById('weekly-total-hours').textContent = formatMillisToHHMMSS(totalMillisThisWeek);
    document.getElementById('weekly-avg-hours').textContent = formatMillisToHHMMSS(avgMillis);
    document.getElementById('weekly-late-count').textContent = totalLatesThisWeek;

    const listContainer = document.getElementById('weekly-day-list');
    listContainer.innerHTML = '';

    // If the entire week contains no actual worked days (all Off/Holiday/Leave), show a friendly message
    const anyWork = currentWeekData.some(day => day.status === 'Present' && day.hours > 0);
    const allNonWorking = currentWeekData.length > 0 && currentWeekData.every(day => ['Holiday', 'Weekly Off', 'Leave'].includes(day.status) || !(day.hours > 0));
    if (!anyWork && allNonWorking) {
        listContainer.innerHTML = `
            <div style="text-align:center; padding: 20px; color: var(--label-color);">
                <div style="font-weight:700; margin-bottom:8px;">Looks quiet this week ✨</div>
                <div style="font-size:11px;">All days in the selected week are holidays, weekly offs or leaves. Nothing to show here — enjoy your time off!</div>
            </div>`;
        // still update summary cards to show zeros/empties
        document.getElementById('weekly-total-hours').textContent = formatMillisToHHMMSS(0);
        document.getElementById('weekly-avg-hours').textContent = formatMillisToHHMMSS(0);
        document.getElementById('weekly-late-count').textContent = 0;
        return;
    }



    // --- SORTING ---
    const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    function extractWeekdayShort(dateStr) {
        if (!dateStr) return null;
        const m = dateStr.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i);
        return m ? m[1].slice(0, 3) : null;
    }
    const sortedWeekData = [...currentWeekData].sort((a, b) => {
        const wa = weekdayMap[extractWeekdayShort(a.date)] || 0;
        const wb = weekdayMap[extractWeekdayShort(b.date)] || 0;
        return wb - wa;
    });

    // --- RENDER LIST ---
    sortedWeekData.forEach(day => {
        let displayStatusText = '';
        let badgeHTML = '';

        const isToday = day.isToday;
        const timeId = isToday ? 'id="today-list-time"' : '';

        // 1. HOLIDAY
        if (day.status === 'Holiday') {
            badgeHTML = `<span class="holiday-badge" style="background-color: #00c853; color: white; padding: 1px 4px; border-radius: 3px; font-size: 7px; font-weight: bold;">HOLIDAY</span>`;
        }
        // 2. WEEKLY OFF
        else if (day.status === 'Weekly Off') {
            badgeHTML = `<span class="off-badge" style="background-color: #b8860b; color: white; padding: 1px 4px; border-radius: 3px; font-size: 7px; font-weight: bold;">OFF</span>`;
        }
        // 3. LEAVE
        else if (day.status === 'Leave') {
            const fullLeaveText = day.leaveType || 'Leave';
            const isUnpaid = fullLeaveText.toLowerCase().includes('unpaid');

            if (isUnpaid) {
                badgeHTML = `<span style="background-color:#9785c2;color:#fff;padding:1px 4px;border-radius:3px;font-size:7px;font-weight:600;letter-spacing:0.2px;">${fullLeaveText}</span>`;
                // displayStatusText = `<span style="font-size:8px;opacity:0.75;margin-left:4px;">${fullLeaveText}</span>`;
            } else {
                badgeHTML = `<span style="background-color:#9c27b0;color:#fff;padding:1px 4px;border-radius:3px;font-size:7px;font-weight:600;letter-spacing:0.2px;">${fullLeaveText}</span>`;
                // displayStatusText = `<span style="font-size:8px;opacity:0.75;margin-left:4px;">${fullLeaveText}</span>`;
            }

        }
        // 4. PRESENT (Or Today)
        else if (day.status === 'Present') {
            displayStatusText = `<span ${timeId} class="day-hours time-display">${formatMillisToHHMMSS(day.hours)}</span>`;
            if (day.isLate) {
                badgeHTML = `<span style="background-color: #ff5c5c; color: white; padding: 1px 4px; border-radius: 3px; font-size: 7px; font-weight: bold;">LATE</span>`;
            } else {
                badgeHTML = ``;
            }
        }

        listContainer.innerHTML += `
            <div class="weekly-day-item">
                <span class="day-date">${day.date}</span>
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${badgeHTML}
                    ${displayStatusText}
                </div>
            </div>`;
    });

    // --- DYNAMIC GOAL CALCULATION ---
    const settings = await new Promise(resolve => chrome.storage.sync.get({
        shiftHours: '08:00:00',
        workWeekDays: 5  // Default to 5-day work week
    }, resolve));
    const dailyGoalMillis = timeStringToMillis(settings.shiftHours);

    // Use the work week days setting (5 or 6 days)
    let targetDays = parseInt(settings.workWeekDays, 10) || 5;

    // Calculate deductions based on actual logs
    let deductions = 0;

    currentWeekData.forEach(day => {
        // Check if the day is a weekday based on work week setting
        const dayName = extractWeekdayShort(day.date);
        let isWeekday;

        if (targetDays === 6) {
            // 6-day work week: Mon-Sat are working days
            isWeekday = dayName && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(dayName);
        } else {
            // 5-day work week: Mon-Fri are working days
            isWeekday = dayName && ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(dayName);
        }

        if (isWeekday) {
            // If it's a weekday AND it's a Holiday or a Leave, reduce the goal
            if (day.status === 'Holiday' || day.status === 'Leave') {
                deductions++;
            }
        }
    });

    // Calculate Final Goal
    const adjustedDays = Math.max(0, targetDays - deductions);
    const weeklyGoalMillis = adjustedDays * dailyGoalMillis;
    const weeklyGoalHours = weeklyGoalMillis / 3600000;

    // Update UI
    const goalTitleEl = document.getElementById('weekly-goal-title');
    if (goalTitleEl) goalTitleEl.textContent = `Weekly Goal (${weeklyGoalHours.toFixed(1)}h)`;

    const weeklyProgress = weeklyGoalMillis > 0 ? Math.min(100, (totalMillisThisWeek / weeklyGoalMillis) * 100) : 0;
    const weeklyGoalPercentEl = document.getElementById('weekly-goal-percent');
    const weeklyGoalFillEl = document.getElementById('weekly-goal-fill');
    if (weeklyGoalPercentEl) weeklyGoalPercentEl.textContent = `${Math.floor(weeklyProgress)}%`;
    if (weeklyGoalFillEl) weeklyGoalFillEl.style.width = `${weeklyProgress}%`;

    // --- UPDATE WEEKLY PROGRESS SECTION ---
    // Calculate days that met the daily goal
    const daysMetGoal = workingDaysInWeek.filter(day => day.hours >= dailyGoalMillis).length;
    const totalWorkDaysCount = workingDaysInWeek.length;
    const dailyGoalProgress = totalWorkDaysCount > 0 ? (daysMetGoal / totalWorkDaysCount) * 100 : 0;

    // Update Daily Goal Achievement
    const goalAchievementPercentEl = document.getElementById('goal-achievement-percent');
    const goalAchievementBarEl = document.getElementById('goal-achievement-bar');
    const goalsMetEl = document.getElementById('goals-met');
    const totalWorkDaysEl = document.getElementById('total-work-days');

    if (goalAchievementPercentEl) goalAchievementPercentEl.textContent = `${Math.floor(dailyGoalProgress)}%`;
    if (goalAchievementBarEl) goalAchievementBarEl.style.width = `${dailyGoalProgress}%`;
    if (goalsMetEl) goalsMetEl.textContent = daysMetGoal;
    if (totalWorkDaysEl) totalWorkDaysEl.textContent = adjustedDays; // Use adjusted days (accounting for holidays/leaves)

    // Update Weekly Hours Target
    const weeklyTargetPercentEl = document.getElementById('weekly-target-percent');
    const weeklyTargetBarEl = document.getElementById('weekly-target-bar');
    const currentWeeklyHoursEl = document.getElementById('current-weekly-hours');
    const targetWeeklyHoursEl = document.getElementById('target-weekly-hours');

    if (weeklyTargetPercentEl) weeklyTargetPercentEl.textContent = `${Math.floor(weeklyProgress)}%`;
    if (weeklyTargetBarEl) weeklyTargetBarEl.style.width = `${weeklyProgress}%`;
    if (currentWeeklyHoursEl) currentWeeklyHoursEl.textContent = (totalMillisThisWeek / 3600000).toFixed(1);
    if (targetWeeklyHoursEl) targetWeeklyHoursEl.textContent = weeklyGoalHours.toFixed(1);

    // --- Insights ---
    const mostProductiveDay = workingDaysInWeek.length > 0 ? [...workingDaysInWeek].sort((a, b) => b.hours - a.hours)[0] : null;
    document.getElementById('avg-daily-hours').textContent = formatMillisToHoursMinutes(avgMillis);
    document.getElementById('best-productivity-day').textContent = mostProductiveDay ? mostProductiveDay.date.split(',')[0] : '--';

    const shiftMillis = timeStringToMillis(settings.shiftHours);
    const totalOvertime = workingDaysInWeek.reduce((acc, day) => acc + Math.max(0, day.hours - shiftMillis), 0);
    document.getElementById('total-overtime').textContent = formatMillisToHoursMinutes(totalOvertime);

    const breakEfficiency = (appData.requiredBreakMillis > 0) ? Math.min(100, Math.floor((appData.breakUsedMillis / appData.requiredBreakMillis) * 100)) : 0;
    document.getElementById('break-efficiency').textContent = `${breakEfficiency}%`;
    const efficiencyScore = (workingDaysInWeek.length * shiftMillis) > 0 ? Math.min(100, Math.floor((totalMillisThisWeek / (workingDaysInWeek.length * shiftMillis)) * 100)) : 0;
    document.getElementById('focus-score').textContent = `${breakEfficiency}%`;
    document.getElementById('efficiency-score').textContent = `${efficiencyScore}%`;
    document.getElementById('consistency-score').textContent = `${Math.max(0, 100 - (totalLatesThisWeek * 20))}%`;

    // --- ON-TIME RATE CALCULATIONS ---
    const onTimeDays = workingDaysInWeek.filter(day => !day.isLate).length;
    const totalWorkDays = workingDaysInWeek.length;
    const onTimeRate = totalWorkDays > 0 ? Math.floor((onTimeDays / totalWorkDays) * 100) : 100;

    const onTimePercentEl = document.getElementById('weekly-ontime-percent');
    const onTimeCountEl = document.getElementById('ontime-count');
    const totalDaysCountEl = document.getElementById('total-days-count');

    if (onTimePercentEl) onTimePercentEl.textContent = `${onTimeRate}%`;
    if (onTimeCountEl) onTimeCountEl.textContent = onTimeDays;
    if (totalDaysCountEl) totalDaysCountEl.textContent = totalWorkDays;
}

function renderHistoricalInsights() {
    try {
        const historicalContainer = document.getElementById('history-insights-content');
        if (!historicalContainer) {
            console.error("Historical container not found");
            return;
        }

        historicalContainer.innerHTML = '';

        // Use originalAppData to get unfiltered data, fallback to appData if originalAppData is not available
        const allData = originalAppData?.weeklyData || appData.weeklyData || [];

        if (allData.length === 0) {
            historicalContainer.innerHTML = '<p style="font-size: 10px; text-align: center;">No data to display.</p>';
            return;
        }

        // Calculate the last 7 days from today
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Today + 6 days back = 7 days total
        sevenDaysAgo.setHours(0, 0, 0, 0);

        // Filter data for the last 7 days
        const last7Days = allData.filter(day => {
            const dayDate = parseDateFromString(day.date);
            if (!dayDate) return false;
            return dayDate >= sevenDaysAgo && dayDate <= today;
        });

        if (last7Days.length === 0) {
            historicalContainer.innerHTML = '<p style="font-size: 10px; text-align: center;">No data to display.</p>';
            return;
        }

        // Calculate stats from ALL 7 days, not just "Present" status
        // This includes partial work days, holidays, leaves, etc.
        const totalHours = last7Days.reduce((sum, day) => {
            const hours = (typeof day.hours === 'number' && !isNaN(day.hours)) ? day.hours : 0;
            return sum + hours;
        }, 0) + (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime ? (Date.now() - appData.lastPunchTime) : 0);

        const workingDays = last7Days.filter(d => d.status === 'Present' && d.hours > 0);
        const lateDays = last7Days.filter(d => d.isLate).length;
        const totalDays = last7Days.length;

        // Create detailed breakdown of all 7 days
        let dayBreakdown = '<div style="margin-top: 12px; font-size: 10px;"><div style="font-weight: 600; margin-bottom: 6px; color: var(--label-color);">Day-by-Day Breakdown:</div>';

        last7Days.forEach((day, index) => {
            const dayHours = (typeof day.hours === 'number' && !isNaN(day.hours)) ? day.hours : 0;
            const hoursDisplay = dayHours > 0 ? formatMillisToHHMMSS(dayHours) : '0h';

            let statusBadge = '';
            if (day.status === 'Holiday') {
                statusBadge = '<span style="background: #00c853; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px;">HOLIDAY</span>';
            } else if (day.status === 'Weekly Off') {
                statusBadge = '<span style="background: #b8860b; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px;">OFF</span>';
            } else if (day.status === 'Leave') {
                statusBadge = '<span style="background: #9c27b0; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px;">LEAVE</span>';
            } else if (day.isLate) {
                statusBadge = '<span style="background: #ff5c5c; color: white; padding: 2px 4px; border-radius: 3px; font-size: 8px; margin-left: 4px;">LATE</span>';
            }

            dayBreakdown += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <span style="flex: 1;">${day.date || `Day ${index + 1}`}${statusBadge}</span>
                <span style="font-weight: 600;">${hoursDisplay}</span>
            </div>`;
        });

        dayBreakdown += '</div>';

        // Create summary card with all 7 days stats
        historicalContainer.innerHTML = `
            <div class="history-card-redesigned">
                <h5>Last 7 Days Summary</h5>
                <div class="history-stats-grid">
                    <div class="history-stat">
                        <div class="stat-value" id="analytics-total-hours">${formatMillisToHHMMSS(totalHours)}</div>
                        <div class="stat-label">Total Hours (All 7 Days)</div>
                    </div>
                    <div class="history-stat">
                        <div class="stat-value">${workingDays.length}</div>
                        <div class="stat-label">Work Days</div>
                    </div>
                    <div class="history-stat">
                        <div class="stat-value">${lateDays}</div>
                        <div class="stat-label">Late Days</div>
                    </div>
                </div>
                ${dayBreakdown}
            </div>`;
    } catch (error) {
        console.error("Error in renderHistoricalInsights:", error);
        const historicalContainer = document.getElementById('history-insights-content');
        if (historicalContainer) {
            historicalContainer.innerHTML = '<p style="font-size: 10px; text-align: center; color: var(--error-color);">Error loading historical data.</p>';
        }
    }
}

// --- WEEK COMPARISON FUNCTION ---
function renderWeekComparison() {
    try {
        if (!appData.weeklyData || appData.weeklyData.length === 0) {
            return; // No data to compare
        }

        const currentWeekData = appData.weeklyData;
        const workingDaysInWeek = currentWeekData.filter(day => day.status === 'Present' && day.hours > 0);
        const totalMillisThisWeek = workingDaysInWeek.reduce((acc, day) => acc + day.hours, 0) + (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime ? (Date.now() - appData.lastPunchTime) : 0);
        const avgMillisThisWeek = workingDaysInWeek.length > 0 ? totalMillisThisWeek / workingDaysInWeek.length : 0;


        // Get current week identifier (e.g., "2024-W49")
        const today = new Date();
        const weekNumber = getWeekNumber(today);
        const currentWeekKey = `week_${today.getFullYear()}_W${weekNumber}`;

        // Store current week's data
        const currentWeekStats = {
            totalHours: totalMillisThisWeek,
            avgHours: avgMillisThisWeek,
            workDays: workingDaysInWeek.length,
            timestamp: Date.now()
        };

        chrome.storage.local.set({ [currentWeekKey]: currentWeekStats });

        // Try to get previous week's data
        const prevWeekNumber = weekNumber - 1;
        const prevWeekKey = `week_${today.getFullYear()}_W${prevWeekNumber}`;

        chrome.storage.local.get([prevWeekKey], (result) => {
            const prevWeekStats = result[prevWeekKey];

            // Calculate comparisons
            let totalHoursChange = 0;
            let avgHoursChange = 0;
            let totalHoursArrow = '↑';
            let avgHoursArrow = '↑';

            if (prevWeekStats && prevWeekStats.totalHours > 0) {
                totalHoursChange = ((totalMillisThisWeek - prevWeekStats.totalHours) / prevWeekStats.totalHours) * 100;
                totalHoursArrow = totalHoursChange >= 0 ? '↑' : '↓';
            }

            if (prevWeekStats && prevWeekStats.avgHours > 0) {
                avgHoursChange = ((avgMillisThisWeek - prevWeekStats.avgHours) / prevWeekStats.avgHours) * 100;
                avgHoursArrow = avgHoursChange >= 0 ? '↑' : '↓';
            }

            // Update UI elements
            const totalComparisonEl = document.getElementById('weekly-total-comparison');
            const avgComparisonEl = document.getElementById('weekly-avg-comparison');

            if (totalComparisonEl) {
                const arrow = totalComparisonEl.querySelector('.comparison-arrow');
                const text = totalComparisonEl.querySelector('.comparison-text');
                if (text) {
                    if (prevWeekStats) {
                        if (arrow) arrow.textContent = totalHoursArrow;
                        text.textContent = `${totalHoursArrow === '↑' ? '+' : ''}${Math.abs(totalHoursChange).toFixed(1)}% vs last week`;
                        totalComparisonEl.style.color = totalHoursChange >= 0 ? 'var(--success-color)' : 'var(--error-color)';
                    } else {
                        if (arrow) arrow.textContent = '—';
                        text.textContent = 'First week - comparison starts next week';
                        totalComparisonEl.style.color = 'var(--label-color)';
                        totalComparisonEl.style.fontSize = '10px';
                    }
                }
            }

            if (avgComparisonEl) {
                const arrow = avgComparisonEl.querySelector('.comparison-arrow');
                const text = avgComparisonEl.querySelector('.comparison-text');
                if (text) {
                    if (prevWeekStats) {
                        if (arrow) arrow.textContent = avgHoursArrow;
                        text.textContent = `${avgHoursArrow === '↑' ? '+' : ''}${Math.abs(avgHoursChange).toFixed(1)}% vs last week`;
                        avgComparisonEl.style.color = avgHoursChange >= 0 ? 'var(--success-color)' : 'var(--error-color)';
                    } else {
                        if (arrow) arrow.textContent = '—';
                        text.textContent = 'First week - comparison starts next week';
                        avgComparisonEl.style.color = 'var(--label-color)';
                        avgComparisonEl.style.fontSize = '10px';
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error in renderWeekComparison:", error);
    }
}

// Helper function to get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// --- UI, SETTINGS, HELPERS ---

function switchView(viewName) {
    document.getElementById('app-view').classList.toggle('hidden', viewName !== 'app');
    document.getElementById('settings-view').classList.toggle('hidden', viewName !== 'settings');
    document.getElementById('error-view').classList.toggle('hidden', viewName !== 'error');
    if (viewName === 'settings') restoreSettings();
}

function showError(message) {
    document.getElementById('error-message').textContent = `Error: ${message}`;
    switchView('error');
    chrome.runtime.sendMessage({ type: 'CLEAR_ALARM' });
}

function setDayMode(mode) {
    currentDayMode = mode;
    document.getElementById('full-day-btn').classList.toggle('active', mode === 'fullDay');
    document.getElementById('half-day-btn').classList.toggle('active', mode === 'halfDay');

    // Save the selected mode to storage
    chrome.storage.sync.set({ selectedDayMode: mode });

    updateDisplay();
}

function saveSettings() {
    const fullDayHH = document.getElementById('full-day-hh').value.padStart(2, '0');
    const fullDayMM = document.getElementById('full-day-mm').value.padStart(2, '0');
    const halfDayHH = document.getElementById('half-day-hh').value.padStart(2, '0');
    const halfDayMM = document.getElementById('half-day-mm').value.padStart(2, '0');
    const breakHH = document.getElementById('break-hh').value.padStart(2, '0');
    const breakMM = document.getElementById('break-mm').value.padStart(2, '0');
    const startHH = document.getElementById('start-time-hh').value.padStart(2, '0');
    const startMM = document.getElementById('start-time-mm').value.padStart(2, '0');

    const shiftHoursStr = `${fullDayHH}:${fullDayMM}:00`;
    const halfDayHoursStr = `${halfDayHH}:${halfDayMM}:00`;
    const breakHoursStr = `${breakHH}:${breakMM}:00`;
    const shiftStartTimeStr = `${startHH}:${startMM}:00`;

    // Get all new settings
    const soundNotification = document.getElementById('sound-notification')?.checked || false;
    const notificationSound = document.getElementById('notification-sound')?.value || 'bell';
    const overtimeThreshold = parseInt(document.getElementById('overtime-threshold')?.value, 10) || 9;
    const autoRefresh = parseInt(document.getElementById('auto-refresh')?.value, 10) || 0;
    const workWeekDays = parseInt(document.getElementById('work-week-days')?.value, 10) || 5;
    const badgeIcon = document.getElementById('badge-icon')?.checked !== false;
    const autoBackup = document.getElementById('auto-backup')?.checked || false;

    chrome.storage.sync.set({
        shiftHours: shiftHoursStr,
        halfDayHours: halfDayHoursStr,
        breakHours: breakHoursStr,
        shiftStartTime: shiftStartTimeStr,
        lateGracePeriod: parseInt(document.getElementById('late-grace-period').value, 10),
        timeFormat: document.querySelector('input[name="time-format"]:checked').value,
        soundNotification: soundNotification,
        notificationSound: notificationSound,
        overtimeThreshold: overtimeThreshold,
        autoRefresh: autoRefresh,
        workWeekDays: workWeekDays,
        badgeIcon: badgeIcon,
        autoBackup: autoBackup
    }, () => {
        const status = document.getElementById('settings-status');
        status.textContent = 'Settings saved!';
        status.classList.add('success-message', 'save-success');

        // Re-setup auto-refresh with new settings
        setupAutoRefresh();

        // Automatically go back to app view after showing success message
        setTimeout(() => {
            status.textContent = '';
            status.classList.remove('success-message', 'save-success');
            switchView('app'); // Navigate back to app view
        }, 1000); // Reduced to 1 second for quicker navigation

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url?.includes('keka.com')) {
                chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ['content.js'] });
            }
        });
    });
}

function restoreSettings() {
    chrome.storage.sync.get({
        shiftHours: '08:00:00',
        halfDayHours: '04:30:00',
        breakHours: '01:00:00',
        shiftStartTime: '09:30:00',
        lateGracePeriod: 5,
        timeFormat: '12H',
        soundNotification: false,
        notificationSound: 'bell',
        overtimeThreshold: 9,
        autoRefresh: 0,
        workWeekDays: 5,
        badgeIcon: true,
        autoBackup: false
    }, items => {
        if (items.shiftHours && items.shiftHours.includes(':')) {
            const [hh, mm] = items.shiftHours.split(':');
            document.getElementById('full-day-hh').value = hh;
            document.getElementById('full-day-mm').value = mm;
        }

        if (items.halfDayHours && items.halfDayHours.includes(':')) {
            const [hh, mm] = items.halfDayHours.split(':');
            document.getElementById('half-day-hh').value = hh;
            document.getElementById('half-day-mm').value = mm;
        }

        if (items.breakHours && items.breakHours.includes(':')) {
            const [hh, mm] = items.breakHours.split(':');
            document.getElementById('break-hh').value = hh;
            document.getElementById('break-mm').value = mm;
        }

        if (items.shiftStartTime && items.shiftStartTime.includes(':')) {
            const [hh, mm] = items.shiftStartTime.split(':');
            document.getElementById('start-time-hh').value = hh;
            document.getElementById('start-time-mm').value = mm;
        }

        document.getElementById('late-grace-period').value = items.lateGracePeriod;

        // Restore time format radio buttons
        const timeFormatRadio = document.querySelector(`input[name="time-format"][value="${items.timeFormat}"]`);
        if (timeFormatRadio) {
            timeFormatRadio.checked = true;
            // Update visual radio buttons
            document.querySelectorAll('.radio-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.format === items.timeFormat);
            });
        }

        // Restore new settings
        const soundNotificationCheckbox = document.getElementById('sound-notification');
        const soundNotificationToggle = document.getElementById('sound-notification-toggle');
        if (soundNotificationCheckbox && soundNotificationToggle) {
            soundNotificationCheckbox.checked = items.soundNotification;
            soundNotificationToggle.classList.toggle('active', items.soundNotification);
        }

        const notificationSoundSelect = document.getElementById('notification-sound');
        if (notificationSoundSelect) {
            notificationSoundSelect.value = items.notificationSound;
        }

        const overtimeThresholdInput = document.getElementById('overtime-threshold');
        if (overtimeThresholdInput) {
            overtimeThresholdInput.value = items.overtimeThreshold;
        }

        const autoRefreshSelect = document.getElementById('auto-refresh');
        if (autoRefreshSelect) {
            autoRefreshSelect.value = items.autoRefresh;
        }

        const workWeekDaysSelect = document.getElementById('work-week-days');
        if (workWeekDaysSelect) {
            workWeekDaysSelect.value = items.workWeekDays;
        }

        const badgeIconCheckbox = document.getElementById('badge-icon');
        const badgeIconToggle = document.getElementById('badge-icon-toggle');
        if (badgeIconCheckbox && badgeIconToggle) {
            badgeIconCheckbox.checked = items.badgeIcon;
            badgeIconToggle.classList.toggle('active', items.badgeIcon);
        }

        const autoBackupCheckbox = document.getElementById('auto-backup');
        const autoBackupToggle = document.getElementById('auto-backup-toggle');
        if (autoBackupCheckbox && autoBackupToggle) {
            autoBackupCheckbox.checked = items.autoBackup;
            autoBackupToggle.classList.toggle('active', items.autoBackup);
        }

        // Restore completion notification toggle state
        const completionCheckbox = document.getElementById('completion-notification');
        const completionToggle = document.getElementById('completion-notification-toggle');
        if (completionCheckbox && completionToggle) {
            completionToggle.classList.toggle('active', completionCheckbox.checked);
        }

        document.getElementById('reset-month-label').textContent = appData.currentMonth || new Date().toLocaleString('default', { month: 'long' });
    });
}


function resetLateCount() {
    if (!appData.currentMonth) return;
    const monthKey = `lateCountOffset_${appData.currentMonth}`;
    const settings = {}; settings[monthKey] = appData.lateCount;
    chrome.storage.sync.set(settings, () => {
        const status = document.getElementById('reset-status');
        status.textContent = `Count reset!`;
        setTimeout(() => { status.textContent = ''; }, 2500);
        document.getElementById('late-count').textContent = 0;
        document.getElementById('late-arrival-card').classList.add('hidden');
    });
}

function exportWeeklyData() {
    if (!appData.weeklyData) return;
    let csvContent = "data:text/csv;charset=utf-8,Date,Status,Effective Hours\n";
    appData.weeklyData.forEach(day => {
        let hours = 'N/A';
        let status = day.status;
        if (day.status === 'Present') {
            hours = formatMillisToHHMMSS(day.hours);
            status = day.isLate ? 'Late' : 'On Time';
        }
        csvContent += `${day.date},${status},${hours}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weekly_attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function timeStringToMillis(timeStr) {
    if (!timeStr || !/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return 0;
    const parts = timeStr.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    const s = parts[2] || 0;
    return (h * 3600 + m * 60 + s) * 1000;
}

function formatMillisToHHMMSS(ms) {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    // When less than 1 minute, show MM:SS format (00:XX) to make seconds visible
    if (h === 0 && m === 0) {
        return `00:${String(s).padStart(2, '0')}`;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatMillisToHoursMinutes(ms) {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h:${String(m).padStart(2, '0')}m`;
}

function formatBreakTime(ms) {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h : ${m}m : ${s}s`;
    if (m === 0 && h === 0) return `${s}s`; // Show only seconds when less than 1 minute
    return `${m}m : ${s}s`;
}

function formatTime(date, format, showSeconds = true) {
    try {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return '--:--';
        }
        const options = { hour: '2-digit', minute: '2-digit' };
        if (showSeconds) options.second = '2-digit';
        options.hour12 = (format === '12H');
        return date.toLocaleTimeString('en-US', options);
    } catch (error) {
        console.error("Error formatting time:", error);
        return '--:--';
    }
}

// --- NEW FEATURES ---

function renderAchievements() {
    try {
        if (!appData || !appData.weeklyData) return;

        const streakEl = document.getElementById('work-streak');
        const achievementsList = document.getElementById('achievements-list');

        if (!streakEl || !achievementsList) return;

        // Calculate work streak
        let streak = 0;
        const weeklyData = appData.weeklyData || [];

        for (let i = 0; i < weeklyData.length; i++) {
            const day = weeklyData[i];
            if (day.status === 'Present' && day.hours > 0) {
                streak++;
            } else if (day.status === 'Holiday' || day.status === 'Leave') {
                // Holidays and leaves don't break streak
                continue;
            } else if (day.status === 'Weekly Off') {
                break;
            } else {
                break;
            }
        }

        if (streakEl) {
            streakEl.textContent = streak || '0';
        }

        // Calculate achievements
        const achievements = [];
        const workingDays = weeklyData.filter(d => d.status === 'Present' && d.hours > 0);
        const totalHours = workingDays.reduce((sum, day) => sum + (day.hours || 0), 0);
        const totalHoursThisWeek = totalHours / 3600000; // Convert to hours
        const avgHours = workingDays.length > 0 ? totalHoursThisWeek / workingDays.length : 0;
        const lateCount = weeklyData.filter(d => d.isLate).length;

        // Achievement checks
        if (streak >= 5) {
            achievements.push({ icon: '🔥', title: '5 Day Streak', desc: 'Worked 5 consecutive days', unlocked: true });
        }
        if (streak >= 7) {
            achievements.push({ icon: '💪', title: 'Week Warrior', desc: 'Perfect 7-day streak', unlocked: true });
        }
        if (totalHoursThisWeek >= 40) {
            achievements.push({ icon: '⭐', title: '40 Hour Week', desc: 'Completed 40+ hours this week', unlocked: true });
        }
        if (lateCount === 0 && workingDays.length >= 5) {
            achievements.push({ icon: '⏰', title: 'Punctual Pro', desc: 'No late arrivals this week', unlocked: true });
        }
        if (avgHours >= 8 && workingDays.length >= 5) {
            achievements.push({ icon: '🎯', title: 'Consistent Worker', desc: 'Average 8+ hours daily', unlocked: true });
        }

        // Render achievements
        achievementsList.innerHTML = '';
        if (achievements.length === 0) {
            achievementsList.innerHTML = '<p style="font-size: 10px; text-align: center; color: var(--label-color);">Keep working to unlock achievements!</p>';
        } else {
            achievements.forEach(achievement => {
                achievementsList.innerHTML += `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(0,0,0,0.1); border-radius: 6px;">
                        <span style="font-size: 20px;">${achievement.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; font-size: 11px;">${achievement.title}</div>
                            <div style="font-size: 9px; color: var(--label-color);">${achievement.desc}</div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error("Error rendering achievements:", error);
    }
}

// --- UI HELPERS ---
function showMonthBanner(titleText, subText) {
    try {
        // remove existing
        const existing = document.getElementById('month-banner');
        if (existing) existing.remove();

        const container = document.querySelector('.main-content') || document.body;
        const banner = document.createElement('div');
        banner.id = 'month-banner';
        banner.style.margin = '8px 0';
        banner.style.padding = '10px 12px';
        banner.style.background = 'linear-gradient(90deg, rgba(108,99,255,0.15), rgba(76,217,100,0.06))';
        banner.style.border = '1px solid rgba(255,255,255,0.06)';
        banner.style.borderRadius = '10px';
        banner.style.display = 'flex';
        banner.style.flexDirection = 'column';
        banner.style.gap = '4px';
        banner.style.color = 'var(--text-color)';

        const h = document.createElement('div');
        h.style.fontWeight = '800';
        h.style.fontSize = '13px';
        h.textContent = titleText;

        const s = document.createElement('div');
        s.style.fontSize = '11px';
        s.style.color = 'var(--label-color)';
        s.textContent = subText;

        banner.appendChild(h);
        banner.appendChild(s);

        // insert at top of main-content
        if (container.firstChild) container.insertBefore(banner, container.firstChild);
        else container.appendChild(banner);
    } catch (e) {
        console.error('Error showing month banner:', e);
    }
}

function removeMonthBanner() {
    const existing = document.getElementById('month-banner');
    if (existing) existing.remove();
}

function renderMonthlySummary() {
    try {
        if (!appData) {
            showMonthBanner('No data available', 'Open Keka (attendance page) and sign in to load your monthly summary.');
            return;
        }

        // Current Month Elements
        const currentMonthTotalEl = document.getElementById('current-month-total-hours');
        const currentMonthWorkDaysEl = document.getElementById('current-month-work-days');
        const currentMonthAvgEl = document.getElementById('current-month-avg-hours');
        const currentMonthLateEl = document.getElementById('current-month-late-count');

        // Previous Month Elements
        const previousMonthTotalEl = document.getElementById('previous-month-total-hours');
        const previousMonthWorkDaysEl = document.getElementById('previous-month-work-days');
        const previousMonthAvgEl = document.getElementById('previous-month-avg-hours');
        const previousMonthLateEl = document.getElementById('previous-month-late-count');

        if (!currentMonthTotalEl || !currentMonthWorkDaysEl || !currentMonthAvgEl || !currentMonthLateEl) return;

        // Calculate CURRENT MONTH stats from actual current month data
        const currentMonthData = appData.currentMonthData || [];
        const currentMonthWorkingDays = currentMonthData.filter(d => d.status === 'Present' && d.hours > 0);
        const currentMonthTotalHours = currentMonthWorkingDays.reduce((sum, day) => sum + (day.hours || 0), 0) + (!isViewingLastWeek && appData.isCurrentlyWorking && appData.lastPunchTime ? (Date.now() - appData.lastPunchTime) : 0);
        const currentMonthAvgHours = currentMonthWorkingDays.length > 0 ? currentMonthTotalHours / currentMonthWorkingDays.length : 0;

        const currentMonthLateCount = appData.lateCount || 0;

        // Update Current Month Display with ACTUAL data
        currentMonthTotalEl.textContent = formatMillisToHHMMSS(currentMonthTotalHours);
        currentMonthWorkDaysEl.textContent = currentMonthWorkingDays.length;
        currentMonthAvgEl.textContent = formatMillisToHHMMSS(currentMonthAvgHours);
        currentMonthLateEl.textContent = currentMonthLateCount;

        // Get PREVIOUS MONTH data from storage
        chrome.storage.local.get(['previousMonthData', 'lastSavedMonth'], (result) => {
            const prevMonthData = result.previousMonthData || null;
            const lastSavedMonth = result.lastSavedMonth || null;
            const currentMonth = appData.currentMonth || new Date().toLocaleString('default', { month: 'long' });

            // If user is viewing an older month, show an eye-catching banner
            const realNowMonth = new Date().toLocaleString('default', { month: 'long' });
            if (currentMonth && currentMonth !== realNowMonth) {
                showMonthBanner(`${currentMonth}`, `You're viewing ${currentMonth}. This month has finished — here's the summary.`);
            } else {
                removeMonthBanner();
            }

            // Display Previous Month Data
            if (prevMonthData && previousMonthTotalEl && previousMonthWorkDaysEl && previousMonthAvgEl && previousMonthLateEl) {
                previousMonthTotalEl.textContent = formatMillisToHHMMSS(prevMonthData.totalHours || 0);
                previousMonthWorkDaysEl.textContent = prevMonthData.workDays || 0;
                previousMonthAvgEl.textContent = formatMillisToHHMMSS(prevMonthData.avgHours || 0);
                previousMonthLateEl.textContent = prevMonthData.lateCount || 0;
            } else {
                // No previous month data available
                if (previousMonthTotalEl) previousMonthTotalEl.textContent = '--:--:--';
                if (previousMonthWorkDaysEl) previousMonthWorkDaysEl.textContent = '--';
                if (previousMonthAvgEl) previousMonthAvgEl.textContent = '--:--:--';
                if (previousMonthLateEl) previousMonthLateEl.textContent = '--';
            }

            // Save current month data for next month (check if month changed)
            if (lastSavedMonth && lastSavedMonth !== currentMonth) {
                // Month changed - save current month data as previous month
                chrome.storage.local.set({
                    previousMonthData: {
                        totalHours: currentMonthTotalHours,
                        workDays: currentMonthWorkingDays.length,
                        avgHours: currentMonthAvgHours,
                        lateCount: currentMonthLateCount,
                        month: lastSavedMonth
                    },
                    lastSavedMonth: currentMonth
                });
            } else if (!lastSavedMonth) {
                // First time - just save current month name
                chrome.storage.local.set({ lastSavedMonth: currentMonth });
            } else {
                // Same month - update the data (in case user worked more days)
                // Don't overwrite previousMonthData, just update lastSavedMonth if needed
            }
        });
    } catch (error) {
        console.error("Error rendering monthly summary:", error);
    }
}

function renderWeekComparison() {
    try {
        if (!appData || !appData.weeklyData) return;

        const comparisonEl = document.getElementById('week-comparison-content');
        if (!comparisonEl) return;

        const weeklyData = appData.weeklyData || [];
        const workingDays = weeklyData.filter(d => d.status === 'Present' && d.hours > 0);
        const totalHours = workingDays.reduce((sum, day) => sum + (day.hours || 0), 0);
        const totalHoursThisWeek = totalHours / 3600000;
        const lateCount = weeklyData.filter(d => d.isLate).length;

        // Get previous week data from storage (if available)
        chrome.storage.local.get(['previousWeekData'], (result) => {
            const prevData = result.previousWeekData || null;

            if (!prevData) {
                comparisonEl.innerHTML = `
                    <p style="font-size: 10px; text-align: center; color: var(--label-color);">
                        Comparison data will be available next week.
                    </p>
                `;
                // Save current week data for next week
                chrome.storage.local.set({
                    previousWeekData: {
                        totalHours: totalHoursThisWeek,
                        workDays: workingDays.length,
                        lateCount: lateCount,
                        timestamp: Date.now()
                    }
                });
                return;
            }

            const hoursDiff = totalHoursThisWeek - prevData.totalHours;
            const daysDiff = workingDays.length - prevData.workDays;
            const lateDiff = lateCount - prevData.lateCount;

            const hoursTrend = hoursDiff > 0 ? '📈' : hoursDiff < 0 ? '📉' : '➡️';
            const daysTrend = daysDiff > 0 ? '📈' : daysDiff < 0 ? '📉' : '➡️';
            const lateTrend = lateDiff < 0 ? '✅' : lateDiff > 0 ? '⚠️' : '➡️';

            comparisonEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 10px; color: var(--label-color);">Total Hours</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 11px; font-weight: 600;" id="comparison-total-hours">${totalHoursThisWeek.toFixed(1)}h</span>
                            <span style="font-size: 10px;">${hoursTrend}</span>
                            <span style="font-size: 9px; color: ${hoursDiff >= 0 ? '#4cd964' : '#ff5c5c'};">
                                ${hoursDiff >= 0 ? '+' : ''}${hoursDiff.toFixed(1)}h
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 10px; color: var(--label-color);">Work Days</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 11px; font-weight: 600;">${workingDays.length}</span>
                            <span style="font-size: 10px;">${daysTrend}</span>
                            <span style="font-size: 9px; color: ${daysDiff >= 0 ? '#4cd964' : '#ff5c5c'};">
                                ${daysDiff >= 0 ? '+' : ''}${daysDiff}
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
                        <span style="font-size: 10px; color: var(--label-color);">Late Count</span>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 11px; font-weight: 600;">${lateCount}</span>
                            <span style="font-size: 10px;">${lateTrend}</span>
                            <span style="font-size: 9px; color: ${lateDiff <= 0 ? '#4cd964' : '#ff5c5c'};">
                                ${lateDiff >= 0 ? '+' : ''}${lateDiff}
                            </span>
                        </div>
                    </div>
                </div>
            `;

            // Update stored data for next comparison
            chrome.storage.local.set({
                previousWeekData: {
                    totalHours: totalHoursThisWeek,
                    workDays: workingDays.length,
                    lateCount: lateCount,
                    timestamp: Date.now()
                }
            });
        });
    } catch (error) {
        console.error("Error rendering week comparison:", error);
    }
}

function exportJsonData() {
    try {
        if (!appData || !appData.weeklyData) {
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            currentMonth: appData.currentMonth,
            weeklyData: appData.weeklyData.map(day => ({
                date: day.date,
                status: day.status,
                hours: formatMillisToHHMMSS(day.hours || 0),
                hoursMillis: day.hours || 0,
                isLate: day.isLate || false,
                leaveType: day.leaveType || null
            })),
            summary: {
                totalHours: formatMillisToHHMMSS(appData.weeklyData.reduce((sum, day) => sum + (day.hours || 0), 0)),
                workDays: appData.weeklyData.filter(d => d.status === 'Present' && d.hours > 0).length,
                lateCount: appData.weeklyData.filter(d => d.isLate).length
            }
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `keka_attendance_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            try {
                link.remove();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error("Error cleaning up:", error);
            }
        }, 100);
    } catch (error) {
        console.error("Error exporting JSON data:", error);
    }
}

// --- NOTIFICATION SOUND FUNCTIONALITY ---

// Sound data - using Web Audio API to generate notification sounds
const notificationSounds = {
    bell: {
        frequency: 800,
        duration: 0.3,
        type: 'sine'
    },
    chime: {
        frequencies: [523.25, 659.25, 783.99], // C5, E5, G5
        duration: 0.15,
        type: 'sine'
    },
    ding: {
        frequency: 1000,
        duration: 0.2,
        type: 'triangle'
    },
    success: {
        frequencies: [523.25, 659.25, 783.99, 1046.50], // C5, E5, G5, C6 - ascending
        duration: 0.12,
        type: 'sine'
    },
    alert: {
        frequencies: [880, 880, 880], // A5 repeated - urgent sound
        duration: 0.15,
        type: 'square'
    },
    gentle: {
        frequencies: [440, 554.37], // A4, C#5 - soft and pleasant
        duration: 0.25,
        type: 'sine'
    },
    digital: {
        frequency: 1200,
        duration: 0.15,
        type: 'square'
    },
    marimba: {
        frequencies: [659.25, 783.99, 987.77], // E5, G5, B5 - marimba-like
        duration: 0.18,
        type: 'triangle'
    },
    harp: {
        frequencies: [523.25, 587.33, 659.25, 783.99, 880], // C5, D5, E5, G5, A5 - harp glissando
        duration: 0.08,
        type: 'sine'
    },
    xylophone: {
        frequencies: [1046.50, 1174.66, 1318.51], // C6, D6, E6 - bright xylophone
        duration: 0.12,
        type: 'triangle'
    },
    piano: {
        frequencies: [261.63, 329.63, 392], // C4, E4, G4 - piano chord
        duration: 0.35,
        type: 'sine'
    },
    glass: {
        frequencies: [2093, 2349.32], // C7, D7 - high pitched glass clink
        duration: 0.2,
        type: 'sine'
    },
    coin: {
        frequencies: [1318.51, 1567.98], // E6, G6 - coin drop sound
        duration: 0.1,
        type: 'triangle'
    },
    swoosh: {
        frequency: 600,
        duration: 0.25,
        type: 'sawtooth',
        sweep: true // Special flag for frequency sweep
    },
    pop: {
        frequency: 400,
        duration: 0.08,
        type: 'sine'
    },
    beep: {
        frequencies: [1000, 1000], // Double beep
        duration: 0.1,
        type: 'square'
    },
    // Trending App-Inspired Sounds (More Accurate Patterns)
    whatsapp: {
        frequencies: [587.33, 659.25], // D5, E5 - WhatsApp double tone
        duration: 0.08,
        type: 'sine',
        gap: 0.05 // Small gap between tones
    },
    iphone: {
        frequencies: [1174.66, 880, 587.33], // D6, A5, D5 - Authentic iPhone Tri-tone
        duration: 0.3,
        type: 'sine',
        gap: 0.08
    },
    samsung: {
        frequencies: [659.25, 880, 1046.50, 1318.51], // E5, A5, C6, E6 - Samsung Over the Horizon
        duration: 0.15,
        type: 'sine',
        gap: 0.05
    },
    messenger: {
        frequencies: [880, 1046.50], // A5, C6 - Messenger pop
        duration: 0.06,
        type: 'sine'
    },
    slack: {
        frequencies: [698.46, 830.61, 698.46], // F5, G#5, F5 - Slack hollow knock
        duration: 0.12,
        type: 'sine',
        gap: 0.08
    },
    discord: {
        frequencies: [1046.50, 1318.51], // C6, E6 - Discord notification
        duration: 0.1,
        type: 'sine'
    },
    teams: {
        frequencies: [523.25, 659.25], // C5, E5 - Microsoft Teams notification
        duration: 0.25,
        type: 'sine',
        gap: 0.05
    },
    tweet: {
        frequencies: [1568, 1318.51], // G6, E6 - Twitter chirp (descending)
        duration: 0.06,
        type: 'sine'
    },

    // Musical Tunes
    happyBirthday: {
        frequencies: [
            // Happy birthday to you (G G A G C B)
            392, 392, 440, 392, 523.25, 493.88,
            // Happy birthday to you (G G A G D C)
            392, 392, 440, 392, 587.33, 523.25,
            // Happy birthday dear [name] (G G G E C B A)
            392, 392, 783.99, 659.25, 523.25, 493.88, 440,
            // Happy birthday to you (F F E C D C)
            698.46, 698.46, 659.25, 523.25, 587.33, 523.25
        ],
        duration: 0.25,
        type: 'sine',
        gap: 0.05
    },
    jingleBells: {
        frequencies: [
            // Jingle bells, jingle bells, jingle all the way (E E E, E E E, E G C D E)
            659.25, 659.25, 659.25, 0,
            659.25, 659.25, 659.25, 0,
            659.25, 783.99, 523.25, 587.33, 659.25, 0, 0,
            // Oh what fun it is to ride (F F F F F E E E E D D E D G)
            698.46, 698.46, 698.46, 698.46,
            698.46, 659.25, 659.25, 659.25, 659.25,
            587.33, 587.33, 659.25, 587.33, 0, 783.99
        ],
        duration: 0.18,
        type: 'sine',
        gap: 0.04
    },
    twinkleStar: {
        frequencies: [
            // Twinkle twinkle little star (C C G G A A G)
            523.25, 523.25, 783.99, 783.99, 880, 880, 783.99, 0,
            // How I wonder what you are (F F E E D D C)
            698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25, 0,
            // Up above the world so high (G G F F E E D)
            783.99, 783.99, 698.46, 698.46, 659.25, 659.25, 587.33, 0,
            // Like a diamond in the sky (G G F F E E D)
            783.99, 783.99, 698.46, 698.46, 659.25, 659.25, 587.33, 0,
            // Twinkle twinkle little star (C C G G A A G)
            523.25, 523.25, 783.99, 783.99, 880, 880, 783.99, 0,
            // How I wonder what you are (F F E E D D C)
            698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25
        ],
        duration: 0.2,
        type: 'sine',
        gap: 0.05
    },
    nokiaTune: {
        frequencies: [
            // Classic Nokia Tune (E D F# G# C# B D E)
            659.25, 587.33, 369.99, 415.30,
            554.37, 493.88, 293.66, 329.63,
            // Repeat
            659.25, 587.33, 369.99, 415.30,
            554.37, 493.88, 293.66, 329.63
        ],
        duration: 0.125,
        type: 'sine',
        gap: 0.04
    },
    superMario: {
        frequencies: [
            // Opening: E E 0 E 0 C E 0 G 0 0 0 G(low)
            659.25, 659.25, 0, 659.25, 0, 523.25, 659.25, 0, 783.99, 0, 0, 0, 392, 0, 0, 0,
            // Main melody: C 0 0 G(low) 0 0 E 0 0 A 0 B 0 Bb A
            523.25, 0, 0, 392, 0, 0, 329.63, 0, 0, 440, 0, 493.88, 0, 466.16, 440, 0,
            // Continue: G E G A 0 F G 0 E 0 C D B
            392, 659.25, 0, 783.99, 880, 0, 698.46, 783.99, 0, 659.25, 0, 523.25, 587.33, 493.88, 0, 0,
            // Repeat opening phrase
            523.25, 0, 0, 392, 0, 0, 329.63, 0, 0, 440, 0, 493.88, 0, 466.16, 440, 0,
            // Final phrase: G E G A 0 F G 0 E 0 C D B
            392, 659.25, 0, 783.99, 880, 0, 698.46, 783.99, 0, 659.25, 0, 523.25, 587.33, 493.88, 0, 0,
            // Ending
            0, 783.99, 740, 698.46, 622.25, 0, 659.25, 0, 415.30, 440, 523.25, 0, 440, 523.25, 587.33, 0,
            783.99, 740, 698.46, 622.25, 0, 659.25, 0, 1046.50, 0, 1046.50, 1046.50, 0, 0, 0
        ],
        duration: 0.11,
        type: 'square',
        gap: 0.025
    },
    zelda: {
        frequencies: [
            783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 783.99,
            880, 932.33, 1046.50, 1174.66, 1318.51,
            1318.51, 1174.66, 1046.50, 932.33, 880, 783.99
        ],
        duration: 0.14,
        type: 'triangle',
        gap: 0.05
    },
    tetris: {
        frequencies: [
            659.25, 493.88, 523.25, 587.33, 523.25, 493.88,
            440, 440, 523.25, 659.25, 587.33, 523.25,
            493.88, 0, 493.88, 523.25, 587.33, 0, 659.25,
            523.25, 440, 0, 440, 493.88, 523.25, 554.37, 587.33,
            659.25, 523.25, 440, 440, 0, 493.88, 523.25
        ],
        duration: 0.11,
        type: 'square',
        gap: 0.03
    },
    finalFantasy: {
        frequencies: [
            523.25, 523.25, 523.25, 523.25,
            659.25, 587.33, 659.25, 783.99,
            880, 783.99, 880, 1046.50,
            1174.66, 1046.50, 880, 783.99,
            659.25, 783.99, 880, 1046.50, 1174.66,
            1318.51, 1318.51, 1318.51, 1318.51
        ],
        duration: 0.13,
        type: 'sine',
        gap: 0.04
    },

    silent: null
};

// Play notification sound
function playNotificationSound(soundType = 'bell') {
    try {
        // Check if sound notifications are enabled
        chrome.storage.sync.get({ soundNotification: false }, (settings) => {
            if (!settings.soundNotification && soundType !== 'test') {
                return;
            }

            const soundConfig = notificationSounds[soundType] || notificationSounds.bell;

            // Silent option - do nothing
            if (soundConfig === null) {
                return;
            }

            // Create audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            if (soundConfig.frequencies) {
                // Play chime (multiple notes)
                const gap = soundConfig.gap || 0; // Gap between notes
                soundConfig.frequencies.forEach((freq, index) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = soundConfig.type;

                    // Calculate start time with gap
                    const startTime = audioContext.currentTime + (index * (soundConfig.duration + gap));
                    gainNode.gain.setValueAtTime(0.3, startTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + soundConfig.duration);

                    oscillator.start(startTime);
                    oscillator.stop(startTime + soundConfig.duration);
                });
            } else {
                // Play single note (bell, ding, swoosh, pop, etc.)
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = soundConfig.frequency;
                oscillator.type = soundConfig.type;

                // Special handling for swoosh - frequency sweep
                if (soundConfig.sweep) {
                    oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(soundConfig.frequency * 0.5, audioContext.currentTime + soundConfig.duration);
                }

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + soundConfig.duration);
            }
        });
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
}

// Test notification sound (called by test button)
function testNotificationSound() {
    try {
        const soundSelect = document.getElementById('notification-sound');
        const selectedSound = soundSelect ? soundSelect.value : 'bell';

        console.log(`Testing sound: ${selectedSound}`);

        // For testing, bypass the soundNotification check
        const soundConfig = notificationSounds[selectedSound];

        // Silent option - show message
        if (soundConfig === null) {
            return;
        }

        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        if (soundConfig.frequencies) {
            // Play chime (multiple notes)
            const gap = soundConfig.gap || 0; // Gap between notes
            soundConfig.frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = soundConfig.type;

                // Calculate start time with gap
                const startTime = audioContext.currentTime + (index * (soundConfig.duration + gap));
                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + soundConfig.duration);

                oscillator.start(startTime);
                oscillator.stop(startTime + soundConfig.duration);
            });
        } else {
            // Play single note (bell, ding, swoosh, pop, etc.)
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = soundConfig.frequency;
            oscillator.type = soundConfig.type;

            // Special handling for swoosh - frequency sweep
            if (soundConfig.sweep) {
                oscillator.frequency.setValueAtTime(soundConfig.frequency, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(soundConfig.frequency * 0.5, audioContext.currentTime + soundConfig.duration);
            }

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundConfig.duration);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + soundConfig.duration);
        }
    } catch (error) {
        console.error('Error testing notification sound:', error);
    }
}

// Test Completion Notification Function
function testCompletionNotification() {
    try {
        chrome.storage.sync.get({
            soundNotification: false,
            notificationSound: 'bell'
        }, (settings) => {
            // Use Chrome notifications API (silent by default) instead of browser Notification API
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: '🎉 Work Hours Complete!',
                message: 'This is a test notification. You have completed your daily work hours. Great job!',
                priority: 2,
                silent: true // This prevents the Windows notification sound
            }, (notificationId) => {
                if (chrome.runtime.lastError) {
                    console.error('Notification error:', chrome.runtime.lastError);
                    alert('Error showing notification. Please check if notifications are enabled.');
                    return;
                }

                // Play our custom sound if enabled
                if (settings.soundNotification) {
                    playNotificationSound(settings.notificationSound);
                }
            });
        });
    } catch (error) {
        console.error('Error testing completion notification:', error);
        alert('Error testing notification. Please check the console for details.');
    }
}


// Track notification states to avoid duplicate notifications
let hasShownCompletionNotification = false;
let hasShownOvertimeNotification = false;
let lastNotificationCheckTime = 0;

// Check and trigger notifications (called from updateDisplay)
function checkAndTriggerNotifications(currentWorkMillis, targetMillis, isCompleted) {
    try {
        const now = Date.now();

        // Only check every 10 seconds to avoid spam
        if (now - lastNotificationCheckTime < 10000) {
            return;
        }
        lastNotificationCheckTime = now;

        chrome.storage.sync.get({
            completionNotification: true,
            soundNotification: false,
            notificationSound: 'bell',
            overtimeThreshold: 9
        }, (settings) => {
            // Check for completion notification
            if (settings.completionNotification && isCompleted && !hasShownCompletionNotification) {
                hasShownCompletionNotification = true;

                // Show Chrome notification (silent by default)
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon.png',
                    title: '🎉 Work Hours Complete!',
                    message: 'You have completed your daily work hours. Great job!',
                    priority: 2,
                    silent: true // This prevents the Windows notification sound
                });

                // Play our custom sound if enabled
                if (settings.soundNotification) {
                    playNotificationSound(settings.notificationSound);
                }
            }


            // Check for overtime notification
            const overtimeThresholdMillis = settings.overtimeThreshold * 3600000; // Convert hours to milliseconds
            if (currentWorkMillis >= overtimeThresholdMillis && !hasShownOvertimeNotification) {
                hasShownOvertimeNotification = true;

                // Show Chrome notification (silent by default)
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon.png',
                    title: '⏰ Overtime Alert',
                    message: `You have worked ${settings.overtimeThreshold}+ hours today. Consider taking a break!`,
                    priority: 2,
                    silent: true // This prevents the Windows notification sound
                });

                // Play our custom sound if enabled
                if (settings.soundNotification) {
                    playNotificationSound(settings.notificationSound);
                }
            }


            // Reset flags when work time goes back below thresholds (new day)
            if (!isCompleted && hasShownCompletionNotification) {
                hasShownCompletionNotification = false;
            }
            if (currentWorkMillis < overtimeThresholdMillis && hasShownOvertimeNotification) {
                hasShownOvertimeNotification = false;
            }
        });
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}


// ==================== NEW FEATURES: MISSED SWIPE & EXCEL EXPORT ====================

/**
 * Detect missed swipes from attendance data
 * A missed swipe is when status shows "Present" but hours are 0 or very low
 */
function detectMissedSwipes() {
    if (!appData || !appData.currentMonthData) return [];

    const missedSwipes = [];
    const monthData = appData.currentMonthData || [];

    // Get today's date string in "Mon, 08 Dec" format to match data
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    // Note: This format "14 Jan" might need adjustment to match "Wed, 14 Jan"
    // Let's use a safer comparison by parsing the date string from the data

    monthData.forEach(day => {
        // Detect missed swipe: marked Present but no hours logged
        // ALSO: Exclude today (as the day is still in progress)

        const isToday = day.date.includes(todayStr) || (parseDateFromString(day.date)?.toDateString() === now.toDateString());

        if (!isToday && day.status === 'Present' && (!day.hours || day.hours < 60000)) { // Less than 1 minute
            missedSwipes.push({
                date: day.date,
                status: 'Missed Swipe',
                hours: day.hours || 0,
                issue: 'No punch data recorded'
            });
        }
    });

    return missedSwipes;
}

/**
 * Detect incomplete hours (days with less than 8 hours)
 */
function detectIncompleteHours() {
    if (!appData || !appData.currentMonthData) return [];

    const incompleteHours = [];
    const monthData = appData.currentMonthData || [];
    const targetMillis = 8 * 3600000; // 8 hours in milliseconds

    monthData.forEach(day => {
        if (day.status === 'Present' && day.hours > 0 && day.hours < targetMillis) {
            const hoursWorked = day.hours / 3600000; // Convert to hours
            const shortage = (targetMillis - day.hours) / 3600000;

            incompleteHours.push({
                date: day.date,
                hoursWorked: day.hours,
                hoursWorkedFormatted: formatMillisToHHMMSS(day.hours),
                shortage: shortage,
                shortageFormatted: formatMillisToHHMMSS(targetMillis - day.hours),
                percentage: Math.floor((day.hours / targetMillis) * 100)
            });
        }
    });

    return incompleteHours;
}

/**
 * Render missed swipes section in UI
 */
function renderMissedSwipes() {
    try {
        const missedSwipes = detectMissedSwipes();
        const container = document.getElementById('missed-swipes-list');
        const countEl = document.getElementById('missed-swipes-count');

        if (!container) return;

        if (countEl) {
            countEl.textContent = missedSwipes.length;
        }

        container.innerHTML = '';

        if (missedSwipes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--label-color); font-size: 12px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✅</div>
                    <div>No missed swipes detected!</div>
                </div>
            `;
        } else {
            missedSwipes.forEach(swipe => {
                container.innerHTML += `
                    <div class="missed-swipe-item" style="padding: 12px; margin-bottom: 8px; background: rgba(255, 59, 48, 0.1); border-left: 3px solid var(--error-color); border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; font-size: 12px; color: var(--text-color);">🗓️ ${swipe.date}</div>
                                <div style="font-size: 10px; color: var(--label-color); margin-top: 4px;">${swipe.issue}</div>
                            </div>
                            <div style="background: var(--error-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: 600;">
                                MISSED
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error rendering missed swipes:', error);
    }
}

/**
 * Render incomplete hours section in UI
 */
function renderIncompleteHours() {
    try {
        const incompleteHours = detectIncompleteHours();
        const container = document.getElementById('incomplete-hours-list');
        const countEl = document.getElementById('incomplete-hours-count');

        if (!container) return;

        if (countEl) {
            countEl.textContent = incompleteHours.length;
        }

        container.innerHTML = '';

        if (incompleteHours.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--label-color); font-size: 12px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🎯</div>
                    <div>All working days met the 8-hour target!</div>
                </div>
            `;
        } else {
            incompleteHours.forEach(day => {
                container.innerHTML += `
                    <div class="incomplete-hours-item" style="padding: 12px; margin-bottom: 8px; background: rgba(255, 149, 0, 0.1); border-left: 3px solid var(--warning-color); border-radius: 6px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div>
                                <div style="font-weight: 600; font-size: 12px; color: var(--text-color);">🗓️ ${day.date}</div>
                                <div style="font-size: 10px; color: var(--label-color); margin-top: 4px;">Worked: ${day.hoursWorkedFormatted}</div>
                            </div>
                            <div style="background: var(--warning-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: 600;">
                                ${day.percentage}%
                            </div>
                        </div>
                        <div class="progress-bar-container" style="height: 6px; background: rgba(0,0,0,0.2); border-radius: 3px; overflow: hidden;">
                            <div class="progress-bar-fill" style="width: ${day.percentage}%; height: 100%; background: var(--warning-color); border-radius: 3px;"></div>
                        </div>
                        <div style="font-size: 9px; color: var(--error-color); margin-top: 6px;">⚠️ Short by ${day.shortageFormatted}</div>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error rendering incomplete hours:', error);
    }
}

/**
 * Export comprehensive attendance data to Excel (CSV format)
 * Includes full dates, hours, status, missed swipes, and more
 */
function exportToExcel() {
    try {
        if (!appData) {
            alert('No attendance data available to export');
            return;
        }

        const monthData = appData.currentMonthData || [];
        const currentMonth = appData.currentMonth || 'Unknown';
        const missedSwipes = detectMissedSwipes();
        const incompleteHours = detectIncompleteHours();

        // Create CSV content with comprehensive data
        let csv = 'KEKA ATTENDANCE REPORT\n';
        csv += `Month: ${currentMonth}\n`;
        csv += `Export Date: ${new Date().toLocaleString()}\n`;
        csv += '\n';

        // Summary Section
        const totalWorkingDays = monthData.filter(d => d.status === 'Present' && d.hours > 0).length;
        const totalHours = monthData.reduce((sum, d) => sum + (d.hours || 0), 0);
        const avgHours = totalWorkingDays > 0 ? totalHours / totalWorkingDays : 0;
        const lateCount = monthData.filter(d => d.isLate).length;

        csv += 'MONTHLY SUMMARY\n';
        csv += `Total Working Days,${totalWorkingDays}\n`;
        csv += `Total Hours Worked,${formatMillisToHHMMSS(totalHours)}\n`;
        csv += `Average Hours/Day,${formatMillisToHHMMSS(avgHours)}\n`;
        csv += `Late Arrivals,${lateCount}\n`;
        csv += `Missed Swipes,${missedSwipes.length}\n`;
        csv += `Incomplete Days (<8hr),${incompleteHours.length}\n`;
        csv += '\n';

        // Detailed Daily Data
        csv += 'DAILY ATTENDANCE DETAILS\n';
        csv += 'Date,Day,Status,Check In,Check Out,Hours Worked,Break Time,Remarks\n';

        monthData.forEach(day => {
            const date = day.date || 'N/A';
            const dayOfWeek = getDayOfWeek(day.date);
            let status = day.status || 'N/A';
            const checkIn = day.checkIn || '--:--';
            const checkOut = day.checkOut || '--:--';
            const hoursWorked = day.hours ? formatMillisToHHMMSS(day.hours) : '00:00:00';
            const breakTime = day.breakTime ? formatMillisToHHMMSS(day.breakTime) : '00:00:00';


            // Build remarks
            let remarks = [];

            // Check for missed swipe
            const isMissedSwipe = missedSwipes.some(ms => ms.date === date);
            if (isMissedSwipe) {
                status = 'Missed Swipe';
                remarks.push('NO PUNCH DATA');
            }

            // Check for late arrival
            if (day.isLate) {
                remarks.push('LATE ARRIVAL');
            }

            // Check for incomplete hours
            const incompleteDay = incompleteHours.find(ih => ih.date === date);
            if (incompleteDay) {
                remarks.push(`INCOMPLETE (Short by ${incompleteDay.shortageFormatted})`);
            }

            // Check for leave types
            if (day.leaveType) {
                remarks.push(day.leaveType.toUpperCase());
            }

            const remarksText = remarks.length > 0 ? remarks.join(' | ') : '';

            csv += `"${date}","${dayOfWeek}","${status}","${checkIn}","${checkOut}","${hoursWorked}","${breakTime}","${remarksText}"\n`;
        });

        // Add Missed Swipes Details
        if (missedSwipes.length > 0) {
            csv += '\n';
            csv += 'MISSED SWIPES DETAILS\n';
            csv += 'Date,Issue\n';
            missedSwipes.forEach(ms => {
                csv += `"${ms.date}","${ms.issue}"\n`;
            });
        }

        // Add Incomplete Hours Details
        if (incompleteHours.length > 0) {
            csv += '\n';
            csv += 'INCOMPLETE HOURS DETAILS\n';
            csv += 'Date,Hours Worked,Shortage,Completion %\n';
            incompleteHours.forEach(ih => {
                csv += `"${ih.date}","${ih.hoursWorkedFormatted}","${ih.shortageFormatted}","${ih.percentage}%"\n`;
            });
        }

        // Download CSV file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `Keka_Attendance_${currentMonth}_${new Date().toISOString().split('T')[0]}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Excel export completed successfully');
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export data. Please try again.');
    }
}

/**
 * Helper function to get day of week from date string
 */
function getDayOfWeek(dateStr) {
    if (!dateStr) return 'N/A';

    try {
        const date = parseDateFromString(dateStr);
        if (!date) return 'N/A';

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    } catch (error) {
        return 'N/A';
    }
}
