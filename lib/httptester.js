
const request = require('request'),
      fs = require('fs'),
      _ = require('underscore'),
      CryptoJS = require('crypto-js');

exports.launch = function(path) {

    var fconfig, config, report, status, commonHeaders, finalLog;

    // Retrieve config
    fconfig = fs.readFileSync(path);
    config = JSON.parse(fconfig.toString());

    // Init report
    report = new Array;

    // Enum status
    status = {
      success: 'SUCCESS',
      fail: 'FAIL'
    }

    // Define headers gen function
    function hgen(callback) {

        // Post login credentials
        request({
          url: config.baseUrl + config.login.path,
          method: 'POST',
          body: 'username=' + config.login.username + '&lang=&password=' + CryptoJS.SHA256(config.login.pass).toString(CryptoJS.enc.Hex),
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }, (err, res, body) => {
            if(err || parseInt(res.statusCode) != 200)
                callback(true)
            else {
                commonHeaders = {
                  'Cookie': res.headers['set-cookie'].join('; '),
                }
                callback();
            }
        })
    }

    // Define recursive http call function
    function req(callback, i) {

       var c, headers, log;
       i = i || 0;

       // Reached end?
       if(i === config.cases.length - 1)
         callback();
       else {
         c = config.cases[i];
         log = new Date().toISOString();
         log += ' [' + (c.method ? c.method.toUpperCase() : '') + ' ' + c.path + '] > ';

         // Build headers
         headers = commonHeaders;
         for(var k in c.headers)
            headers[k] = c.headers[k];

         // Case http call
         request({
           url: config.baseUrl + c.path,
           method: c.method,
           body: c.body,
           headers: headers
         }, (err, res, body) => {

            // Fail?
            var fail = err || config.rejectCodes.indexOf(parseInt(res.statusCode)) > -1
                       || (c.path !== config.login.paths && res.request.uri.pathname === config.login.path);

            // log
            log += fail ? '✘ HTTP test failed' : '✓ HTTP test succeeded';
            console.log( log );

            // Push result to report
            report.push({
                date: new Date().toISOString(),
                url: c.path,
                status: fail ? status.fail : status.success,
                message: err || ''
            });

            // Next cases
            req(callback, i + 1);
         });
       }
    }

    // Generating headers
    hgen((err) => {
       if(err)
          console.log('[ERROR: Login failed, could not generate headers]');
        else {

          // Launching tests
          console.log(new Date().toISOString() + ' [' + config.baseUrl + '] > Launching HTTP test ...');
          req(()=>{

              // Generating ifinal log
              finalLog = new Date().toISOString();
              finalLog += ' Done, ';
              finalLog += _.where(report, {status: status.fail}).length;
              finalLog += ' tests failed, ';
              finalLog += _.where(report, {status: status.success}).length;
              finalLog += ' tests succeded';

              console.log(finalLog);
          });
        }
    });
}
