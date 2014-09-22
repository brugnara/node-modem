/**
 * Created by vrut on 22/09/14.
 */

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
  function(cb) {
    setTimeout(cb, 60 * 1000);
  },
  function(cb) {
    modem.command('AT+CHUP', cb);
  }
], function(err) {
  err && console.error(err);
});