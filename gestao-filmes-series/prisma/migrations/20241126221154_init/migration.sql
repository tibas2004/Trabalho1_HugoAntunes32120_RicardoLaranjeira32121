-- CreateTable
CREATE TABLE "Users" (
    "UserId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Movies" (
    "MovieId" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Genre" TEXT NOT NULL,
    "ReleaseDate" TIMESTAMP(3) NOT NULL,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movies_pkey" PRIMARY KEY ("MovieId")
);

-- CreateTable
CREATE TABLE "Series" (
    "SeriesId" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Genre" TEXT NOT NULL,
    "ReleaseDate" TIMESTAMP(3) NOT NULL,
    "Description" TEXT,
    "SeasonsCount" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("SeriesId")
);

-- CreateTable
CREATE TABLE "MovieRatings" (
    "MovieRatingId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "MovieId" INTEGER NOT NULL,
    "Rating" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieRatings_pkey" PRIMARY KEY ("MovieRatingId")
);

-- CreateTable
CREATE TABLE "SeriesRatings" (
    "SeriesRatingId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SeriesId" INTEGER NOT NULL,
    "Rating" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesRatings_pkey" PRIMARY KEY ("SeriesRatingId")
);

-- CreateTable
CREATE TABLE "MovieComments" (
    "MovieCommentId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "MovieId" INTEGER NOT NULL,
    "CommentText" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieComments_pkey" PRIMARY KEY ("MovieCommentId")
);

-- CreateTable
CREATE TABLE "SeriesComments" (
    "SeriesCommentId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SeriesId" INTEGER NOT NULL,
    "CommentText" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesComments_pkey" PRIMARY KEY ("SeriesCommentId")
);

-- CreateTable
CREATE TABLE "MovieNotes" (
    "NoteId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "MovieId" INTEGER NOT NULL,
    "NoteText" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieNotes_pkey" PRIMARY KEY ("NoteId")
);

-- CreateTable
CREATE TABLE "SeriesNotes" (
    "NoteId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "SeriesId" INTEGER NOT NULL,
    "NoteText" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesNotes_pkey" PRIMARY KEY ("NoteId")
);

-- CreateTable
CREATE TABLE "Scheduling" (
    "EventId" SERIAL NOT NULL,
    "UserId" INTEGER NOT NULL,
    "MovieId" INTEGER,
    "SeriesId" INTEGER,
    "EventDate" TIMESTAMP(3) NOT NULL,
    "Note" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheduling_pkey" PRIMARY KEY ("EventId")
);

-- CreateTable
CREATE TABLE "Shares" (
    "ShareId" SERIAL NOT NULL,
    "SenderUserId" INTEGER NOT NULL,
    "RecipientUserId" INTEGER NOT NULL,
    "MovieId" INTEGER,
    "SeriesId" INTEGER,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shares_pkey" PRIMARY KEY ("ShareId")
);

-- CreateTable
CREATE TABLE "MovieCategories" (
    "MovieCategoryId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieCategories_pkey" PRIMARY KEY ("MovieCategoryId")
);

-- CreateTable
CREATE TABLE "SeriesCategories" (
    "SeriesCategoryId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesCategories_pkey" PRIMARY KEY ("SeriesCategoryId")
);

-- CreateTable
CREATE TABLE "MovieCategoryRelations" (
    "MovieCategoryRelationId" SERIAL NOT NULL,
    "MovieId" INTEGER NOT NULL,
    "MovieCategoryId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieCategoryRelations_pkey" PRIMARY KEY ("MovieCategoryRelationId")
);

-- CreateTable
CREATE TABLE "SeriesCategoryRelations" (
    "SeriesCategoryRelationId" SERIAL NOT NULL,
    "SeriesId" INTEGER NOT NULL,
    "SeriesCategoryId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriesCategoryRelations_pkey" PRIMARY KEY ("SeriesCategoryRelationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "MovieCategories_Name_key" ON "MovieCategories"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "SeriesCategories_Name_key" ON "SeriesCategories"("Name");

-- AddForeignKey
ALTER TABLE "MovieRatings" ADD CONSTRAINT "MovieRatings_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieRatings" ADD CONSTRAINT "MovieRatings_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesRatings" ADD CONSTRAINT "SeriesRatings_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesRatings" ADD CONSTRAINT "SeriesRatings_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieComments" ADD CONSTRAINT "MovieComments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieComments" ADD CONSTRAINT "MovieComments_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesComments" ADD CONSTRAINT "SeriesComments_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesComments" ADD CONSTRAINT "SeriesComments_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieNotes" ADD CONSTRAINT "MovieNotes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieNotes" ADD CONSTRAINT "MovieNotes_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesNotes" ADD CONSTRAINT "SeriesNotes_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesNotes" ADD CONSTRAINT "SeriesNotes_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling" ADD CONSTRAINT "Scheduling_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling" ADD CONSTRAINT "Scheduling_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scheduling" ADD CONSTRAINT "Scheduling_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shares" ADD CONSTRAINT "Shares_SenderUserId_fkey" FOREIGN KEY ("SenderUserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shares" ADD CONSTRAINT "Shares_RecipientUserId_fkey" FOREIGN KEY ("RecipientUserId") REFERENCES "Users"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shares" ADD CONSTRAINT "Shares_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shares" ADD CONSTRAINT "Shares_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCategoryRelations" ADD CONSTRAINT "MovieCategoryRelations_MovieId_fkey" FOREIGN KEY ("MovieId") REFERENCES "Movies"("MovieId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieCategoryRelations" ADD CONSTRAINT "MovieCategoryRelations_MovieCategoryId_fkey" FOREIGN KEY ("MovieCategoryId") REFERENCES "MovieCategories"("MovieCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesCategoryRelations" ADD CONSTRAINT "SeriesCategoryRelations_SeriesId_fkey" FOREIGN KEY ("SeriesId") REFERENCES "Series"("SeriesId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriesCategoryRelations" ADD CONSTRAINT "SeriesCategoryRelations_SeriesCategoryId_fkey" FOREIGN KEY ("SeriesCategoryId") REFERENCES "SeriesCategories"("SeriesCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
