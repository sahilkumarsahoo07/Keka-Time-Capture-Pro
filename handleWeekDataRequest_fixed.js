// Updated function to correctly parse Last Week data
async function handleWeekDataRequest(weekOffset) {
    try {
        console.log('📅 Fetching week data for offset:', weekOffset);

        if (weekOffset === 0) {
            return await parseAndCalculate();
        }

        // For Last Week: We need to find the correct 7-day range
        // Current week starts from the most recent Monday
        // Last week is the 7 days before that

        const settings = await chrome.storage.sync.get({
            shiftHours: '08:00:00',
            breakHours: '01:00:00',
            lateGracePeriod: 5,
        });

        const requiredBreakMillis = timeStringToMillis(settings.breakHours);
        const gracePeriodSeconds = settings.lateGracePeriod * 60;

        const allRows = document.querySelectorAll('employee-attendance-list-view .card-body > .ng-star-inserted > div');
        console.log(`📊 Total rows found: ${allRows.length}`);

        if (!allRows || allRows.length < 14) {
            throw new Error("Not enough data for last week");
        }

        // Find where "This Week" ends by looking for the first Monday going backwards
        // Then take the next 7 rows for "Last Week"
        let thisWeekEnd = -1;
        for (let i = 0; i < allRows.length; i++) {
            const dateEl = allRows[i].querySelector('.w-250 > span.mr-8');
            if (dateEl) {
                const dateText = dateEl.textContent.trim();
                // Check if it's Monday and not the first row
                if (i > 0 && dateText.includes('Mon,')) {
                    thisWeekEnd = i;
                    break;
                }
            }
        }

        console.log(`📍 This week ends at row: ${thisWeekEnd}`);

        // If we found where this week ends, get the next 7 rows for last week
        const startRow = thisWeekEnd > 0 ? thisWeekEnd : 7;
        const endRow = startRow + 7;

        console.log(`📅 Parsing Last Week from rows ${startRow} to ${endRow - 1}`);

        const lastWeekRows = Array.from(allRows).slice(startRow, endRow);
        const weeklyData = [];

        lastWeekRows.forEach((row, index) => {
            const dateEl = row.querySelector('.w-250 > span.mr-8');
            if (!dateEl) return;
            const dateText = dateEl.textContent.trim();

            let status = "Present";
            let hours = 0;
            let isLate = false;
            let leaveType = '';

            const isWeekend = /(Sat|Sun)/i.test(dateText);

            if (row.querySelector('.bg-accent-green-light') || row.textContent.includes('Holiday')) {
                status = "Holiday";
            } else if (row.querySelector('.bg-accent-brown-light') || isWeekend) {
                status = "Weekly Off";
            } else if (row.querySelector('.bg-accent-violet-light')) {
                status = "Leave";
                const leaveTextEl = row.querySelector('.text-center .text-small');
                leaveType = leaveTextEl ? leaveTextEl.textContent.trim() : "Leave";
            } else {
                const effectiveHoursEl = row.querySelector('.pie-percent + div > span');
                const arrivalStatusEl = row.querySelector('.w-50.ng-star-inserted span.ml-40');
                if (effectiveHoursEl) {
                    const hoursText = effectiveHoursEl.textContent.trim();
                    hours = parseEffectiveHours(hoursText);
                    isLate = arrivalStatusEl ? isLateAfterGrace(arrivalStatusEl.textContent, gracePeriodSeconds) : false;
                    console.log(`  ${dateText}: ${hoursText} -> ${hours}ms, Late: ${isLate}`);
                }
            }

            weeklyData.push({ date: dateText, hours, isLate, status, leaveType });
        });

        console.log('✅ Last week data parsed:', weeklyData);

        return {
            requiredBreakMillis,
            totalWorkMillis: 0,
            breakUsedMillis: 0,
            breakListMillis: [],
            isCurrentlyWorking: false,
            lastPunchTime: null,
            lateCount: weeklyData.filter(d => d.isLate).length,
            currentMonth: 'November',
            weeklyData: weeklyData,
            currentMonthData: weeklyData
        };

    } catch (error) {
        console.error("❌ Error fetching last week:", error);
        throw error;
    }
}
