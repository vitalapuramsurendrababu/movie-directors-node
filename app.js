const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");

const dbpath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeAndStartServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`dbError:${e.message}`);
    process.exit(1);
  }
};
initializeAndStartServer();

const convertobject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

const dirconvertobject = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

//get movies list

const allmovies = app.get("/movies/", async (request, response) => {
  const getmovies = `SELECT movie_name FROM movie;`;
  const dbResponse = await db.all(getmovies);
  let camelCase = [];
  for (let each of dbResponse) {
    let g = convertobject(each);
    camelCase.push({ movieName: g.movieName });
  }
  response.send(camelCase);
});
//add movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addmovie = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addmovie);
  response.send("Movie Successfully Added");
});

//getmovienamebyid
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovie = `SELECT *
                    FROM movie
                    WHERE movie_id=${movieId};`;
  const dbResponse = await db.get(getmovie);
  response.send(convertobject(dbResponse));
});

//updatemovie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { movieName, directorId, leadActor } = movieDetails;
  const updatemovie = `UPDATE movie SET movie_name='${movieName}',director_id=${directorId},lead_actor='${leadActor}' WHERE movie_id=${movieId};`;
  const dbResponse = await db.run(updatemovie);
  response.send("Movie Details Updated");
});

//delete amovie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovie = `DELETE FROM movie WHERE movie_id=${movieId};`;
  const dbResponse = await db.run(deletemovie);
  response.send("Movie Removed");
});

//get directors name

app.get("/directors/", async (request, response) => {
  const directors = `SELECT * FROM director;`;
  const dbResponse = await db.all(directors);
  camelCase = [];
  for (let each of dbResponse) {
    let f = dirconvertobject(each);
    camelCase.push(f);
  }
  response.send(camelCase);
});

//dirmovies

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dirmovies = `SELECT 
                            *
                        FROM
                            movie INNER JOIN director ON director.director_id=movie.director_id
                        WHERE 
                            movie.director_id=${directorId};`;

  const dbResponse = await db.all(dirmovies);
  camelCase = [];
  for (let each of dbResponse) {
    let h = convertobject(each);
    camelCase.push({ movieName: h.movieName });
  }
  response.send(camelCase);
});

module.exports = allmovies;
