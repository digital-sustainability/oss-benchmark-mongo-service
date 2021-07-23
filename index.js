require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const MongoClient = require("mongodb").MongoClient;

app.use(cors());

app.get("/institutions", async function (req, res, next) {
  const institutions = await getInstitutions();
  console.log(institutions);
  res.json({ institutions });
});

app.get("/repositories", async function (req, res, next) {
  const repos = await getRepositories();
  console.log(repos);
  res.json(repos);
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 5000");
});

async function createConnection() {
  console.log(process.env.MONGO_READ);
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
    .find(
      {},
      {
        projection: {
          "orgs.repos.commit_activities": 0,
          "repos.commit_activities": 0,
        },
      }
    )
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
