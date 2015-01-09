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

## Reading data (ie read received sms)

```js

modem.sequence([
  {
    command: 'AT+CMGF=0'
  },
  {
    command: 'AT+CMGL=4' // reads all SIM messages
  }
], console.log.bind(console));
```

# Changelog

- 1.1.7: Returning values from commands. Useful for reading messages.
- 1.1.6: Minor fixes
- 1.1.5: Improved read when multilines comes from on('data').
- 1.1.4: Now you can pass options.modem to constructor. That object, will be passed to the Serialport constructor.
- 1.1.3: Rewritten parser
- 1.1.2: Fixes some strange issues related on reading data with some modems.
- 1.1.1: Initial release
