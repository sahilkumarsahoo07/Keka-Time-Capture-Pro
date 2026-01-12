// background.js

// Initialize extension state
let isMonitoring = false;
let checkInterval = null;

// Function to start monitoring
function startMonitoring() {
    if (isMonitoring) return;
    isMonitoring = true;

    // Check every minute
    checkInterval = setInterval(() => {
        updateLiveBadge();
        checkAndUpdateData();
        checkOvertime(); // Check for overtime
        scheduleWeeklySummary(); // Check if it's time for weekly summary
    }, 60000);

    // Initial update
    updateLiveBadge();
    checkAndUpdateData();
    // Start the faster badge updater (keeps toolbar badge fresh)
    startLiveBadgeUpdater();
}

// Function to stop monitoring
function stopMonitoring() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
    isMonitoring = false;
}

// Function to check and update data
function checkAndUpdateData() {
    // Get the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            return; // No active tabs, exit gracefully
        }

        const activeTab = tabs[0];
        // Check if we're on a Keka URL
        if (activeTab && activeTab.url && activeTab.url.includes('keka.com')) {
            // Inject content script to get data
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                files: ['content.js']
            }).catch(err => {
            });
        }
    });
}

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === "SET_END_OF_DAY_ALARM") {
            const endTime = request.endTime;

            // Validate endTime
            if (!endTime || typeof endTime !== 'number' || isNaN(endTime) || endTime <= 0) {
                if (sendResponse) sendResponse({ success: false, error: "Invalid end time" });
                return true;
            }

            const now = Date.now();

            // Clear existing alarms with error handling
            chrome.alarms.clearAll((wasCleared) => {
            });

            const tenMinutesBeforeEnd = endTime - (10 * 60 * 1000);
            const fiveMinutesBeforeEnd = endTime - (5 * 60 * 1000);

            // Create 10-minute warning
            if (tenMinutesBeforeEnd > now) {
                try {
                    chrome.alarms.create("warning_10min", {
                        when: tenMinutesBeforeEnd,
                    });
                } catch (error) { }
            }

            // Create 5-minute warning
            if (fiveMinutesBeforeEnd > now) {
                try {
                    chrome.alarms.create("warning_5min", {
                        when: fiveMinutesBeforeEnd,
                    });
                } catch (error) { }
            }

            // Create final completion alarm
            if (endTime > now) {
                try {
                    chrome.alarms.create("finalCompletion", {
                        when: endTime,
                    });
                } catch (error) { }
            }

            if (sendResponse) sendResponse({ success: true });
        }
        else if (request.type === "CLEAR_ALARM") {
            chrome.alarms.clearAll((wasCleared) => {
                if (sendResponse) sendResponse({ success: true });
            });
        } else {
            if (sendResponse) sendResponse({ success: false, error: "Unknown request type" });
        }
    } catch (error) {
        if (sendResponse) sendResponse({ success: false, error: error.message });
    }

    return true; // Required for async sendResponse
});


chrome.alarms.onAlarm.addListener((alarm) => {
    try {
        if (!alarm || !alarm.name) {
            return;
        }

        if (alarm.name === "warning_10min") {
            showPreCompletionNotification(10);
        }
        else if (alarm.name === "warning_5min") {
            showPreCompletionNotification(5);
        }
        else if (alarm.name === "finalCompletion") {
            // Clear other specific alarms just in case
            chrome.alarms.clear("warning_10min");
            chrome.alarms.clear("warning_5min");
            showFinalCompletionNotification();
        }
    } catch (error) {
    }
});

//--- ADVANCED NOTIFICATION FUNCTIONS ---

// Overtime Warning Notification
function showOvertimeWarning(overtimeHours) {
    try {
        chrome.storage.sync.get({
            overtimeNotification: true,
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            if (!items.overtimeNotification) return;

            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "⚠️ Overtime Alert",
                message: `You've worked ${overtimeHours} hours overtime today. Consider taking a break!`,
                priority: 2,
                silent: true
            });
        });
    } catch (error) {
    }
}

// Sound notification function using offscreen document
async function playNotificationSound(soundType = 'bell') {
    try {
        // Check if offscreen document exists, if not create it
        const existingContexts = await chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT']
        });

        if (existingContexts.length === 0) {
            // Create offscreen document
            await chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['AUDIO_PLAYBACK'],
                justification: 'Playing notification sounds'
            });
        }

        // Send message to offscreen document to play sound
        await chrome.runtime.sendMessage({
            type: 'PLAY_NOTIFICATION_SOUND',
            soundType: soundType
        });
    } catch (error) {
        // Silently fail if offscreen document cannot be created
    }
}

// Late Arrival Alert
function showLateArrivalAlert(lateMinutes) {
    try {
        chrome.storage.sync.get({
            lateArrivalNotification: true,
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            if (!items.lateArrivalNotification) return;

            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "⏰ Late Arrival",
                message: `You arrived ${lateMinutes} minutes late today.`,
                priority: 1,
                silent: true
            });
        });
    } catch (error) {
    }
}

// Weekly Summary Notification
function showWeeklySummary(totalHours, avgHours, lateCount) {
    try {
        chrome.storage.sync.get({
            weeklySummaryNotification: true,
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            if (!items.weeklySummaryNotification) return;

            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "📊 Weekly Summary",
                message: `This week: ${totalHours}h total, ${avgHours}h avg/day, ${lateCount} late arrivals`,
                priority: 1,
                silent: true
            });
        });
    } catch (error) {
    }
}

// Goal Achievement Notification
function showGoalAchievement(goalType) {
    try {
        chrome.storage.sync.get({
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "🎯 Goal Achieved!",
                message: `Congratulations! You've met your ${goalType} goal!`,
                priority: 2,
                silent: true
            });
        });
    } catch (error) {
    }
}

// Check for overtime (called periodically)
function checkOvertime() {
    chrome.storage.sync.get({ overtimeThreshold: 9 }, (settings) => {
        chrome.storage.local.get('liveBadgeState', (result) => {
            if (!result || !result.liveBadgeState) return;

            const state = result.liveBadgeState;
            const required = timeStringToMillis(state.shiftHours || '09:00:00');
            let current = state.totalWorkMillis || 0;

            if (state.isCurrentlyWorking && typeof state.lastPunchTime === 'number') {
                current += (Date.now() - state.lastPunchTime);
            }

            const currentHours = current / (1000 * 60 * 60);
            const thresholdHours = settings.overtimeThreshold;

            // Check if current hours exceed the threshold
            if (currentHours >= thresholdHours) {
                const overtimeHours = (currentHours - (required / (1000 * 60 * 60))).toFixed(1);

                // Check if we should notify (only once when threshold is reached)
                const overtimeKey = `overtime_notified_${thresholdHours}`;
                chrome.storage.local.get(overtimeKey, (result) => {
                    if (!result[overtimeKey]) {
                        showOvertimeWarning(overtimeHours);
                        chrome.storage.local.set({ [overtimeKey]: true });
                    }
                });
            }
        });
    });
}

// Schedule weekly summary (call on Friday evening)
function scheduleWeeklySummary() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    if (dayOfWeek === 5) { // Friday
        const hour = now.getHours();
        if (hour === 17) { // 5 PM
            // Get weekly data and show summary
            chrome.storage.local.get('weeklyData', (result) => {
                if (result.weeklyData) {
                    const data = result.weeklyData;
                    const totalHours = data.totalHours || 0;
                    const avgHours = data.avgHours || 0;
                    const lateCount = data.lateCount || 0;

                    showWeeklySummary(totalHours, avgHours, lateCount);
                }
            });
        }
    }
}

function showPreCompletionNotification(minutesLeft) {
    try {
        // Respect user preference stored in sync storage
        chrome.storage.sync.get({
            completionNotification: true,
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            if (!items.completionNotification) {
                return;
            }

            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "Shift Ending Soon",
                message: `Your shift ends in ${minutesLeft} minutes.`,
                priority: 2,
                silent: true
            }, (notificationId) => {
                if (chrome.runtime.lastError) {
                    console.error("Error showing pre-completion notification:", chrome.runtime.lastError.message);
                }
            });
        });
    } catch (error) {
        console.error("Exception showing pre-completion notification:", error);
    }
}

function showFinalCompletionNotification() {
    try {
        // Respect user preference stored in sync storage
        chrome.storage.sync.get({
            completionNotification: true,
            soundNotification: false,
            notificationSound: 'bell'
        }, (items) => {
            if (!items.completionNotification) {
                return;
            }

            // Play sound if enabled
            if (items.soundNotification) {
                playNotificationSound(items.notificationSound);
            }

            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon.png",
                title: "Shift Completed!",
                message: "Your required work time is complete. You can now log out.",
                priority: 2,
                silent: true
            }, (notificationId) => {
                if (chrome.runtime.lastError) {
                    console.error("Error showing final notification:", chrome.runtime.lastError.message);
                }
            });
        });
    } catch (error) {
        console.error("Exception showing final notification:", error);
    }
}

chrome.runtime.onInstalled.addListener((details) => {
    try {

        // Clear any existing alarms on install/update to prevent stale alarms
        chrome.alarms.clearAll((wasCleared) => {
        });
    } catch (error) {
    }
});

// Handle extension errors
chrome.runtime.onStartup.addListener(() => {
    try {
    } catch (error) {
    }
});

//--- LIVE BADGE TIMER (auto badge update every 20s) ---
let liveBadgeInterval = null;
function startLiveBadgeUpdater() {
    if (liveBadgeInterval) return;
    liveBadgeInterval = setInterval(updateLiveBadge, 20000); // 20s
    updateLiveBadge(); // initial
}

function timeStringToMillis(timeStr) {
    if (!timeStr || !/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(timeStr)) return 0;
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h * 3600 + m * 60 + s) * 1000;
}

function formatBadgeString(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}:${String(m).padStart(2, '0')}`;
}

function updateLiveBadge() {
    try {
        // First check if badge icon is enabled
        chrome.storage.sync.get({ badgeIcon: true }, (badgeSettings) => {
            if (!badgeSettings || badgeSettings.badgeIcon === undefined) {
                // If settings are not available, default to showing badge
                badgeSettings = { badgeIcon: true };
            }

            if (!badgeSettings.badgeIcon) {
                // Badge is disabled, clear it
                chrome.action.setBadgeText({ text: '' });
                return;
            }

            // Badge is enabled, proceed with normal update
            chrome.storage.local.get('liveBadgeState', (result) => {
                // Check if result is undefined or null
                if (!result) {
                    chrome.action.setBadgeText({ text: '' });
                    return;
                }
                const state = result.liveBadgeState;
                if (!state || typeof state.totalWorkMillis !== 'number') {
                    chrome.action.setBadgeText({ text: '' });
                    return;
                }
                const required = (state.currentDayMode === 'halfDay') ? timeStringToMillis(state.halfDayHours) : timeStringToMillis(state.shiftHours);
                let current = state.totalWorkMillis || 0;
                if (state.isCurrentlyWorking && typeof state.lastPunchTime === 'number') {
                    current += (Date.now() - state.lastPunchTime);
                }
                const remain = Math.max(0, required - current);
                const isCompleted = current >= required;
                let badgeText = '';
                let badgeColor = '#df3600'; // pending default
                if (isCompleted) {
                    badgeText = '\u2713'; // check mark
                    badgeColor = '#4cd964';
                } else if (remain > 0) {
                    badgeText = formatBadgeString(remain);
                    badgeColor = '#df3600';
                } else {
                    badgeText = '';
                }
                try {
                    chrome.action.setBadgeText({ text: badgeText });
                    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
                } catch (e) {
                    // ignore
                }
            });
        });
    } catch (e) {
        chrome.action.setBadgeText({ text: '' });
    }
}

// Start monitoring when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    startMonitoring();
});

// Start monitoring when browser starts
chrome.runtime.onStartup.addListener(() => {
    startMonitoring();
});

// Start monitoring when extension is loaded
startMonitoring();

// Listen for tab updates to capture data when Keka is opened
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('keka.com')) {
        checkAndUpdateData();
    }
});

// Listen for tab activation to update data when switching to Keka tab
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && tab.url.includes('keka.com')) {
            checkAndUpdateData();
        }
    });
});
