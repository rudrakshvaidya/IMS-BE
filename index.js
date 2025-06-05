const libMongodb = require("mongodb");
const libExpress = require("express");
const libRandomString = require("randomstring");
const cors = require("cors");

const server = libExpress();
server.use(libExpress.json());
const { MongoClient } = require("mongodb");
const DB = "IMS";
const connection = new MongoClient(
  "mongodb://rud:pass123@localhost:27017/IMS?authSource=IMS"
);

server.use(cors());

//API FOR USERS
// server.get('/users', (req, res) => {
//    connection.connect().
//     then(() => connection.db(DB)).
//     then((db) => db.collection('USERS')).
//     then((collection) => collection.find({}).toArray()).
//     then((result) => console.log(result))
//     .catch((err) => console.error(err));
//    // res.json([
//    //   {name: "user1"},
//    //   {name: "user2"},
//     //  {name: "user3"},
//    //   {name: "user4"}
//    // ])
// })

server.get("/users/roles", async (req, res) => {
  await connection.connect();
  const db = await connection.db(DB);
  const collection = await db.collection("USERS");
  const result = await collection.find({ token: req.headers.token }).toArray();

  if(result.length === 1){
  res.status(200).json({
    "teamOwner":!!(result[0].isOwner),
    "isAdmin":!!(result[0].isAdmin),
    "Playingfor":!!(result[0].playingFor)
  })
  }
  else{
    res.status(401).json({ error: "Invalid token" });
  }

});

server.post("/users", async (req, res) => {
  if (req.body.name && req.body.email && req.body.password && req.body.phone)
    await connection.connect();
  const db = await connection.db(DB);
  const collection = await db.collection("USERS");
  const result = await collection.find({ email: req.body.email }).toArray();

  if (result.length > 0) {
    res.status(200).json({ error: "Email already exists" });
  } else {
    await collection.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    });
    res.status(401).json({ message: "User created successfully" });
  }
});
    server.post("/tokens", async (req, res) => {
  if (req.body.email && req.body.password) {
    await connection.connect();
    const db = await connection.db(DB);
    const collection = await db.collection("USERS");
    const result = await collection
      .find({ email: req.body.email, password: req.body.password })
      .toArray();

    if (result.length > 0) {
      const generetedToken = libRandomString.generate(7);

      const user = result[0];

      await collection.updateOne(
        { _id: user._id },
        { $set: { token: generetedToken } }
      );

      res.status(200).json({ token: generetedToken });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } else {
    res.status(400).json({ error: "Email and password are required" });
  }
});

// server.post('/teams', (req, res) => {
//     console.log("team creation request reveieved");
//     res.send("Team created successfully");
// })

// server.post('/players', (req, res) => {
//     console.log("player creation request reveieved");
//     res.send("player created successfully");
// })

server.listen(8000, () => {
  console.log("Listening over 8k");
});
