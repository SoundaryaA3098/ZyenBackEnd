var request = require('request');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';
var EventEmitter = require('events').EventEmitter;
var sh = require('shorthash');
const express = require('express');
var path = require("path");

var app = express();
var upload = require('express-fileupload');
var fs = require('fs');
var crypto = require('crypto');
app.use(upload()); // configure middleware



var spv = {

  saveSPV: function (req, res, next) {

    var documentDetails = new EventEmitter();

    var SPVCreateDate = new Date();
    console.log("SPVCreateDate:::"+SPVCreateDate.toDateString());// to get the Date alone and not with the time

    var uploadpath = '/SpvImages/' + req.file.filename;
    var fd = fs.createReadStream('/var/www/html/SpvImages/' + req.file.filename);
    var hash = crypto.createHash('sha1');
    hash.setEncoding('hex');

    fd.on('end', function () {
      hash.end();

      //console.log(hash.read());
      // var sessData = req.session;
      // sessData.docHash = hash.read();
      // sessData.docPath = uploadpath;
      // sessData.docName = req.file.filename;
      var FileHash = hash.read();
      var FilePath = uploadpath;
      var docName = req.file.filename;

      // res.locals.session = req.session;
      // req.session.save((err) => {
      //  if (!err) {
      //  console.log(req.session);
      documentDetails.data = {
        FileHash,
        FilePath,
        docName
      };
      // console.log("@@@@@"+documentDetails.data.FileHash);
      documentDetails.emit('update');

      //  }
      //  });
    });

    fd.pipe(hash);
    documentDetails.on('update', function () {
      console.log('saved session: ' + JSON.stringify(documentDetails.data));
      console.log("documentDetails.data.FileHash:::::" + documentDetails.data.FileHash+"File Path::"+documentDetails.data.FilePath);
      console.log(req.body);
      var SPVID = uuidv4();
      console.log("SPVID:" + SPVID);

      var peerString = req.body.peers;
      var peerArr = peerString.split(",");

      var postData = {
        peers: peerArr,
        fcn: "SaveSPVCC",
        args: [SPVID, "", req.body.SPVName, req.body.SPVDescription, SPVCreateDate, "", documentDetails.data.FileHash, documentDetails.data.FilePath, "" ,req.body.SPVTokenName, req.body.SPVTokenSymbol, req.body.SPVTokenValue]
      };

      request.post({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            // res.json({"response":response,"fileAbsPath":documentDetails.data.FilePath});
            res.send(response);

          } else {
            console.log(response.statusCode + response.body);

            res.send({ spv: -1 });
          }
        });
    });

  },


  // allocateOilFieldsToSpv: function(req, res, next){

  // var getData = {
  //   peer: req.body.peers[0],
  //   fcn: "GetSPVCCBySPVID",
  //   args: '[\"' + req.body.SPVID + '\"]'
  // };

  //   console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::");
  //   request.get({
  //     uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC?' + require('querystring').stringify(getData),
  //     headers: {
  //       'content-type': 'application/json',
  //       'authorization': 'Bearer ' + req.body.token
  //     }
  //     // body:require('querystring').stringify(getData)
  //   },
  //     function (error, response, body) {
  //       if (!error && response.statusCode == 200) {
  //         try {
  //           console.log("BODY:::" + body);

  //           spvDetails.data = JSON.parse(body);
  //           spvDetails.emit('update');

  //         } catch (e) {
  //           res.send(e)
  //         }

  //       } else {
  //         console.log(response.statusCode + response.body);
  //         res.send({ spv: -1 });
  //       }
  //     });

  //     oilFieldDetails.on('update', function(){

  //       console.log("Fisrt Log::::OilFieldData::"+JSON.stringify(oilFieldDetails.data));

  //       console.log(req.body.OFieldOilWellHashes + ":::oil well hashes");


  //     var oilFieldData = {
  //       oilFieldDetails: oilFieldDetails.data
  //     }
  //     console.log(JSON.stringify(oilFieldData) + "***------------------");
  //     var OFieldHash = sh.unique(req.body.OFieldOilWellHashes);
  //     console.log(oilFieldData.oilFieldDetails.SPVID + "::?????????????");
  //     var postData = {
  //       peers: req.body.peers,
  //       fcn: "CreateOilField",
  //       args: [oilFieldData.oilFieldDetails.SPVID, OFieldHash, oilFieldData.oilFieldDetails.OFieldName, oilFieldData.oilFieldDetails.OFieldCountry,oilFieldData.oilFieldDetails.OFieldState,oilFieldData.oilFieldDetails.OFieldOwner,oilFieldData.oilFieldDetails.OFieldCurrentOperator,oilFieldData.oilFieldDetails.OFieldTimestamp,req.body.OFieldOilWellHashes,oilFieldData.oilFieldDetails.OSPVID,"active"]
  //     };
  //     console.log(JSON.stringify(postData) + "******************************");
  //     request.post({
  //       uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilFieldCC',
  //       headers: {
  //         'content-type': 'application/json',
  //         'authorization': 'Bearer ' + req.body.token
  //       },
  //       body: JSON.stringify(postData)
  //     },
  //       function (error, response, body) {
  //         if (!error && response.statusCode == 200) {
  //           response = JSON.parse(body);
  //           console.log("Final Res after updation::"+JSON.stringify(response));
  //           res.send(response);
  //         } else {
  //           console.log(response.statusCode + response.body);

  //           res.send({ oilField: -1 });
  //         }
  //       });

  //     });
  //  },

  allocateOilFieldsToSPV: function (req, res, next) {

    var flagA = 0;
    var flagB = 0;
    //   var count = 0;
    var ArraySize;
    var TxIdStr = "";
    var transID = [];

    var SPVDetails = new EventEmitter();
    var oilFieldDetails = new EventEmitter();
    var getSingleOilFieldEmmiter = new EventEmitter();

    var getData = {
      peer: req.body.peers[0],
      fcn: "GetSPVCCBySPVID",
      args: '[\"' + req.body.SPVID + '\"]'
    };

    console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::");
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.body.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          try {
            //    console.log("BODY _____________________________________________________________" + body);
            SPVDetails.data = JSON.parse(body);
            SPVDetails.emit('update');

          } catch (e) {
            res.send(e)
          }

        } else {
          console.log(response.statusCode + response.body);
          res.send({ spv: -1 });
        }
      });

    SPVDetails.on('update', function () {

      console.log("SPVDetails Log --------------SPVData::" + JSON.stringify(SPVDetails.data));

      console.log(req.body.SPVOilFieldHashes + ":::oil field hashes");


      var SPVHash = sh.unique(req.body.SPVOilFieldHashes);
      var SPVOFieldhashesAppend = "";
            if(SPVDetails.data.SPVOilFieldHashes != ""){
              SPVOFieldhashesAppend = req.body.SPVOilFieldHashes + "#" + SPVDetails.data.SPVOilFieldHashes;
            }
            else{
              SPVOFieldhashesAppend = req.body.SPVOilFieldHashes;
            }
      var postData = {
        peers: req.body.peers,
        fcn: "SaveSPVCC",
        args: [SPVDetails.data.SPVID, SPVHash, SPVDetails.data.SPVName, SPVDetails.data.SPVDescription, SPVDetails.data.SPVCreateDate, SPVOFieldhashesAppend, SPVDetails.data.SPVImgHash, SPVDetails.data.SPVImgPath, req.body.SPVGasAggr, SPVDetails.data.SPVTokenName, SPVDetails.data.SPVTokenSymbol, SPVDetails.data.SPVTokenValue]
      };
      console.log(JSON.stringify(postData) + "******************************");
      request.post({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            console.log("Final Res after updation::" + JSON.stringify(response));
            flagA = 1;
            transID.push(response.TransactionID);
            getSingleOilFieldEmmiter.data = SPVOFieldhashesAppend;
            getSingleOilFieldEmmiter.emit('getSingleOilFieldEmmiter');
            //  res.send(response);
          } else {
            console.log(response.statusCode + response.body);

            res.send({ spv: -1 });
          }
        });

    });
    console.log("TransID Array:::" + transID);
    //end of oilField Updation

    //oil Well
    getSingleOilFieldEmmiter.on('getSingleOilFieldEmmiter', function () {

      // var OilFieldID = OFieldId;
      // console.log()
      var SPVHashString = getSingleOilFieldEmmiter.data;

      var SPVHashArr = SPVHashString.split("#");

      ArraySize = SPVHashArr.length;
      console.log(SPVHashArr + ":::oilWellHash" + ArraySize + "::::ArraySize");


      var oilFieldHash;
      for (var i = 0; i < ArraySize; i++) {

        oilFieldHash = SPVHashArr[i];

        var getData = {
          peer: req.body.peers[0],
          fcn: "GetOilFieldDetailsByOFieldHash",
          args: '[\"' + oilFieldHash + '\"]'
        };

        console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::");

        request.get({
          uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilFieldCC?' + require('querystring').stringify(getData),
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer ' + req.body.token
          }
          // body:require('querystring').stringify(getData)
        },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              //  try {
              console.log("BODY ***********************************************" + body);
              oilFieldDetails.data = JSON.parse(body);
              oilFieldDetails.emit('updateOilWell');


              // } catch (e) {
              //       res.send(e)
              //  }

            } else {
              console.log(response.statusCode + response.body);
              res.send({ spv: -1 });
            }
          });
      }//end of for
    }); // end of getSingleOilWellEmmiter

    oilFieldDetails.on('updateOilWell', function () {

      var SPVID = req.body.SPVID;
      console.log("SPVID::::" + SPVID);

      console.log("Fisrt Log::::oilFieldDetails::" + JSON.stringify(oilFieldDetails.data));

      // console.log(oilWellDetails.data.OWellID + " &&&&&&&&&&&& OWellID &&&&&&");

      var postData = {
        peers: req.body.peers,
        fcn: "CreateOilField",
        args: [oilFieldDetails.data.OFieldID, oilFieldDetails.data.OFieldHash, oilFieldDetails.data.OFieldName, oilFieldDetails.data.OFieldCountry, oilFieldDetails.data.OFieldState, oilFieldDetails.data.OFieldOwner, oilFieldDetails.data.OFieldCurrentOperator, oilFieldDetails.data.OFieldTimestamp, oilFieldDetails.data.OFieldOilWellHashes, SPVID, oilFieldDetails.data.OFileHash, oilFieldDetails.data.OFilePath, oilFieldDetails.data.OFGasAggr, oilFieldDetails.data.Status]
      };
      console.log(JSON.stringify(postData) + "******************************");
      request.post({
        uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilFieldCC',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + req.body.token
        },
        body: JSON.stringify(postData)
      },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            console.log("Final Res after updation::" + JSON.stringify(response));
            // res.send(response);
            flagB = flagB + 1;
            transID.push(response.TransactionID);
          } else {
            console.log(response.statusCode + response.body);

            res.send({ spv: -1 });
          }

          if (flagA === 1 && flagB === ArraySize) {
            console.log("flagA:::" + flagA + "::::::flagB::::::" + flagB);
            for (var j = 0; j < transID.length; j++) {
              console.log("inside for");
              if (TxIdStr === "") {
                TxIdStr = transID[j];
              }
              else {
                TxIdStr = TxIdStr + "," + transID[j];
              }
            }
            console.log("TxID String:::" + TxIdStr);
            var finalRes = {
              response: "Transactions has been done with Transaction ids:" + TxIdStr,
              succes: true
            }
            console.log("finalRes::" + JSON.stringify(finalRes));

            res.send(finalRes);
          }
        });// end of function
    });
    //end of oil Well updation

  },

  getSPVBySPVID: function (req, res, next) {
    console.log(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetSPVCCBySPVID",
      args: '[\"' + req.params.spvId + '\"]'
    };
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ spv: -1 });
        }
      });
  },

  getSPVCCBySPVNamesArray: function (req, res, next) {
    console.log(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetSPVCCBySPVNamesArray",
      args: '[\"' + req.params.SpvListStr + '\"]'
    };
    console.log("getData:::"+JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC?' + require('querystring').stringify(getData),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + req.query.token
      }
      // body:require('querystring').stringify(getData)
    },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          response = JSON.parse(body);
          res.send(response);
        } else {
          console.log(response.statusCode + response.body);
          res.send({ spv: -1 });
        }
      });
  },


  getAllSPVs: function (req, res, next) {
    console.log(req.query);
    var getData = {
      peer: req.query.peer,
      fcn: "GetAllSPVs",
      args: '[\"\"]'
    };
    console.log("---" + JSON.stringify(getData));
    request.get({
      uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'SPVCC?' + require('querystring').stringify(getData),
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
          res.send({ spv: -1 });
        }
      });
  }


}

module.exports = spv;
