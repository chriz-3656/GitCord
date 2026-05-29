-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "description" TEXT,
    "techStack" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active Development',
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "discordId" TEXT,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "commits" INTEGER NOT NULL DEFAULT 0,
    "prs" INTEGER NOT NULL DEFAULT 0,
    "issues" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "mergedPrs" INTEGER NOT NULL DEFAULT 0,
    "helpfulReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectInteraction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFollower" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectFollower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowcaseComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContributorAchievement" (
    "id" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContributorAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAnalytics" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "forkCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "contributorId" TEXT NOT NULL,
    "silentMode" BOOLEAN NOT NULL DEFAULT false,
    "pingOnRelease" BOOLEAN NOT NULL DEFAULT true,
    "pingOnMention" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'gemini',
    "ttl" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AICache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildAISettings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "primaryProvider" TEXT NOT NULL DEFAULT 'gemini',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuildAISettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_guildId_fullName_key" ON "Repository"("guildId", "fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_discordId_key" ON "Contributor"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_username_key" ON "Contributor"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInteraction_type_repositoryId_contributorId_key" ON "ProjectInteraction"("type", "repositoryId", "contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFollower_repositoryId_contributorId_key" ON "ProjectFollower"("repositoryId", "contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ContributorAchievement_contributorId_achievementId_key" ON "ContributorAchievement"("contributorId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAnalytics_repositoryId_date_key" ON "ProjectAnalytics"("repositoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_contributorId_key" ON "NotificationPreference"("contributorId");

-- CreateIndex
CREATE UNIQUE INDEX "AICache_cacheKey_key" ON "AICache"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "GuildAISettings_guildId_key" ON "GuildAISettings"("guildId");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInteraction" ADD CONSTRAINT "ProjectInteraction_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInteraction" ADD CONSTRAINT "ProjectInteraction_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFollower" ADD CONSTRAINT "ProjectFollower_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFollower" ADD CONSTRAINT "ProjectFollower_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseComment" ADD CONSTRAINT "ShowcaseComment_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseComment" ADD CONSTRAINT "ShowcaseComment_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAchievement" ADD CONSTRAINT "ContributorAchievement_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContributorAchievement" ADD CONSTRAINT "ContributorAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAnalytics" ADD CONSTRAINT "ProjectAnalytics_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
