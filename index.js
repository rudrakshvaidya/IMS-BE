const libExpress = require('express');
const cors = require('cors')
const server = libExpress();

server.use(cors());

//API FOR USERS
server.get('/users', (req, res) => {
    res.json([
      {name: "user1"},
      {name: "user2"},
      {name: "user3"},
      {name: "user4"}
    ])
})

server.post('/users', (req, res) => {
    console.log("user creation request reveieved");
    res.send("User created successfully");
})

server.post('/teams', (req, res) => {
    console.log("team creation request reveieved");
    res.send("Team created successfully");
})

server.post('/players', (req, res) => {
    console.log("player creation request reveieved");
    res.send("player created successfully");
})

server.listen(8000,()=>{
    console.log("Listening over 8k")
})