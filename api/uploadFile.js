var request = require('request');
const uuidv4 = require('uuid/v4');
const fabricURL = 'http://localhost:4000';
var EventEmitter = require("events").EventEmitter;
var fs=require('fs');
const csv = require('csv-parser'); 
var EventEmitter = require('events').EventEmitter;
var upload = require('express-fileupload');
var crypto = require('crypto');

var uploadfiledetails = {
  
   saveUploadedFile:function(req,res,next) {

     console.log(req.body);
     var FileID = uuidv4();//"L0002";
     console.log("UploadFile ID:::"+FileID);
     var FileUploadDate = new Date();
     console.log(FileUploadDate);

     var documentDetails = new EventEmitter();

     // var uploadpath = __dirname + '/uploads/' + req.file.filename;
     var uploadpath = '/uploads/' + req.file.filename;
     var fd = fs.createReadStream('/var/www/html/uploads/' + req.file.filename);
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
         console.log("documentDetails.data:::"+JSON.stringify(documentDetails.data));

         var peerString = req.body.peers;
      var peerArr = peerString.split(",");

     var postData={
      	peers:peerArr,
        fcn:"SaveFile",
        args:[FileID, req.body.FileTypeID, req.body.FileType, documentDetails.data.FileHash, documentDetails.data.FilePath, req.body.FileDescription, FileUploadDate, "Active"]
      };
      console.log("postData:::"+JSON.stringify(postData));
     request.post({
      	uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UploadFileCC',
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
             res.send({uploadfiledetails: -1});
         }
     });

    });//end of documentDetails Emit

   },
   getFileByFileId:function(req,res,next) {
    console.log(req.params);
  

    var getData={
       peer:req.query.peer,
       fcn:"GetFileByFileId",
       args:'[\"'+req.params.fileid+'\"]'
     };

    request.get({
       uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UploadFileCC?'+require('querystring').stringify(getData),
       headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.query.token}
       //body:JSON.stringify(postData)
       },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);
            res.send({uploadfiledetails: -1});
        }
    });
  },

  getFileByFileTypeID:function(req,res,next) {

    console.log(req.params);
   
    var getData={
       peer:req.query.peer,
       fcn:"GetFileByFileTypeID",
       args:'[\"'+req.params.FileTypeID+'\"]'
     };

    request.get({
       uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UploadFileCC?'+require('querystring').stringify(getData),
       headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.query.token}
       //body:JSON.stringify(postData)
       },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);
            res.send({uploadfiledetails: -1});
        }
    });

  },
  
  getAllFiles:function(req,res,next) {
    console.log(req.query);
   
    var getData={
       peer:req.query.peer,
       fcn:"GetAllFiles",
       args:'[\"\"]'
     };

    request.get({
       uri:fabricURL + '/channels/'+'mychannel'+'/chaincodes/'+'UploadFileCC?'+require('querystring').stringify(getData),
       headers:{'content-type': 'application/json',
             'authorization': 'Bearer '+req.query.token}
       //body:JSON.stringify(getData)

       },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            response = JSON.parse(body);
            res.send(response);
        } else {
            console.log(response.statusCode + response.body);
            res.send({GetAllFiles: -1});
        }
    });

  }
};
module.exports = uploadfiledetails;
