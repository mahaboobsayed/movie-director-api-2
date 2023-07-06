const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbpath = path.join(__dirname, "moviesData.db");
app.use(express.json());

let database = null;
const initiliaseDBandServer = async () => {
  try {
    database = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () =>
      console.log("Server running at http://localhost:3000")
    );
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initiliaseDBandServer();
const movie_snake_camel = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};
const director_snake_camel = (dbobject) => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const DbQuery = `SELECT movie_name
    FROM
    movie`;
  const movieslist = await database.all(DbQuery);
  response.send(movieslist.map((movie) => ({ movieName: movie.movie_name })));
});
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const DbQuery = `INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  await database.run(DbQuery);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const Dbquery = `SELECT *
    FROM
    movie
    WHERE
    movie_id=${movieId};`;
  const movie_list = await database.get(Dbquery);
  response.send(movie_snake_camel(movie_list));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const Dbquery = `UPDATE movie
    SET director_id= ${directorId},
    movie_name= '${movieName}',
    lead_actor= '${leadActor}'
    WHERE 
    movie_id=${movieId}`;
  await database.run(Dbquery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const DbQuery = `DELETE FROM
    movie
    WHERE
    movie_id=${movieId};`;
  await database.run(DbQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
    *
    FROM
    director`;
  const directorsArray = await database.all(getDirectorQuery);
  response.send(
    directorsArray.map((eachdirector) => director_snake_camel(eachdirector))
  );
});

app.get("/directors/:directorId/movies/", async (request, reponse) => {
  const { directorId } = request.params;
  const DbQuery = `SELECT movie_name
    FROM
    director
    WHERE
    director_id=${directorId}`;
  const single_director = await database.all(DbQuery);
  response.send(
    single_director.map((eachmovie) => ({ movieName: eachmovie.movie_name }))
  );
});

module.exports = app;
