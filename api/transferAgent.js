var request = require('request');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';
var EventEmitter = require('events').EventEmitter;

var transfer = {
  
    saveTransferCC:function(req,res,next) {
     console.log(req.body);
      var TransID = uuidv4();
      var TimeStamp = new Date();
      console.log("TimeStamp:::"+TimeStamp);
     var postData={
      	peers:req.body.peers,
        fcn:"SaveTransfer",
        args:[TransID,req.body.TransInvestorName,req.body.TransOrderID,req.body.TransNameOfToken,req.body.TransNumberOfTokens,req.body.TransOrderType,req.body.TransOrderPrice,TimeStamp, req.body.TransLockInperiod]
      };

      request.post({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'TransferAgentCC',
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

             res.send({transfer: -1});
         }
     });
   
   },
   getTransRecByTransID: function(req, res, next) {
     console.log(req.query);
     var getData={
      	peer:req.query.peer,
        fcn:"GetTransRecByTransID",
        args:'[\"'+req.params.transId+'\"]'
      };
     request.get({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'TransferAgentCC?'+require('querystring').stringify(getData),
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
             res.send({transfer: -1});
         }
     });
   },

   getTransRecByInvestorName: function(req, res, next) {
    console.log(req.query);
    var getData={
      peer:req.query.peer,
      fcn:"GetTransRecByInvestorName",
      args:'[\"'+req.params.transInvestorName+'\"]'
    };
    console.log("getData:::"+JSON.stringify(getData));
   request.get({
      uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'TransferAgentCC?'+require('querystring').stringify(getData),
      headers:{'content-type': 'application/json',
            'authorization': 'Bearer '+req.query.token}
      // body:require('querystring').stringify(getData)
      },
   function (error, response, body) {
       if (!error && response.statusCode == 200) {
           
           if(body.length < 4){
             res.send({transfer: "No Data Available"});
           }
           else{
            response = JSON.parse(body);
            res.send(response);
           }
       } else {
           console.log(response.statusCode + response.body);
           res.send({transfer: -1});
       }
   });
   
   },
   getAllTransfers: function(req, res, next) {
     console.log(req.query);
     var getData={
      	peer:req.query.peer,
        fcn:"GetAllTransfers",
        args:'[\"\"]'
      };
      console.log("---"+JSON.stringify(getData));
     request.get({
      	uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'TransferAgentCC?'+require('querystring').stringify(getData),
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
             res.send({transfer: -1});
         }
     });
   }
};

module.exports = transfer;
