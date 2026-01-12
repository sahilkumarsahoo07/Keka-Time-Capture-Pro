// pomodoro.js - Pomodoro Timer Module

class PomodoroTimer {
    constructor() {
        this.workDuration = 25 * 60; // 25 minutes in seconds
        this.breakDuration = 5 * 60; // 5 minutes in seconds
        this.longBreakDuration = 15 * 60; // 15 minutes
        this.sessionsBeforeLongBreak = 4;

        this.isRunning = false;
        this.isWorkSession = true;
        this.timeRemaining = this.workDuration;
        this.sessionsCompleted = 0;
        this.timerInterval = null;

        this.onTick = null;
        this.onComplete = null;
        this.onSessionChange = null;
    }

    // Start the timer
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateBadge();

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;

            if (this.onTick) {
                this.onTick(this.timeRemaining, this.isWorkSession);
            }

            this.updateBadge();

            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);

        this.saveState();
    }

    // Pause the timer
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.updateBadge();
        this.saveState();
    }

    // Reset the timer
    reset() {
        this.pause();
        this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration;

        if (this.onTick) {
            this.onTick(this.timeRemaining, this.isWorkSession);
        }

        this.updateBadge();
        this.saveState();
    }

    // Skip to next session
    skip() {
        this.pause();
        this.complete();
    }

    // Complete current session
    complete() {
        this.pause();

        if (this.isWorkSession) {
            this.sessionsCompleted++;

            // Determine break type
            const isLongBreak = this.sessionsCompleted % this.sessionsBeforeLongBreak === 0;
            this.isWorkSession = false;
            this.timeRemaining = isLongBreak ? this.longBreakDuration : this.breakDuration;

            // Show notification
            this.showNotification('Work Session Complete! 🎉',
                `Time for a ${isLongBreak ? 'long' : 'short'} break!`);
        } else {
            this.isWorkSession = true;
            this.timeRemaining = this.workDuration;

            this.showNotification('Break Complete! ⏰',
                'Ready to start working again?');
        }

        if (this.onComplete) {
            this.onComplete(this.isWorkSession, this.sessionsCompleted);
        }

        if (this.onSessionChange) {
            this.onSessionChange(this.isWorkSession);
        }

        if (this.onTick) {
            this.onTick(this.timeRemaining, this.isWorkSession);
        }

        this.updateBadge();
        this.saveState();
    }

    // Update extension badge
    updateBadge() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const badgeText = this.isRunning ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '';

        chrome.action.setBadgeText({ text: badgeText });

        const badgeColor = this.isWorkSession ? '#6c63ff' : '#4cd964';
        chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    }

    // Show notification
    showNotification(title, message) {
        if (chrome.notifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: title,
                message: message,
                priority: 2
            });
        }
    }

    // Format time for display
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Get progress percentage
    getProgress() {
        const total = this.isWorkSession ? this.workDuration : this.breakDuration;
        return ((total - this.timeRemaining) / total) * 100;
    }

    // Set custom durations
    setDurations(work, shortBreak, longBreak) {
        this.workDuration = work * 60;
        this.breakDuration = shortBreak * 60;
        this.longBreakDuration = longBreak * 60;

        if (!this.isRunning) {
            this.timeRemaining = this.isWorkSession ? this.workDuration : this.breakDuration;
        }

        this.saveState();
    }

    // Save state to storage
    saveState() {
        const state = {
            isRunning: this.isRunning,
            isWorkSession: this.isWorkSession,
            timeRemaining: this.timeRemaining,
            sessionsCompleted: this.sessionsCompleted,
            workDuration: this.workDuration,
            breakDuration: this.breakDuration,
            longBreakDuration: this.longBreakDuration,
            timestamp: Date.now()
        };

        chrome.storage.local.set({ pomodoroState: state });
    }

    // Load state from storage
    async loadState() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['pomodoroState'], (result) => {
                if (result.pomodoroState) {
                    const state = result.pomodoroState;

                    // Check if state is recent (within 1 hour)
                    const timeDiff = Date.now() - (state.timestamp || 0);
                    if (timeDiff < 3600000) {
                        this.isWorkSession = state.isWorkSession;
                        this.timeRemaining = state.timeRemaining;
                        this.sessionsCompleted = state.sessionsCompleted;
                        this.workDuration = state.workDuration || this.workDuration;
                        this.breakDuration = state.breakDuration || this.breakDuration;
                        this.longBreakDuration = state.longBreakDuration || this.longBreakDuration;

                        // Don't auto-resume running state
                        this.isRunning = false;
                    }
                }

                this.updateBadge();
                resolve();
            });
        });
    }

    // Get today's sessions count
    async getTodaySessions() {
        return new Promise((resolve) => {
            const today = new Date().toDateString();
            chrome.storage.local.get(['pomodoroHistory'], (result) => {
                const history = result.pomodoroHistory || {};
                resolve(history[today] || 0);
            });
        });
    }

    // Save today's session
    async saveTodaySession() {
        const today = new Date().toDateString();
        chrome.storage.local.get(['pomodoroHistory'], (result) => {
            const history = result.pomodoroHistory || {};
            history[today] = (history[today] || 0) + 1;
            chrome.storage.local.set({ pomodoroHistory: history });
        });
    }

    // Get session statistics
    async getStats() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['pomodoroHistory'], (result) => {
                const history = result.pomodoroHistory || {};
                const today = new Date().toDateString();

                const totalSessions = Object.values(history).reduce((a, b) => a + b, 0);
                const todaySessions = history[today] || 0;
                const daysActive = Object.keys(history).length;

                resolve({
                    totalSessions,
                    todaySessions,
                    daysActive,
                    avgPerDay: daysActive > 0 ? (totalSessions / daysActive).toFixed(1) : 0
                });
            });
        });
    }
}

// Export for use in popup.js
window.PomodoroTimer = PomodoroTimer;
