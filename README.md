# ⏰ Keka Time Capture Pro

> A powerful browser extension that enhances Keka's attendance tracking with advanced analytics, missed swipe detection, and comprehensive Excel exports.

[![Edge Add-ons](https://img.shields.io/badge/Edge-Available-0078D4?logo=microsoft-edge)](https://microsoftedge.microsoft.com/addons/detail/keka-time-capture-pro/nafcioiaipfahhkpgmgbjpildbkabonn)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Coming%20Soon-lightgrey?logo=google-chrome)](#)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.0-green.svg)](manifest.json)

---

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Screenshots](#-screenshots)
- [Technical Details](#-technical-details)
- [File Structure](#-file-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Tracking
- **Real-time Work Timer** - Live countdown showing remaining work hours
- **Progress Ring Chart** - Visual representation of daily completion
- **Break Time Tracking** - Monitor breaks with detailed logs
- **Late Arrival Detection** - Automatic flagging with grace period settings
- **Shift Mode Toggle** - Switch between full-day (8hr) and half-day (4hr) modes

### 📊 Advanced Analytics
- **Weekly Statistics** 
  - Total hours worked
  - Average daily hours
  - On-time arrival rate
  - Late count tracking
- **Monthly Summary** - Comprehensive overview with trends
- **Daily Breakdown** - Detailed hour-by-hour analysis
- **Progress Bars** - Visual completion tracking

### ⚠️ Smart Detection (NEW!)
- **Missed Swipe Alerts** - Automatically detects days with incomplete punch data
- **Incomplete Hours Warnings** - Flags days with less than 8 hours worked
- **Real-time Notifications** - Get alerted when issues are detected

### 📥 Comprehensive Excel Export (NEW!)
Export detailed attendance reports including:
- Full date and day of week
- Check-in and check-out times
- Hours worked and break times
- Status (Present, Late, Missed Swipe, Leave, etc.)
- Detailed remarks and warnings
- Monthly summary statistics
- Separate sections for missed swipes and incomplete hours

### 🏆 Gamification
- **Achievement System** - Unlock badges for consistency
- **Streak Tracking** - Build and maintain work streaks
- **Progress Milestones** - Celebrate your achievements

### 🎨 Customization
- **6 Premium Themes**
  - Midnight Blue
  - Sunset Orange
  - Forest Green
  - Ocean Blue
  - Lavender Purple
  - Rose Gold
- **Custom Work Hours** - Set your own shift duration
- **Adjustable Break Time** - Define required break hours
- **Grace Period Settings** - Configure late arrival tolerance
- **Sound Notifications** - Choose from multiple notification sounds

---

## 🚀 Installation

### Method 1: Edge Add-ons Store (Recommended) ⭐
1. Visit the [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/keka-time-capture-pro/nafcioiaipfahhkpgmgbjpildbkabonn)
2. Click **Get**
3. Navigate to your Keka attendance page
4. Click the extension icon to start tracking

### Method 2: Chrome Web Store
1. Visit the Chrome Web Store (Coming Soon - Under Review)
2. Click **Add to Chrome**
3. Navigate to your Keka attendance page
4. Click the extension icon to start tracking

### Method 3: Manual Installation (Developer Mode)
1. **Download the Extension**
   ```bash
   git clone https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro.git
   cd Keka-Time-Capture-Pro
   ```

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top-right toggle)
   - Click **Load unpacked**
   - Select the extension folder

3. **Pin the Extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "Keka Time Capture Pro"
   - Click the pin icon

---

## 📖 Usage Guide

### Initial Setup

1. **Navigate to Keka**
   - Go to your company's Keka attendance page
   - Make sure you're on the attendance log view

2. **Open Extension**
   - Click the extension icon in Chrome toolbar
   - The extension will automatically sync with Keka data

3. **Configure Settings** (Optional)
   - Click the ⚙️ Settings tab
   - Adjust work hours, break time, and grace period
   - Choose your preferred theme
   - Select notification preferences

### Daily Usage

#### Dashboard View
- **Progress Ring** - Shows your completion percentage for the day
- **Time Remaining** - Countdown to shift completion
- **Status Indicator** - Current work status (Working, Break, Completed)
- **Break Tracker** - Monitor your break usage

#### Analytics View
- **Weekly Stats** - View your performance for the current/previous week
- **Daily Breakdown** - See hour distribution across the week
- **Export Options**:
  - 📊 **CSV Export** - Basic attendance data
  - 📄 **JSON Export** - Structured data for developers
  - 📥 **Excel Export** - Comprehensive report with all details

#### Missed Swipes Section
- Located in the Analytics tab
- Shows all days with incomplete punch data
- Displays count badge for quick reference
- Color-coded red for visibility

#### Incomplete Hours Section
- Also in Analytics tab
- Lists days with less than 8 hours worked
- Shows progress bars and shortage amounts
- Color-coded orange for warnings

### Excel Export Guide

1. **Navigate to Analytics Tab**
2. **Click the green "📥 Export Excel" button**
3. **Open the downloaded CSV file**

**Report Sections:**
- **Header** - Month and export date
- **Monthly Summary** - Aggregated statistics
- **Daily Details** - Complete punch records for all days
- **Missed Swipes Details** - Separate section listing all issues
- **Incomplete Hours Details** - Days with shortage information

**CSV Columns:**
```
Date | Day | Status | Check In | Check Out | Hours Worked | Break Time | Remarks
```

---

## 📸 Screenshots

### Dashboard View
*Clean interface showing daily progress and time tracking*

### Analytics Dashboard
*Comprehensive weekly statistics with visual charts*

### Missed Swipes Detection
*Automatic alerts for incomplete attendance*

### Excel Export Sample
*Detailed attendance report with all data*

### Settings Panel
*Customizable options and theme selection*

---

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Structure
- **CSS3** - Styling with CSS variables for theming
- **Vanilla JavaScript** - No framework dependencies
- **Chart.js** - Progress ring visualization
- **Chrome Extension APIs**:
  - `chrome.storage` - Data persistence
  - `chrome.scripting` - Content injection
  - `chrome.runtime` - Message passing
  - `chrome.notifications` - Desktop alerts
  - `chrome.alarms` - Scheduled tasks

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Other Chromium-based browsers

### Permissions Required

```json
{
  "activeTab": "Access current tab for Keka data extraction",
  "scripting": "Inject content scripts to read attendance",
  "storage": "Save settings and attendance data locally",
  "notifications": "Show completion alerts",
  "alarms": "Schedule periodic data updates",
  "offscreen": "Play notification sounds"
}
```

### Data Privacy
- ✅ **100% Local Processing** - All data stored locally in your browser
- ✅ **No External Servers** - Zero data transmission to external services
- ✅ **No Analytics** - We don't track your usage
- ✅ **Open Source** - Full code transparency

---

## 📁 File Structure

```
Keka-Time-Capture-Pro/
├── manifest.json              # Extension configuration
├── popup.html                 # Main UI structure
├── popup.js                   # Core application logic
├── content.js                 # Keka page data extraction
├── background.js              # Service worker (messages, alarms)
├── offscreen.js               # Notification sound handler
├── offscreen.html             # Offscreen document
├── achievements.js            # Achievement system logic
├── charts.js                  # Chart rendering
├── style.css                  # Global styles
├── icons/
│   └── icon.png              # Extension icon
├── README.md                  # This file
├── PUBLISHING_GUIDE.md        # Chrome Web Store submission guide
├── STORE_LISTING.md           # Store listing content
└── SEO_KEYWORDS.md            # SEO and marketing keywords
```

### Key Components

#### `popup.js` (~3000 lines)
- Main application logic
- UI rendering and updates
- Data processing and calculations
- Export functionality (CSV, JSON, Excel)
- Missed swipe detection
- Incomplete hours tracking
- Settings management
- Achievement system

#### `content.js` (~700 lines)
- Scrapes Keka attendance page
- Extracts daily punch times
- Parses work hours and status
- Detects late arrivals
- Extracts check-in/check-out times
- Calculates break durations

#### `background.js`
- Handles cross-script messaging
- Manages periodic data sync
- Schedules alarms for updates

#### `popup.html` (~3400 lines)
- Complete UI structure
- Embedded CSS with theme variables
- Multiple view sections (Dashboard, Analytics, Settings)
- Responsive layout

---

## 🛠️ Development

### Prerequisites
- Chrome browser
- Text editor (VS Code recommended)
- Basic knowledge of JavaScript and Chrome Extensions

### Setup Development Environment

1. **Clone Repository**
   ```bash
   git clone https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro.git
   cd Keka-Time-Capture-Pro
   ```

2. **Load Extension**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select project folder

3. **Make Changes**
   - Edit files in your preferred editor
   - Click reload icon in `chrome://extensions` after changes
   - Test on actual Keka page

### Testing

1. **Unit Testing**
   - Test individual functions with sample data
   - Verify calculations match expected results

2. **Integration Testing**
   - Test on actual Keka attendance page
   - Verify data extraction accuracy
   - Check all UI interactions

3. **Cross-browser Testing**
   - Test on Chrome, Edge, Brave
   - Verify theme rendering
   - Check notification functionality

### Building for Production

1. **Review Code**
   - Remove console.log statements
   - Optimize performance
   - Minify if needed

2. **Update Version**
   - Increment version in `manifest.json`
   - Update README changelog

3. **Create ZIP**
   ```bash
   # Exclude unnecessary files
   zip -r keka-extension.zip . -x "*.git*" "*.DS_Store" "node_modules/*"
   ```

4. **Test Production Build**
   - Load ZIP in Chrome
   - Full functionality test
   - Performance check

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
1. Check existing issues first
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser version

### Suggesting Features
1. Open feature request issue
2. Describe the feature clearly
3. Explain use case and benefits
4. Provide mockups if possible

### Pull Requests
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Guidelines
- Use clear, descriptive variable names
- Comment complex logic
- Follow existing code style
- Test thoroughly before submitting

---

## 📄 License

This project is **copyright-protected** - see the [LICENSE](LICENSE) file for details.

**Copyright © 2026 Sahil Kumar Sahoo. All Rights Reserved.**

**For Permission to Use:**
- 📧 Email: sahilkumarsahoo001@gmail.com
- 📝 Include your intended use case
- ⏳ Wait for written approval

**End Users Can:**
- ✅ Install from official stores (Edge, Chrome)
- ✅ Use the extension for personal attendance tracking
- ✅ View source code for educational purposes

**Developers/Organizations Must:**
- 📩 Request permission before modifying or redistributing
- 🤝 Get written approval for commercial use
- 📋 Respect copyright and licensing terms

```
Copyright © 2026 Sahil Kumar Sahoo. All Rights Reserved.

Usage requires explicit permission from the copyright holder.
Contact: sahilkumarsahoo001@gmail.com

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

---

## 🙏 Acknowledgments

- **Chart.js** - For the beautiful progress ring visualization
- **Chrome Extension Team** - For the powerful APIs
- **Keka** - For the attendance management system
- **Contributors** - For making this extension better

---

## 📞 Support

- **Edge Add-ons**: [Leave a Review](https://microsoftedge.microsoft.com/addons/detail/keka-time-capture-pro/nafcioiaipfahhkpgmgbjpildbkabonn)
- **Issues**: [GitHub Issues](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues)
- **Email**: sahilkumarsahoo001@gmail.com
- **Documentation**: [Wiki](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/wiki)

---

## 🗺️ Roadmap

### Version 1.1 (Planned)
- [ ] Multi-language support
- [ ] Custom notification schedules
- [ ] Export to PDF format
- [ ] Calendar view for monthly overview

### Version 1.2 (Future)
- [ ] Team analytics (for managers)
- [ ] Remote work tracking
- [ ] Integration with Google Calendar
- [ ] Mobile companion app

---

## 📊 Changelog

### Version 3.0 (2026-01-12)
- ✨ Initial release
- ✅ Real-time work tracking
- ✅ Weekly analytics
- ✅ Achievement system
- ✅ Missed swipe detection
- ✅ Incomplete hours tracking
- ✅ Comprehensive Excel export
- ✅ 6 premium themes
- ✅ Customizable settings

---

<div align="center">

**Made with ❤️ by [Sahil Kumar Sahoo](https://github.com/sahilkumarsahoo07)**

⭐ Star this repo if you find it helpful!

[🔗 Get Extension](https://microsoftedge.microsoft.com/addons/detail/keka-time-capture-pro/nafcioiaipfahhkpgmgbjpildbkabonn) · [Report Bug](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues) · [Request Feature](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues) · [Documentation](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/wiki)

</div>
