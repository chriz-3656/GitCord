# 🚀 GitCord Features

GitCord is designed to be more than just a relay; it's a full-spectrum developer ecosystem.

## 1. Multi-Tenant Webhook Relay
- **Dynamic Routing:** Register multiple repositories to different Discord channels.
- **Zod Validation:** Every incoming payload is validated against strict schemas to prevent errors.
- **Professional Embeds:** Compact, readable, and aesthetic Discord messages for:
    - `Push`: Includes commit IDs, messages, and comparison links.
    - `Pull Request`: Tracks opening, merging, and closing.
    - `Issues`: Monitors labels and status changes.
    - `Stars`: Instant "⭐" notifications for new stargazers.

## 2. 🧠 AI Intelligence (Google Gemini)
- **PR Summarization:** Large Pull Requests are automatically summarized into 2 concise sentences, saving reviewers time.
- **Issue Analysis:** AI analyzes new issues and suggests potential fixes or next steps based on the description.

## 3. 🛡️ DevSecOps Security Monitor
- **Secret Scanning:** Real-time regex-based scanning of all incoming payloads for:
    - `.env` files and environment keys.
    - AWS Access Keys and generic API keys.
    - Private keys (RSA/EC/PGP).
- **Anomaly Detection:** Immediate alerts for high-risk actions like **Force Pushes** or **Branch Deletions**.

## 4. 🏆 Community & Contributor Tracking
- **Automatic Stats:** Every commit and PR is attributed to a user in the database.
- **Global Leaderboard:** Rank developers across your entire community.
- **Project Showcase:** A dedicated command for members to share their work with rich previews.

## 5. 📊 Live Dashboard
- **HTML5 Panel:** A high-performance, dark-mode web interface.
- **Real-time Monitoring:** System status and active repository counts.
- **Public Leaderboard:** View contributor rankings outside of Discord.
