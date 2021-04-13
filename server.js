//**----------------------------- */
//** NODE SERVER                  */
//**----------------------------- */

/*jshint esversion: 6 */
/*jshint asi: true */
/*jshint expr: true */

'use strict';
const {log} = console

require('https');
require('cors')
const express = require('express');
var app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');

  next();
});


const port = 8080 
var server = app.listen(port)

app.use(express.static('public'))

console.log(`this socket server is running on port ${port}`)
const socket = require('socket.io')

const io = socket(server, { 
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
})

io.sockets.on('connection', newConnection)


const yahooFinance = require('yahoo-finance');


function newConnection(socket) {
  console.log('new connection: ' + socket.id)
  socket.on('fetchHistoricalData', fetchHistoricalData)
  function fetchHistoricalData(symbol) { 
    log(`fetchHistoricalData ${symbol}`)
    const thisDate = new Date()
    const thisYear = String(thisDate.getFullYear())
    const thisMonth = function(){
      
      const m = thisDate.getMonth() + 1

      if(m < 10)return '0' + m
      return String(m)
    }()
    const thisDay = function(){
      const d = thisDate.getDate()
      if(d < 10)return '0' + d
      return String(d)
    }()
    const today = thisYear + '-' + thisMonth + '-' + thisDay


    const beginDate = '2011-03-10', endDate = today//'2021-03-10'

    //** GET HISTORICAL DATA FROM YAHOO FINANCE */
    yahooFinance.historical({
      symbol,
      from: beginDate,
      to: endDate,
    }, function (err, quotes) {
      //** SEND RETRIVED DATA TO REQUESTER */
      log('SEND RETRIVED DATA TO REQUESTER :' + symbol)
      socket.emit('returnHistoricalData', quotes.reverse())
    })
  }
}



