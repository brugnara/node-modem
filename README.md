Modem
=====

With this module, you can enqueue commands via serial. It's main scope is to operate a modem (send sms, do a voice call,
...)

Refer to `examples` for real use cases.

# Reality

We are using this module in a RoundRobin configuration with 2 servers with 4 modems each.
With this configuration, we are able to to send 8 messages simultaneously and 170k messages a day. Each message takes 2-4 seconds to be sent, depending on his length.

This module works but you need to write commands your self, it is not a stand-alone-do-all-for-me module so please remenber this and check examples for use-cases.

Feel free to try it and report any issue you have. I'm happy to help and improve.

# PDU and concatenated messages

There are no good solutions in JS on NPM you can use to achieve this.
I suggest you to use `python-messaging` and with a simple script file, you can encode/decode correctly messages. If you want to send only TEXT messages, be sure they are 160chars max or the modem will fail with a generic **ERROR**.
 
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
    command: 'AT+CMGF=0' // enables PDU mode (check examples for a TEXT send)
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
