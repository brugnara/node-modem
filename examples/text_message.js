/**
 * Created by vrut on 22/09/14.
 */

var Modem = require('../');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

// send a text message
async.waterfall([
  function(cb) {
    // activate text mode
    modem.command('AT+CMGF=1', cb);
  },
  function(cb) {
    modem.command('AT+CMGS="+393420011223"', {
      expect: '>'
    }, cb)
  },
  function(cb) {
    modem.command('CIAO MONDO!', {
      endline: Modem.ctrlZ
  }, cb);
  }
], function(err) {
  err && console.error(err);
  modem.close();
});