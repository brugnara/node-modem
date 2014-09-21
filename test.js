var Modem = require('./');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

// do a voicecall
async.waterfall([
  function(cb) {
    modem.command('ATD+393420011223;', cb);
  },
  function(junk, cb) {
    setTimeout(cb, 60 * 1000);
  },
  function(junk, cb) {
    modem.command('AT+CHUP', cb);
  }
], function(err) {
  err && console.error(err);
});

// send a text message
async.waterfall([
  function(cb) {
    // activate text mode
    modem.command('AT+CMGF=1', cb);
  },
  function(junk, cb) {
    modem.command('AT+CMGS="+393420011223"', {
      expect: '>'
    }, cb)
  },
  function(junk, cb) {
    modem.command('CIAO MONDO!', cb);
  }
], function(err) {
  err && console.error(err);
});

// listen for a serial port event, ie: RING
modem.on('RING', function() {
  console.log('Ringing!!!!');
});

// sequence
modem.sequence([
  {
    command: 'AT+CMGS="+393420011223"',
    options: {
      expect: '>'
    }
  },
  {
    command: 'CIAO MONDO!'
  }
], function(err) {
  err && console.error(err);
  console.log('done');
});

// sending with PDU

var pdu = require('sms-pdu-node');
var PDU = pdu('ciao', '393420011223', null, 7);
modem.sequence([
  {
    command: PDU.command,
    expect: '>'
  },
  {
    command: PDU.pdu
  }
], console.log.bind(console));