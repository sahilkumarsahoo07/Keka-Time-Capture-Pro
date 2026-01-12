async function handleWeekDataRequest(weekOffset) {
    try {
        console.log('📅 Fetching week data for offset:', weekOffset);

        // --- 1. Calculate the Exact Date Range (Monday to Sunday) ---
        // offset 0 = This Week (Dec 8 - Dec 14)
        // offset 1 = Last Week (Dec 1 - Dec 7)
        const today = new Date();
        const currentDay = today.getDay(); // 1 = Monday

        // Find "This Week's" Monday
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - distanceToMonday);
        currentMonday.setHours(0, 0, 0, 0);

        // Shift back by weekOffset (e.g., 7 days for Last Week)
        const targetMonday = new Date(currentMonday);
        targetMonday.setDate(currentMonday.getDate() - (7 * weekOffset));

        const targetSunday = new Date(targetMonday);
        targetSunday.setDate(targetMonday.getDate() + 6);
        targetSunday.setHours(23, 59, 59, 999);

        console.log(`🎯 Target Range: ${targetMonday.toDateString()} to ${targetSunday.toDateString()}`);

        const settings = await chrome.storage.sync.get({
            shiftHours: '08:00:00',
            breakHours: '01:00:00',
            lateGracePeriod: 5,
        });

        const gracePeriodSeconds = settings.lateGracePeriod * 60;
        const requiredBreakMillis = timeStringToMillis(settings.breakHours);

        // --- 2. Scan ALL Rows ---
        const allRows = document.querySelectorAll('employee-attendance-list-view .card-body > .ng-star-inserted > div');
        const weeklyData = [];

        allRows.forEach((row) => {
            // 1. Get Date Text (e.g., "Fri, 05 Dec")
            const dateEl = row.querySelector('.mr-8');
            if (!dateEl) return; // Skip if no date found

            const dateText = dateEl.textContent.trim();
            const rowDate = parseRowDate(dateText);

            // 2. Check if row is in Target Range
            if (rowDate >= targetMonday && rowDate <= targetSunday) {

                let status = "Present";
                let hours = 0;
                let isLate = false;
                let leaveType = '';

                // --- 3. LOGIC TO DETERMINE STATUS AND HOURS ---

                // CASE A: Explicit Non-Working Days (Colors)
                const isLeave = row.querySelector('.bg-accent-violet-light') || row.querySelector('.badge.bg-accent-violet');
                const isHoliday = row.querySelector('.bg-accent-green-light') || row.querySelector('.badge.bg-accent-green') || row.textContent.includes('Holiday');
                const isWeeklyOff = row.querySelector('.bg-accent-brown-light') || row.querySelector('.badge.bg-accent-brown');

                if (isLeave) {
                    status = "Leave";
                    // Grab leave text (e.g., "Casual Leave" or "Unpaid Leave")
                    const textEl = row.querySelector('.text-center .text-small') || row.querySelector('.badge.bg-accent-violet');
                    leaveType = textEl ? textEl.textContent.trim() : "Leave";
                }
                else if (isHoliday) {
                    status = "Holiday";
                }
                else if (isWeeklyOff) {
                    status = "Weekly Off";
                }
                else {
                    // CASE B: Work Day (Includes Penalty days, Late days, etc.)
                    // Even if there is a 'Penalty' badge, we enter here because it's not Violet/Green/Brown.

                    // 1. Get Effective Hours (e.g., "5h 13m +")
                    const effectiveHoursEl = row.querySelector('.pie-percent + div > span');
                    if (effectiveHoursEl) {
                        hours = parseEffectiveHours(effectiveHoursEl.textContent);
                    }

                    // 2. Check Arrival (Late/On Time)
                    const arrivalStatusEl = row.querySelector('.w-50.ng-star-inserted span.ml-40');
                    const isLateText = arrivalStatusEl ? isLateAfterGrace(arrivalStatusEl.textContent, gracePeriodSeconds) : false;

                    // 3. Check for Penalty Badge (Red badge)
                    // We mark it as 'Late' for the chart, but we KEEP the hours calculated above.
                    const hasPenalty = !!row.querySelector('.badge.bg-danger-light');

                    if (hasPenalty || isLateText) {
                        isLate = true;
                    }
                }

                // Check if it is today
                const today = new Date();
                const isToday = rowDate.getDate() === today.getDate() &&
                    rowDate.getMonth() === today.getMonth() &&
                    rowDate.getFullYear() === today.getFullYear();

                weeklyData.push({ date: dateText, hours, isLate, status, leaveType, isToday });
            }
        });

        // --- 4. Sort Monday -> Sunday ---
        weeklyData.sort((a, b) => parseRowDate(a.date) - parseRowDate(b.date));

        console.log('✅ Final Weekly Data:', weeklyData);

        return {
            requiredBreakMillis,
            totalWorkMillis: 0,
            breakUsedMillis: 0,
            breakListMillis: [],
            isCurrentlyWorking: false,
            lastPunchTime: null,
            lateCount: weeklyData.filter(d => d.isLate).length,
            currentMonth: targetMonday.toLocaleString('default', { month: 'long' }),
            weeklyData: weeklyData,
            currentMonthData: weeklyData
        };

    } catch (error) {
        console.error("❌ Error fetching week data:", error);
        throw error;
    }
}

// Helper: Parse hours string "5h 13m +" -> milliseconds
function parseEffectiveHours(text) {
    if (!text) return 0;
    // Regex matches "5h" and "13m", ignoring "+" or other text
    const hourMatch = text.match(/(\d+)h/);
    const minMatch = text.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;

    return (hours * 3600000) + (minutes * 60000);
}

// Helper: Parse "Mon, 01 Dec" or "Fri, 29 Nov"
function parseRowDate(dateStr) {
    if (!dateStr) return new Date(0);

    // Split by comma to get "01 Dec" or "29 Nov"
    const parts = dateStr.split(',');
    const cleanDateStr = parts.length > 1 ? parts[1].trim() : dateStr; // "01 Dec" or "29 Nov"

    // Extract day, month abbreviation
    const dateParts = cleanDateStr.split(' '); // ["01", "Dec"] or ["29", "Nov"]
    if (dateParts.length < 2) return new Date(0);

    const day = parseInt(dateParts[0], 10);
    const monthAbbr = dateParts[1]; // "Dec" or "Nov"

    // Map month abbreviations to month numbers (0-indexed)
    const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const month = monthMap[monthAbbr];
    if (month === undefined) return new Date(0);

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Determine the correct year
    let year = currentYear;

    // If we're in early January and seeing December dates, use previous year
    if (currentMonth === 0 && month === 11) {
        year = currentYear - 1;
    }
    // If we're in December and seeing January dates, use next year
    else if (currentMonth === 11 && month === 0) {
        year = currentYear + 1;
    }
    // If the month is more than 6 months in the future, it's probably from last year
    else if (month > currentMonth + 6) {
        year = currentYear - 1;
    }

    const date = new Date(year, month, day);
    return date;
}