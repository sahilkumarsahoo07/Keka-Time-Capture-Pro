// goals.js - Goals & Milestones System

class GoalsManager {
    constructor() {
        this.goals = {
            daily: { target: 9, current: 0, unit: 'hours' },
            weekly: { target: 45, current: 0, unit: 'hours' },
            monthly: { target: 180, current: 0, unit: 'hours' }
        };

        this.streaks = {
            current: 0,
            longest: 0,
            lastDate: null
        };

        this.milestones = [];
    }

    // Initialize goals from storage
    async init() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['goals', 'streaks', 'milestones'], (result) => {
                if (result.goals) {
                    this.goals = result.goals;
                }
                if (result.streaks) {
                    this.streaks = result.streaks;
                }
                if (result.milestones) {
                    this.milestones = result.milestones;
                }
                resolve();
            });
        });
    }

    // Set goal target
    setGoal(type, target) {
        if (this.goals[type]) {
            this.goals[type].target = target;
            this.save();
        }
    }

    // Update current progress
    updateProgress(dailyHours, weeklyHours, monthlyHours) {
        this.goals.daily.current = dailyHours;
        this.goals.weekly.current = weeklyHours;
        this.goals.monthly.current = monthlyHours;

        // Check if daily goal is met
        if (dailyHours >= this.goals.daily.target) {
            this.updateStreak();
        }

        this.save();
        this.checkMilestones();
    }

    // Update streak
    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (this.streaks.lastDate === today) {
            // Already counted today
            return;
        }

        if (this.streaks.lastDate === yesterday) {
            // Continuing streak
            this.streaks.current++;
        } else if (this.streaks.lastDate !== today) {
            // Streak broken or first time
            this.streaks.current = 1;
        }

        this.streaks.lastDate = today;

        if (this.streaks.current > this.streaks.longest) {
            this.streaks.longest = this.streaks.current;
        }

        this.save();
    }

    // Get goal progress percentage
    getProgress(type) {
        const goal = this.goals[type];
        if (!goal) return 0;

        const percentage = (goal.current / goal.target) * 100;
        return Math.min(100, Math.round(percentage));
    }

    // Check if goal is met
    isGoalMet(type) {
        const goal = this.goals[type];
        return goal && goal.current >= goal.target;
    }

    // Get all goals status
    getAllGoalsStatus() {
        return {
            daily: {
                ...this.goals.daily,
                progress: this.getProgress('daily'),
                met: this.isGoalMet('daily')
            },
            weekly: {
                ...this.goals.weekly,
                progress: this.getProgress('weekly'),
                met: this.isGoalMet('weekly')
            },
            monthly: {
                ...this.goals.monthly,
                progress: this.getProgress('monthly'),
                met: this.isGoalMet('monthly')
            },
            streaks: this.streaks
        };
    }

    // Add custom milestone
    addMilestone(name, target, type = 'hours') {
        const milestone = {
            id: Date.now(),
            name: name,
            target: target,
            type: type,
            achieved: false,
            achievedDate: null
        };

        this.milestones.push(milestone);
        this.save();
        return milestone;
    }

    // Check and update milestones
    checkMilestones() {
        let newAchievements = [];

        this.milestones.forEach(milestone => {
            if (!milestone.achieved) {
                const current = this.goals[milestone.type]?.current || 0;

                if (current >= milestone.target) {
                    milestone.achieved = true;
                    milestone.achievedDate = new Date().toISOString();
                    newAchievements.push(milestone);
                }
            }
        });

        if (newAchievements.length > 0) {
            this.save();
            this.notifyMilestones(newAchievements);
        }
    }

    // Notify about achieved milestones
    notifyMilestones(milestones) {
        milestones.forEach(milestone => {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: '🎯 Milestone Achieved!',
                message: `Congratulations! You've reached: ${milestone.name}`,
                priority: 2
            });
        });
    }

    // Get achievement summary
    getAchievementSummary() {
        const total = this.milestones.length;
        const achieved = this.milestones.filter(m => m.achieved).length;

        return {
            total: total,
            achieved: achieved,
            pending: total - achieved,
            percentage: total > 0 ? Math.round((achieved / total) * 100) : 0
        };
    }

    // Reset weekly goals (call at start of week)
    resetWeekly() {
        this.goals.weekly.current = 0;
        this.save();
    }

    // Reset monthly goals (call at start of month)
    resetMonthly() {
        this.goals.monthly.current = 0;
        this.save();
    }

    // Save to storage
    save() {
        chrome.storage.sync.set({
            goals: this.goals,
            streaks: this.streaks,
            milestones: this.milestones
        });
    }

    // Get motivational message based on progress
    getMotivationalMessage() {
        const dailyProgress = this.getProgress('daily');

        if (dailyProgress >= 100) {
            return "🎉 Daily goal achieved! You're crushing it!";
        } else if (dailyProgress >= 75) {
            return "💪 Almost there! Keep pushing!";
        } else if (dailyProgress >= 50) {
            return "🚀 Halfway to your goal! You got this!";
        } else if (dailyProgress >= 25) {
            return "⭐ Good start! Keep up the momentum!";
        } else {
            return "🌟 Let's make today count!";
        }
    }

    // Export goals data
    exportGoalsData() {
        return {
            goals: this.goals,
            streaks: this.streaks,
            milestones: this.milestones,
            exportDate: new Date().toISOString()
        };
    }

    // Import goals data
    importGoalsData(data) {
        if (data.goals) this.goals = data.goals;
        if (data.streaks) this.streaks = data.streaks;
        if (data.milestones) this.milestones = data.milestones;
        this.save();
    }
}

// Export for use in popup.js
window.GoalsManager = GoalsManager;
