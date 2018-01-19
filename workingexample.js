function HelloWorldWorker() {
}

HelloWorldWorker.prototype.WORKER_URI_PATH = "shared/aci-integration";
HelloWorldWorker.prototype.isPublic = true;
const logger = require('f5-logger').getInstance();

HelloWorldWorker.prototype.onStart = function (success) {
  logger.info("HelloWorld onStart()");

                var request = require('request');

                var formData = "<aaaUser name=\"admin\" pwd=\"cisco123\" />";
                var contentLength = formData.length;

                var username = "admin";
                var password = "admin";
                var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

                function callBackFour (vlan2) {
                        //console.log("VLAN2 ADDED TO BIG-IP:", vlan2);
                        logger.info("VLAN2 ADDED TO BIG-IP:", vlan2);
                }

                function callBackThree (vlan1,vlan2) {
                        //console.log("VLAN1 ADDED TO BIG-IP:", vlan1);
                        logger.info("VLAN1 ADDED TO BIG-IP:", vlan1);
                        //Make a request to configure VLAN2 on BIG-IP
                        formData = {
                                "name": "vlan2",
                                "partition": "Common",
                                "interfaces": [{
                                        "name": "1.2",
                                        "untagged": true
                                }],
                                "tag": vlan2
                        };

                        var formData_s = JSON.stringify(formData);
                        var contentLength = formData_s.length;

                        //Make a request to configure VLAN on BIG-IP
                        request({
                                headers: {
                                'Content-Length': contentLength,
                                'Content-Type': 'application/json',
                                'Authorization': auth
                        },
                         uri: 'https://10.192.73.218/mgmt/tm/net/vlan',
                         body: formData_s,
                         method: 'POST'
                        }, callBackFour(vlan2));
                }

                //Parse the output to grab the VLANS
                var callBackTwo = function (err, res, body) {
                         var pos = body.indexOf("encap");
                         pos += 13;
                         pos1 = pos + 4;
                         var vlan1 = body.slice(pos,pos1);
                         //console.log("VLAN1: ", vlan1)
                         logger.info("VLAN1: ", vlan1);
                         var pos2 = body.indexOf("encap",pos1);
                         pos2 += 13;
                         pos3 = pos2 + 4;
                         var vlan2 = body.slice(pos2,pos3);
                         //console.log("VLAN2: ", vlan2);
                         logger.info("VLAN2: ", vlan2);

                         formData = {
                                "name": "vlan1",
                                "partition": "Common",
                                "interfaces": [{
                                                "name": "1.1",
                                                "untagged": true
                                }],
                                "tag": vlan1
                         };

                         var formData_s = JSON.stringify(formData);
                         contentLength = formData_s.length;

                         //Make a request to configure VLAN1 on BIG-IP
                          request({
                          headers: {
                           'Content-Length': contentLength,
                           'Content-Type': 'application/json',
                           'Authorization': auth
                          },
                          uri: 'https://10.192.73.218/mgmt/tm/net/vlan',
                          body: formData_s,
                          method: 'POST'
                          }, callBackThree(vlan1,vlan2));
                };

                //Parse the output to extract token
                var callBackOne = function (err, res, body) {
                        var pos = body.indexOf("token");
                        pos += 7;
                        var pos1 = body.indexOf("\"",pos);
                        var result = body.slice(pos, pos1);
                        //console.log("TOKEN:", result);
                        logger.info("TOKEN:", result);
                        var cookie = 'APIC-Cookie=' + result;

                        //Make a request to grab the VLAN information from APIC, using the auth TOKEN in the request
                        request({
                        headers: {
                          'Content-Length': contentLength,
                          'Content-Type': 'application/x-www-form-urlencoded',
                          'Cookie': cookie
                        },
                        uri: 'https://10.192.73.30/api/node/mo/uni/tn-UM_Tenant2A/lDevVip-UM_Tenant2A.json?query-target=subtree',
                        body: formData,
                        method: 'GET'
                        }, callBackTwo);
                  };

                //Make a request to get the Authorization token from APIC
                request({
                        headers: {
                          'Content-Length': contentLength,
                          'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        uri: 'https://10.192.73.30/api/aaaLogin.xml',
                        body: formData,
                        method: 'POST'
                  }, callBackOne);

  success();
};

HelloWorldWorker.prototype.onGet = function(restOperation) {
  restOperation.setBody("Hello");
  this.completeRestOperation(restOperation);
};

module.exports = HelloWorldWorker;
