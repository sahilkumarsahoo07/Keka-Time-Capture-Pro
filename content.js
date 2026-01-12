// // content.js

// (async function() {
//     try {
//         const data = await parseAndCalculate();
//         chrome.runtime.sendMessage(data);
//     } catch (e) {
//         chrome.runtime.sendMessage({ error: e.message });
//     }
// })();

// async function parseAndCalculate() {
//     const settings = await chrome.storage.sync.get({
//         shiftHours: '08:00:00',
//         breakHours: '01:00:00',
//         lateGracePeriod: 5,
//     });

//     const requiredBreakMillis = timeStringToMillis(settings.breakHours);
//     const gracePeriodSeconds = settings.lateGracePeriod * 60;

//     // --- SCRAPE TODAY'S DETAILED DATA ---
//     const todayLog = document.querySelector('div.attendance-logs-row');
//     if (!todayLog) throw new Error("Could not find today's attendance log.");

//     const { totalWorkMillis, breakUsedMillis, breakListMillis, isCurrentlyWorking, lastPunchTime } = await getTodaysDetailedData(todayLog);

//     // --- SCRAPE THIS MONTH'S LATE COUNT ---
//     let totalLateCount = 0;
//     const allRows = document.querySelectorAll('employee-attendance-list-view .card-body > .ng-star-inserted > div');

//     allRows.forEach(row => {
//         const arrivalSpan = row.querySelector('.w-50.ng-star-inserted span.ml-40');
//         if (arrivalSpan && isLateAfterGrace(arrivalSpan.textContent, gracePeriodSeconds)) {
//             totalLateCount++;
//         }
//     });

//     // --- SCRAPE WEEKLY DATA (LAST 7 DAYS) ---
//     const weeklyData = [];
//     const visibleRows = Array.from(allRows).slice(0, 7); // Get the top 7 rows shown on the page

//     visibleRows.forEach(row => {
//         const dateEl = row.querySelector('.w-250 > span.mr-8');
//         if (!dateEl) return;

//         // Check if it's a weekly off/holiday row
//         if (row.querySelector('.bg-accent-brown-light')) {
//             weeklyData.push({
//                 date: dateEl.textContent.trim(),
//                 hours: 0,
//                 isLate: false,
//                 isOff: true,
//             });
//             return; // Move to the next row
//         }

//         // It's a regular work day, so parse its data
//         const effectiveHoursEl = row.querySelector('.pie-percent + div > span');
//         const arrivalStatusEl = row.querySelector('.w-50.ng-star-inserted span.ml-40');

//         if (effectiveHoursEl) {
//             weeklyData.push({
//                 date: dateEl.textContent.trim(),
//                 hours: parseEffectiveHours(effectiveHoursEl.textContent),
//                 isLate: (arrivalStatusEl && isLateAfterGrace(arrivalStatusEl.textContent, gracePeriodSeconds)),
//                 isOff: false
//             });
//         }
//     });

//     const monthButton = document.querySelector('.btn-group[aria-label="months"] button.active span');
//     let currentMonth = new Date().toLocaleString('default', { month: 'long' });
//     if (monthButton && isNaN(parseInt(monthButton.textContent))) {
//         let monthText = monthButton.textContent.trim();
//         currentMonth = monthText.charAt(0).toUpperCase() + monthText.slice(1).toLowerCase();
//     }

//     return {
//         requiredBreakMillis,
//         totalWorkMillis,
//         breakUsedMillis,
//         breakListMillis,
//         isCurrentlyWorking,
//         lastPunchTime,
//         lateCount: totalLateCount,
//         currentMonth,
//         weeklyData,
//     };
// }

// // --- HELPER FUNCTIONS ---

// async function getTodaysDetailedData(todayLog) {
//     const toggle = todayLog.querySelector('[dropdowntoggle]');
//     if (!toggle) return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };

//     const mustBeOpened = !toggle.parentElement.classList.contains('open');
//     if (mustBeOpened) toggle.click();

//     const timeEntriesContainer = await waitForElement(todayLog, '.dropdown-menu-logs', 2000);
//     if (!timeEntriesContainer) {
//         if (mustBeOpened) toggle.click();
//         // If details don't open, we can't get punch times, so assume not working
//         return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };
//     }

//     const timeSpans = timeEntriesContainer.querySelectorAll('div.d-flex.mt-10 span.ng-star-inserted');
//     const times = Array.from(timeSpans)
//         .map(span => span.textContent.trim())
//         .filter(text => /\d{1,2}:\d{2}:\d{2}\s(AM|PM)/.test(text))
//         .map(parseTime)
//         .filter(Boolean);

//     if (mustBeOpened) toggle.click();
//     if (times.length === 0) return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };

//     let totalWorkMillis = 0;
//     for (let i = 0; i < times.length; i += 2) {
//         if (times[i + 1]) totalWorkMillis += (times[i + 1] - times[i]);
//     }

//     const isCurrentlyWorking = times.length % 2 === 1;
//     const lastPunchTime = isCurrentlyWorking ? times[times.length - 1].getTime() : null;

//     let breakUsedMillis = 0;
//     const breakListMillis = [];
//     for (let i = 1; i < times.length - 1; i += 2) {
//         const breakDuration = times[i + 1] - times[i];
//         breakUsedMillis += breakDuration;
//         breakListMillis.push(breakDuration);
//     }

//     return { totalWorkMillis, breakUsedMillis, breakListMillis, isCurrentlyWorking, lastPunchTime };
// }

// function isLateAfterGrace(text, gracePeriodSeconds) {
//     if (!text || !text.includes('late')) return false;
//     const timeMatch = text.match(/(\d+:)?\d+:\d+/);
//     if (!timeMatch) return false;

//     const parts = timeMatch[0].split(':').map(Number);
//     let lateSeconds = 0;
//     if (parts.length === 3) lateSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
//     else if (parts.length === 2) lateSeconds = parts[0] * 60 + parts[1];

//     return lateSeconds > gracePeriodSeconds;
// }

// function parseEffectiveHours(hourStr) {
//     let totalMillis = 0;
//     const hourMatch = hourStr.match(/(\d+)h/);
//     const minMatch = hourStr.match(/(\d+)m/);
//     if (hourMatch) totalMillis += parseInt(hourMatch[1], 10) * 3600 * 1000;
//     if (minMatch) totalMillis += parseInt(minMatch[1], 10) * 60 * 1000;
//     return totalMillis;
// }

// function parseTime(timeStr) {
//     const parts = timeStr.split(' ');
//     const [hours, minutes, seconds] = parts[0].split(':').map(Number);
//     const modifier = parts[1];
//     let h24 = hours;

//     if (modifier?.toUpperCase() === 'PM' && h24 < 12) h24 += 12;
//     if (modifier?.toUpperCase() === 'AM' && h24 === 12) h24 = 0;

//     const date = new Date();
//     date.setHours(h24, minutes, seconds, 0);
//     return date;
// }

// function timeStringToMillis(timeStr) {
//     if (!timeStr || !/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return 0;
//     const [h, m, s] = timeStr.split(':').map(Number);
//     return (h * 3600 + m * 60 + s) * 1000;
// }

// function waitForElement(parent, selector, timeout = 2000) {
//     return new Promise(resolve => {
//         const timer = setInterval(() => {
//             const element = parent.querySelector(selector);
//             if (element) { clearInterval(timer); resolve(element); }
//         }, 100);
//         setTimeout(() => { clearInterval(timer); resolve(null); }, timeout);
//     });
// }

// content.js


(async function () {
    try {
        const data = await parseAndCalculate();
        if (data && typeof data === 'object') {
            chrome.runtime.sendMessage(data, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                }
            });
        } else {
            console.error("Invalid data returned from parseAndCalculate:", data);
            chrome.runtime.sendMessage({ error: "Invalid data format" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending error message:", chrome.runtime.lastError.message);
                }
            });
        }
    } catch (e) {
        console.error("Error in content script:", e);
        chrome.runtime.sendMessage({ error: e.message || "Unknown error occurred" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending error message:", chrome.runtime.lastError.message);
            }
        });
    }
})();


function getMonthNameFromAbbr(abbr) {
    // Create a temporary date to reliably get the full month name
    const date = new Date(`${abbr} 1, 2000`);
    return date.toLocaleString('default', { month: 'long' });
}

async function parseAndCalculate() {
    let settings;
    try {
        settings = await chrome.storage.sync.get({
            shiftHours: '08:00:00',
            breakHours: '01:00:00',
            lateGracePeriod: 5,
        });
    } catch (error) {
        console.error("Error getting settings:", error);
        settings = {
            shiftHours: '08:00:00',
            breakHours: '01:00:00',
            lateGracePeriod: 5,
        };
    }

    // Validate settings
    if (!settings.shiftHours || typeof settings.shiftHours !== 'string') {
        settings.shiftHours = '08:00:00';
    }
    if (!settings.breakHours || typeof settings.breakHours !== 'string') {
        settings.breakHours = '01:00:00';
    }
    if (typeof settings.lateGracePeriod !== 'number' || isNaN(settings.lateGracePeriod) || settings.lateGracePeriod < 0) {
        settings.lateGracePeriod = 5;
    }

    const requiredBreakMillis = timeStringToMillis(settings.breakHours);
    const gracePeriodSeconds = settings.lateGracePeriod * 60;

    // --- 1. Determine the current month from the UI ---
    const monthButton = document.querySelector('.btn-group[aria-label="months"] button.active span');
    // Default to the actual current month if no specific month is selected
    let currentDisplayMonth = new Date().toLocaleString('default', { month: 'long' });

    if (monthButton) {
        const monthText = monthButton.textContent.trim();
        // Check if a month like 'SEP', 'AUG' is selected, not '30 DAYS'
        if (monthText !== "30 DAYS" && isNaN(parseInt(monthText))) {
            currentDisplayMonth = getMonthNameFromAbbr(monthText);
        }
    }

    // --- 2. Scrape ALL rows, not just the first 7 ---
    const allRows = document.querySelectorAll('employee-attendance-list-view .card-body > .ng-star-inserted > div');
    if (!allRows || allRows.length === 0) {
        throw new Error("No attendance data found. Open Keka and click the Attendance tab to see the time.");
    }

    const weeklyData = []; // This will still hold the first 7 days for the UI list
    const currentMonthData = []; // All days in current month
    let lateCountForCurrentMonth = 0;

    // --- 3. Loop through all rows and filter by month before counting ---
    for (let index = 0; index < allRows.length; index++) {
        const row = allRows[index];
        const dateEl = row.querySelector('.w-250 > span.mr-8');
        if (!dateEl) continue;
        const dateText = dateEl.textContent.trim();

        const rowMonthMatch = dateText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/);
        if (!rowMonthMatch) continue;

        const rowMonthName = getMonthNameFromAbbr(rowMonthMatch[0]);

        let status = "Present";
        let hours = 0;
        let isLate = false;
        let leaveType = '';
        let checkIn = null;
        let checkOut = null;
        let breakTime = 0;

        // --- CHECK FOR SATURDAY/SUNDAY FIRST ---
        const isWeekend = /(Sat|Sun|Saturday|Sunday)/i.test(dateText);

        // --- UPDATED STATUS DETECTION LOGIC ---
        if (row.querySelector('.bg-accent-green-light') || row.textContent.includes('Holiday')) {
            status = "Holiday";
        }
        else if (row.querySelector('.bg-accent-brown-light') || isWeekend) {
            status = "Weekly Off";
        }
        // Check for Leave (Purple background)
        else if (row.querySelector('.bg-accent-violet-light') || row.querySelector('.badge.bg-accent-violet')) {
            status = "Leave";

            const leaveTextEl = row.querySelector('.text-center .text-small');
            if (leaveTextEl) {
                leaveType = leaveTextEl.textContent.trim();
            } else {
                // Fallback: look for the badge text if detail text isn't found
                const badgeEl = row.querySelector('.badge.bg-accent-violet');
                leaveType = badgeEl ? badgeEl.textContent.trim() : "Leave";
            }
        }
        else {
            // Normal Working Day - Extract punch times
            const effectiveHoursEl = row.querySelector('.pie-percent + div > span');
            const arrivalStatusEl = row.querySelector('.w-50.ng-star-inserted span.ml-40');
            if (effectiveHoursEl) {
                hours = parseEffectiveHours(effectiveHoursEl.textContent);
                isLate = arrivalStatusEl ? isLateAfterGrace(arrivalStatusEl.textContent, gracePeriodSeconds) : false;
            }

            // Extract punch times from dropdown details
            const punchData = await extractPunchTimes(row);
            checkIn = punchData.checkIn;
            checkOut = punchData.checkOut;
            breakTime = punchData.breakTime;
        }
        // --------------------------------------

        // Collect all current month data
        if (rowMonthName === currentDisplayMonth) {
            currentMonthData.push({
                date: dateText,
                hours,
                isLate,
                status,
                leaveType,
                checkIn,
                checkOut,
                breakTime
            });
            if (isLate) {
                lateCountForCurrentMonth++;
            }
        }

        // Collect first 14 days for weekly view (This Week + Last Week)
        if (index < 14) {
            const isToday = (index === 0); // First row is always today
            weeklyData.push({
                date: dateText,
                hours,
                isLate,
                status,
                leaveType,
                isToday,
                checkIn,
                checkOut,
                breakTime
            });
        }
    }


    // --- LIVE TODAY DATA (No changes needed here) ---
    let liveData = { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };
    const todayRow = allRows[0];
    if (todayRow && todayRow.classList.contains('attendance-logs-row')) {
        liveData = await getTodaysDetailedData(todayRow);
    }


    return {
        requiredBreakMillis,
        totalWorkMillis: liveData.totalWorkMillis,
        breakUsedMillis: liveData.breakUsedMillis,
        breakListMillis: liveData.breakListMillis,
        isCurrentlyWorking: liveData.isCurrentlyWorking,
        lastPunchTime: liveData.lastPunchTime,
        lateCount: lateCountForCurrentMonth, // Return the correctly filtered count
        currentMonth: currentDisplayMonth,
        weeklyData, // Return the 7-day data for the list
        currentMonthData, // Return all current month data
    };
}

// Helper function to extract punch times from a row
async function extractPunchTimes(row) {
    try {
        const toggle = row.querySelector('[dropdowntoggle]');
        if (!toggle) {
            return { checkIn: null, checkOut: null, breakTime: 0 };
        }

        const mustBeOpened = !toggle.parentElement.classList.contains('open');
        if (mustBeOpened) {
            toggle.click();
        }

        const timeEntriesContainer = await waitForElement(row, '.dropdown-menu-logs', 1500);
        if (!timeEntriesContainer) {
            if (mustBeOpened) toggle.click();
            return { checkIn: null, checkOut: null, breakTime: 0 };
        }

        // Extract all time entries
        const timeSpans = timeEntriesContainer.querySelectorAll('div.d-flex.mt-10 span.ng-star-inserted');
        const times = [];

        timeSpans.forEach(span => {
            const text = span.textContent.trim();
            // Match both actual times and "MISSING"
            if (/\d{1,2}:\d{2}:\d{2}\s(AM|PM)/.test(text)) {
                times.push(text);
            } else if (text === 'MISSING') {
                times.push('MISSING');
            }
        });

        if (mustBeOpened) {
            toggle.click();
        }

        // Determine check-in, check-out, and calculate break time
        let checkIn = null;
        let checkOut = null;
        let breakTime = 0;

        if (times.length > 0) {
            // First punch is check-in
            checkIn = times[0] !== 'MISSING' ? times[0] : '--:--';

            // If there's an even number of punches, last one is check-out
            // If odd number, still missing checkout
            if (times.length % 2 === 0) {
                checkOut = times[times.length - 1] !== 'MISSING' ? times[times.length - 1] : '--:--';
            } else {
                checkOut = 'MISSING';
            }

            // Calculate break time (time between clock-out and clock-in pairs)
            for (let i = 1; i < times.length - 1; i += 2) {
                if (times[i] !== 'MISSING' && times[i + 1] !== 'MISSING') {
                    const outTime = parseTime(times[i]);
                    const inTime = parseTime(times[i + 1]);
                    if (outTime && inTime) {
                        const breakDuration = inTime.getTime() - outTime.getTime();
                        if (breakDuration > 0) {
                            breakTime += breakDuration;
                        }
                    }
                }
            }
        }

        return { checkIn, checkOut, breakTime };
    } catch (error) {
        console.error("Error extracting punch times:", error);
        return { checkIn: null, checkOut: null, breakTime: 0 };
    }
}

async function getTodaysDetailedData(todayLog) {
    try {
        if (!todayLog || !todayLog.querySelector) {
            return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };
        }

        const toggle = todayLog.querySelector('[dropdowntoggle]');
        const hasMissingSwipe = todayLog.textContent && todayLog.textContent.includes('MISSING');

        if (!toggle) {
            return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: hasMissingSwipe, lastPunchTime: hasMissingSwipe ? new Date().getTime() : null };
        }

        const mustBeOpened = toggle.parentElement && !toggle.parentElement.classList.contains('open');

        try {
            if (mustBeOpened && typeof toggle.click === 'function') {
                toggle.click();
            }
        } catch (clickError) {
        }

        const timeEntriesContainer = await waitForElement(todayLog, '.dropdown-menu-logs', 2000);
        if (!timeEntriesContainer) {
            try {
                if (mustBeOpened && typeof toggle.click === 'function') {
                    toggle.click();
                }
            } catch (clickError) {
                console.error("Error closing toggle:", clickError);
            }
            return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: hasMissingSwipe, lastPunchTime: hasMissingSwipe ? new Date().getTime() : null };
        }

        const timeSpans = timeEntriesContainer.querySelectorAll('div.d-flex.mt-10 span.ng-star-inserted');
        const times = Array.from(timeSpans)
            .map(span => {
                try {
                    return span && span.textContent ? span.textContent.trim() : '';
                } catch (e) {
                    return '';
                }
            })
            .filter(text => text && /\d{1,2}:\d{2}:\d{2}/.test(text))
            .map(parseTime)
            .filter(time => time !== null && !isNaN(time.getTime()));

        try {
            if (mustBeOpened && typeof toggle.click === 'function') {
                toggle.click();
            }
        } catch (clickError) {
        }

        const isCurrentlyWorking = times.length % 2 === 1;
        let totalWorkMillis = 0;
        for (let i = 0; i < times.length; i += 2) {
            if (times[i] && times[i + 1]) {
                const duration = times[i + 1].getTime() - times[i].getTime();
                if (duration > 0 && !isNaN(duration)) {
                    totalWorkMillis += duration;
                }
            }
        }

        const lastPunchTime = times.length > 0 && times[times.length - 1] ? times[times.length - 1].getTime() : null;
        let breakUsedMillis = 0;
        const breakListMillis = [];
        for (let i = 1; i < times.length - 1; i += 2) {
            if (times[i] && times[i + 1]) {
                const breakDuration = times[i + 1].getTime() - times[i].getTime();
                if (breakDuration > 0 && !isNaN(breakDuration)) {
                    breakUsedMillis += breakDuration;
                    breakListMillis.push(breakDuration);
                }
            }
        }

        return { totalWorkMillis, breakUsedMillis, breakListMillis, isCurrentlyWorking, lastPunchTime };
    } catch (error) {
        console.error("Error in getTodaysDetailedData:", error);
        return { totalWorkMillis: 0, breakUsedMillis: 0, breakListMillis: [], isCurrentlyWorking: false, lastPunchTime: null };
    }
}

function isLateAfterGrace(text, gracePeriodSeconds) {
    try {
        if (!text || typeof text !== 'string' || !text.includes('late')) return false;
        if (typeof gracePeriodSeconds !== 'number' || isNaN(gracePeriodSeconds) || gracePeriodSeconds < 0) {
            return false;
        }

        const timeMatch = text.match(/(\d+:)?\d+:\d+/);
        if (!timeMatch || !timeMatch[0]) return false;

        const parts = timeMatch[0].split(':').map(part => {
            const num = parseInt(part, 10);
            return isNaN(num) ? 0 : num;
        });

        let lateSeconds = 0;
        if (parts.length === 3) {
            lateSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            lateSeconds = parts[0] * 60 + parts[1];
        } else {
            return false;
        }

        return lateSeconds > gracePeriodSeconds;
    } catch (error) {
        console.error("Error in isLateAfterGrace:", error);
        return false;
    }
}

function parseEffectiveHours(hourStr) {
    try {
        if (!hourStr || typeof hourStr !== 'string') return 0;

        let totalMillis = 0;
        const hourMatch = hourStr.match(/(\d+)h/);
        const minMatch = hourStr.match(/(\d+)m/);

        if (hourMatch && hourMatch[1]) {
            const hours = parseInt(hourMatch[1], 10);
            if (!isNaN(hours) && hours >= 0) {
                totalMillis += hours * 3600000;
            }
        }

        if (minMatch && minMatch[1]) {
            const minutes = parseInt(minMatch[1], 10);
            if (!isNaN(minutes) && minutes >= 0 && minutes < 60) {
                totalMillis += minutes * 60000;
            }
        }

        return totalMillis;
    } catch (error) {
        return 0;
    }
}

function parseTime(timeStr) {
    try {
        if (!timeStr || typeof timeStr !== 'string') {
            return null;
        }

        // This function now handles both 12-hour (AM/PM) and 24-hour formats
        const parts = timeStr.trim().split(' ');
        const timePart = parts[0];

        if (!timePart || !timePart.includes(':')) {
            return null;
        }

        const timeComponents = timePart.split(':');
        if (timeComponents.length < 2) {
            return null;
        }

        const hours = parseInt(timeComponents[0], 10);
        const minutes = parseInt(timeComponents[1], 10);
        const seconds = timeComponents[2] ? parseInt(timeComponents[2], 10) : 0;

        // Validate parsed values
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) ||
            hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
            return null;
        }

        const modifier = parts.length > 1 ? parts[1] : null;

        let h24 = hours;
        if (modifier) { // 12-hour format with AM/PM
            const modifierUpper = modifier.toUpperCase();
            if (modifierUpper === 'PM' && h24 < 12) h24 += 12;
            if (modifierUpper === 'AM' && h24 === 12) h24 = 0; // Midnight case
        }
        // No change needed for 24-hour format

        const date = new Date();
        date.setHours(h24, minutes, seconds, 0);

        // Validate the resulting date
        if (isNaN(date.getTime())) {
            return null;
        }

        return date;
    } catch (error) {
        console.error("Error parsing time:", timeStr, error);
        return null;
    }
}

function timeStringToMillis(timeStr) {
    try {
        if (!timeStr || typeof timeStr !== 'string') return 0;

        // Support both HH:MM:SS and HH:MM formats
        if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return 0;

        const parts = timeStr.split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const s = parts[2] ? parseInt(parts[2], 10) : 0;

        // Validate values
        if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || m < 0 || s < 0 || m > 59 || s > 59) {
            return 0;
        }

        return (h * 3600 + m * 60 + s) * 1000;
    } catch (error) {
        return 0;
    }
}

function waitForElement(parent, selector, timeout = 2000) {
    return new Promise(resolve => {
        if (!parent || !selector) {
            resolve(null);
            return;
        }

        let timer = null;
        let timeoutId = null;

        const cleanup = () => {
            if (timer) clearInterval(timer);
            if (timeoutId) clearTimeout(timeoutId);
        };

        timer = setInterval(() => {
            try {
                const element = parent.querySelector(selector);
                if (element) {
                    cleanup();
                    resolve(element);
                }
            } catch (error) {
                console.error("Error in waitForElement interval:", error);
                cleanup();
                resolve(null);
            }
        }, 100);

        timeoutId = setTimeout(() => {
            cleanup();
            resolve(null);
        }, timeout);
    });
}