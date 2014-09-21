
var SerialPort = require('serialport').SerialPort;
var async = require('async');
var once = require('once');

var DEFAULTS = {
  baudrate: 9600,
  timeout: 60
};

var noop = function(){};

function Modem(port, options, cb) {
  this.port = port;
  this.idle = true;
  this.ready = false;
  this.queue = [];
  if (!cb) {
    cb = options;
    options = null;
  }
  this.options = options || {};
  this.options.baudrate = this.options.baudrate || DEFAULTS.baudrate;
  this.options.timeout = this.options.timeout || DEFAULTS.timeout;
  cb && (cb = once(cb));
  //
  this.serialPort = new SerialPort(port, {
    baudrate: this.options.baudrate
  });
  // events
  this.handleEvents(this.serialPort, cb);
}

Modem.prototype.handleEvents = function(serialPort, cb) {
  serialPort.on('open', function() {
    this.ready = true;
    cb && cb();
  }.bind(this));
  //
  serialPort.on('error', function(err) {
    this.ready = false;
    cb && cb(err);
  }.bind(this));
  //
  serialPort.on('close', function() {
    this.ready = false;
    cb && cb();
  }.bind(this));
};

Modem.prototype.command = function(command, timeout, cb) {
  if (!cb) {
    cb = timeout;
    timeout = this.options.timeout;
  }
  this._enqueue(command, timeout, cb);
};

Modem.prototype._enqueue = function(command, timeout, cb) {
  // enqueue command
  this.queue.push({
    command: command,
    timeout: timeout,
    cb: cb || noop
  });
  this.startQueueDigester();
};

Modem.prototype._executor = function(cmdObj) {
  var cb = once(function(err, data) {
    this.idle = true;
    cmdObj.cb(err, data);
    this.startQueueDigester();
  }.bind(this));
  var timeout = setTimeout(function () {
    cb(new Error('timed out'));
  }.bind(this), cmdObj.timeout * 1000);
  //
  this.idle = false;
  this.serialPort.write(cmdObj.command, cb);
};

Modem.prototype.startQueueDigester = function() {
  if (!this.ready || !this.idle) {
    return;
  }
  if (this.queue.length == 0) {
    return;
  }
  this._executor(this.queue.shift());
};

module.exports = Modem;