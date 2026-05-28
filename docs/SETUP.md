# 🛠️ Detailed Setup Guide

Follow these steps to get GitCord running in your own environment.

## 1. Discord Developer Portal
1. Create a new Application at [Discord Developers](https://discord.com/developers/applications).
2. Go to the **Bot** tab:
    - Enable **Message Content Intent**.
    - Reset/Copy your **Token**.
3. Go to the **OAuth2** tab:
    - Copy your **Client ID**.

## 2. Infrastructure Setup
1. **Docker:** Ensure Docker is running.
2. **PostgreSQL:** Start the database container:
   ```bash
   docker-compose up -d
   ```
3. **Environment:**
   ```bash
   cp .env.example .env
   # Fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, and GEMINI_API_KEY
   ```

## 3. Database Initialization
Run Prisma to create the necessary tables in your PostgreSQL container:
```bash
npx prisma db push
```

## 4. Launching the Bot
```bash
npm install
npm run dev
```

## 5. GitHub Configuration
1. In your GitHub Repo -> **Settings** -> **Webhooks** -> **Add Webhook**.
2. **Payload URL:** `http://YOUR_IP:3000/webhooks/github`
3. **Content type:** `application/json`
4. **Secret:** Choose a strong secret.
5. **Events:** Pick Push, Pull Request, Issues, and Stars.
6. Use `/register-repo` in Discord to finalize the link!
