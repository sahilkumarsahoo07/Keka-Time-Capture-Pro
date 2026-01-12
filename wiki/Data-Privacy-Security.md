# Data Privacy & Security

Your privacy and data security are our top priorities.

---

## 🔒 Privacy Commitment

**Keka Time Capture Pro** is designed with privacy-first principles:

- ✅ **100% Local Storage** - All data stays on your device
- ✅ **No External Servers** - Zero data transmission
- ✅ **No Tracking** - We don't monitor your usage
- ✅ **No Analytics** - No telemetry or statistics collection
- ✅ **Open Source Code** - Full transparency

---

## 💾 Where Your Data is Stored

### Local Browser Storage

All extension data is stored in:
```
Chrome Storage API (Local)
Location: Your browser's local database
Access: Only this extension, only on your device
```

### What Data is Stored

1. **Attendance Records**
   - Daily punch times
   - Hours worked
   - Break times
   - Status information

2. **Settings**
   - Theme preference
   - Work hours configuration
   - Notification settings
   - Display preferences

3. **Achievements**
   - Unlocked badges
   - Streak counters
   - Milestones reached

### What is NOT Stored

- ❌ Your Keka password
- ❌ Personal identification info
- ❌ Salary information
- ❌ Colleague data
- ❌ Company details beyond what's in Keka

---

## 🔐 How Data is Protected

### Browser Security

- Data encrypted by browser's built-in security
- Same protection as browser passwords/cookies
- Isolated from other extensions
- No cross-extension access

### No Network Transmission

```
Extension ➜ Reads Keka Page ➜ Stores Locally

NO external servers involved!
```

### Permission Model

The extension ONLY requests:
- `activeTab` - Read Keka page data
- `storage` - Save settings locally
- `notifications` - Show alerts
- `alarms` - Schedule updates

No permissions for:
- ❌ Reading other websites
- ❌ Accessing files
- ❌ Network requests to external servers

---

## 👁️ What Can the Extension See?

### On Keka Pages

The extension reads:
- Your attendance logs
- Punch times
- Work hours
- Leave records
- **Only from the Keka attendance page you're viewing**

### What It Cannot See

- ❌ Emails or messages
- ❌ Other browser tabs
- ❌ Files on your computer
- ❌ Passwords or credentials
- ❌ Banking/financial info
- ❌ Any non-Keka websites

---

## 🔍 Data Access

### Who Can Access Your Data?

**Only You**
- Data stored in YOUR browser
- On YOUR device
- Only accessible when YOU'RE logged in

**Not Accessible To:**
- ❌ Extension developer
- ❌ Microsoft/Edge
- ❌ Your company IT
- ❌ Other users
- ❌ Third parties

### Viewing Your Data

To see what's stored:
```
1. Right-click extension icon
2. Select "Inspect"
3. Go to "Application" tab
4. Find "Storage" > "Local Storage"
5. View stored data
```

---

## 🗑️ Data Deletion

### Automatic Deletion

Data is deleted when you:
- Uninstall the extension
- Clear browser data
- Reset extension in Settings

### Manual Deletion

To delete all data:
```
1. Open extension
2. Settings tab
3. Scroll to "Advanced"
4. Click "Clear All Data"
5. Confirm deletion
```

To delete browser data:
```
1. Edge settings
2. Privacy > Clear browsing data
3. Select "Site data"
4. Choose time range
5. Click "Clear now"
```

---

## 📜 Data Retention

### How Long Data is Kept

- **As long as extension is installed**
- No automatic expiration
- You control deletion

### Exports

When you export to Excel/CSV:
- File saved to your Downloads folder
- Under YOUR control
- Not accessible to extension after export

---

## 🌐 Network Activity

### Zero External Connections

The extension:
- ❌ Does NOT connect to any external servers
- ❌ Does NOT send data anywhere
- ❌ Does NOT make API calls to third parties
- ✅ Only reads from Keka (which you're already logged into)

### Verifiable

You can verify this:
```
1. F12 (Developer Tools)
2. Network tab
3. Use extension
4. See: NO external requests
```

---

## 🛡️ Security Best Practices

### For Users

1. **Keep Extension Updated**
   - Latest version has security fixes
   - Auto-updates from Microsoft Edge

2. **Download from Official Store**
   - Only install from Edge Add-ons
   - Avoid unofficial sources

3. **Regular Backups**
   - Export data monthly
   - Keep local copies

### For Companies

1. **Review Permissions**
   - IT can audit extension permissions
   - No excessive access requested

2. **Whitelist in Firewall**
   - No special rules needed
   - Works behind corporate firewall

---

## 🔒 Compliance

### GDPR Compliance

- ✅ No personal data collection
- ✅ No data processing
- ✅ No third-party sharing
- ✅ User has full control
- ✅ Easy data deletion

### Company Policies

- Works within corporate security
- No data exfiltration risk
- All data stays on-premise (in browser)

---

## ⚠️ What to Watch For

### Legitimate Extension Behavior

✅ Reads Keka page when you open it  
✅ Stores data in browser storage  
✅ Shows notifications  
✅ Updates every 30 seconds  

### Red Flags (NOT Normal)

🚫 Asks for Keka password  
🚫 Requests credit card info  
🚫 Shows ads or pop-ups  
🚫 Redirects to other websites  
🚫 Requests unusual permissions  

**If you see any red flags, uninstall immediately and report!**

---

## 🔐 Source Code Transparency

### View the Code

The extension code is available on GitHub:
```
https://github.com/sahilkumarsahoo07/Keka-Time-Capture-Pro
```

You can:
- Review all source code
- Audit for privacy/security
- Verify no hidden tracking
- See exactly what extension does

### Copyright Protection

While code is viewable:
- Copyright © 2026 Sahil Kumar Sahoo
- Permission required for modification
- Contact: sahilkumarsahoo001@gmail.com

---

## 📧 Reporting Security Issues

Found a security concern?

**DO NOT post publicly!**

Instead:
1. Email: sahilkumarsahoo001@gmail.com
2. Subject: "SECURITY: [brief description]"
3. Include:
   - Detailed description
   - Steps to reproduce
   - Potential impact
4. Wait for response

We'll:
- Acknowledge within 24 hours
- Investigate immediately
- Fix and release patch
- Credit you (if desired)

---

## ❓ Privacy FAQ

### Does it send data to the developer?
**No.** All data stays on your device.

### Can my company see my extension data?
**No.** Data is in browser storage, not on network.

### What if I use a shared computer?
Data is tied to browser profile. Use separate profiles for privacy.

### Can extension access my bank account?
**No.** It can only read Keka attendance page.

### Is my Keka password safe?
**Yes.** Extension never touches passwords. Uses existing Keka session.

---

## 📞 Privacy Questions?

Contact us:
- **Email**: sahilkumarsahoo001@gmail.com
- **Subject**: "Privacy Question"

---

[← Back to Wiki Home](Home.md)
