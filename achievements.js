// achievements.js - Achievements & Badges System

class AchievementsManager {
    constructor() {
        this.achievements = {
            // Streak Badges
            streak7: {
                id: 'streak7',
                name: '7-Day Warrior',
                description: 'Complete 7 consecutive work days',
                icon: '🔥',
                category: 'streaks',
                requirement: 7,
                unlocked: false,
                unlockedDate: null
            },
            streak30: {
                id: 'streak30',
                name: 'Monthly Master',
                description: 'Complete 30 consecutive work days',
                icon: '⚡',
                category: 'streaks',
                requirement: 30,
                unlocked: false,
                unlockedDate: null
            },
            streak100: {
                id: 'streak100',
                name: 'Century Champion',
                description: 'Complete 100 consecutive work days',
                icon: '👑',
                category: 'streaks',
                requirement: 100,
                unlocked: false,
                unlockedDate: null
            },

            // Hour Milestones
            hours100: {
                id: 'hours100',
                name: 'Centurion',
                description: 'Work 100 total hours',
                icon: '💯',
                category: 'hours',
                requirement: 100,
                unlocked: false,
                unlockedDate: null
            },
            hours500: {
                id: 'hours500',
                name: 'Half Millennium',
                description: 'Work 500 total hours',
                icon: '🌟',
                category: 'hours',
                requirement: 500,
                unlocked: false,
                unlockedDate: null
            },
            hours1000: {
                id: 'hours1000',
                name: 'Millennium Master',
                description: 'Work 1000 total hours',
                icon: '🏆',
                category: 'hours',
                requirement: 1000,
                unlocked: false,
                unlockedDate: null
            },

            // Punctuality Awards
            punctual7: {
                id: 'punctual7',
                name: 'On-Time Rookie',
                description: 'No late arrivals for 7 days',
                icon: '⏰',
                category: 'punctuality',
                requirement: 7,
                unlocked: false,
                unlockedDate: null
            },
            punctual30: {
                id: 'punctual30',
                name: 'Punctuality Pro',
                description: 'No late arrivals for 30 days',
                icon: '⌚',
                category: 'punctuality',
                requirement: 30,
                unlocked: false,
                unlockedDate: null
            },

            // Perfect Week
            perfectWeek: {
                id: 'perfectWeek',
                name: 'Perfect Week',
                description: 'Complete all work days in a week',
                icon: '✨',
                category: 'special',
                requirement: 1,
                unlocked: false,
                unlockedDate: null
            },

            // Early Bird
            earlyBird5: {
                id: 'earlyBird5',
                name: 'Early Bird',
                description: 'Arrive early 5 days in a row',
                icon: '🌅',
                category: 'special',
                requirement: 5,
                unlocked: false,
                unlockedDate: null
            },
            earlyBird15: {
                id: 'earlyBird15',
                name: 'Morning Person',
                description: 'Arrive early 15 days in a row',
                icon: '🌄',
                category: 'special',
                requirement: 15,
                unlocked: false,
                unlockedDate: null
            },

            // Night Owl
            nightOwl5: {
                id: 'nightOwl5',
                name: 'Night Owl',
                description: 'Work late 5 times',
                icon: '🦉',
                category: 'special',
                requirement: 5,
                unlocked: false,
                unlockedDate: null
            },
            nightOwl20: {
                id: 'nightOwl20',
                name: 'Midnight Warrior',
                description: 'Work late 20 times',
                icon: '🌙',
                category: 'special',
                requirement: 20,
                unlocked: false,
                unlockedDate: null
            },

            // Break Master
            breakMaster: {
                id: 'breakMaster',
                name: 'Break Master',
                description: 'Optimal break usage for 7 days',
                icon: '☕',
                category: 'special',
                requirement: 7,
                unlocked: false,
                unlockedDate: null
            },

            // Monthly Champion
            monthlyChampion: {
                id: 'monthlyChampion',
                name: 'Monthly Champion',
                description: 'Meet daily goals all month',
                icon: '🥇',
                category: 'special',
                requirement: 1,
                unlocked: false,
                unlockedDate: null
            }
        };

        this.stats = {
            totalHours: 0,
            currentStreak: 0,
            punctualStreak: 0,
            earlyBirdStreak: 0,
            nightOwlCount: 0,
            breakMasterDays: 0,
            perfectWeeks: 0,
            monthlyGoalsMet: 0
        };
    }

    // Initialize from storage
    async init() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['achievements', 'achievementStats'], (result) => {
                if (result.achievements) {
                    // Merge with existing achievements structure
                    Object.keys(result.achievements).forEach(key => {
                        if (this.achievements[key]) {
                            this.achievements[key] = {
                                ...this.achievements[key],
                                ...result.achievements[key]
                            };
                        }
                    });
                }

                if (result.achievementStats) {
                    this.stats = { ...this.stats, ...result.achievementStats };
                }

                resolve();
            });
        });
    }

    // Update statistics and check achievements
    updateStats(data) {
        // Update total hours
        if (data.totalHours !== undefined) {
            this.stats.totalHours = data.totalHours;
            this.checkHourMilestones();
        }

        // Update current streak
        if (data.currentStreak !== undefined) {
            this.stats.currentStreak = data.currentStreak;
            this.checkStreakBadges();
        }

        // Update punctual streak
        if (data.punctualStreak !== undefined) {
            this.stats.punctualStreak = data.punctualStreak;
            this.checkPunctualityAwards();
        }

        // Update early bird streak
        if (data.earlyBirdStreak !== undefined) {
            this.stats.earlyBirdStreak = data.earlyBirdStreak;
            this.checkEarlyBirdAwards();
        }

        // Update night owl count
        if (data.nightOwlCount !== undefined) {
            this.stats.nightOwlCount = data.nightOwlCount;
            this.checkNightOwlAwards();
        }

        // Update break master days
        if (data.breakMasterDays !== undefined) {
            this.stats.breakMasterDays = data.breakMasterDays;
            this.checkBreakMaster();
        }

        // Update perfect weeks
        if (data.perfectWeeks !== undefined) {
            this.stats.perfectWeeks = data.perfectWeeks;
            this.checkPerfectWeek();
        }

        this.save();
    }

    // Check hour milestones
    checkHourMilestones() {
        const milestones = ['hours100', 'hours500', 'hours1000'];

        milestones.forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && this.stats.totalHours >= achievement.requirement) {
                this.unlockAchievement(id);
            }
        });
    }

    // Check streak badges
    checkStreakBadges() {
        const streaks = ['streak7', 'streak30', 'streak100'];

        streaks.forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && this.stats.currentStreak >= achievement.requirement) {
                this.unlockAchievement(id);
            }
        });
    }

    // Check punctuality awards
    checkPunctualityAwards() {
        const awards = ['punctual7', 'punctual30'];

        awards.forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && this.stats.punctualStreak >= achievement.requirement) {
                this.unlockAchievement(id);
            }
        });
    }

    // Check early bird awards
    checkEarlyBirdAwards() {
        const awards = ['earlyBird5', 'earlyBird15'];

        awards.forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && this.stats.earlyBirdStreak >= achievement.requirement) {
                this.unlockAchievement(id);
            }
        });
    }

    // Check night owl awards
    checkNightOwlAwards() {
        const awards = ['nightOwl5', 'nightOwl20'];

        awards.forEach(id => {
            const achievement = this.achievements[id];
            if (!achievement.unlocked && this.stats.nightOwlCount >= achievement.requirement) {
                this.unlockAchievement(id);
            }
        });
    }

    // Check break master
    checkBreakMaster() {
        const achievement = this.achievements.breakMaster;
        if (!achievement.unlocked && this.stats.breakMasterDays >= achievement.requirement) {
            this.unlockAchievement('breakMaster');
        }
    }

    // Check perfect week
    checkPerfectWeek() {
        const achievement = this.achievements.perfectWeek;
        if (!achievement.unlocked && this.stats.perfectWeeks >= achievement.requirement) {
            this.unlockAchievement('perfectWeek');
        }
    }

    // Unlock achievement
    unlockAchievement(id) {
        const achievement = this.achievements[id];
        if (!achievement || achievement.unlocked) return;

        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();

        // Show notification
        this.showAchievementNotification(achievement);

        this.save();
    }

    // Show achievement notification
    showAchievementNotification(achievement) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon.png',
            title: `🏆 Achievement Unlocked!`,
            message: `${achievement.icon} ${achievement.name}\n${achievement.description}`,
            priority: 2
        });
    }

    // Get all achievements by category
    getByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    // Get unlocked achievements
    getUnlocked() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    // Get locked achievements
    getLocked() {
        return Object.values(this.achievements).filter(a => !a.unlocked);
    }

    // Get achievement progress
    getProgress(id) {
        const achievement = this.achievements[id];
        if (!achievement) return 0;

        let current = 0;

        switch (achievement.category) {
            case 'streaks':
                current = this.stats.currentStreak;
                break;
            case 'hours':
                current = this.stats.totalHours;
                break;
            case 'punctuality':
                current = this.stats.punctualStreak;
                break;
            default:
                current = 0;
        }

        return Math.min(100, Math.round((current / achievement.requirement) * 100));
    }

    // Get overall completion percentage
    getOverallCompletion() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlocked().length;

        return Math.round((unlocked / total) * 100);
    }

    // Get next achievement to unlock
    getNextAchievement() {
        const locked = this.getLocked();

        // Sort by progress (closest to unlocking)
        locked.sort((a, b) => {
            const progressA = this.getProgress(a.id);
            const progressB = this.getProgress(b.id);
            return progressB - progressA;
        });

        return locked[0] || null;
    }

    // Save to storage
    save() {
        chrome.storage.local.set({
            achievements: this.achievements,
            achievementStats: this.stats
        });
    }

    // Export achievements data
    exportData() {
        return {
            achievements: this.achievements,
            stats: this.stats,
            exportDate: new Date().toISOString()
        };
    }
}

// Export for use in popup.js
window.AchievementsManager = AchievementsManager;
