# 📦 Manual Cloud Backup Guide

This guide explains how to store your PULSE data on the cloud service of your choice.

---

## 🎯 Philosophy: "Full User Control"

PULSE **does not** connect directly to third-party cloud services. This means:
- ✅ You have full ownership of your data.
- ✅ No API keys or account registrations are required.
- ✅ Your data remains 100% private.
- ✅ It works with **any** cloud service provider.

---

## 📁 Step 1: Exporting Data

1. Open **PULSE**.
2. Navigate to the **Analytics Vault** (Stats button in the bottom navigation).
3. Select **"Data Operations"**.
4. Click on **"Export TOON"** or **"Export JSON"**.
5. Choose your desired save location.

---

## ☁️ Step 2: Saving to the Cloud

### Google Drive
1. Open your `Google Drive` folder on your computer.
2. Create a folder named `PULSE Backups`.
3. Save or move the exported file there.
4. It will sync automatically.

### Dropbox
1. Open your `Dropbox` folder.
2. Create a folder named `PULSE Backups`.
3. Save or move the exported file there.

### OneDrive
1. Open your `OneDrive` folder.
2. Create a folder named `PULSE Backups`.
3. Save or move the exported file there.

### Other Options
- **iCloud Drive** (macOS)
- **Nextcloud** (Self-hosted)
- **Syncthing** (P2P)
- Any synced folder on your system!

---

## 📥 Step 3: Restoring Data

1. Ensure the backup file is available on your computer.
2. Open **PULSE**.
3. Go to **Analytics Vault** > **Data Operations**.
4. Click on **"Import"**.
5. Select your backup file to restore.

---

## 🔄 Automatic Workflow (Power User Tip)

For a seamless workflow, you can save your exports directly into a cloud-synced folder:

### Windows
When exporting, navigate to:
```
C:\Users\[Username]\Google Drive\PULSE Backups\
```

### Naming Convention
We recommend including the date in your filename for easier versioning:
```
pulse_backup_2026-01-28.toon
```

---

## 📋 Backup Frequency Recommendations

| Usage | Recommended Frequency |
|-------|----------------------|
| Daily Heavy Use | Weekly Backup |
| Casual Use | Monthly Backup |
| Before Updates | **ALWAYS!** |

---

## 🔒 Security & Privacy

- **Transparency:** TOON/JSON files are **plain text**. You can open and read them with any text editor.
- **Encryption:** If you require extra security, compress the file using **7-Zip** (or similar tools) with a password before uploading.
- **Transmission:** Most major cloud providers encrypt your files during transfer and storage.

---

*Last Updated: 2026-01-28*