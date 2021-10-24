const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require("uuid");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isIdValidate(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ erro: "Invalide repository id." });
  }
  return next();
}

function infosValidadte(request, response, next) {
  const { title, url, techs } = request.body;
  if (!title || !url || !techs) {
    return response
      .status(400)
      .json({ menssage: "Error, title, url or unfilled" });
  }
  return next();
}

function repositoryFound(id, type) {
  let repositoryFound;

  if (type === "find") {
    repositoryFound = repositories.find(
      (repositorie) => repositorie.id === id
    );
  }
  if(type === 'findIndex'){
    repositoryFound = repositories.findIndex(
      (repositorie) => repositorie.id === id
    );
  }

  return repositoryFound;
}

app.use("/repositories/:id", isIdValidate);
app.use("/repositories/:id/like", isIdValidate);


app.get("/repositories", (request, response) => {
  if (!repositories) {
    return response.status(400).json({ menssage: "Error, no repositores" });
  }
  return response.status(200).json(repositories);
});

app.post("/repositories", infosValidadte, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(200).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const found = repositoryFound(id, 'findIndex');

  if (found < 0) {
    return response
      .status(400)
      .json({ menssage: "Error, Repository not found" });
  }

  const newRepository = {
    id,
    title,
    url,
    techs,
    likes: repositories[found].likes
  };

  repositories[found] = newRepository;

  return response.json(newRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const found = repositoryFound(id, 'findIndex')

  if (!found) {
    return response
      .status(400)
      .json({ menssage: "Error, Repository not found" });
  }

  repositories.splice(found, 1);

  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const found = repositoryFound(id, 'find')

  if (!found) {
    return response
      .status(400)
      .json({ menssage: "Error, Repository not found" });
  }

  const newRepository = {
    id,
    title: found.title,
    url: found.url,
    techs: found.techs,
    likes: (found.likes += 1),
  };

  repositories[found] = newRepository;

  return response.status(200).json(newRepository);
});

module.exports = app;
