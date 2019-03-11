const keys = require('./keys');
//Importing the redis client and
const redis = require('redis');

// Make connection to redis clientcreating a redis client
const redisClient = redis.createClient({
    host:keys.redisHost,
    port:keys.redisPort,
    retry_strategy: () => 1000
});

//Make duplicate copy of redis client. sub stands for subscription
const sub = redisClient.duplicate();

//Write the logic for the fibonacci series
function fib(index){
    if(index < 2) return 1;
    return fib(index-1)+fib(index-2);  
}

// Watch redis when a new value is inserted into and run the fibo function and get a new message
//When we get a new message, run the call back function

// calculate the fibonacci value, insert that into hash of values, message is the index value and push the fibonacci value
sub.on('message',(channel,message) =>{
    redisClient.hset('values',message,fib(parseInt(message)))
});


//subscribe to the insert event
sub.subscribe('insert');