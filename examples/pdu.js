var Modem = require('../index');
var async = require('async');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

// sending with PDU

var pdu = require('sms-pdu-node');
var PDU = pdu('13123123123127y3g12u3g12u3g12ouh3g1o2uhg31uo2hg3u12hg3u12hb3h12bg31g2hj3jh12g3h12g3bhj12b3jh12b3jh12b3j1h2b312jhb312jhb31jh2b3j1h2b312hjb31jhb3j12hb3j1hb31j2hbi', '393420011223', null, 7);

console.log(PDU);

return;

modem.sequence([
  {
    command: 'AT+CMGF=0'
  },
  {
    command: PDU.command,
    options: {
      expect: '>'
    }
  },
  {
    command: PDU.pdu,
    options: {
      endline: Modem.ctrlZ
    }
  }
], function(err) {
  err && console.error(err);
  modem.close();
});
