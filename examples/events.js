/**
 * Created by vrut on 22/09/14.
 */

var Modem = require('../');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

// listen for a serial port event, ie: RING
modem.on('RING', function() {
  console.log('Ringing!!!!');
});