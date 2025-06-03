const libMongodb = require('mongodb');
const libExpress = require('express');
const cors = require('cors')

const server = libExpress();
server.use(libExpress.json());
const { MongoClient } = require('mongodb');
const DB = "IMS"
const connection = new MongoClient('mongodb://rud:pass123@localhost:27017/IMS?authSource=IMS')


server.use(cors());

//API FOR USERS
server.get('/users', (req, res) => {
   connection.connect().
    then(() => connection.db(DB)).
    then((db) => db.collection('USERS')).
    then((collection) => collection.find({}).toArray()).
    then((result) => console.log(result))
    .catch((err) => console.error(err));
   // res.json([
   //   {name: "user1"},
   //   {name: "user2"},
    //  {name: "user3"},
   //   {name: "user4"}
   // ])
})

server.post('/users', async (req, res) => {
  if (req.body.name && req.body.email && req.body.password && req.body.phone) 
    await connection.connect()
    const db = await connection.db(DB)
    const collection = await db.collection('USERS');
    const result = await collection.find({"email": req.body.email}).toArray()
    
    if (result.length > 0) {
      res.json({ error: "Email already exists" });
    }
    else{
        await collection.insertOne({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone
        })
        res.json({message: "User created successfully"});
    }
})
server.post('/token', (req, res) => {})

// server.post('/teams', (req, res) => {
//     console.log("team creation request reveieved");
//     res.send("Team created successfully");
// })

// server.post('/players', (req, res) => {
//     console.log("player creation request reveieved");
//     res.send("player created successfully");
// })

server.listen(8000,()=>{
    console.log("Listening over 8k")
})