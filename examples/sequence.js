/**
 * Created by vrut on 22/09/14.
 */

var Modem = require('../');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
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
  modem.close();
});