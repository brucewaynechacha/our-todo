# 🎯 Our Daily Targets • Me & Her (Telegram Channel Database)

A modern, tactile daily goal tracking application built with **React JS** and styled in **Claymorphism** format. Designed for you and your friend/partner to set daily targets, keep each other accountable, attach resource links, toggle between light and dark clay themes, browse all targets chronologically by date, and **store all todos in a Telegram Channel in JSON format**.

---

## ✨ Features

- **✈️ Telegram Channel as a Database (JSON Storage)**:
  - Stores all targets directly in your private or public **Telegram Channel** in structured **JSON format**.
  - **Live Action Feed**: Every time a target is created, completed, updated, or deleted, a structured JSON transaction log message is posted to the channel.
  - **Master Database State**: Continuously maintains and updates an authoritative master JSON message pinned at the top of the channel (`OUR_TODO_DATABASE_MASTER`).
  - **Cross-Device Sync & Realtime**: Changes made by either person automatically sync across devices by reading from the channel.
  - **In-App Telegram Setup Dialog**: Connect or test your Bot Token and Channel ID right inside the UI without touching configuration files.
  - **Zero-Config Local Fallback**: Works offline immediately with local storage until you connect your Telegram channel.
- **Split-Screen Accountability**:
  - **Left Section**: "My Targets" (Pastel Indigo/Blue clay aesthetic).
  - **Right Section**: "Her Targets" (Pastel Rose/Coral clay aesthetic).
  - Customizable names: Click the edit pencil next to the titles to personalize names (e.g. "Bruce" & "Selina").
- **📅 Dedicated "All by Date" Section**:
  - Switch to the **"All by Date"** view via the header navigation to view all todos organized chronologically by date.
  - Each date group displays its completion progress and side-by-side columns for both users.
  - Filter by person (**Everyone**, **Me only**, **Her only**), completion status (**All**, **Active**, **Completed**), and sort order (**Newest First** / **Oldest First**).
- **🔍 Real-Time Search**:
  - Instant live search bar accessible in the header and in the All by Date section.
  - Searches across target titles, notes, attached link URLs, link titles, and owners with live count feedback and a 1-click clear button.
- **📅 Today's Targets & Next Day Planning**:
  - **Focused Daily View**: Shows only today's targets by default so you stay focused on what needs to be accomplished today.
  - **Next Day (Tomorrow) Scheduling**: In the "+ New Target" form, select **"Next Day ⏭️"** to plan ahead for tomorrow.
  - **Day View Switcher**: Easily switch between **"Today"** and **"Next Day"** in the header to review upcoming commitments.
  - **In-place Rescheduling**: Edit any target to move it between Today and Tomorrow with one click.
- **🌙 Claymorphism Dark Mode**:
  - Deep midnight clay surfaces with inner glows, dark soft drop-shadows, and neon pastel accents.
  - One-click Light/Dark toggle in the header, persisted across browser reloads.
- **Link Attachment Functionality**:
  - Add links directly to any target (e.g., GitHub PRs, Figma designs, YouTube course videos, research articles, Notion pages).
  - Clean domain chip with one-click copy and safe external link opening (`target="_blank"`).
- **Claymorphism UI**:
  - 3D tactile marshmallow clay cards with outer soft drop-shadows and inner light/dark embossing.
  - Squeezable clay buttons with press-down animations.
  - Clay checkboxes with bouncy checkmarks.
  - Clay inset input wells for comfortable typing.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✈️ Telegram Channel Database Setup (1 Minute)

### Step 1: Create a Bot via BotFather
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, choose a display name and username for your bot.
3. BotFather will provide an **HTTP API Token** (e.g., `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`).

### Step 2: Create a Telegram Channel
1. In Telegram, create a new Channel (e.g., `Our Daily Targets`).
2. Add your friend/partner to the channel.

### Step 3: Add Bot as Administrator
1. In your Channel Settings &gt; **Administrators** &gt; **Add Administrator**.
2. Search for your bot's username and add it.
3. Grant **Post Messages**, **Edit Messages**, and **Pin Messages** permissions.

### Step 4: Connect in the App
1. In the website header, click the **"Connect Telegram"** button.
2. Enter your **Bot Token** and **Channel Username** (e.g. `@my_targets_channel`) or Channel ID (e.g. `-1001234567890`).
3. Click **"Save & Connect Telegram DB"**.
4. The bot will automatically test the connection, sync existing targets in JSON format, and pin the master database message in your channel!

---

### 📦 How the Data is Stored in Telegram

1. **Master Database Message (Pinned in Channel)**:
   ```json
   {
     "_db": "OUR_DAILY_TARGETS_DATABASE",
     "updatedAt": "2026-10-01T09:35:00.000Z",
     "total": 4,
     "completed": 2,
     "todos": [
       {
         "$id": "tg-1",
         "title": "Complete frontend responsive layout",
         "description": "Verify 2-column split on desktop",
         "linkUrl": "https://github.com",
         "linkTitle": "GitHub Repo",
         "isCompleted": true,
         "owner": "me",
         "targetDate": "2026-10-01",
         "createdAt": "2026-10-01T08:35:00.000Z"
       }
     ]
   }
   ```

2. **Transaction Action Logs (Feed in Channel)**:
   Whenever a target is created or completed, a readable JSON message is sent to the channel:
   ```json
   {
     "action": "CREATE",
     "timestamp": "2026-10-01T09:35:00.000Z",
     "todo": {
       "$id": "tg-1727775300",
       "title": "New daily target",
       "owner": "her",
       "isCompleted": false,
       "targetDate": "2026-10-01"
     }
   }
   ```
