# httptester - Application http paths tester

httptester is a simple to use node module to test http/https URLs of your application.

## Install and configuration

Install with npm

```sh
npm install httptester
```
Copy /test folder from module to project root
Copy /bin folder from module to /test

httptester starts from a config file to run http/https tests.

Generate config.json by running the following command and follow the instructions

```sh
bash ./test/bin/genconfig.sh
```
Config file example

```js
{
   "baseUrl": "http://127.0.0.1:3000",
   "login" : {
      "path" : "/login",
      "username" : "YOUR_USERNAME",
      "pass" : "YOUR_PASSWORD"
   },
   "rejectCodes" : [500, 404, 403, 402, 401, 400],
   "cases": [
	   {
       "path": "/dashboard",
       "method": "GET",
       "headers" : {
         "X-Access-Token": "DuhgduihsdFHfiudsigsdoigjsDGU659595922"
       }
  	 },
     {
       "path": "/companies?_=1474988489928",
       "method": "GET"
  	 }
   ]
}

```
## Tests launcher example

```js
var tester = require('httptester');

try {
  tester.launch('./test/config.json')
} catch(e) {
  console.log(e);
}
```
