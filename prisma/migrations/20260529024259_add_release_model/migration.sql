-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "tagName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorUrl" TEXT,
    "authorAvatar" TEXT,
    "releasedAt" TIMESTAMP(3) NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "isPrerelease" BOOLEAN NOT NULL DEFAULT false,
    "assets" JSONB NOT NULL DEFAULT '[]',
    "releaseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Release_releaseId_key" ON "Release"("releaseId");

-- CreateIndex
CREATE INDEX "Release_repoId_idx" ON "Release"("repoId");

-- CreateIndex
CREATE INDEX "Release_releasedAt_idx" ON "Release"("releasedAt");
