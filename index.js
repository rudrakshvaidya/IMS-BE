// const libMongodb = require("mongodb");
// const libExpress = require("express");
// const libRandomString = require("randomstring");
// const cors = require("cors");

// const server = libExpress();
// server.use(libExpress.json());
// const { MongoClient } = require("mongodb");
// const DB = "IMS";
// const connection = new MongoClient(
//   "mongodb://rud:pass123@localhost:27017/IMS?authSource=IMS"
// );

// server.use(cors());

// //API FOR USERS
// // server.get('/users', (req, res) => {
// //    connection.connect().
// //     then(() => connection.db(DB)).
// //     then((db) => db.collection('USERS')).
// //     then((collection) => collection.find({}).toArray()).
// //     then((result) => console.log(result))
// //     .catch((err) => console.error(err));
// //    // res.json([
// //    //   {name: "user1"},
// //    //   {name: "user2"},
// //     //  {name: "user3"},
// //    //   {name: "user4"}
// //    // ])
// // })

// server.get("/users/roles", async (req, res) => {
//   const token = req.headers.token;

//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const usersCollection = db.collection("USERS");

//     const user = await usersCollection.findOne({ token });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const teamOwner = !!user.isOwner;
//     const isAdmin = !!user.isAdmin;

//     res.status(200).json({
//       teamOwner,
//       isAdmin,
//       isOwnerTeamId: user.isOwner || null,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// server.post("/users", async (req, res) => {
//   try {
//     const { name, email, password, phone } = req.body;

//     // Validate input
//     if (!name || !email || !password || !phone) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Connect to DB
//     await connection.connect();
//     const db = connection.db(DB);
//     const collection = db.collection("USERS");

//     // Check if email already exists
//     const result = await collection.find({ email }).toArray();

//     if (result.length > 0) {
//       return res.status(401).json({ error: "Email already exists" });
//     }

//     // Insert new user
//     await collection.insertOne({ name, email, password, phone });

//     res.status(200).json({ message: "User created successfully" });
//   } catch (err) {
//     console.error("Signup error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     connection.close(); // ensure it always closes
//   }
// });

// server.post("/tokens", async (req, res) => {
//   if (req.body.email && req.body.password) {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const collection = await db.collection("USERS");
//     const result = await collection
//       .find({ email: req.body.email, password: req.body.password })
//       .toArray();

//     if (result.length > 0) {
//       const generetedToken = libRandomString.generate(7);

//       const user = result[0];

//       await collection.updateOne(
//         { _id: user._id },
//         { $set: { token: generetedToken } }
//       );

//       res.status(200).json({ token: generetedToken });
//     } else {
//       res.status(401).json({ error: "Invalid email or password" });
//     }
//   } else {
//     res.status(400).json({ error: "Email and password are required" });
//   }
//   connection.close();
// });


// server.get("/players", async (req, res) => {
//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const playerCollection = await db.collection("USERS");

//     // Get all players who have a "playingFor" field
//     const players = await playerCollection.find({ playingFor: { $exists: true } }).toArray();

//     // Prepare to fetch all teams only once
//     const teamCollection = await db.collection("TEAMS");
//     const teams = await teamCollection.find({}).toArray();

//     // Build a map of teamId -> teamName
//     const teamMap = {};
//     teams.forEach(team => {
//       teamMap[team._id.toString()] = team.name;
//     });

//     // Add playingForName to each player
//     const enrichedPlayers = players.map(player => ({
//       ...player,
//       playingForName: teamMap[player.playingFor] || "Unknown"
//     }));

//     res.status(200).json(enrichedPlayers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// server.get("/players/:id/stats", async (req, res) => {
//   if (req.params.id) {
//     try {
//       await connection.connect();
//       const db = await connection.db(DB);
//       const collection = await db.collection("USERS");

//       const player = await collection.findOne({ _id: new libMongodb.ObjectId(req.params.id) });

//       if (!player) {
//         return res.status(404).json({ error: "Player not found" });
//       }

//       let teamName = "Unknown";

//       // Only query teams if playingFor field exists
//       if (player.playingFor) {
//         const team = await db.collection("TEAMS").findOne({ _id: new libMongodb.ObjectId(player.playingFor) }).catch(() => null);
//         if (team && team.name) {
//           teamName = team.name;
//         }
//       }

//       player.playingForName = teamName;

//       res.status(200).json(player);
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Internal server error" });
//     } finally {
//       connection.close();
//     }
//   }
// });


// server.get('/teams', async (req, res) => {
//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const collection = await db.collection("TEAMS");
//     const result = await collection.find({}).toArray();
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// server.patch("/teams/:id", async (req, res) => {
//   const id = req.params.id;
//   const updates = req.body;

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const teams = db.collection("TEAMS");

//     if (Object.keys(updates).length === 0) {
//       // If empty PATCH, just return current data
//       const team = await teams.findOne({ _id: new libMongodb.ObjectId(id) });
//       res.status(200).json(team);
//     } else {
//       // Otherwise perform update
//       await teams.updateOne({ _id: new libMongodb.ObjectId(id) }, { $set: updates });
//       res.status(200).json({ message: "Team updated successfully" });
//     }

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });


// server.get("/teams/:id/stats", async (req, res) => {
//   if (req.params.id) {
//     try {
//       const teamId = new libMongodb.ObjectId(req.params.id);

//       await connection.connect();
//       const db = await connection.db(DB);

//       const teamCollection = db.collection("TEAMS");
//       const team = await teamCollection.findOne({ _id: teamId });

//       const playerCollection = db.collection("USERS");
//       const players = await playerCollection
//         .find({ playingFor: req.params.id }) // still using string here
//         .toArray();

//       // Attach team name to each player object
//       const enrichedPlayers = players.map(player => ({
//         ...player,
//         playingForName: team.name,  // new field
//       }));

//       await connection.close();

//       res.status(200).json({
//         team,
//         players: enrichedPlayers,
//       });

//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   } else {
//     res.status(400).json({ error: "Team ID is required" });
//   }
// });

// server.get("/users/ownedTeams", async (req, res) => {
//   const token = req.headers.token;

//   if (!token) {
//     return res.status(401).json({ error: "Token missing" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);

//     const usersCollection = db.collection("USERS");
//     const teamsCollection = db.collection("TEAMS");

//     const user = await usersCollection.findOne({ token });

//     if (!user || !user.isOwner) {
//       return res.status(403).json({ error: "User is not an owner" });
//     }

//     const teamId = new libMongodb.ObjectId(user.isOwner);
//     const ownedTeam = await teamsCollection.findOne({ _id: teamId });

//     res.status(200).json({ team: ownedTeam });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// // 


// //BELOW ARE FOR ADMINS,
// // PUT - Update player (Admin only)
// //server.put("/players/:id", async (req, res) => {
//   // const token = req.headers.token;
//   // const playerId = req.params.id;
  
//   // if (!token) {
//   //   return res.status(401).json({ error: "Token required" });
//   // }

//   // try {
//   //   await connection.connect();
//   //   const db = await connection.db(DB);
//   //   const usersCollection = db.collection("USERS");
//   //   const playersCollection = db.collection("USERS");

//   //   // Check if user is admin
//   //   const user = await usersCollection.findOne({ token });
//   //   if (!user || !user.isAdmin) {
//   //     return res.status(403).json({ error: "Admin access required" });
//   //   }

//   //   const { name, nationality, specialization, image, playingForName } = req.body;
    
//   //   // Validate required fields
//   //   if (!name || !nationality || !specialization) {
//   //     return res.status(400).json({ error: "Name, nationality, and specialization are required" });
//   //   }

//   //   const updateData = {
//   //     name,
//   //     nationality,
//   //     specialization,
//   //     image: image || "",
//   //     playingForName: playingForName || "",
//   //     updatedAt: new Date()
//   //   };

//   //   const result = await playersCollection.updateOne(
//   //     { _id: new libMongodb.ObjectId(playerId) },
//   //     { $set: updateData }
//   //   );

//   //   if (result.matchedCount === 0) {
//   //     return res.status(404).json({ error: "Player not found" });
//   //   }

//   //   res.status(200).json({ message: "Player updated successfully" });

//   // } catch (err) {
//   //   console.error(err);
//   //   res.status(500).json({ error: "Internal server error" });
//   // } finally {
//   //   connection.close();
//   // }
// //});
// // DELETE - Delete player (Admin only)
// server.delete("/adminplayers/:id", async (req, res) => {
//   const token = req.headers.token;
//   const playerId = req.params.id;
  
//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const usersCollection = db.collection("USERS");

//     // Check if user is admin
//     const user = await usersCollection.findOne({ token });
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     const result = await usersCollection.deleteOne({ 
//       _id: new libMongodb.ObjectId(playerId) 
//     });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: "Player not found" });
//     }

//     res.status(200).json({ message: "Player deleted successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });
// server.get("/adminplayers", async (req, res) => {
//   const token = req.headers.token;
  
//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const usersCollection = db.collection("USERS");

//     // Verify token
//     const user = await usersCollection.findOne({ token });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     // Fetch all players (users with playingFor field)
//     const players = await usersCollection.find(
//       { playingFor: { $exists: true, $ne: null } },
//       { 
//         projection: { 
//           password: 0, // Don't send password in response
//           token: 0 // Don't send token in response
//         } 
//       }
//     ).toArray();

//     res.status(200).json(players);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });
// server.post("/adminplayers", async (req, res) => {
//   const token = req.headers.token;
  
//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const usersCollection = db.collection("USERS");
//     const teamsCollection = db.collection("TEAMS");

//     // Validate token and admin status
//     const user = await usersCollection.findOne({ token });
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     const {
//       name,
//       password,
//       email,
//       phone,
//       playingFor,
//       playingForName,
//       image,
//       nationality,
//       specialization,
//       stats
//     } = req.body;

//     // Validate required fields
//     if (!name || !password || !email || !phone || !playingFor || !nationality || !specialization) {
//       return res.status(400).json({ error: "Missing required fields: name, password, email, phone, playingFor, nationality, specialization" });
//     }

//     // Check if email already exists
//     const existingUser = await usersCollection.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     // Validate team exists
//     const team = await teamsCollection.findOne({ _id: new libMongodb.ObjectId(playingFor) });
//     if (!team) {
//       return res.status(400).json({ error: "Invalid team selected" });
//     }

//     const newPlayer = {
//       name,
//       password, // In production, you should hash this password
//       email,
//       phone,
//       playingFor,
//       playingForName: playingForName || team.name,
//       image: image || "",
//       nationality,
//       specialization,
//       stats: {
//         runs: stats?.runs || "0",
//         debut: stats?.debut || "",
//         dob: stats?.dob || "",
//         matches: stats?.matches || "0"
//       },
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const result = await usersCollection.insertOne(newPlayer);
//     res.status(201).json({ message: "Player created successfully", playerId: result.insertedId });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });
// server.patch("/adminplayers/:id", async (req, res) => {
//   const token = req.headers.token;
//   const playerId = req.params.id;
  
//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const usersCollection = db.collection("USERS");
//     const teamsCollection = db.collection("TEAMS");

//     // Check if user is admin
//     const user = await usersCollection.findOne({ token });
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     const { 
//       name, 
//       password, 
//       email, 
//       phone, 
//       nationality, 
//       specialization, 
//       image, 
//       playingFor, 
//       playingForName,
//       stats 
//     } = req.body;
    
//     // Validate required fields
//     if (!name || !nationality || !specialization || !playingFor) {
//       return res.status(400).json({ error: "Name, nationality, specialization, and team are required" });
//     }

//     // Validate team exists
//     const team = await teamsCollection.findOne({ _id: new libMongodb.ObjectId(playingFor) });
//     if (!team) {
//       return res.status(400).json({ error: "Invalid team selected" });
//     }

//     const updateData = {
//       name,
//       nationality,
//       specialization,
//       image: image || "",
//       playingFor,
//       playingForName: playingForName || team.name,
//       stats: {
//         runs: stats?.runs || "0",
//         debut: stats?.debut || "",
//         dob: stats?.dob || "",
//         matches: stats?.matches || "0"
//       },
//       updatedAt: new Date()
//     };

//     // Add optional fields if provided
//     if (email) updateData.email = email;
//     if (phone) updateData.phone = phone;
//     if (password) updateData.password = password; // In production, hash this

//     const result = await usersCollection.updateOne(
//       { _id: new libMongodb.ObjectId(playerId) },
//       { $set: updateData }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ error: "Player not found" });
//     }

//     res.status(200).json({ message: "Player updated successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// // Add these endpoints to your server file

// // Get single team by ID
// server.get('/teams/:id', async (req, res) => {
//   const { id } = req.params;
//   const token = req.headers.token;

//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
//     const collection = await db.collection("TEAMS");
    
//     const { ObjectId } = require('mongodb');
//     const result = await collection.findOne({ _id: new ObjectId(id) });
    
//     if (!result) {
//       return res.status(404).json({ error: "Team not found" });
//     }
    
//     res.status(200).json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// // Create new team (Admin only)
// server.post('/adminteams', async (req, res) => {
//   const token = req.headers.token;
//   const { name, captain, coach, owner, state, logo, win, moto } = req.body;

//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
    
//     // Check if user is admin
//     const usersCollection = db.collection("USERS");
//     const user = await usersCollection.findOne({ token });
    
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     // Validate required fields
//     if (!name || !captain || !coach || !owner || !state || !logo) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const teamsCollection = db.collection("TEAMS");
    
//     // Check if team name already exists
//     const existingTeam = await teamsCollection.findOne({ name });
//     if (existingTeam) {
//       return res.status(400).json({ error: "Team name already exists" });
//     }

//     const newTeam = {
//       name,
//       captain,
//       coach,
//       owner,
//       state,
//       logo,
//       win: win || "",
//       moto: moto || ""
//     };

//     const result = await teamsCollection.insertOne(newTeam);
//     res.status(201).json({ 
//       message: "Team created successfully", 
//       teamId: result.insertedId 
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// // Update team (Admin only)
// server.put('/adminteams/:id', async (req, res) => {
//   const { id } = req.params;
//   const token = req.headers.token;
//   const { name, captain, coach, owner, state, logo, win, moto } = req.body;

//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
    
//     // Check if user is admin
//     const usersCollection = db.collection("USERS");
//     const user = await usersCollection.findOne({ token });
    
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     // Validate required fields
//     if (!name || !captain || !coach || !owner || !state || !logo) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const teamsCollection = db.collection("TEAMS");
//     const { ObjectId } = require('mongodb');
    
//     // Check if team exists
//     const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(id) });
//     if (!existingTeam) {
//       return res.status(404).json({ error: "Team not found" });
//     }

//     // Check if new name conflicts with another team
//     const nameConflict = await teamsCollection.findOne({ 
//       name, 
//       _id: { $ne: new ObjectId(id) } 
//     });
//     if (nameConflict) {
//       return res.status(400).json({ error: "Team name already exists" });
//     }

//     const updatedTeam = {
//       name,
//       captain,
//       coach,
//       owner,
//       state,
//       logo,
//       win: win || "",
//       moto: moto || ""
//     };

//     const result = await teamsCollection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedTeam }
//     );

//     if (result.modifiedCount === 0) {
//       return res.status(400).json({ error: "No changes made" });
//     }

//     res.status(200).json({ message: "Team updated successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });

// // Delete team (Admin only)
// server.delete('/adminteams/:id', async (req, res) => {
//   const { id } = req.params;
//   const token = req.headers.token;

//   if (!token) {
//     return res.status(401).json({ error: "Token required" });
//   }

//   try {
//     await connection.connect();
//     const db = await connection.db(DB);
    
//     // Check if user is admin
//     const usersCollection = db.collection("USERS");
//     const user = await usersCollection.findOne({ token });
    
//     if (!user || !user.isAdmin) {
//       return res.status(403).json({ error: "Admin access required" });
//     }

//     const teamsCollection = db.collection("TEAMS");
//     const { ObjectId } = require('mongodb');
    
//     // Check if team exists
//     const existingTeam = await teamsCollection.findOne({ _id: new ObjectId(id) });
//     if (!existingTeam) {
//       return res.status(404).json({ error: "Team not found" });
//     }

//     const result = await teamsCollection.deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 0) {
//       return res.status(400).json({ error: "Failed to delete team" });
//     }

//     res.status(200).json({ message: "Team deleted successfully" });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     connection.close();
//   }
// });




// // server.post('/players', (req, res) => {
// //     console.log("player creation request reveieved");
// //     res.send("player created successfully");
// // })

// server.listen(8000, () => {
//   console.log("Listening over 8k");
// });
// === index.js (Backend - Simplified & Functional) ===

// --- 1. IMPORTS & INITIAL SETUP ---
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const randomString = require("randomstring");

const server = express();
server.use(cors());
server.use(express.json());

// --- 2. DATABASE CONNECTION (CONNECT ONCE) ---
// This is the essential fix for the "Topology is closed" error.
const DB_URI = "mongodb://rud:pass123@localhost:27017/IMS?authSource=IMS";
const DB_NAME = "IMS";
let db; // This variable will hold our database instance

MongoClient.connect(DB_URI)
  .then(client => {
    console.log('✅ Database connected successfully');
    db = client.db(DB_NAME);

    // Start the server only AFTER the DB is connected
    server.listen(8000, () => {
      console.log('🚀 Server is listening on port 8000');
    });
  })
  .catch(error => {
    console.error('❌ Could not connect to the database. The server will not start.', error);
    process.exit(1);
  });

// --- 3. API ROUTES ---

// User Registration (Signup)
server.post("/users", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) return res.status(400).json({ error: "All fields are required" });

    const existingUser = await db.collection("USERS").findOne({ email });
    if (existingUser) return res.status(409).json({ error: "Email already exists" });

    // Storing password in plain text as requested
    await db.collection("USERS").insertOne({ name, email, password, phone });
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User Login (Token Generation)
server.post("/tokens", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    // Finding user by plain text password
    const user = await db.collection("USERS").findOne({ email: email, password: password });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const token = randomString.generate(32);
    await db.collection("USERS").updateOne({ _id: user._id }, { $set: { token: token } });
    res.status(200).json({ token: token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get User Roles
server.get("/users/roles", async (req, res) => {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ error: "Token required" });
  try {
    const user = await db.collection("USERS").findOne({ token });
    if (!user) return res.status(404).json({ error: "User not found for this token" });
    res.status(200).json({
      teamOwner: !!user.isOwner,
      isAdmin: !!user.isAdmin,
      isOwnerTeamId: user.isOwner || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all Players
server.get("/players", async (req, res) => {
  try {
    const players = await db.collection("USERS").find({ playingFor: { $exists: true } }).project({ password: 0, token: 0 }).toArray();
    res.status(200).json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single Player's stats
server.get("/players/:id/stats", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const player = await db.collection("USERS").findOne({ _id: new ObjectId(req.params.id) });
    if (!player) return res.status(404).json({ error: "Player not found" });

    if (player.playingFor) {
      const team = await db.collection("TEAMS").findOne({ _id: new ObjectId(player.playingFor) });
      player.playingForName = team ? team.name : "Unknown";
    }
    res.status(200).json(player);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all Teams
server.get('/teams', async (req, res) => {
  try {
    const teams = await db.collection("TEAMS").find({}).toArray();
    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single Team
server.get('/teams/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const team = await db.collection("TEAMS").findOne({ _id: new ObjectId(req.params.id) });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

server.get("/teams/:id/stats", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid team ID format." });
    }
    const teamId = new ObjectId(req.params.id);
    const teamIdString = req.params.id; // Keep the string version for player query

    // Fetch team and players in parallel for efficiency
    const [team, players] = await Promise.all([
      db.collection("TEAMS").findOne({ _id: teamId }),
      db.collection("USERS").find({ playingFor: teamIdString }).project({ password: 0, token: 0 }).toArray()
    ]);

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }
    
    // The structure your frontend expects
    res.status(200).json({ team, players });

  } catch (error) {
    next(error); // Pass to central error handler
  }
});

// --- ADMIN-ONLY ROUTES ---

// Create a Player (Admin)
server.post("/adminplayers", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });

    const { name, password, email, phone, playingFor, nationality, specialization, stats } = req.body;
    if (!name || !password || !email || !phone || !playingFor || !nationality || !specialization) return res.status(400).json({ error: "Missing required fields" });

    const result = await db.collection("USERS").insertOne({ name, password, email, phone, playingFor, nationality, specialization, stats: stats || {}, createdAt: new Date() });
    res.status(201).json({ message: "Player created successfully", playerId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a Player (Admin)
server.patch("/adminplayers/:id", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });
    
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    
    const { password, ...updateData } = req.body;
    if (password) {
      updateData.password = password; // Set new plain text password if provided
    }
    updateData.updatedAt = new Date();

    const result = await db.collection("USERS").updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Player not found" });

    res.status(200).json({ message: "Player updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a Player (Admin)
server.delete("/adminplayers/:id", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });

    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid ID format" });
    const result = await db.collection("USERS").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Player not found" });

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a Team (Admin)
server.post('/adminteams', async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });

    const { name, captain, coach, owner, state, logo, ...rest } = req.body;
    if (!name || !captain || !coach || !owner || !state || !logo) return res.status(400).json({ error: "Missing required fields" });
    
    const result = await db.collection("TEAMS").insertOne({ name, captain, coach, owner, state, logo, ...rest });
    res.status(201).json({ message: "Team created successfully", teamId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a Team (Admin)
server.put('/adminteams/:id', async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });

    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid team ID format" });

    const { name, captain, coach, owner, state, logo, ...rest } = req.body;
    if (!name || !captain || !coach || !owner || !state || !logo) return res.status(400).json({ error: "Missing required fields" });
    
    const result = await db.collection("TEAMS").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { name, captain, coach, owner, state, logo, ...rest } });
    if (result.matchedCount === 0) return res.status(404).json({ error: "Team not found" });

    res.status(200).json({ message: "Team updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a Team (Admin)
server.delete('/adminteams/:id', async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    const adminUser = await db.collection("USERS").findOne({ token });
    if (!adminUser || !adminUser.isAdmin) return res.status(403).json({ error: "Admin access required" });

    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid team ID format" });
    
    const result = await db.collection("TEAMS").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Team not found" });

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



server.get("/owner/team", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication token required." });
    }

    // 1. Find the user making the request by their token
    const user = await db.collection("USERS").findOne({ token });
    if (!user) {
      // Send a "Forbidden" error so the frontend knows to redirect to login
      return res.status(403).json({ error: "Forbidden: Invalid token." });
    }

    // 2. Check if the user is actually an owner
    if (!user.isOwner) {
      return res.status(403).json({ error: "Forbidden: You do not own a team." });
    }

    // 3. Find the team using the ID stored in the user document
    const teamId = new ObjectId(user.isOwner);
    const team = await db.collection("TEAMS").findOne({ _id: teamId });

    if (!team) {
      return res.status(404).json({ error: "Your owned team could not be found." });
    }
    
    // 4. Send the team data back, matching the format the frontend expects.
    res.status(200).json({ team: team });

  } catch (err) {
    console.error("Error fetching owned team:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
/**
 * A SECURE ROUTE FOR AN OWNER TO UPDATE THEIR OWN TEAM'S DETAILS
 * It only allows changing non-critical fields like logo and motto.
 */
server.patch("/owner/team", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });

    const user = await db.collection("USERS").findOne({ token });
    if (!user || !user.isOwner) {
      return res.status(403).json({ error: "Forbidden. You do not own a team." });
    }

    // Log the incoming body for easy debugging
    console.log("Request to update team received with body:", req.body);

    const { name, captain, logo, moto } = req.body;

    // Perform validation for the required fields.
    if (!name || name.trim() === '' || !captain || captain.trim() === '') {
      return res.status(400).json({ error: "Team Name and Captain are required and cannot be empty." });
    }

    // Build the update object dynamically. This is safer.
    // It prevents accidentally overwriting a field with 'undefined' if it's not sent.
    const fieldsToUpdate = {
        name: name,
        captain: captain,
        updatedAt: new Date()
    };
    
    // Only add logo and moto if they were actually provided in the request.
    if (logo !== undefined) {
        fieldsToUpdate.logo = logo;
    }
    if (moto !== undefined) {
        fieldsToUpdate.moto = moto;
    }

    const teamIdToUpdate = new ObjectId(user.isOwner);

    // Perform the update with the safely constructed object.
    const result = await db.collection("TEAMS").updateOne(
      { _id: teamIdToUpdate },
      { $set: fieldsToUpdate }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Your owned team could not be found." });
    }

    res.status(200).json({ message: "Team details updated successfully." });
  } catch (err) {
    console.error("Error updating owned team:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * A SECURE ROUTE FOR AN OWNER TO MANAGE THEIR ROSTER
 * Allows adding or removing a player from their team.
 */
server.patch("/owner/roster", async (req, res) => {
  try {
    const token = req.headers.token;
    if (!token) return res.status(401).json({ error: "Token required" });
    
    const { playerId, action } = req.body; // Expecting an action: 'add' or 'remove'
    if (!playerId || !action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ error: "A 'playerId' and 'action' ('add' or 'remove') are required." });
    }
    if (!ObjectId.isValid(playerId)) {
      return res.status(400).json({ error: "The provided player ID has an invalid format." });
    }

    const owner = await db.collection("USERS").findOne({ token });
    if (!owner || !owner.isOwner) {
      return res.status(403).json({ error: "Forbidden. You do not own a team." });
    }

    const ownerTeamIdString = owner.isOwner;
    // If 'add', set playingFor to the owner's team ID. If 'remove', set it to null (unassigned).
    const newPlayingForValue = action === 'add' ? ownerTeamIdString : null;

    const result = await db.collection("USERS").updateOne(
      { _id: new ObjectId(playerId) },
      { $set: { playingFor: newPlayingForValue } }
    );

    if (result.matchedCount === 0) return res.status(404).json({ error: "Player not found." });
    
    res.status(200).json({ message: `Player successfully ${action === 'add' ? 'added to' : 'removed from'} roster.` });
  } catch (err) {
    console.error("Error managing roster:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});