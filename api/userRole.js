var request = require('request');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';

var distance = {
   login: function(req, res, next) {
     console.log(req.body);
     var postData={
      	username:req.body.username,
      	orgName:req.body.orgName
      };
     request.post({
      	uri:fabricURL + '/users',
      	headers:{'content-type': 'application/x-www-form-urlencoded'},
      	body:require('querystring').stringify(postData)
      	},
     function (error, response, body) {
         if (!error && response.statusCode == 200) {
             response = JSON.parse(body);
             res.send(response);
         } else {
             console.log(response.statusCode + response.body);
             res.send({distance: -1});
         }
     });
   },
   createUserRole:function(req,res,next) {
     console.log(req.body);
      var UserRoleID = uuidv4();
      console.log("UserRoleID::"+UserRoleID);
     var postData={
      	peers:req.body.peers,
        fcn:"CreateUserRole",
        args:[UserRoleID,req.body.UserRoleName]//'[\"'+userID+'\",\"'+req.body.args[0]+'\"]'
      };
      
     request.post({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UserRoleCC',
      	headers:{'content-type': 'application/json',
              'authorization': 'Bearer '+req.body.token},
      	body:JSON.stringify(postData)
      	},
     function (error, response, body) {
         if (!error && response.statusCode == 200) {
             response = JSON.parse(body);
             res.send(response);
         } else {
             console.log(response.statusCode + response.body);

             res.send({distance: -1});
         }
     });
   
   },
   getAllUserRoles: function(req, res, next) {
     console.log(req.query);
     var getData={
      	peer:req.query.peer,
        fcn:"GetAllUserRoles",
        args:'[\"\"]'
      };
     request.get({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UserRoleCC?'+require('querystring').stringify(getData),
      	headers:{'content-type': 'application/json',
              'authorization': 'Bearer '+req.query.token}
      	// body:require('querystring').stringify(getData)
      	},
     function (error, response, body) {
         if (!error && response.statusCode == 200) {
             response = JSON.parse(body);
             res.send(response);
         } else {
             console.log(response.statusCode + response.body);
             res.send({distance: -1});
         }
     });
   },
   getUserRole: function(req, res, next) {
     console.log(req.query);

     var getData={
      	peer:req.query.peer,
        fcn:"GetUserRole",
        args:'[\"'+req.params.userRoleid+'\"]'
      };
      console.log("---"+JSON.stringify(getData));
     request.get({
      	uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UserRoleCC?'+require('querystring').stringify(getData),
      	headers:{'content-type': 'application/json',
              'authorization': 'Bearer '+req.query.token
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
             res.send({distance: -1});
         }
     });
     
   },
};

module.exports = distance;