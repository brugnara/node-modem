var Modem = require('./');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});