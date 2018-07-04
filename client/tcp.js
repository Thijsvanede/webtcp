function TCP(address, callback){
    /** TCP attributes. **/
    /* Connection to WebSocket. */
    this.socket = io.connect(address);
    /* Current state of TCP. */
    this.state  = 'disconnected';
    /* Set callback function */
    this.callback = callback;
    /* Set self reference. */
    var self    = this;


    /** Socket sending methods. **/
    /* Setup a connection to host:port. */
    this.connect = function(host, port){
        if(this.state === 'disconnected'){
            this.socket.emit('tcp', {
                host: host,
                port: port
            });
            return true;
        }
        return false;
    }

    /* Send a message. */
    this.send = function(data){
        if(this.state === 'connected'){
            this.socket.emit('send', data);
            return true;
        }
        return false;
    };

    /* Disconnect connection. */
    this.disconnect = function(){
        if(this.state === 'connected'){
            this.socket.emit('tcp_exit');
            return true;
        }
        return false;
    };


    /** State transition actions. **/
    /* Connect transition. */
    this.state_connect = function(){
        this.state = 'connected';
    };

    /* Disconnect transition. */
    this.state_disconnect = function(){
        this.state = 'disconnected';
    };


    /** Actions on socket events. **/
    /* When a tcp_ack is received, transition to connected state. */
    this.socket.on('tcp_ack', function(){
        self.state_connect();
    });

    /* When a connection_exit is received, transition to disconnected state. */
    this.socket.on('connection_exit', function(){
        self.state_disconnect();
    });
    
    /* When a data is received, pass it through to the callback function. */
    this.socket.on('data', function(data){
        self.callback(data);
    });
}
