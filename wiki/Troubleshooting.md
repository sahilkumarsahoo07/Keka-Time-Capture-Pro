# Troubleshooting Guide

Solutions to common issues with **Keka Time Capture Pro**.

---

## 🔍 Quick Diagnostics

Having problems? Start here:

1. ✅ Are you on the Keka attendance page?
2. ✅ Are you logged into Keka?
3. ✅ Is the extension updated to the latest version?
4. ✅ Did you reload the Keka page?
5. ✅ Did you reopen the extension?

---

## 📊 Data Loading Issues

### Extension Shows No Data

**Symptoms:**
- Empty dashboard
- "No data available" message
- All zeros showing

**Solutions:**

1. **Verify Keka Page**
   ```
   1. Go to your Keka attendance page
   2. Click on "Attendance" tab
   3. Make sure attendance logs are visible
   4. Refresh the page
   ```

2. **Reload Extension**
   ```
   1. Close the extension popup
   2. Click the extension icon again
   3. Wait for data to load (5-10 seconds)
   ```

3. **Clear Cache**
   ```
   1. Open extension
   2. Go to Settings
   3. Scroll to "Advanced"
   4. Click "Clear Cache"
   5. Reopen extension
   ```

4. **Check Permissions**
   ```
   1. Go to edge://extensions/
   2. Find Keka Time Capture Pro
   3. Click "Details"
   4. Ensure all permissions are enabled
   ```

---

### Incorrect Times Showing

**Symptoms:**
- Wrong hours displayed
- Outdated information
- Missing recent punches

**Solutions:**

1. **Refresh Keka Data**
   ```
   1. On Keka page, press Ctrl+F5 (hard refresh)
   2. Wait for page to fully load
   3. Reopen extension
   ```

2. **Check Month Selection**
   ```
   1. On Keka, verify correct month is selected
   2. Extension reads currently displayed month
   3. Switch month if needed
   4. Refresh extension
   ```

3. **Verify Timezone**
   ```
   1. Check your system time
   2. Ensure it matches Keka timezone
   3. Restart browser if needed
   ```

---

### Data Not Updating

**Symptoms:**
- Static data, no live updates
- Timer not counting
- Old information persisting

**Solutions:**

1. **Enable Auto-Refresh**
   ```
   1. Settings tab
   2. Find "Auto-Refresh"
   3. Enable if disabled
   4. Set interval to 30 seconds
   ```

2. **Manual Refresh**
   ```
   1. Close extension
   2. Refresh Keka page
   3. Wait 5 seconds
   4. Reopen extension
   ```

3. **Check Background Permissions**
   ```
   1. edge://extensions/
   2. Keka Time Capture Pro > Details
   3. Ensure "Allow in background" is checked
   ```

---

## 📥 Export Problems

### Excel Export Not Working

**Symptoms:**
- No file downloads
- Empty CSV file
- Export button does nothing

**Solutions:**

1. **Check Download Settings**
   ```
   1. Open Edge settings
   2. Go to Downloads
   3. Ensure downloads are not blocked
   4. Try export again
   ```

2. **Verify Data Loaded**
   ```
   1. Make sure dashboard shows data
   2. Check Analytics tab has content
   3. If empty, reload from Keka
   4. Then try export
   ```

3. **Browser Cleanup**
   ```
   1. Close all Keka tabs
   2. Clear browser cache
   3. Restart browser
   4. Go to Keka page
   5. Try export again
   ```

4. **Try Different Format**
   ```
   1. If Excel export fails
   2. Try CSV Export or JSON Export
   3. Check if those work
   ```

---

### Export Has Missing Data

**Symptoms:**
- Some days missing from export
- Check-in/out times show "--:--"
- Incomplete information

**Solutions:**

1. **Ensure Month is Loaded**
   ```
   1. On Keka, select the month to export
   2. Scroll through all days
   3. Let the page fully load
   4. Then export
   ```

2. **Check Keka Data**
   ```
   1. Verify data exists on Keka
   2. If Keka shows "--:--", extension will too
   3. Extension reads from Keka directly
   ```

3. **Re-sync Data**
   ```
   1. Close extension
   2. Hard refresh Keka (Ctrl+F5)
   3. Wait for complete page load
   4. Reopen extension
   5. Go to Analytics > Export
   ```

---

## ⚙️ Settings Issues

### Settings Not Saving

**Symptoms:**
- Changes revert after closing
- Theme doesn't persist
- Custom hours reset

**Solutions:**

1. **Enable Storage Permission**
   ```
   1. edge://extensions/
   2. Keka Time Capture Pro > Details
   3. Check "Allow access to file URLs"
   4. Restart browser
   ```

2. **Clear Old Settings**
   ```
   1. Open extension
   2. Settings tab
   3. Scroll to bottom
   4. Click "Reset to Defaults"
   5. Reconfigure settings
   6. Click Save
   ```

3. **Check Browser Sync**
   ```
   1. Edge settings
   2. Profiles > Sync
   3. Ensure Extensions sync is enabled
   ```

---

### Theme Not Changing

**Symptoms:**
- Theme stays the same
- Colors don't update
- Default theme always shows

**Solutions:**

1. **Force Theme Change**
   ```
   1. Settings tab
   2. Select different theme
   3. Click Save
   4. Close extension completely
   5. Reopen - should show new theme
   ```

2. **Clear Extension Cache**
   ```
   1. edge://extensions/
   2. Find extension
   3. Click Remove
   4. Reinstall from store
   5. Reconfigure settings
   ```

---

## 🔔 Notification Problems

### No Notifications Showing

**Symptoms:**
- Completion alerts not appearing
- No sound notifications
- Silent mode even when enabled

**Solutions:**

1. **Check Browser Permissions**
   ```
   1. Edge settings
   2. Cookies and site permissions
   3. Notifications
   4. Ensure Edge can show notifications
   ```

2. **Enable in Extension**
   ```
   1. Settings tab
   2. Scroll to Notifications
   3. Toggle ON
   4. Select notification sound
   5. Click Save
   ```

3. **System Notifications**
   ```
   Windows:
   1. Settings > System > Notifications
   2. Ensure notifications are ON
   3. Edge should be allowed
   ```

4. **Test Notification**
   ```
   1. Complete 8 hours
   2. Should trigger completion alert
   3. If nothing, check all above steps
   ```

---

## 🚫 Extensions Conflicts

### Extension Not Loading

**Symptoms:**
- Icon grayed out
- Clicking does nothing
- Extension missing from toolbar

**Solutions:**

1. **Verify Installation**
   ```
   1. edge://extensions/
   2. Find Keka Time Capture Pro
   3. Ensure toggle is ON (enabled)
   4. Check for errors
   ```

2. **Disable Other Extensions**
   ```
   1. Temporarily disable other extensions
   2. Test if Keka works alone
   3. Re-enable one by one to find conflict
   ```

3. **Reinstall Extension**
   ```
   1. edge://extensions/
   2. Remove extension
   3. Restart browser
   4. Reinstall from Edge Add-ons Store
   ```

---

### Extension Crashes/Freezes

**Symptoms:**
- Extension becomes unresponsive
- Browser tab freezes
- Error messages appear

**Solutions:**

1. **Check Console Errors**
   ```
   1. Right-click extension icon
   2. Select "Inspect"
   3. Check Console tab for errors
   4. Screenshot and report to developer
   ```

2. **Update Browser**
   ```
   1. Edge menu > Help and feedback
   2. About Microsoft Edge
   3. Let it update if available
   4. Restart browser
   ```

3. **Memory Issues**
   ```
   1. Close unnecessary tabs
   2. Restart browser
   3. Try extension with fewer tabs open
   ```

---

## 📱 Browser-Specific Issues

### Edge-Specific Fixes

**Clearing Extension Data:**
```
1. edge://settings/siteData
2. Search for "chrome-extension"
3. Remove Keka extension data
4. Restart browser
```

**Resetting Edge:**
```
1. Settings > Reset settings
2. Restore settings to defaults
3. Reinstall extension
```

---

## 🆘 Advanced Troubleshooting

### Enable Debug Mode

For developers troubleshooting:
```javascript
1. Open extension
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for error messages
5. Report to GitHub with screenshots
```

### Check Network Requests

```
1. F12 > Network tab
2. Refresh extension
3. Look for failed requests
4. Check status codes
5. Report issues found
```

---

## 📞 Still Need Help?

If none of these solutions work:

1. **Report Bug**
   - Go to [GitHub Issues](https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro/issues)
   - Click "New Issue"
   - Include:
     - Browser version
     - Extension version
     - Steps to reproduce
     - Screenshot of error
     - Console errors (if any)

2. **Email Support**
   - Email: sahilkumarsahoo001@gmail.com
   - Subject: "Keka Extension Issue"
   - Describe problem in detail
   - Include screenshots

3. **Check for Updates**
   - New version might fix your issue
   - edge://extensions/
   - Check for updates

---

## ✅ Prevention Tips

### Avoid Common Issues

1. ✅ Keep extension updated
2. ✅ Always use latest Keka page
3. ✅ Don't modify extension files manually
4. ✅ Clear cache periodically
5. ✅ Report bugs early

### Best Practices

- Use extension on official Keka domain only
- Keep browser updated
- Enable all required permissions
- Regular backups via Excel export

---

[← Back to Wiki Home](Home.md)
