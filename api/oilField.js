var request = require('request');
const express = require('express');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';
var app = express();
var EventEmitter = require('events').EventEmitter;
var upload = require('express-fileupload');
var fs = require('fs');
var crypto = require('crypto');

var sh = require('shorthash');
app.use(upload()); // configure middleware

var oilField = {

    createOilField: function (req, res, next) {
        console.log(req.body);
        var OFieldID = uuidv4();
        console.log("OFieldID::::" + OFieldID);
        var OFieldHash = sh.unique(OFieldID);
        console.log("Hash:::" + OFieldHash);
        var OFieldTimestamp = new Date();
        console.log("OFieldTimestamp::::" + OFieldTimestamp);

        var postData = {
            peers: req.body.peers,
            fcn: "CreateOilField",
            args: [OFieldID, OFieldHash, req.body.OFieldName, req.body.OFieldCountry, req.body.OFieldState, req.body.OFieldOwner, req.body.OFieldCurrentOperator, OFieldTimestamp, "", "", "", "", "", "active"]
        };

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
                    res.send(response);
                } else {
                    console.log(response.statusCode + response.body);

                    res.send({ oilField: -1 });
                }
            });

    },
    getOilFieldDetailsByOFieldID: function (req, res, next) {
        console.log(req.query);
        var getData = {
            peer: req.query.peer,
            fcn: "GetOilFieldDetailsByOFieldID",
            args: '[\"' + req.params.oilFieldId + '\"]'
        };
        request.get({
            uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilFieldCC?' + require('querystring').stringify(getData),
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
                    res.send({ oilField: -1 });
                }
            });
    },


    getOilFieldDetailsByArrayOfOFieldHashes: function(req, res, next) {
    console.log(req.query);
    
    var EmitterForSPV = new EventEmitter();
      var getData={
         peer:req.query.peer,
         fcn:"GetSPVCCBySPVID",
         args:'[\"'+req.params.SPVID+'\"]'
       };
      request.get({
         uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'SPVCC?'+require('querystring').stringify(getData),
         headers:{'content-type': 'application/json',
               'authorization': 'Bearer '+req.query.token}
         // body:require('querystring').stringify(getData)
         },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              response = JSON.parse(body);
              EmitterForSPV.data = response;
              console.log("EmitterForSPV Data:::"+JSON.stringify(EmitterForSPV.data));
              EmitterForSPV.emit('update');
              // res.send(response);
          } else {
              console.log(response.statusCode + response.body);
              res.send({oilField: -1});
          }
        });

        EmitterForSPV.on('update', function(){
          console.log("SPV Data Hashes:::"+JSON.stringify(EmitterForSPV.data.SPVOilFieldHashes));
          var getData={
            peer:req.query.peer,
          fcn:"GetOilFieldDetailsByArrayOfOFieldHashes",
          args:'[\"'+EmitterForSPV.data.SPVOilFieldHashes+'\"]'
        };
        console.log("---"+JSON.stringify(getData));
       request.get({
            uri: fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'OilFieldCC?'+require('querystring').stringify(getData),
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
               res.send({oilField: -1});
           }
       });
});
  },
    getAllOilFields: function (req, res, next) {
        console.log(req.query);
        var getData = {
            peer: req.query.peer,
            fcn: "GetAllOilFields",
            args: '[\"\"]'
        };
        console.log("---" + JSON.stringify(getData));
        request.get({
            uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilFieldCC?' + require('querystring').stringify(getData),
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
                    res.send({ oilField: -1 });
                }
            });
    },
    allocateOilWellsToOilField: function (req, res, next) {

        var flagA = 0;
        var flagB = 0;
        
        //   var count = 0;
        var ArraySize;
        var TxIdStr = "";
        var transID = [];

        var oilFieldDetails = new EventEmitter();
        var oilWellDetails = new EventEmitter();
        //r oilFieldDetails1 = new EventEmitter();
        var getSingleOilWellEmmiter = new EventEmitter();


       

        var getData = {
            peer: req.body.peers[0],
            fcn: "GetOilFieldDetailsByOFieldID",
            args: '[\"' + req.body.OFieldID + '\"]'
        };

        //  console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::");
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
                    try {
                        //    console.log("BODY _____________________________________________________________" + body);
                        oilFieldDetails.data = JSON.parse(body);
                        oilFieldDetails.emit('update');

                        // console.log(flag + ":::flag");

                        //   flag = flag + 1;

                    } catch (e) {
                        res.send(e)
                    }

                } else {
                    console.log(response.statusCode + response.body);
                    res.send({ oilField: -1 });
                }
            });

          
        oilFieldDetails.on('update', function () {

                     
            console.log("oilFieldDetails Log --------------OilFieldData::" + JSON.stringify(oilFieldDetails.data));

            console.log(req.body.OFieldOilWellHashes + ":::oil well hashes");


            var OFieldHash = sh.unique(req.body.OFieldOilWellHashes);
            var OWellhashesAppend = "";
            if(oilFieldDetails.data.OFieldOilWellHashes != ""){
             OWellhashesAppend = req.body.OFieldOilWellHashes + "#" + oilFieldDetails.data.OFieldOilWellHashes;
            }
            else{
                OWellhashesAppend = req.body.OFieldOilWellHashes;
            }
            var postData = {
                peers: req.body.peers,
                fcn: "CreateOilField",
                args: [oilFieldDetails.data.OFieldID, OFieldHash, oilFieldDetails.data.OFieldName, 
                    oilFieldDetails.data.OFieldCountry, oilFieldDetails.data.OFieldState, oilFieldDetails.data.OFieldOwner,
                     oilFieldDetails.data.OFieldCurrentOperator, oilFieldDetails.data.OFieldTimestamp, OWellhashesAppend,
                      oilFieldDetails.data.OSPVID, oilFieldDetails.data.OFileHash, oilFieldDetails.data.OFilePath,
                       req.body.OFGasAggr,"active"]
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
                        flagA = 1;
                        transID.push(response.TransactionID);
                        getSingleOilWellEmmiter.data = OWellhashesAppend;
                        getSingleOilWellEmmiter.emit('getSingleOilWellEmmiter');
                        //  res.send(response);
                    } else {
                        console.log(response.statusCode + response.body);

                        res.send({ oilField: -1 });
                    }
                });

            

        });
       // console.log("TransID Array:::" + transID);
        //end of oilField Updation

        //oil Well
        getSingleOilWellEmmiter.on('getSingleOilWellEmmiter', function () {

            // var OilFieldID = OFieldId;
            // console.log()
            var OwellHashString = getSingleOilWellEmmiter.data;

            var oilWellHashArr = OwellHashString.split("#");

            ArraySize = oilWellHashArr.length;
            console.log(oilWellHashArr + ":::oilWellHash" + ArraySize + "::::ArraySize");


            var oilWellHash;
            for (var i = 0; i < ArraySize; i++) {

                oilWellHash = oilWellHashArr[i];

                var getData = {
                    peer: req.body.peers[0],
                    fcn: "GetOilWellDetailsByOHash",
                    args: '[\"' + oilWellHash + '\"]'
                };

                console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::");

                request.get({
                    uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilWellCC?' + require('querystring').stringify(getData),
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
                            oilWellDetails.data = JSON.parse(body);
                            oilWellDetails.emit('updateOilWell');


                            // } catch (e) {
                            //       res.send(e)
                            //  }

                        } else {
                            console.log(response.statusCode + response.body);
                            res.send({ oilField: -1 });
                        }
                    });
            }//end of for
        }); // end of getSingleOilWellEmmiter

        oilWellDetails.on('updateOilWell', function () {

            var OFID = req.body.OFieldID;
            console.log("OFID::::" + OFID);

            console.log("Fisrt Log::::oilWellDetails::" + JSON.stringify(oilWellDetails.data));

            console.log(oilWellDetails.data.OWellID + " &&&&&&&&&&&& OWellID &&&&&&");

            var postData = {
                peers: req.body.peers,
                fcn: "CreateOilWell",
                args: [oilWellDetails.data.OWellID, oilWellDetails.data.OHash, oilWellDetails.data.OWellName, oilWellDetails.data.OCountry, oilWellDetails.data.OState, oilWellDetails.data.OWellType, oilWellDetails.data.OPermitDate, oilWellDetails.data.OCurrentOperator, oilWellDetails.data.OWellOwner, oilWellDetails.data.OFlag, oilWellDetails.data.OTimeStamp, OFID, oilWellDetails.data.OWellDigType, oilWellDetails.data.OWellDescrpition, oilWellDetails.data.OWellImgHash ,oilWellDetails.data.OWellImgPath , oilWellDetails.data.Status]
            };
            console.log(JSON.stringify(postData) + "******************************");
            request.post({
                uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilWellCC',
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

                        res.send({ oilField: -1 });
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
    saveDocDataInSession: function (req, res, next) {
        console.log(JSON.stringify(req.body));

        var oilFieldDataEmitter = new EventEmitter();
        var documentDetails = new EventEmitter();

        // var uploadpath = __dirname + '/uploads/' + req.file.filename;
        var uploadpath = __dirname + '/uploads/' + req.file.filename;
        var fd = fs.createReadStream('./uploads/' + req.file.filename);
        var hash = crypto.createHash('sha1');
        hash.setEncoding('hex');
        console.log("UploadPath:::" + uploadpath);
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
            //    if (!err) {
            //    console.log(req.session);
            documentDetails.data = {
                FileHash,
                FilePath,
                docName
            };
            // console.log("@@@@@"+documentDetails.data.FileHash);
            documentDetails.emit('update');

            //    }
            //    });
        });

        fd.pipe(hash);
        documentDetails.on('update', function () {
            console.log('saved session: ' + JSON.stringify(documentDetails.data));
            // res.setHeader('Set-Cookie','session=documentDetails');
            // res.cookie('session',documentDetails, { secure:false, httpOnly: false });
            var arra = req.body.peers;
            console.log("------------" + JSON.stringify(req.body.peers));
            //var array = JSON.parse("[" + arra + "]");
            var array = arra.split(",");

            console.log(array[0] + "::peer data");
            //get OFieldID
            var getData = {
                peer: array[0],
                fcn: "GetOilFieldDetailsByOFieldID",
                args: '[\"' + req.body.OFieldID + '\"]'
            };
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
                        response = JSON.parse(body);
                        oilFieldDataEmitter.data = response;
                        oilFieldDataEmitter.emit('uploadFile', documentDetails.data);
                        // res.send(response);
                    } else {
                        console.log(response.statusCode + response.body);
                        res.send({ oilField: -1 });
                    }
                });

        });//end of document details emitter

        //end
        oilFieldDataEmitter.on('uploadFile', function (DocDetails) {

            console.log(JSON.stringify(DocDetails));
            console.log("CHECKKK!!!!!");
            console.log("oilFieldDataEmitter:::" + JSON.stringify(oilFieldDataEmitter.data));
            console.log("DocDetails.FileHash:::" + DocDetails.FileHash);


            var peerString = req.body.peers;
            var peerArr = peerString.split(",");
            var postData = {
                peers: peerArr,
                fcn: "CreateOilField",
                args: [oilFieldDataEmitter.data.OFieldID, oilFieldDataEmitter.data.OFieldHash, oilFieldDataEmitter.data.OFieldName, oilFieldDataEmitter.data.OFieldCountry, oilFieldDataEmitter.data.OFieldState, oilFieldDataEmitter.data.OFieldOwner, oilFieldDataEmitter.data.OFieldCurrentOperator, oilFieldDataEmitter.data.OFieldTimestamp, oilFieldDataEmitter.data.OFieldOilWellHashes, oilFieldDataEmitter.data.OSPVID, DocDetails.FileHash, DocDetails.FilePath, oilFieldDataEmitter.data.OFGasAggr, oilFieldDataEmitter.data.Status]
            };
            console.log("postData:::" + JSON.stringify(postData));
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
                        res.send(response);
                    } else {
                        console.log(response.statusCode + response.body);

                        res.send({ oilField: -1 });
                    }
                });

        });// end of oilFieldDataEmitter


    }



};

module.exports = oilField;
