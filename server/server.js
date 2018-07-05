var express = require('express');
var socket  = require('socket.io');
var net     = require('net');

/* Application setup */
var port   = 4000
var app    = express();
var server = app.listen(port, function(){
    console.log('listening to requests on port', port);
});

/* Socket setup */
var io = socket(server);

io.on('connection', function(socket){
    console.log('Socket connected!');
    /* Create TCP client for a connection. */
    var client    = new net.Socket();
    var connected = false;
    
    
    /* Create actions for given socket events. */
    /* On tcp event, connect socket to given host:port*/
    socket.on('tcp', function(data){
        client.connect(data.port, data.host, function(){
            socket.emit('tcp_ack');
            connected = true;
            console.log('Connection ', data.host, ':', data.port, ' established!');
        });
    });

    /* On tcp_exit, disconnect socket. */
    socket.on('tcp_exit', function(data){
        connected = false;
        client.end();
        socket.emit('connection_exit');
        //client = new net.Socket();
    });

    /* On send, send data over socket if connected. */
    socket.on('send', function(data){
        if(connected)
            client.write(data);
        else
            socket.emit('error', 'Not connected to any client');
    });
    
    
    /** Create actions for given TCP client events. **/
    /* On close event, send exit to WebClient and create new Socket. */
    client.on('close', function(){
        connected = false;
        socket.emit('connection_exit');
        client = new net.Socket();
    });
    
    /* On data event, relay data to WebClient. */
    client.on('data', function(data){
        socket.emit('data', data);
    });
});
