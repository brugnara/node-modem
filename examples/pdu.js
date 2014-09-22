var Modem = require('../index');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

// sending with PDU

var pdu = require('sms-pdu-node');
var PDU = pdu('ciao', '393420011223', null, 7);
modem.sequence([
  {
    command: 'AT+CMGF=0'
  },
  {
    command: PDU.command,
    expect: '>',
    endline: Modem.ctrlZ
  },
  {
    command: PDU.pdu
  }
], console.log.bind(console));