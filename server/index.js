const keys = require('./keys');

//Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//cors stands for cross origin resource sharing
const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postgres Client Setup
//Postgress is sql type database similiar to MySQl
const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});


pgClient.on('error',()=>console.log('Lost PostGress connection'));

//Create Postgres table to store values submitted by the user

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err =>console.log(err));


//Make the Express server connect to Redis
//Redis Client Setup

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

//Create duplicate connection
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/',(req,res)=>{
    req.send('Hello');
})

//Define another route handler. This is used to query the PostGress instance and return all the values susbmitted by user.
// This is going to be async function
app.get('/values/all',async(req,res)=>{
    const values = await pgClient.query('SELECT * from values');

    //Send back the information to the one who requested
    res.send(values.rows);
});

// Another get request handler and reach redis this 
//time and retrieve all indices and return all values calculated
//hgetall - hash value
// redis library for node.js does not have the the await syntax hence classic way of route handling
app.get('/values/current',async(req,res)=>{
    redisClient.hgetall('values',(err,values)=>{
        res.send(values);
    });
}); 


// Final route handler will receive new indice from the user and react app will send this to Express server

app.post('/values',async(req,res)=>{
    const index = req.body.index;
    // Restrict the maximum index value to 40 to avoid complex calculations
    if(parseInt(index)>40){
        return res.status(422).send('Index too high');
    }

    // Put the index value into Redis database
    //hset - hash set
    redisClient.hset('values',index,'Nothing yet!');
    // publish a new insert event of that index value.
    redisPublisher.publish('insert',index);

    // Add the new index that was just submitted to the PG database
    pgClient.query('INSERT INTO values(number) VALUES($1)',[index]);

    // Send back response to the client saying some work in progress
    res.send({working: true});

});

// Listen on port 5000
app.listen(5000, err =>{
    console.log('Listening');
});