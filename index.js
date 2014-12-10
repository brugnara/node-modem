var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var async = require('async');
var once = require('once');
var EE = require('events').EventEmitter;

var DEFAULTS = {
  baudrate: 9600,
  timeout: 60,
  expect: 'OK',
  endline: '\r'
};

var noop = function(){};

function Modem(port, options, cb) {
  this.port = port;
  this.next = null;
  this.idle = true;
  this.ready = false;
  this.queue = [];
  this.events = [];
  this.eventEmitter = new EE();
  if (!cb) {
    cb = options;
    options = null;
  }
  this.options = options || {};
  this.options.baudrate = this.options.baudrate || DEFAULTS.baudrate;
  this.options.timeout = this.options.timeout || DEFAULTS.timeout;
  this.options.endline = this.options.endline || DEFAULTS.endline;
  this.options.expect = this.options.expect || DEFAULTS.expect;
  //
  cb && (cb = once(cb));
  //
  this.serialPort = new SerialPort(port, {
    baudrate: this.options.baudrate,
    parser: serialport.parsers.readline('\n')
  });
  // events
  this.handleEvents(this.serialPort, cb);
}

Modem.ctrlZ = String.fromCharCode(26);

Modem.prototype.close = function(cb) {
  this.serialPort && this.ready && this.serialPort.close(cb);
};

Modem.prototype.on = function(event, handler) {
  if (this.events.indexOf(event) === -1) {
    this.events.push(event);
  }
  this.eventEmitter.on(event, handler);
};

Modem.prototype.handleEvents = function(serialPort, cb) {
  serialPort.on('open', function() {
    this.ready = true;
    cb && cb();
    this.startQueueDigester();
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
  //
  serialPort.on('data', function(data) {
    var res = data.toString().trim();
    if (res === this.lastCommand && this.next.expect != '>') {
      return;
    }
    // is something we are waiting for? ie: RING
    if (this.events.indexOf(res) !== -1) {
      this.eventEmitter.emit(res);
    }
    if (this.next) {
      if (res.indexOf('ERROR') !== -1) {
        this.next.cb && this.next.cb(new Error(res));
      } else {
        this.next.cb && this.next.cb(null, res);
      }
    }
  }.bind(this));
};

Modem.prototype.command = function(command, options, cb) {
  if (!cb) {
    cb = options;
    options = {};
  }
  this._enqueue({
    type: 'single',
    commands: [
      this._prepareCommand(command, options)
    ],
    cb: cb || noop
  }, cb);
};

Modem.prototype._prepareCommand = function(command, options) {
  return {
    command: command,
    expect: options.expect || this.options.expect,
    timeout: options.timeout || this.options.timeout,
    endline: options.endline || this.options.endline
  }
};

Modem.prototype.sequence = function(commands, cb) {
  var cmds = [];
  commands.forEach(function(command) {
    if (!command.command) {
      throw new Error('Missing command!');
    }
    cmds.push(this._prepareCommand(command.command, command.options || {}));
  }.bind(this));
  //
  this._enqueue({
    type: 'sequence',
    commands: cmds,
    cb: cb || noop
  })
};

Modem.prototype._enqueue = function(commands) {
  // enqueue command
  this.queue.push(commands);
  this.startQueueDigester();
};

Modem.prototype._executor = function(cmdsObj) {
  async.eachSeries(cmdsObj.commands, function(cmdObj, next) {
    var timeout;
    var cb = once(function(err, data) {
      clearTimeout(timeout);
      this.idle = true;
      next(err, data);
      this.startQueueDigester();
    }.bind(this));
    this.next = {
      cb: cb,
      expect: cmdObj.expect
    };
    timeout = setTimeout(function () {
      cb(new Error('timed out'));
    }.bind(this), cmdObj.timeout * 1000);
    //
    this.idle = false;
    this.lastCommand = cmdObj.command;
    this.serialPort.write(cmdObj.command + cmdObj.endline, function(err) {
      this.serialPort.drain(function() {
        err && cb(err);
      });
    }.bind(this));
  }.bind(this), cmdsObj.cb);
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