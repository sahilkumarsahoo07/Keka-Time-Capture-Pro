# Dashboard Overview

Complete guide to the **Dashboard** - your main tracking interface.

---

## 📱 Dashboard Layout

The dashboard is divided into three main sections:

1. **Progress Ring** - Visual completion indicator
2. **Time Cards** - Work, break, and remaining time
3. **Status Display** - Current work status

---

## 🎯 Progress Ring

### What It Shows
- **Percentage complete** for the current day
- **Visual arc** that fills as you work
- **Color coding** based on progress

### Color Meanings
- 🟢 **Green (80-100%)** - On track, good progress
- 🟡 **Yellow (60-79%)** - Moderate progress
- 🟠 **Orange (40-59%)** - Behind schedule
- 🔴 **Red (0-39%)** - Significantly behind

### Center Display
Shows your completion percentage:
```
75%
```

### How It Calculates
```
Progress = (Hours Worked / Required Hours) × 100%
```
Example: 6 hours worked / 8 hours required = 75%

---

## ⏱️ Time Remaining Counter

### Display Format
```
TIME REMAINING
5h 30m 15s
```

### What It Means
- **Hours until shift completion**
- Updates every second
- Accounts for breaks taken
- Shows negative time if overtime

### States
- **Positive** - Time left to work
- **Zero** - Shift complete!
- **Negative** - Working overtime

---

## 📊 Time Cards

### Work Time Card
```
🕐 WORK TIME
6h 30m
```
- Total hours worked today
- Excludes break time
- Live updates

### Break Time Card
```
☕ BREAK TIME
45m
Used: 45/60m
```
- Total break time taken
- Shows usage vs. allowance
- Warns if exceeding limit

### Remaining Card
```
⏰ REMAINING
1h 30m
```
- Time left to complete shift
- Based on required hours
- Accounts for breaks

---

## 🎨 Work Status Indicator

### Status Types

#### 🟢 Working
```
STATUS: WORKING
Clock In: 2:00 PM
```
- Currently clocked in
- Active work session
- Timer running

#### 🟡 On Break
```
STATUS: ON BREAK
Break started: 6:30 PM
```
- Between check-out and check-in
- Break timer active
- Shows break duration

#### ✅ Completed
```
STATUS: COMPLETED
Total: 8h 15m
```
- Shift requirements met
- Can continue for overtime
- Shows final total

#### ⚠️ Not Started
```
STATUS: NOT STARTED
Shift: 2:00 PM - 11:00 PM
```
- Haven't clocked in yet
- Shows scheduled shift time
- Waiting for first punch

---

## 📈 Additional Dashboard Elements

### Late Arrival Warning
When you clock in late:
```
⚠️ LATE ARRIVAL
0:15:32 late
```

### Overtime Indicator
When working extra hours:
```
🎉 OVERTIME
+1h 30m
```

### Achievement Badges
Shows recent unlocked badges:
```
🏆 5-Day Streak!
```

---

## 🔄 Real-Time Updates

### Auto-Refresh
- **Every 30 seconds** - Data sync
- **Every 1 second** - Timer updates
- **Manual refresh** - Click extension icon

### What Updates
- ✅ Progress percentage
- ✅ Time remaining
- ✅ Work hours
- ✅ Break time
- ✅ Status changes

---

## 💡 Dashboard Tips

### Tip 1: Keep It Open
Pin the extension and check throughout the day

### Tip 2: Monitor Progress
Aim for 50% by midday, 100% by shift end

### Tip 3: Watch Break Time
Keep breaks within allowance to avoid penalties

### Tip 4: Set Goals
Use the progress ring to pace yourself

### Tip 5: Check Status
Verify you're clocked in/out correctly

---

## 🎨 Theme Customization

Change dashboard colors in Settings:

1. **Midnight Blue** - Professional dark theme
2. **Sunset Orange** - Warm and energetic
3. **Forest Green** - Calm and natural
4. **Ocean Blue** - Cool and refreshing
5. **Lavender Purple** - Soft and elegant
6. **Rose Gold** - Premium and modern

[Settings Guide →](Settings-Customization.md)

---

## ⚙️ Dashboard Settings

Customize what you see:

### Show/Hide Elements
- Progress ring
- Time cards
- Status indicator
- Achievement badges

### Notification Preferences
- Shift completion alerts
- Break time warnings
- Overtime notifications

---

## 📱 Dashboard Actions

### Quick Actions
- 🔄 Refresh data
- 📊 View analytics
- ⚙️ Open settings
- 📥 Export data

### Navigation
- **Dashboard** - Current view
- **Analytics** - Statistics
- **Breaks** - Break history
- **Insights** - Trends
- **Settings** - Preferences

---

## 🐛 Dashboard Troubleshooting

### Progress ring stuck at 0%
- Refresh the Keka page
- Reopen the extension

### Times not updating
- Check internet connection
- Verify Keka is accessible

### Wrong shift hours showing
- Update shift hours in Settings
- Ensure correct month selected

[Troubleshooting Guide →](Troubleshooting.md)

---

## ➡️ Next Steps

- [Analytics & Reports](Analytics-Reports.md) - View detailed statistics
- [Settings & Customization](Settings-Customization.md) - Personalize your experience
- [Excel Export Guide](Excel-Export-Guide.md) - Export your data

---

[← Back to Wiki Home](Home.md)
