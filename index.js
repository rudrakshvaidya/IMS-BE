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
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    await connection.connect();
    const db = await connection.db(DB);
    const usersCollection = db.collection("USERS");

    const user = await usersCollection.findOne({ token });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const teamOwner = !!user.isOwner;
    const isAdmin = !!user.isAdmin;

    res.status(200).json({
      teamOwner,
      isAdmin,
      isOwnerTeamId: user.isOwner || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.close();
  }
});

server.post("/users", async (req, res) => {
  if (req.body.name && req.body.email && req.body.password && req.body.phone)
    await connection.connect();
  const db = await connection.db(DB);
  const collection = await db.collection("USERS");
  const result = await collection.find({ email: req.body.email }).toArray();

  if (result.length > 0) {
    res.status(401).json({ error: "Email already exists" });
  } else {
    await collection.insertOne({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    });
    res.status(200).json({ message: "User created successfully" });
  }
  connection.close();
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
  connection.close();
});


server.get("/players", async (req, res) => {
  try {
    await connection.connect();
    const db = await connection.db(DB);
    const playerCollection = await db.collection("USERS");

    // Get all players who have a "playingFor" field
    const players = await playerCollection.find({ playingFor: { $exists: true } }).toArray();

    // Prepare to fetch all teams only once
    const teamCollection = await db.collection("TEAMS");
    const teams = await teamCollection.find({}).toArray();

    // Build a map of teamId -> teamName
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team._id.toString()] = team.name;
    });

    // Add playingForName to each player
    const enrichedPlayers = players.map(player => ({
      ...player,
      playingForName: teamMap[player.playingFor] || "Unknown"
    }));

    res.status(200).json(enrichedPlayers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.close();
  }
});

server.get("/players/:id/stats", async (req, res) => {
  if (req.params.id) {
    try {
      await connection.connect();
      const db = await connection.db(DB);
      const collection = await db.collection("USERS");

      const player = await collection.findOne({ _id: new libMongodb.ObjectId(req.params.id) });

      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      let teamName = "Unknown";

      // Only query teams if playingFor field exists
      if (player.playingFor) {
        const team = await db.collection("TEAMS").findOne({ _id: new libMongodb.ObjectId(player.playingFor) }).catch(() => null);
        if (team && team.name) {
          teamName = team.name;
        }
      }

      player.playingForName = teamName;

      res.status(200).json(player);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      connection.close();
    }
  }
});


server.get('/teams', async (req, res) => {
  try {
    await connection.connect();
    const db = await connection.db(DB);
    const collection = await db.collection("TEAMS");
    const result = await collection.find({}).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.close();
  }
});

server.patch("/teams/:id", async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    await connection.connect();
    const db = await connection.db(DB);
    const teams = db.collection("TEAMS");

    if (Object.keys(updates).length === 0) {
      // If empty PATCH, just return current data
      const team = await teams.findOne({ _id: new libMongodb.ObjectId(id) });
      res.status(200).json(team);
    } else {
      // Otherwise perform update
      await teams.updateOne({ _id: new libMongodb.ObjectId(id) }, { $set: updates });
      res.status(200).json({ message: "Team updated successfully" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.close();
  }
});


server.get("/teams/:id/stats", async (req, res) => {
  if (req.params.id) {
    try {
      const teamId = new libMongodb.ObjectId(req.params.id);

      await connection.connect();
      const db = await connection.db(DB);

      const teamCollection = db.collection("TEAMS");
      const team = await teamCollection.findOne({ _id: teamId });

      const playerCollection = db.collection("USERS");
      const players = await playerCollection
        .find({ playingFor: req.params.id }) // still using string here
        .toArray();

      // Attach team name to each player object
      const enrichedPlayers = players.map(player => ({
        ...player,
        playingForName: team.name,  // new field
      }));

      await connection.close();

      res.status(200).json({
        team,
        players: enrichedPlayers,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "Team ID is required" });
  }
});

server.get("/users/ownedTeams", async (req, res) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    await connection.connect();
    const db = await connection.db(DB);

    const usersCollection = db.collection("USERS");
    const teamsCollection = db.collection("TEAMS");

    const user = await usersCollection.findOne({ token });

    if (!user || !user.isOwner) {
      return res.status(403).json({ error: "User is not an owner" });
    }

    const teamId = new libMongodb.ObjectId(user.isOwner);
    const ownedTeam = await teamsCollection.findOne({ _id: teamId });

    res.status(200).json({ team: ownedTeam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.close();
  }
});



// server.post('/players', (req, res) => {
//     console.log("player creation request reveieved");
//     res.send("player created successfully");
// })

server.listen(8000, () => {
  console.log("Listening over 8k");
});
