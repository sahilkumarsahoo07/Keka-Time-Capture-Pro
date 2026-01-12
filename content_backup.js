// Simplified version - parse Last Week from existing page data
async function handleWeekDataRequest(weekOffset) {
    try {
        console.log('ðŸ“… Fetching week data for offset:', weekOffset);

        if (weekOffset === 0) {
            return await parseAndCalculate();
        }

        // For Last Week, parse rows 8-14 from attendance logs
        const settings = await chrome.storage.sync.get({
            shiftHours: '08:00:00',
            breakHours: '01:00:00',
            lateGracePeriod: 5,
        });

        const requiredBreakMillis = timeStringToMillis(settings.breakHours);
        const gracePeriodSeconds = settings.lateGracePeriod * 60;

        const allRows = document.querySelectorAll('employee-attendance-list-view .card-body > .ng-star-inserted > div');
        if (!allRows || allRows.length < 14) {
            throw new Error("Not enough data for last week");
        }

        const lastWeekRows = Array.from(allRows).slice(7, 14);
        const weeklyData = [];

        lastWeekRows.forEach((row) => {
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
                    hours = parseEffectiveHours(effectiveHoursEl.textContent);
                    isLate = arrivalStatusEl ? isLateAfterGrace(arrivalStatusEl.textContent, gracePeriodSeconds) : false;
                }
            }

            weeklyData.push({ date: dateText, hours, isLate, status, leaveType });
        });

        console.log('âœ… Last week data:', weeklyData);

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
        console.error("Error fetching last week:", error);
        throw error;
    }
}
