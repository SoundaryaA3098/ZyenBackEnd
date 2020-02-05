var request = require('request');
const fabricURL = 'http://localhost:4000';
var EventEmitter = require("events").EventEmitter;
var crypto = require('crypto');
const uuidv4 = require('uuid/v4');
var fs = require('fs');
const csv = require('csv-parser');
let nodemailer = require("nodemailer");
var generator = require('generate-password');



//generate salt
var genRandomString = function (length) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
};

//console.log("RandomString:::"+genRandomString(10));

//hash password with salt
var sha512 = function (password, salt) {
  var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  var value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value
  };
};


//generate salt for a user, and hash his password with the salt
function saltHashPassword(userpassword) {
  var salt = genRandomString(16); /** Gives us salt of length 16 */
  console.log('UserPassword = ' + userpassword);
  console.log('Salt = ' + salt);
  var passwordData = sha512(userpassword, salt);

  console.log('Passwordhash = ' + passwordData.passwordHash);
  console.log('nSalt = ' + passwordData.salt);
  return passwordData;
}


var login = {

  login: function (req, res, next) {
    console.log(req.body);
    //  var username = req.body.UserName;
    var postData = {
      username: req.body.UserName,
      orgName: req.body.OrgName
    };
    request.post({
      uri: fabricURL + '/users',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: require('querystring').stringify(postData)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
          // res.json({"username":username,"response":response});
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });

  },
  authenticate: function (req, res, next) {

    var resMessage = {};
    console.log(req.body);

    var userDetails = new EventEmitter();

    var getData = {
      peer: req.body.peer,
      fcn: "GetUserByUsername",
      args: '[\"' + req.body.UserName + '\"]'
    };

    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.body.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200 && body.length > 4) {
          try {
            console.log("BODY:::" + body);
            userDetails.data = JSON.parse(body);
            userDetails.emit('update');
          } catch (e) {
            res.send(e)
          }

        }  //if Not authenticated =>(the username or password is invalid)
        else {
          res.sendStatus(204);
        }
        //  }
      });


    userDetails.on('update', function () {
      console.log('response: ' + JSON.stringify(userDetails.data)); // HOORAY! THIS WORKS!
      var usr;
      usr = {
        usrDetails: userDetails.data
      }

    

      console.log("USER DETAILS::" + JSON.stringify(usr));
      console.log('usr ' + usr.usrDetails[0].PwdSalt);
      //  for(var i=0;i<usr.usrDetails.length;i++){

      var passwordData = sha512(req.body.Password, usr.usrDetails[0].PwdSalt);
      console.log(passwordData.passwordHash);
      console.log(usr.usrDetails[0].OrgName);
      console.log(usr.usrDetails[0].ApproveStatus);
      //if authenticated
      if (usr.usrDetails[0].Password === passwordData.passwordHash) { 
        var postData = {
          username: req.body.UserName,
          orgName: usr.usrDetails[0].OrgName.replace("o","O")
        };
        request.post({
          uri: fabricURL + '/users',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: require('querystring').stringify(postData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
           //   if(usr.usrDetails[0].ApproveStatus === "Approved"){
                response = JSON.parse(body);
                console.log("response:::" + JSON.stringify(response));
                // res.send(response);
                console.log("username:::" + usr.usrDetails[0].UserName);
              //  resMessage.JSON({ "username": usr.usrDetails[0].UserName, "userRoleID": usr.usrDetails[0].UserRoleID, "orgName": usr.usrDetails[0].OrgName,  "response": response });
              resMessage = { "data": usr.usrDetails[0] ,"response": response };
              res.send(resMessage);
            } else {
              console.log(response.statusCode + response.body);
              res.send({ login: -1 });
            }
          });
      } 
      else {
        res.sendStatus(204);
      }
    
    });

  },

  getUserByUserRoleName: function (req, res, next) {


    var userRoleDetails = new EventEmitter();
    console.log(req.query);
    // Querying UserRoleCC to get the RoleID
    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByRoleName",
      args: '[\"' + req.params.userRoleName + '\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserRoleCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }

    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          console.log(body);
          userRoleDetails.data = JSON.parse(body);
          userRoleDetails.emit('userRole');
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });


    userRoleDetails.on('userRole', function () {

      var data = {
        userRoleData: userRoleDetails.data
      }


      var getUserData = {
        peer: req.query.peer,
        fcn: "GetUserByRoleID",
        args: '[\"' + data.userRoleData.UserRoleID + '\"]'
      };
      console.log("---" + JSON.stringify(getUserData));
      request.get({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getUserData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.query.token
        }
        // body:require('querystring').stringify(getUserData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            console.log(body);
            response = JSON.parse(body);
            res.send(response);
          } else {
            console.log(response.statusCode + response.body);
            res.send({ login: -1 });
          }
        });

    });
  },

  addUser: function (req, res, next) {

    console.log(req.body);
    var userId = uuidv4();
    console.log("userID:" + userId);
    //hash the user password and return the hashed password and salt
    var passwordData = saltHashPassword(req.body.Password);

    var postData = {
      peers: req.body.peers,
      fcn: "CreateUser",
      args: [userId, req.body.UserName, passwordData.passwordHash, req.body.OrgName, req.body.EmailID, passwordData.salt, " ", req.body.FirstName, req.body.LastName, req.body.MobileNumber, req.body.Country, "Pending"]
    };

    request.post({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.body.token
      },
      body: JSON.stringify(postData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });

  },

  addRegisteredUser: function (req, res, next) {

    console.log(req.body);
    var userId = uuidv4();
    console.log("userID:" + userId);
    //hash the user password and return the hashed password and salt
    var passwordData = saltHashPassword(req.body.Password);

    var postData = {
      peers: req.body.peers,
      fcn: "CreateUser",
      args: [userId, req.body.UserName, passwordData.passwordHash, req.body.OrgName, req.body.EmailID, passwordData.salt, req.body.UserRoleID, req.body.FirstName, req.body.LastName, req.body.MobileNumber, req.body.Country, "Approved"]
    };
console.log("postData for RegisteredUser:::"+JSON.stringify(postData));

    request.post({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.body.token
      },
      body: JSON.stringify(postData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });

  },

  getUser: function (req, res, next) {
    console.log(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetUser",
      args: '[\"' + req.params.userId + '\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          console.log(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });
  },


  approveUser: function (req, res, next) {
    var userDataEmit = new EventEmitter();
    var responseTxID = new EventEmitter();
    var outString = "";
    var userIDs = req.body.UserID;
    var flag = 0;
    var sum = 0;
    console.log("userid::" + userIDs);
    // var userIdArray = [];
    // userIdArray.push(userIDs.split("#"));
    var userIdArray = userIDs.split("#");
    console.log("userIdArray:" + userIdArray);
    console.log("Length of User ID Array:::::" + userIdArray.length);
    //console.log(req.query);
    for (var i = 0; i < userIdArray.length; i++) {
      var getData = {
        peer: req.body.peers[0],
        fcn: "GetUser",
        args: '[\"' + userIdArray[i] + '\"]'
      };
      console.log("---" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            console.log(body);
            userDataEmit.data = JSON.parse(body);
            userDataEmit.emit('userData');
            console.log(flag + ":::flag");

            flag = flag + 1;

          } else {
            console.log(response.statusCode + response.body);
            res.send({ login: -1 });
          }
        });



    }
    outString = "";

    userDataEmit.on('userData', function () {

      var data = {
        usrData: userDataEmit.data
      }

      var postData = {
        peers: req.body.peers,
        fcn: "CreateUser",
        args: [data.usrData.UserID, data.usrData.UserName, data.usrData.Password, data.usrData.OrgName, data.usrData.EmailID, data.usrData.PwdSalt, data.usrData.UserRoleID, data.usrData.FirstName, data.usrData.LastName, data.usrData.MobileNumber, data.usrData.Country, "Approved"]
      };
      console.log("---" + JSON.stringify(postData));
      request.post({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            sum = sum + 1;
            responseTxID.data = outString;
            responseTxID.emit('updateRes', response.TransactionID);
            // res.send(response);
          } else {
            console.log(response.statusCode + response.body);
            res.send({ login: -1 });
          }
        });
    });
    responseTxID.on('updateRes', function (TxID) {

      if (outString == "") {
        //outString = tid
        outString = TxID;
        console.log("outString::" + TxID);

      }
      else {
        //outString = outString + , + tid
        outString = outString + "," + TxID;
        // console.log("outString::"+outString);
        //  responseTxID.data = outString;
        //  responseTxID.emit('updateRes');
      }

      console.log(flag + ":::flag");
      console.log(sum + "::::::sum");
      if (flag == sum) {
        //send the respone
        var data = {
          response: "Transaction got commited with ids: " + outString.toString(),
          success: "true"
        }
        res.send(JSON.stringify(data));
      }

    });


    // });

  },


  allocateUserRole: function (req, res, next) {
    var userDataEmit = new EventEmitter();
    var responseTxID = new EventEmitter();
    var outString = "";
    var userIDs = req.body.UserID;
    var roleID = req.body.UserRoleID;
    var flag = 0;
    var sum = 0;
    console.log("userid::" + userIDs);
    // var userIdArray = [];
    // userIdArray.push(userIDs.split("#"));
    var userIdArray = userIDs.split("#");
    console.log("userIdArray:" + userIdArray);
    console.log("Length of User ID Array:::::" + userIdArray.length);
    //console.log(req.query);
    for (var i = 0; i < userIdArray.length; i++) {
      var getData = {
        peer: req.body.peers[0],
        fcn: "GetUser",
        args: '[\"' + userIdArray[i] + '\"]'
      };
      console.log("---" + JSON.stringify(getData));
      request.get({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        }
        // body:require('querystring').stringify(getData)
      },
        function (error, response, body) {

          if (!error && response.statusCode == 200) {
            console.log(body);
            userDataEmit.data = JSON.parse(body);
            userDataEmit.emit('userData');
            console.log(flag + ":::flag");

            flag = flag + 1;

          } else {
            console.log(response.statusCode + response.body);
            res.send({ login: -1 });
          }
        });



    }
    outString = "";

    userDataEmit.on('userData', function () {

      var data = {
        usrData: userDataEmit.data
      }

      var postData = {
        peers: req.body.peers,
        fcn: "CreateUser",
        args: [data.usrData.UserID, data.usrData.UserName, data.usrData.Password, data.usrData.OrgName, data.usrData.EmailID, data.usrData.PwdSalt, roleID, data.usrData.FirstName, data.usrData.LastName, data.usrData.MobileNumber, data.usrData.Country, "Approved"]
      };
      console.log("---" + JSON.stringify(postData));
      request.post({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            sum = sum + 1;
            responseTxID.data = outString;
            responseTxID.emit('updateRes', response.TransactionID);
            // res.send(response);
          } else {
            console.log(response.statusCode + response.body);
            res.send({ login: -1 });
          }
        });
    });
    responseTxID.on('updateRes', function (TxID) {

      if (outString == "") {
        //outString = tid
        outString = TxID;
        console.log("outString::" + TxID);

      }
      else {
        //outString = outString + , + tid
        outString = outString + "," + TxID;
        // console.log("outString::"+outString);
        //  responseTxID.data = outString;
        //  responseTxID.emit('updateRes');
      }

      console.log(flag + ":::flag");
      console.log(sum + "::::::sum");
      if (flag == sum) {
        //send the respone
        var data = {
          response: "Transaction got commited with ids: " + outString.toString(),
          success: "true"
        }
        res.send(JSON.stringify(data));
      }

    });


    // });

  },

  getAllUsers: function (req, res, next) {
    console.log(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetAllUsers",
      args: '[\"\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          console.log(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });
  },

  getUserByUsername: function (req, res, next) {
    console.log(req.query);

    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByUsername",
      args: '[\"' + req.params.userName + '\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          console.log(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });

  },

  getUserByEmailID: function (req, res, next) {
    console.log(req.query);

    var getData = {
      peer: req.query.peer,
      fcn: "GetUserByEmailID",
      args: '[\"' + req.params.emailId + '\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'UserCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {

        if (!error && response.statusCode == 200) {
          console.log(body);
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ login: -1 });
        }
      });

  }

};

module.exports = login;
