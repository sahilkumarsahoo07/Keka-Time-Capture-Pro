# Excel Export Guide

Learn how to export comprehensive attendance reports using the **Excel Export** feature.

---

## 📥 What is Excel Export?

The Excel Export feature generates a **detailed CSV file** containing your complete attendance data, including:

- ✅ Full dates and days of the week
- ✅ Check-in and check-out times
- ✅ Hours worked each day
- ✅ Break time calculations
- ✅ Status (Present, Late, Leave, Holiday, etc.)
- ✅ Detailed remarks and warnings
- ✅ Monthly summary statistics
- ✅ Missed swipes breakdown
- ✅ Incomplete hours analysis

---

## 🚀 How to Export

### Step 1: Navigate to Analytics
1. Open the extension by clicking its icon
2. Click the **"📊 Analytics"** tab
3. Scroll down to the export buttons section

### Step 2: Click Export
1. Look for the green **"📥 Export Excel"** button
2. Click it to start the export process
3. Wait a few seconds for data extraction

### Step 3: Save the File
1. Your browser will download a CSV file
2. Filename format: `Keka_Attendance_[Month]_[YYYY-MM-DD].csv`
3. Save it to your desired location

### Step 4: Open in Excel/Sheets
1. Open the CSV file in:
   - Microsoft Excel
   - Google Sheets
   - LibreOffice Calc
   - Any spreadsheet application
2. Review your data

---

## 📊 Understanding the Report

### Section 1: Header
```
KEKA ATTENDANCE REPORT
Month: January
Export Date: 2026-01-12 15:51:01
```

### Section 2: Monthly Summary
Key metrics for the entire month:
- **Total Working Days** - Actual work days (excludes weekends/holidays)
- **Total Hours** - Sum of all hours worked
- **Average Hours/Day** - Average across working days
- **Late Arrivals** - Count of late check-ins
- **Missed Swipes** - Days with incomplete punch data
- **Incomplete Days** - Days with less than 8 hours

### Section 3: Daily Attendance Details

| Column | Description | Example |
|--------|-------------|---------|
| **Date** | Full date string | Mon, 12 Jan |
| **Day** | Day of week | Monday |
| **Status** | Attendance status | Present, Late, Leave |
| **Check In** | First punch time | 2:03:39 PM |
| **Check Out** | Last punch time | 10:45:20 PM or MISSING |
| **Hours Worked** | Total work time | 8.15.00 |
| **Break Time** | Total break duration | 0.45.00 |
| **Remarks** | Warnings/notes | LATE ARRIVAL \| INCOMPLETE |

### Section 4: Missed Swipes Details
Dedicated section listing all days with missing punch data:
```
MISSED SWIPES DETAILS
Date          | Issue
Mon, 12 Jan  | No punch data recorded
```

### Section 5: Incomplete Hours Details
Shows days with less than required hours:
```
INCOMPLETE HOURS DETAILS
Date          | Hours Worked | Shortage  | Completion %
Fri, 09 Jan  | 5.02.00     | 2.58.00   | 62%
```

---

## 💡 Use Cases

### 1. Monthly Reporting
Export at month-end for:
- HR submissions
- Salary calculations
- Personal records

### 2. Performance Analysis
Track your:
- Attendance consistency
- Average work hours
- Late arrival trends

### 3. Issue Resolution
Identify and fix:
- Missing swipes
- Incomplete days
- Data discrepancies

### 4. Backup & Archive
Create backups of:
- Historical attendance
- Leave records
- Work patterns

---

## 🎯 Pro Tips

### Tip 1: Regular Exports
Export weekly to catch issues early and maintain accurate records.

### Tip 2: Multi-Month Comparison
Export each month separately and compare trends over time.

### Tip 3: Filter in Excel
Use Excel's filter feature to:
- Show only late arrivals
- Find specific date ranges
- Highlight incomplete days

### Tip 4: Conditional Formatting
Apply formatting to:
- Color-code status (green = on-time, red = late)
- Highlight low hours (< 8)
- Mark missing swipes

### Tip 5: Pivot Tables
Create pivot tables to:
- Analyze by day of week
- Calculate averages
- Generate charts

---

## 🔍 Example Export

Here's what a sample export looks like:

```csv
KEKA ATTENDANCE REPORT
Month: January
Export Date: 2026-01-12 15:51:01

MONTHLY SUMMARY
Total Working Days,5
Total Hours,######
Average Hours/Day,7.30.24
Late Arrivals,1
Missed Swipes,1
Incomplete Days,1

DAILY ATTENDANCE DETAILS
Date,Day,Status,Check In,Check Out,Hours Worked,Break Time,Remarks
Mon, 12 Jan,Monday,--:--,--:--,0.00.00,0.00.00,NO PUNCH DATA
Fri, 09 Jan,Friday,2:08:32 PM,MISSING,5.02.00,0.28.25,LATE ARRIVAL | INCOMPLETE
Thu, 08 Jan,Thursday,2:00:00 PM,10:45:13 PM,8.04.00,0.40.47,
```

---

## ⚙️ Export Options Comparison

| Feature | CSV Export | JSON Export | Excel Export |
|---------|-----------|-------------|--------------|
| File Format | Basic CSV | JSON | Comprehensive CSV |
| Dates | ✅ Yes | ✅ Yes | ✅ Full format |
| Check-in/out | ❌ No | ❌ No | ✅ Yes |
| Break Times | ❌ No | ❌ No | ✅ Yes |
| Status | ✅ Basic | ✅ Yes | ✅ Detailed |
| Remarks | ❌ No | ❌ No | ✅ Yes |
| Summary | ❌ No | ✅ Yes | ✅ Detailed |
| Missed Swipes | ❌ No | ❌ No | ✅ Dedicated |
| Incomplete Hours | ❌ No | ❌ No | ✅ Dedicated |
| **Best For** | Quick data | Developers | HR & Analysis |

---

## 🐛 Troubleshooting

### Export Button Not Working
**Problem**: Nothing happens when clicking export  
**Solution**: 
1. Make sure you're on the Analytics tab
2. Check that you have data loaded
3. Try refreshing the extension

### Empty Export
**Problem**: CSV file is empty or has no data  
**Solution**:
1. Visit your Keka attendance page first
2. Refresh the page
3. Reopen the extension
4. Try exporting again

### Wrong Data
**Problem**: Export shows incorrect information  
**Solution**:
1. Go to Keka attendance page
2. Select the correct month
3. Refresh the extension
4. Export again

### File Won't Open
**Problem**: CSV file won't open in Excel  
**Solution**:
1. Right-click the file
2. Choose "Open with"
3. Select your spreadsheet app
4. Or drag-and-drop into Excel

---

## 📞 Need Help?

Having trouble with exports?

- **Email**: sahilkumarsahoo001@gmail.com
- **Issues**: [Report Export Problem](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues)

---

## ➡️ Related Guides

- [Analytics & Reports](Analytics-Reports.md)
- [Dashboard Overview](Dashboard-Overview.md)
- [FAQ](FAQ.md)

---

[← Back to Wiki Home](Home.md)
