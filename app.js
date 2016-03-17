//This Requires kafka and zookeeper running. 
//http://kafka.apache.org/documentation.html#quickstart Has the links to download these and instructions on how to start.

//This is a test application that uses Kafka. Upon reciving a post request it sends a message though kafka. There is an event lister that
//then recives these messages and ouputs them to the console

//The post request expects an event header. It can be either add, update, delete. Any other value will be handled by the unrecognized function 
//The request must also have a body containing the data property

//All of the kafka logic is abstracted out into eventBroker.js and eventHandler.js

var when = require('when'); //when for promises

//setup producer
var sendEvent = require('./eventBroker')('localhost:9092', "events", console.log);

//express boilerplate
var express = require('express');
var bodyParser = require('body-parser');
app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//function for unrecognized events
function unrecognized(event, data) {
    console.log("unrecognized event: " + event + " with: "+ JSON.stringify(data));
}

//functions to be called on the recival fo a spesific event
var eventMap = {
    add: function (data) {
        console.log("add " + JSON.stringify(data));
    }, 
    delete: function (data) {
       console.log("delete " + JSON.stringify(data));
    },
    update: function (data) {
        console.log("update " + JSON.stringify(data));
    }
};

//setup listener
require("./eventHandler")('localhost:9092', "events", eventMap, unrecognized,'./kafka-offsets', console.log);

//send events upon getting a post request with the data
app.post('/', function(req, res) {
    sendEvent(req.headers.event, req.body.data);
    res.status(200).send('Message is queued...');
});

//start server
app.listen(8083);