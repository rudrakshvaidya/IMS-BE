const libExpress = require('express');

const server = libExpress();
//API FOR USERS
server.post('/users', (req, res) => {
    console.log("user creation request reveieved");
    res.send("User created successfully");
})
//API FOR TEAMS - MAYBE ALL ADMIN APIS
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