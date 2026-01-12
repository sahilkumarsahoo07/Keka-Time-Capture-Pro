# Missed Swipe Detection

Learn how the **Missed Swipe Detection** feature automatically identifies incomplete attendance records.

---

## 🎯 What is Missed Swipe Detection?

Missed Swipe Detection automatically identifies days where you:
- Are marked as "Present" in Keka
- But have less than 1 minute of recorded work hours
- Or have missing check-in/check-out punches

This helps you catch attendance issues before they affect payroll or HR records.

---

## 🔍 How It Works

### Detection Logic

The extension scans your attendance data and flags a day as "Missed Swipe" when:

```
IF status == "Present" 
   AND hours_worked < 1 minute
THEN flag as "Missed Swipe"
```

**OR**

```  
IF check_in exists 
   AND check_out == "MISSING"
   AND still_at_work == false
THEN flag as "Missed Swipe"
```

### Why This Matters

Example scenarios:
- ✅ Forgot to punch in (but actually worked)
- ✅ Forgot to punch out (left without clocking out)
- ✅ Biometric device malfunction
- ✅ System not registering swipe

---

## 📍 Where to Find Missed Swipes

### Analytics View

1. Open the extension
2. Click **"📊 Analytics"** tab
3. Scroll down to **"⚠️ Missed Swipes"** section

### Visual Indicators

```
⚠️ MISSED SWIPES (1)
━━━━━━━━━━━━━━━━━━━
📅 Mon, 12 Jan
   ❌ No punch data recorded
```

### Count Badge

The Analytics tab header shows a count badge:
```
📊 Analytics  [⚠️ 1]
```

---

## 📊 Missed Swipes Display

### Information Shown

For each missed swipe day:
- **Date** - Full date string (e.g., "Mon, 12 Jan")
- **Issue** - Reason flagged (e.g., "No punch data recorded")
- **Status** - Current attendance status
- **Action** - Recommended next steps

### Example Display

```
MISSED SWIPES DETAILS

Date           | Status    | Issue
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mon, 12 Jan   | Present   | No punch data recorded
Fri, 09 Jan   | Present   | Missing check-out punch
```

---

## 📥 In Excel Export

Missed swipes appear in two places:

### 1. Daily Details Section
```csv
Date,Day,Status,Check In,Check Out,Hours Worked,Remarks
Mon, 12 Jan,Monday,Missed Swipe,--:--,--:--,0.00.00,NO PUNCH DATA
```

### 2. Dedicated Missed Swipes Section
```csv
MISSED SWIPES DETAILS
Date          | Issue
Mon, 12 Jan  | No punch data recorded
Fri, 09 Jan  | Missing check-out punch
```

---

## 🔧 What To Do When Detected

### Immediate Actions

1. **Verify on Keka**
   ```
   1. Go to Keka attendance page
   2. Find the flagged date
   3. Check if punches are really missing
   4. Note the actual times you worked
   ```

2. **Raise Attendance Request**
   ```
   1. In Keka, go to "Attendance Requests"
   2. Click "New Request"
   3. Select the date
   4. Select request type (missed swipe)
   5. Enter actual work times
   6. Add comments/justification
   7. Submit for approval
   ```

3. **Contact HR (if needed)**
   ```
   - Inform your HR about the issue
   - Provide actual work times
   - Attach any proof (emails, Slack activity, etc.)
   ```

---

## 💡 Prevention Tips

### Best Practices

1. **Set Reminders**
   - Phone alarm at shift start/end
   - Calendar notifications
   - Sticky notes on desk

2. **Verify Punches**
   - Check Keka after swiping
   - Confirm "Check In" shows your time
   - Verify "Check Out" at day end

3. **Use Extension Daily**
   - Open extension each morning
   - Check for any alerts
   - Verify attendance is recording

4. **Enable Notifications**
   - Extension can alert at shift end
   - Reminds you to punch out
   - Settings > Notifications > Enable

---

## 📈 Common Scenarios

### Scenario 1: Forgot to Clock In

**What Happened:**
- Started work at 2:00 PM
- Forgot to swipe in
- Remembered at 4:00 PM

**Detection:**
```
Status: Present (if manually marked)
Hours: 0h 0m
Flag: ⚠️ Missed Swipe
```

**Fix:**
1. Raise attendance request
2. Mention forgot to punch in
3. Provide actual time (2:00 PM)

---

### Scenario 2: Forgot to Clock Out

**What Happened:**
- Clocked in: 2:00 PM
- Left work: 10:00 PM
- Forgot to clock out

**Detection:**
```
Check In: 2:00 PM
Check Out: MISSING
Flag: ⚠️ Missed Swipe
```

**Fix:**
1. Raise attendance request
2. Select "Forgot to punch out"
3. Enter actual time you left

---

### Scenario 3: Biometric Failure

**What Happened:**
- Device didn't register swipe
- Assumed it worked
- Later found no record

**Detection:**
```
Status: Present (manual)
Punches: Missing
Flag: ⚠️ Missed Swipe
```

**Fix:**
1. Inform security/admin
2. Check if backup logs exist
3. Raise request with details

---

## 🎯 Detection Accuracy

### High Accuracy Scenarios

✅ Clear missed swipes (0 hours recorded)  
✅ Missing check-out with old check-in  
✅ Status mismatch (Present but no data)

### Edge Cases

⚠️ **Very short work days** (< 1 hour)
- May be flagged as missed swipe
- Verify if intentional (half-day leave)

⚠️ **System delays**
- Keka data not yet updated
- Wait 15-30 minutes, refresh

⚠️ **Manual adjustments**
- HR manually corrected
- Extension may still show alert until next reload

---

## 🔔 Notifications

### Auto-Alerts

When enabled, you'll get:
- Daily summary notification
- Showing missed swipe count
- With link to view details

### How to Enable
```
1. Settings tab
2. Scroll to Notifications
3. Toggle "Missed Swipe Alerts" ON
4. Select notification time
5. Save
```

---

## 📊 Analytics Integration

### Weekly View

```
WEEKLY STATISTICS
━━━━━━━━━━━━━━━
Missed Swipes: 2
```

### Monthly Summary

```
MONTHLY SUMMARY
━━━━━━━━━━━━━━━
Total Missed Swipes: 3
Dates: Jan 5, Jan 9, Jan 12
```

### Trends

Track over time:
- Frequency of missed swipes
- Days of week most common
- Patterns (e.g., Fridays)

---

## 🤝 Integration with HR

### Export for HR

The Excel export provides:
- Complete list of missed swipes
- Dates and details
- Ready for HR submission

### Audit Trail

- Extension doesn't modify Keka data
- Only reads and reports
- HR has final authority

---

## 📞 Need Help?

Issues with missed swipe detection?

- **Email**: sahilkumarsahoo001@gmail.com
- **GitHub**: [Report Issue](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues)

---

## ➡️ Related Guides

- [Incomplete Hours Tracking](Incomplete-Hours-Tracking.md)
- [Excel Export Guide](Excel-Export-Guide.md)
- [Troubleshooting](Troubleshooting.md)

---

[← Back to Wiki Home](Home.md)
