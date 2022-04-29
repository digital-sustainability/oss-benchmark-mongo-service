require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const MongoClient = require("mongodb").MongoClient;

let data;

getData().then((d) => {
  data = d;
});

async function getData() {
  return {
    institutions: await getInstitutions(),
    repositories: await getRepositories(),
    users: await getUsers(),
  };
}

setInterval(function () {
  getData().then((d) => {
    data = d;
  });
}, 3600000);

app.use(cors());

app.get("/institutions", async function (req, res, next) {
  if (!data || !data.institutions) {
    data = await getData();
  }
  const institutions = data.institutions;
  res.json({ institutions });
});

app.get("/repositories", async function (req, res, next) {
  if (!data || !data.repositories) {
    data = await getData();
  }
  const repos = data.repositories;
  res.json(repos);
});

app.get("/users", async function (req, res, next) {
  if (!data || !data.users) {
    data = await getData();
  }
  const users = data.users;
  res.json(users);
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 5000");
});

async function createConnection() {
  const client = new MongoClient(process.env.MONGO_READ, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  return client;
}

async function terminateConnection(client) {
  await client.close();
}

async function getInstitutions() {
  const client = await createConnection();
  const institutions = await client
    .db("statistics")
    .collection("institutions")
    .find({})
    .toArray();
  await terminateConnection(client);
  return institutions;
}

async function getRepositories() {
  const client = await createConnection();
  const repos = await client
    .db("statistics")
    .collection("repositories")
    .find(
      {},
      {
        projection: {
          commit_activities: 0,
        },
      }
    )
    .toArray();
  await terminateConnection(client);
  return repos;
}

async function getUsers() {
  const client = await createConnection();
  const users = await client
    .db("statistics")
    .collection("users")
    .find()
    .toArray();
  await terminateConnection(client);
  return users;
}
