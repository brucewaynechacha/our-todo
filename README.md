# 🎯 Our Daily Targets • Me & Her (Telegram Channel Database)

A modern, tactile daily goal tracking application built with **React JS** and styled in **Claymorphism** format. Designed for you and your friend/partner to set daily targets, keep each other accountable, attach resource links, toggle between light and dark clay themes, browse all targets chronologically by date, and **store/fetch all todos directly from a Telegram Channel in JSON format (Zero Local Storage for Todos)**.

---

## ✨ Features

- **✈️ Pure Telegram Channel Database (Zero Local Storage for Todos)**:
  - **Always Fetches from Telegram Channel**: Todos are fetched directly from your Telegram Channel using the Telegram Bot API. Zero todos are stored in `localStorage`.
  - **📌 Exactly 1 Message Per Day (Updated In-Place)**:
    - The bot posts only **ONE message for the day** containing the formatted dual checklist and embedded JSON.
    - Every action (adding, checking/completing, editing, or deleting a todo) **edits that exact message in-place** (`editMessageText`).
    - **No spam**: The channel stays completely clean with exactly 1 live-updating message per calendar day!
  - **Multi-Day Continuity**: Targets scheduled for the Next Day (Tomorrow) are included in the daily JSON database.
  - **Instant 1-Click Sync**: A dedicated **"Sync"** button in the header allows fetching live updates directly from Telegram at any second.
  - **Continuous Polling**: Automatically polls the Telegram channel pinned message in the background to keep both users in sync.
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

## ✈️ Connecting Your Telegram Channel

1. **Create your Bot**: Message `@BotFather` on Telegram -> `/newbot` -> get your Bot Token.
2. **Create your Channel**: Create a public or private Telegram Channel for you and your friend.
3. **Add Bot as Admin**: In Channel Settings &gt; Administrators &gt; Add your bot with *Post Messages*, *Edit Messages*, and *Pin Messages* permissions.
4. **Connect in App**: Click **"Connect Telegram"** in the website header, enter the Bot Token and Channel Username (`@your_channel`) or ID, and click **"Save & Connect Telegram DB"**.

---

### 📦 Single Daily Message Format in Telegram

For each calendar day, there is only 1 message posted and updated in place:

```
🎯 Daily Targets • 2026-10-01
📊 Progress: 2/3 completed (67%)

👤 Me:
✅ Complete project specs
⏳ Review architecture

👤 Her:
✅ Design clay tokens

⏭️ Next Day Plan (1):
• Next day plan (Me)

📦 Database JSON:
{
  "_db": "OUR_DAILY_TARGETS",
  "date": "2026-10-01",
  "updatedAt": "2026-10-01T15:20:00.000Z",
  "todos": [ ... ]
}
```
