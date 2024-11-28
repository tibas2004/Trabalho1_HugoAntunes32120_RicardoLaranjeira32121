// Importar dependências
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Inicializar o Express e o Prisma Client
const app = express();
const prisma = new PrismaClient();

// Configurar middlewares
app.use(cors());
app.use(bodyParser.json());

// Função para formatar datas no formato "DD-MM-YYYY"
function formatPortugueseDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Função para formatar datas e horas no formato "DD-MM-YYYY HH:mm:ss"
function formatPortugueseDateTime(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

//Rotas

// Rota inicial para testar o servidor
app.get("/", (req, res) => {
  res.send("A API de Gestão de Filmes e Séries está a funcionar!");
});

//Utilizadores

// Criar um utilizador
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await prisma.users.create({
      data: {
        Name: name,
        Email: email,
        Password: password,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter todos os utilizadores
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.users.findMany();

    const formattedUsers = users.map(user => ({
      ...user,
      CreatedAt: formatPortugueseDateTime(user.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(user.UpdatedAt),
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3 - Obter um utilizador por ID
app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { UserId: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    user.CreatedAt = formatPortugueseDateTime(user.CreatedAt);
    user.UpdatedAt = formatPortugueseDateTime(user.UpdatedAt);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um utilizador
app.put("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await prisma.users.update({
      where: { UserId: parseInt(userId) },
      data: {
        Name: name,
        Email: email,
        Password: password,
      },
    });

    updatedUser.CreatedAt = formatPortugueseDateTime(updatedUser.CreatedAt);
    updatedUser.UpdatedAt = formatPortugueseDateTime(updatedUser.UpdatedAt);

    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ error: "Utilizador não encontrado" });
  }
});

// Eliminar um utilizador
app.delete("/users/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await prisma.users.delete({
      where: { UserId: parseInt(userId) },
    });
    res.json({ message: "Utilizador eliminado com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Utilizador não encontrado" });
  }
});

//Filmes

// Obter todos os filmes
app.get("/movies", async (req, res) => {
  try {
    const movies = await prisma.movies.findMany();

    const formattedMovies = movies.map(movie => ({
      ...movie,
      ReleaseDate: formatPortugueseDate(movie.ReleaseDate),
      CreatedAt: formatPortugueseDateTime(movie.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(movie.UpdatedAt),
    }));

    res.json(formattedMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um filme por ID
app.get("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    const movie = await prisma.movies.findUnique({
      where: { MovieId: parseInt(movieId) },
    });

    if (!movie) {
      return res.status(404).json({ error: "Filme não encontrado" });
    }

    movie.ReleaseDate = formatPortugueseDate(movie.ReleaseDate);
    movie.CreatedAt = formatPortugueseDateTime(movie.CreatedAt);
    movie.UpdatedAt = formatPortugueseDateTime(movie.UpdatedAt);

    res.json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar um filme
app.post("/movies", async (req, res) => {
  const { title, genre, releaseDate, description, categoryIds } = req.body;

  try {
    // Verificar se as categorias fornecidas existem
    if (categoryIds && categoryIds.length > 0) {
      const categoriesExist = await prisma.movieCategories.findMany({
        where: { MovieCategoryId: { in: categoryIds } },
        select: { MovieCategoryId: true },
      });

      const existingCategoryIds = categoriesExist.map(c => c.MovieCategoryId);

      if (existingCategoryIds.length !== categoryIds.length) {
        return res.status(400).json({ error: "Uma ou mais categorias fornecidas não existem." });
      }
    }

    // Criar o filme
    const newMovie = await prisma.movies.create({
      data: {
        Title: title,
        Genre: genre,
        ReleaseDate: new Date(releaseDate),
        Description: description || null,
        MovieCategoryRelations: categoryIds
          ? {
              create: categoryIds.map(categoryId => ({
                MovieCategoryId: categoryId,
              })),
            }
          : undefined, // Cria as relações com as categorias, se fornecidas
      },
    });

    res.status(201).json(newMovie);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar o filme: " + error.message });
  }
});

// Atualizar um filme
app.put("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const { title, genre, releaseDate, description } = req.body;

  try {
    // Atualização parcial: só atualiza os campos fornecidos no corpo da requisição
    const updatedMovie = await prisma.movies.update({
      where: { MovieId: parseInt(movieId) },
      data: {
        Title: title || undefined,
        Genre: genre || undefined,
        ReleaseDate: releaseDate ? new Date(releaseDate) : undefined,
        Description: description || undefined,
      },
    });

    res.json({
      ...updatedMovie,
      ReleaseDate: formatPortugueseDate(updatedMovie.ReleaseDate),
      CreatedAt: formatPortugueseDateTime(updatedMovie.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedMovie.UpdatedAt),
    });
  } catch (error) {
    res.status(404).json({ error: "Filme não encontrado ou erro ao atualizar" });
  }
});

// Eliminar um filme
app.delete("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;

  try {
    await prisma.movies.delete({
      where: { MovieId: parseInt(movieId) },
    });
    res.json({ message: "Filme eliminado com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Filme não encontrado" });
  }
});

//Séries

// Obter todas as séries
app.get("/series", async (req, res) => {
  try {
    const seriesList = await prisma.series.findMany();

    const formattedSeries = seriesList.map(series => ({
      ...series,
      ReleaseDate: formatPortugueseDate(series.ReleaseDate),
      CreatedAt: formatPortugueseDateTime(series.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(series.UpdatedAt),
    }));

    res.json(formattedSeries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter uma série por ID
app.get("/series/:seriesId", async (req, res) => {
  const { seriesId } = req.params;

  try {
    const series = await prisma.series.findUnique({
      where: { SeriesId: parseInt(seriesId) },
    });

    if (!series) {
      return res.status(404).json({ error: "Série não encontrada" });
    }

    series.ReleaseDate = formatPortugueseDate(series.ReleaseDate);
    series.CreatedAt = formatPortugueseDateTime(series.CreatedAt);
    series.UpdatedAt = formatPortugueseDateTime(series.UpdatedAt);

    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma série
app.post("/series", async (req, res) => {
  const { title, genre, releaseDate, description, seasonsCount, categoryIds } = req.body;

  try {
    // Verificar se as categorias fornecidas existem
    if (categoryIds && categoryIds.length > 0) {
      const categoriesExist = await prisma.seriesCategories.findMany({
        where: { SeriesCategoryId: { in: categoryIds } },
        select: { SeriesCategoryId: true },
      });

      const existingCategoryIds = categoriesExist.map(c => c.SeriesCategoryId);

      if (existingCategoryIds.length !== categoryIds.length) {
        return res.status(400).json({ error: "Uma ou mais categorias fornecidas não existem." });
      }
    }

    // Criar a série
    const newSeries = await prisma.series.create({
      data: {
        Title: title,
        Genre: genre,
        ReleaseDate: new Date(releaseDate),
        Description: description || null,
        SeasonsCount: seasonsCount,
        SeriesCategoryRelations: categoryIds
          ? {
              create: categoryIds.map(categoryId => ({
                SeriesCategoryId: categoryId,
              })),
            }
          : undefined, // Cria as relações com as categorias, se fornecidas
      },
    });

    res.status(201).json(newSeries);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar a série: " + error.message });
  }
});

// Atualizar uma série
app.put("/series/:seriesId", async (req, res) => {
  const { seriesId } = req.params;
  const { title, genre, releaseDate, description, seasonsCount } = req.body;

  try {
    // Atualização parcial: só atualiza os campos fornecidos no corpo da requisição
    const updatedSeries = await prisma.series.update({
      where: { SeriesId: parseInt(seriesId) },
      data: {
        Title: title || undefined,
        Genre: genre || undefined,
        ReleaseDate: releaseDate ? new Date(releaseDate) : undefined,
        Description: description || undefined,
        SeasonsCount: seasonsCount || undefined,
      },
    });

    res.json({
      ...updatedSeries,
      ReleaseDate: formatPortugueseDate(updatedSeries.ReleaseDate),
      CreatedAt: formatPortugueseDateTime(updatedSeries.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedSeries.UpdatedAt),
    });
  } catch (error) {
    res.status(404).json({ error: "Série não encontrada ou erro ao atualizar" });
  }
});

// Eliminar uma série
app.delete("/series/:seriesId", async (req, res) => {
  const { seriesId } = req.params;

  try {
    await prisma.series.delete({
      where: { SeriesId: parseInt(seriesId) },
    });
    res.json({ message: "Série eliminada com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Série não encontrada" });
  }
});

//Classificações

// Adicionar classificação a um filme
app.post("/movies/:movieId/rating", async (req, res) => {
  const { movieId } = req.params;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "O rating deve estar entre 0 e 10." });
  }

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const movie = await prisma.movies.findUnique({ where: { MovieId: parseInt(movieId) } });

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });

    const newRating = await prisma.movieRatings.create({
      data: {
        UserId: parseInt(userId),
        MovieId: parseInt(movieId),
        Rating: parseInt(rating),
      },
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar classificação de um filme
app.put("/movies/:movieId/rating/:ratingId", async (req, res) => {
  const { ratingId } = req.params;
  const { rating } = req.body;

  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "O rating deve estar entre 0 e 10." });
  }

  try {
    const updatedRating = await prisma.movieRatings.update({
      where: { MovieRatingId: parseInt(ratingId) },
      data: { Rating: parseInt(rating) },
    });

    res.json(updatedRating);
  } catch (error) {
    res.status(404).json({ error: "Classificação não encontrada" });
  }
});


// Listar classificações de um filme
app.get("/movies/:movieId/ratings", async (req, res) => {
  const { movieId } = req.params;

  try {
    const ratings = await prisma.movieRatings.findMany({
      where: { MovieId: parseInt(movieId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    res.json(
      ratings.map(rating => ({
        ...rating,
        CreatedAt: formatPortugueseDateTime(rating.CreatedAt),
        UpdatedAt: formatPortugueseDateTime(rating.UpdatedAt),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter classificação específica de um filme
app.get("/movies/:movieId/rating/:ratingId", async (req, res) => {
  const { movieId, ratingId } = req.params;

  try {
    const rating = await prisma.movieRatings.findUnique({
      where: { MovieRatingId: parseInt(ratingId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    if (!rating || rating.MovieId !== parseInt(movieId)) {
      return res.status(404).json({ error: "Classificação não encontrada para este filme" });
    }

    res.json({
      ...rating,
      CreatedAt: formatPortugueseDateTime(rating.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(rating.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Eliminar classificação de um filme
app.delete("/movies/:movieId/rating/:ratingId", async (req, res) => {
  const { ratingId } = req.params;

  try {
    await prisma.movieRatings.delete({ where: { MovieRatingId: parseInt(ratingId) } });
    res.json({ message: "Classificação removida com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Classificação não encontrada" });
  }
});

// Adicionar classificação a uma série
app.post("/series/:seriesId/rating", async (req, res) => {
  const { seriesId } = req.params;
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "O rating deve estar entre 0 e 10." });
  }

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const series = await prisma.series.findUnique({ where: { SeriesId: parseInt(seriesId) } });

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });
    if (!series) return res.status(404).json({ error: "Série não encontrada" });

    const newRating = await prisma.seriesRatings.create({
      data: {
        UserId: parseInt(userId),
        SeriesId: parseInt(seriesId),
        Rating: parseInt(rating),
      },
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar classificações de uma série
app.get("/series/:seriesId/ratings", async (req, res) => {
  const { seriesId } = req.params;

  try {
    const ratings = await prisma.seriesRatings.findMany({
      where: { SeriesId: parseInt(seriesId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    res.json(
      ratings.map(rating => ({
        ...rating,
        CreatedAt: formatPortugueseDateTime(rating.CreatedAt),
        UpdatedAt: formatPortugueseDateTime(rating.UpdatedAt),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter classificação específica de uma série
app.get("/series/:seriesId/rating/:ratingId", async (req, res) => {
  const { seriesId, ratingId } = req.params;

  try {
    const rating = await prisma.seriesRatings.findUnique({
      where: { SeriesRatingId: parseInt(ratingId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    if (!rating || rating.SeriesId !== parseInt(seriesId)) {
      return res.status(404).json({ error: "Classificação não encontrada para esta série" });
    }

    res.json({
      ...rating,
      CreatedAt: formatPortugueseDateTime(rating.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(rating.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar classificação de uma série
app.put("/series/:seriesId/rating/:ratingId", async (req, res) => {
  const { ratingId } = req.params;
  const { rating } = req.body;

  if (rating < 0 || rating > 10) {
    return res.status(400).json({ error: "O rating deve estar entre 0 e 10." });
  }

  try {
    const updatedRating = await prisma.seriesRatings.update({
      where: { SeriesRatingId: parseInt(ratingId) },
      data: { Rating: parseInt(rating) },
    });

    res.json(updatedRating);
  } catch (error) {
    res.status(404).json({ error: "Classificação não encontrada" });
  }
});

// Eliminar classificação de uma série
app.delete("/series/:seriesId/rating/:ratingId", async (req, res) => {
  const { ratingId } = req.params;

  try {
    await prisma.seriesRatings.delete({ where: { SeriesRatingId: parseInt(ratingId) } });
    res.json({ message: "Classificação removida com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Classificação não encontrada" });
  }
});

//Calendarizar

// Adicionar um evento
app.post("/scheduling", async (req, res) => {
  const { userId, movieId, seriesId, eventDate, note } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    if (movieId) {
      const movie = await prisma.movies.findUnique({ where: { MovieId: parseInt(movieId) } });
      if (!movie) return res.status(404).json({ error: "Filme não encontrado" });
    }

    if (seriesId) {
      const series = await prisma.series.findUnique({ where: { SeriesId: parseInt(seriesId) } });
      if (!series) return res.status(404).json({ error: "Série não encontrada" });
    }

    const newEvent = await prisma.scheduling.create({
      data: {
        UserId: parseInt(userId),
        MovieId: movieId ? parseInt(movieId) : null,
        SeriesId: seriesId ? parseInt(seriesId) : null,
        EventDate: new Date(eventDate),
        Note: note || null,
      },
    });

    res.status(201).json({
      ...newEvent,
      EventDate: formatPortugueseDateTime(newEvent.EventDate),
      CreatedAt: formatPortugueseDateTime(newEvent.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(newEvent.UpdatedAt),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos os eventos de um utilizador
app.get("/users/:userId/scheduling", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

    const events = await prisma.scheduling.findMany({
      where: { UserId: parseInt(userId) },
      include: {
        Movie: { select: { Title: true } },
        Series: { select: { Title: true } },
      },
    });

    res.json(
      events.map(event => ({
        ...event,
        EventDate: formatPortugueseDateTime(event.EventDate),
        CreatedAt: formatPortugueseDateTime(event.CreatedAt),
        UpdatedAt: formatPortugueseDateTime(event.UpdatedAt),
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Obter eventos
app.get("/scheduling", async (req, res) => {
  try {
    const schedules = await prisma.scheduling.findMany({
      include: {
        Movie: { select: { Title: true } },
        Series: { select: { Title: true } },
      },
    });

    // Formatar as datas em português
    const formattedSchedules = schedules.map(schedule => ({
      ...schedule,
      EventDate: formatPortugueseDateTime(schedule.EventDate),
      CreatedAt: formatPortugueseDateTime(schedule.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(schedule.UpdatedAt),
    }));

    res.json(formattedSchedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um evento específico por ID
app.get("/scheduling/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await prisma.scheduling.findUnique({
      where: { EventId: parseInt(eventId) },
      include: {
        Movie: { select: { Title: true } },
        Series: { select: { Title: true } },
      },
    });

    if (!event) return res.status(404).json({ error: "Evento não encontrado" });

    res.json({
      ...event,
      EventDate: formatPortugueseDateTime(event.EventDate),
      CreatedAt: formatPortugueseDateTime(event.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(event.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um evento específico de um utilizador
app.get("/users/:userId/scheduling/:eventId", async (req, res) => {
  const { userId, eventId } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: { UserId: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    const event = await prisma.scheduling.findUnique({
      where: { EventId: parseInt(eventId) },
      include: {
        Movie: { select: { Title: true } },
        Series: { select: { Title: true } },
      },
    });

    if (!event || event.UserId !== parseInt(userId)) {
      return res.status(404).json({ error: "Evento não encontrado para este utilizador" });
    }

    res.json({
      ...event,
      EventDate: formatPortugueseDateTime(event.EventDate),
      CreatedAt: formatPortugueseDateTime(event.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(event.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um evento
app.put("/scheduling/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const { eventDate, note } = req.body;

  try {
    const updatedEvent = await prisma.scheduling.update({
      where: { EventId: parseInt(eventId) },
      data: {
        EventDate: eventDate ? new Date(eventDate) : undefined,
        Note: note || undefined,
      },
    });

    res.json({
      ...updatedEvent,
      EventDate: formatPortugueseDateTime(updatedEvent.EventDate),
      CreatedAt: formatPortugueseDateTime(updatedEvent.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedEvent.UpdatedAt),
    });
  } catch (error) {
    res.status(404).json({ error: "Evento não encontrado" });
  }
});

// Remover um evento
app.delete("/scheduling/:eventId", async (req, res) => {
  const { eventId } = req.params;

  try {
    await prisma.scheduling.delete({
      where: { EventId: parseInt(eventId) },
    });
    res.json({ message: "Evento removido com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Evento não encontrado" });
  }
});

//Categorias filmes

// Listar todas as categorias de filmes
app.get("/movie-categories", async (req, res) => {
  try {
    const categories = await prisma.movieCategories.findMany();

    const formattedCategories = categories.map(category => ({
      ...category,
      CreatedAt: formatPortugueseDateTime(category.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(category.UpdatedAt),
    }));

    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter uma categoria de filme específica por ID
app.get("/movie-categories/:movieCategoryId", async (req, res) => {
  const { movieCategoryId } = req.params;

  try {
    const category = await prisma.movieCategories.findUnique({
      where: { MovieCategoryId: parseInt(movieCategoryId) },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json({
      ...category,
      CreatedAt: formatPortugueseDateTime(category.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(category.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Criar uma categoria de filme
app.post("/movie-categories", async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = await prisma.movieCategories.create({
      data: {
        Name: name,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar a categoria: " + error.message });
  }
});

//Atualizar uma categoria de filme
app.put("/movie-categories/:movieCategoryId", async (req, res) => {
  const { movieCategoryId } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await prisma.movieCategories.update({
      where: {
        MovieCategoryId: parseInt(movieCategoryId),
      },
      data: {
        Name: name,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(404).json({ error: "Erro ao atualizar a categoria: " + error.message });
  }
});

//Eliminar uma categoria de filme
app.delete("/movie-categories/:movieCategoryId", async (req, res) => {
  const { movieCategoryId } = req.params;

  try {
    await prisma.movieCategories.delete({
      where: {
        MovieCategoryId: parseInt(movieCategoryId),
      },
    });

    res.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Erro ao excluir a categoria: " + error.message });
  }
});

//Categorias séries

// Listar todas as categorias de séries
app.get("/series-categories", async (req, res) => {
  try {
    const categories = await prisma.seriesCategories.findMany();

    const formattedCategories = categories.map(category => ({
      ...category,
      CreatedAt: formatPortugueseDateTime(category.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(category.UpdatedAt),
    }));

    res.json(formattedCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter uma categoria de série específica por ID
app.get("/series-categories/:seriesCategoryId", async (req, res) => {
  const { seriesCategoryId } = req.params;

  try {
    const category = await prisma.seriesCategories.findUnique({
      where: { SeriesCategoryId: parseInt(seriesCategoryId) },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.json({
      ...category,
      CreatedAt: formatPortugueseDateTime(category.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(category.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma categoria de série
app.post("/series-categories", async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = await prisma.seriesCategories.create({
      data: {
        Name: name,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar a categoria: " + error.message });
  }
});

// Atualizar uma categoria de série
app.put("/series-categories/:seriesCategoryId", async (req, res) => {
  const { seriesCategoryId } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await prisma.seriesCategories.update({
      where: {
        SeriesCategoryId: parseInt(seriesCategoryId),
      },
      data: {
        Name: name,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(404).json({ error: "Erro ao atualizar a categoria: " + error.message });
  }
});

// Eliminar uma categoria de série
app.delete("/series-categories/:seriesCategoryId", async (req, res) => {
  const { seriesCategoryId } = req.params;

  try {
    await prisma.seriesCategories.delete({
      where: {
        SeriesCategoryId: parseInt(seriesCategoryId),
      },
    });

    res.json({ message: "Categoria excluída com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Erro ao excluir a categoria: " + error.message });
  }
});

//Partilhas

// Criar uma partilha (POST)
app.post("/shares", async (req, res) => {
  const { senderUserId, recipientUserId, movieId, seriesId } = req.body;

  try {
    // Verificar utilizadores
    const sender = await prisma.users.findUnique({ where: { UserId: parseInt(senderUserId) } });
    if (!sender) return res.status(404).json({ error: "Utilizador remetente não encontrado" });

    const recipient = await prisma.users.findUnique({ where: { UserId: parseInt(recipientUserId) } });
    if (!recipient) return res.status(404).json({ error: "Utilizador destinatário não encontrado" });

    // Verificar filme ou série
    if (movieId) {
      const movie = await prisma.movies.findUnique({ where: { MovieId: parseInt(movieId) } });
      if (!movie) return res.status(404).json({ error: "Filme não encontrado" });
    }

    if (seriesId) {
      const series = await prisma.series.findUnique({ where: { SeriesId: parseInt(seriesId) } });
      if (!series) return res.status(404).json({ error: "Série não encontrada" });
    }

    // Criar a partilha
    const newShare = await prisma.shares.create({
      data: {
        SenderUserId: parseInt(senderUserId),
        RecipientUserId: parseInt(recipientUserId),
        MovieId: movieId ? parseInt(movieId) : null,
        SeriesId: seriesId ? parseInt(seriesId) : null,
      },
    });

    res.status(201).json(newShare);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar partilhas enviadas por um utilizador (GET)
app.get("/users/:userId/shares-sent", async (req, res) => {
  const { userId } = req.params;

  try {
    const shares = await prisma.shares.findMany({
      where: { SenderUserId: parseInt(userId) },
      include: {
        Movie: { select: { Title: true, Genre: true } },
        Series: { select: { Title: true, Genre: true } },
        RecipientUser: { select: { Name: true, Email: true } },
      },
    });

    const formattedShares = shares.map(share => ({
      ...share,
      CreatedAt: formatPortugueseDateTime(share.CreatedAt),
    }));

    res.json(formattedShares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar partilhas recebidas por um utilizador (GET)
app.get("/users/:userId/shares-received", async (req, res) => {
  const { userId } = req.params;

  try {
    const shares = await prisma.shares.findMany({
      where: { RecipientUserId: parseInt(userId) },
      include: {
        Movie: { select: { Title: true, Genre: true } },
        Series: { select: { Title: true, Genre: true } },
        SenderUser: { select: { Name: true, Email: true } },
      },
    });

    const formattedShares = shares.map(share => ({
      ...share,
      CreatedAt: formatPortugueseDateTime(share.CreatedAt),
    }));

    res.json(formattedShares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar uma partilha (DELETE)
app.delete("/shares/:shareId", async (req, res) => {
  const { shareId } = req.params;

  try {
    await prisma.shares.delete({ where: { ShareId: parseInt(shareId) } });
    res.json({ message: "Partilha removida com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Partilha não encontrada" });
  }
});

// Notes

// Listar notas de filmes
app.get("/movies/:movieId/notes", async (req, res) => {
  const { movieId } = req.params;

  try {
    const notes = await prisma.movieNotes.findMany({
      where: { MovieId: parseInt(movieId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    const formattedNotes = notes.map(note => ({
      ...note,
      CreatedAt: formatPortugueseDateTime(note.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(note.UpdatedAt),
    }));

    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma nota para um filme
app.post("/movies/:movieId/notes", async (req, res) => {
  const { movieId } = req.params;
  const { userId, noteText } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const movie = await prisma.movies.findUnique({ where: { MovieId: parseInt(movieId) } });

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });

    const newNote = await prisma.movieNotes.create({
      data: {
        UserId: parseInt(userId),
        MovieId: parseInt(movieId),
        NoteText: noteText,
      },
    });

    res.status(201).json({
      ...newNote,
      CreatedAt: formatPortugueseDateTime(newNote.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(newNote.UpdatedAt),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar uma nota de um filme
app.put("/movies/:movieId/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { noteText } = req.body;

  try {
    const updatedNote = await prisma.movieNotes.update({
      where: { NoteId: parseInt(noteId) },
      data: { NoteText: noteText },
    });

    res.json({
      ...updatedNote,
      CreatedAt: formatPortugueseDateTime(updatedNote.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedNote.UpdatedAt),
    });
  } catch (error) {
    res.status(404).json({ error: "Nota não encontrada ou erro ao atualizar" });
  }
});

// Deletar uma nota de um filme
app.delete("/movies/:movieId/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;

  try {
    await prisma.movieNotes.delete({ where: { NoteId: parseInt(noteId) } });
    res.json({ message: "Nota removida com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Nota não encontrada" });
  }
});

// Listar notas de séries
app.get("/series/:seriesId/notes", async (req, res) => {
  const { seriesId } = req.params;

  try {
    const notes = await prisma.seriesNotes.findMany({
      where: { SeriesId: parseInt(seriesId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    const formattedNotes = notes.map(note => ({
      ...note,
      CreatedAt: formatPortugueseDateTime(note.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(note.UpdatedAt),
    }));

    res.json(formattedNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar uma nota para uma série
app.post("/series/:seriesId/notes", async (req, res) => {
  const { seriesId } = req.params;
  const { userId, noteText } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const series = await prisma.series.findUnique({ where: { SeriesId: parseInt(seriesId) } });

    if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });
    if (!series) return res.status(404).json({ error: "Série não encontrada" });

    const newNote = await prisma.seriesNotes.create({
      data: {
        UserId: parseInt(userId),
        SeriesId: parseInt(seriesId),
        NoteText: noteText,
      },
    });

    res.status(201).json({
      ...newNote,
      CreatedAt: formatPortugueseDateTime(newNote.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(newNote.UpdatedAt),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar uma nota de uma série
app.put("/series/:seriesId/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const { noteText } = req.body;

  try {
    const updatedNote = await prisma.seriesNotes.update({
      where: { NoteId: parseInt(noteId) },
      data: { NoteText: noteText },
    });

    res.json({
      ...updatedNote,
      CreatedAt: formatPortugueseDateTime(updatedNote.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedNote.UpdatedAt),
    });
  } catch (error) {
    res.status(404).json({ error: "Nota não encontrada ou erro ao atualizar" });
  }
});

// Deletar uma nota de uma série
app.delete("/series/:seriesId/notes/:noteId", async (req, res) => {
  const { noteId } = req.params;

  try {
    await prisma.seriesNotes.delete({ where: { NoteId: parseInt(noteId) } });
    res.json({ message: "Nota removida com sucesso" });
  } catch (error) {
    res.status(404).json({ error: "Nota não encontrada" });
  }
});

// Listar todas as notas de um utilizador
app.get("/users/:userId/notes", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });

    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    // Buscar notas de filmes do utilizador
    const movieNotes = await prisma.movieNotes.findMany({
      where: { UserId: parseInt(userId) },
      include: { Movie: { select: { Title: true } } },
    });

    // Buscar notas de séries do utilizador
    const seriesNotes = await prisma.seriesNotes.findMany({
      where: { UserId: parseInt(userId) },
      include: { Series: { select: { Title: true } } },
    });

    // Formatar as notas
    const formattedMovieNotes = movieNotes.map(note => ({
      NoteId: note.NoteId,
      Type: "Movie",
      RelatedTitle: note.Movie.Title,
      NoteText: note.NoteText,
      CreatedAt: formatPortugueseDateTime(note.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(note.UpdatedAt),
    }));

    const formattedSeriesNotes = seriesNotes.map(note => ({
      NoteId: note.NoteId,
      Type: "Series",
      RelatedTitle: note.Series.Title,
      NoteText: note.NoteText,
      CreatedAt: formatPortugueseDateTime(note.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(note.UpdatedAt),
    }));

    // Combinar e retornar as notas
    const allNotes = [...formattedMovieNotes, ...formattedSeriesNotes];

    res.json(allNotes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter uma nota específica de um utilizador
app.get("/users/:userId/notes/:noteId", async (req, res) => {
  const { userId, noteId } = req.params;

  try {
    // Verificar se o utilizador existe
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }

    // Procurar nota nos filmes
    const movieNote = await prisma.movieNotes.findFirst({
      where: { UserId: parseInt(userId), NoteId: parseInt(noteId) },
      include: { Movie: { select: { Title: true } } },
    });

    if (movieNote) {
      return res.json({
        NoteId: movieNote.NoteId,
        Type: "Movie",
        RelatedTitle: movieNote.Movie.Title,
        NoteText: movieNote.NoteText,
        CreatedAt: formatPortugueseDateTime(movieNote.CreatedAt),
        UpdatedAt: formatPortugueseDateTime(movieNote.UpdatedAt),
      });
    }

    // Procurar nota nas séries
    const seriesNote = await prisma.seriesNotes.findFirst({
      where: { UserId: parseInt(userId), NoteId: parseInt(noteId) },
      include: { Series: { select: { Title: true } } },
    });

    if (seriesNote) {
      return res.json({
        NoteId: seriesNote.NoteId,
        Type: "Series",
        RelatedTitle: seriesNote.Series.Title,
        NoteText: seriesNote.NoteText,
        CreatedAt: formatPortugueseDateTime(seriesNote.CreatedAt),
        UpdatedAt: formatPortugueseDateTime(seriesNote.UpdatedAt),
      });
    }

    // Nota não encontrada
    return res.status(404).json({ error: "Nota não encontrada para este utilizador" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Comentários filmes

// Listar comentários de um filme
app.get("/movies/:movieId/comments", async (req, res) => {
  const { movieId } = req.params;

  try {
    const comments = await prisma.movieComments.findMany({
      where: { MovieId: parseInt(movieId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    const formattedComments = comments.map(comment => ({
      ...comment,
      CreatedAt: formatPortugueseDateTime(comment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(comment.UpdatedAt),
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter um comentário específico de um filme por usuário e ID do comentário
app.get("/users/:userId/movies/comments/:commentId", async (req, res) => {
  const { userId, commentId } = req.params;

  try {
    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({
      where: { UserId: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verificar se o comentário existe e pertence ao usuário
    const comment = await prisma.movieComments.findUnique({
      where: { id: parseInt(commentId) }, // Substitua "id" pelo nome real do campo no modelo
      include: { Movie: { select: { Title: true } } },
    });

    
    if (!comment || comment.UserId !== parseInt(userId)) {
      return res.status(404).json({ error: "Comentário não encontrado para este usuário" });
    }

    // Retornar o comentário formatado
    res.json({
      CommentId: comment.CommentId,
      MovieId: comment.MovieId,
      MovieTitle: comment.Movie.Title,
      CommentText: comment.CommentText,
      CreatedAt: formatPortugueseDateTime(comment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(comment.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obter todos os comentários de filmes de um usuário
app.get("/users/:userId/movies/comments", async (req, res) => {
  const { userId } = req.params;

  try {
    const comments = await prisma.movieComments.findMany({
      where: { UserId: parseInt(userId) },
      include: { Movie: { select: { Title: true } } },
    });

    const formattedComments = comments.map(comment => ({
      CommentId: comment.CommentId,
      MovieId: comment.MovieId,
      MovieTitle: comment.Movie.Title,
      CommentText: comment.CommentText,
      CreatedAt: formatPortugueseDateTime(comment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(comment.UpdatedAt),
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar comentário a um filme
app.post("/movies/:movieId/comments", async (req, res) => {
  const { movieId } = req.params;
  const { userId, commentText } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const movie = await prisma.movies.findUnique({ where: { MovieId: parseInt(movieId) } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (!movie) return res.status(404).json({ error: "Filme não encontrado" });

    const newComment = await prisma.movieComments.create({
      data: {
        UserId: parseInt(userId),
        MovieId: parseInt(movieId),
        CommentText: commentText,
      },
    });

    res.status(201).json({
      ...newComment,
      CreatedAt: formatPortugueseDateTime(newComment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(newComment.UpdatedAt),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar um comentário de um filme
app.put("/movies/:movieId/comments/:commentId", async (req, res) => {
  const { movieId, commentId } = req.params;
  const { commentText } = req.body;

  try {
    // Verifica se o comentário pertence ao filme
    const comment = await prisma.movieComments.findUnique({
      where: { CommentId: parseInt(commentId) },
    });

    if (!comment || comment.MovieId !== parseInt(movieId)) {
      return res.status(404).json({ error: "Comentário não encontrado para este filme" });
    }

    // Atualiza o comentário
    const updatedComment = await prisma.movieComments.update({
      where: { CommentId: parseInt(commentId) },
      data: { CommentText: commentText },
    });

    res.json({
      ...updatedComment,
      CreatedAt: formatPortugueseDateTime(updatedComment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedComment.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o comentário: " + error.message });
  }
});

// Deletar um comentário de um filme
app.delete("/movies/:movieId/comments/:commentId", async (req, res) => {
  const { movieId, commentId } = req.params;

  try {
    // Verifica se o comentário pertence ao filme
    const comment = await prisma.movieComments.findUnique({
      where: { CommentId: parseInt(commentId) },
    });

    if (!comment || comment.MovieId !== parseInt(movieId)) {
      return res.status(404).json({ error: "Comentário não encontrado para este filme" });
    }

    // Deleta o comentário
    await prisma.movieComments.delete({
      where: { CommentId: parseInt(commentId) },
    });

    res.json({ message: "Comentário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o comentário: " + error.message });
  }
});

//Comentário séries

// Listar comentários de uma série
app.get("/series/:seriesId/comments", async (req, res) => {
  const { seriesId } = req.params;

  try {
    const comments = await prisma.seriesComments.findMany({
      where: { SeriesId: parseInt(seriesId) },
      include: { User: { select: { Name: true, Email: true } } },
    });

    const formattedComments = comments.map(comment => ({
      ...comment,
      CreatedAt: formatPortugueseDateTime(comment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(comment.UpdatedAt),
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter todos os comentários de séries de um usuário
app.get("/users/:userId/series/comments", async (req, res) => {
  const { userId } = req.params;

  try {
    // Buscar todos os comentários de séries do usuário
    const comments = await prisma.seriesComments.findMany({
      where: { UserId: parseInt(userId) },
      include: { Series: { select: { Title: true } } }, // Inclui o título da série
    });

    // Se não houver comentários, retornar uma resposta apropriada
    if (!comments || comments.length === 0) {
      return res.status(404).json({ error: "Nenhum comentário encontrado para este usuário" });
    }

    // Formatar os comentários
    const formattedComments = comments.map(comment => ({
      CommentId: comment.CommentId,
      SeriesId: comment.SeriesId,
      SeriesTitle: comment.Series.Title,
      CommentText: comment.CommentText,
      CreatedAt: formatPortugueseDateTime(comment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(comment.UpdatedAt),
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar comentários: " + error.message });
  }
});

// Adicionar comentário a uma série
app.post("/series/:seriesId/comments", async (req, res) => {
  const { seriesId } = req.params;
  const { userId, commentText } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { UserId: parseInt(userId) } });
    const series = await prisma.series.findUnique({ where: { SeriesId: parseInt(seriesId) } });

    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    if (!series) return res.status(404).json({ error: "Série não encontrada" });

    const newComment = await prisma.seriesComments.create({
      data: {
        UserId: parseInt(userId),
        SeriesId: parseInt(seriesId),
        CommentText: commentText,
      },
    });

    res.status(201).json({
      ...newComment,
      CreatedAt: formatPortugueseDateTime(newComment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(newComment.UpdatedAt),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar um comentário de uma série
app.put("/series/:seriesId/comments/:commentId", async (req, res) => {
  const { seriesId, commentId } = req.params;
  const { commentText } = req.body;

  try {
    const comment = await prisma.seriesComments.findUnique({
      where: { CommentId: parseInt(commentId) },
    });

    if (!comment || comment.SeriesId !== parseInt(seriesId)) {
      return res.status(404).json({ error: "Comentário não encontrado para esta série" });
    }

    const updatedComment = await prisma.seriesComments.update({
      where: { CommentId: parseInt(commentId) },
      data: { CommentText: commentText },
    });

    res.json({
      ...updatedComment,
      CreatedAt: formatPortugueseDateTime(updatedComment.CreatedAt),
      UpdatedAt: formatPortugueseDateTime(updatedComment.UpdatedAt),
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar o comentário: " + error.message });
  }
});

// Deletar um comentário de uma série
app.delete("/series/:seriesId/comments/:commentId", async (req, res) => {
  const { seriesId, commentId } = req.params;

  try {
    const comment = await prisma.seriesComments.findUnique({
      where: { CommentId: parseInt(commentId) },
    });

    if (!comment || comment.SeriesId !== parseInt(seriesId)) {
      return res.status(404).json({ error: "Comentário não encontrado para esta série" });
    }

    await prisma.seriesComments.delete({
      where: { CommentId: parseInt(commentId) },
    });

    res.json({ message: "Comentário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover o comentário: " + error.message });
  }
});


//Login

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "sua_chave_secreta"; // Substitua por uma chave secreta forte

// Registro de novo usuário
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashear a senha
    const newUser = await prisma.users.create({
      data: {
        Name: name,
        Email: email,
        Password: hashedPassword,
      },
    });
    res.status(201).json({ message: "Usuário registrado com sucesso!", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login de usuário
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { Email: email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Senha inválida" });
    }

    // Gerar o token JWT
    const token = jwt.sign({ userId: user.UserId }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
}

//Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});