"use strict"

var tester = require('httptester');

try {
  tester.launch('./test/config.json')
} catch(e) {
  console.log(e);
}
