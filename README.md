Modem
=====

With this module, you can enqueue commands via serial. It's main scope is to operate a modem (send sms, do a voice call,
...)

Refer to `examples` for real use cases.

# Install

```bash
npm install --save node-modem

# if you need a fully working PDU converter:
# npm install --save sms-pdu-node 
```

# Usage

```js
var Modem = require('../index');

var modem = new Modem('/dev/tty.usbserial', function(err, data) {
  err && console.error(err);
});

modem.command('AT+CMGF=1', console.log.bind(console));
```

## Sequence

Use this to execute a sequence of commands. 

```js
var pdu = require('sms-pdu-node');
var PDU = pdu('ciao', '393420011223', null, 7);

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
], console.log.bind(console));
```