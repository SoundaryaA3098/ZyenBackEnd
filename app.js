var express = require('express');
var app = express();
const fabricURL = 'http://localhost:4000';
var request = require('request');
const uuidv4 = require('uuid/v4');
var EventEmitter = require('events').EventEmitter;
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var path = require("path");
var multer = require('multer');



//upload
var storage = multer.diskStorage(
  {
    destination: "/var/www/html" + '/uploads/',
    filename: function (req, file, cb) {
      console.log("upload file ===== called" );
      //req.body is empty...
      //How could I get the new_file_name property sent from client here?
      var fileorgName = file.originalname;
      var fileorgNameArr = fileorgName.split(".");
      cb(null, fileorgNameArr[0] + '-' + Date.now() +"."+ fileorgNameArr[1]);
    }
  }
);
var upload = multer({ storage: storage });
//end of upload

//SPVimageUpload
var storage1 = multer.diskStorage(
  {
    destination: "/var/www/html" + '/SpvImages/',
    filename: function (req, file, cb) {
      console.log("SPVImage::called");
      //req.body is empty...
      //How could I get the new_file_name property sent from client here?
      var imagefileorgName = file.originalname;
      var imagefileorgNameArr = imagefileorgName.split(".");
      cb(null, imagefileorgNameArr[0] + '-' + Date.now() +"."+ imagefileorgNameArr[1]);
    },
  
  }
);
var upload1 = multer({ storage: storage1 });

//end of SPVimageUpload

//OilWellImages Upload

var storage2 = multer.diskStorage(
  {
    destination: "/var/www/html" + '/OilWellImages/',
    filename: function (req, file, cb) {
      console.log("OilWellImages::called");
      //req.body is empty...
      //How could I get the new_file_name property sent from client here?
      var OilWellimagefileorgName = file.originalname;
      var OilWellimagefileorgNameArr = OilWellimagefileorgName.split(".");
      cb(null, OilWellimagefileorgNameArr[0] + '-' + Date.now() +"."+ OilWellimagefileorgNameArr[1]);
    },
  
  }
);
var upload2 = multer({ storage: storage2 });



//end of OilWellImages

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(jsonParser);
app.use(cors());
var routes = require('./api/userLogin');
var routes1 = require('./api/userRole');
var routes2 = require('./api/oilWell');
var routes3 = require('./api/spv');
var routes4 = require('./api/transferAgent');
var routes5 = require('./api/oilField');
var routes6 = require('./api/uploadFile');
var routes7 = require('./api/dataProvider');





//USER LOGIN

app.post('/login', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes.login(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.post('/authenticate', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes.authenticate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/addUser', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes.addUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


app.post('/addRegisteredUser', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes.addRegisteredUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});



app.get('/getUser/:userId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.getUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAllUsers', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes.getAllUsers(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByUsername/:userName', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.getUserByUsername(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/approveUser', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.approveUser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/allocateUserRole', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.allocateUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByEmailID/:emailId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.getUserByEmailID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserByUserRoleName/:userRoleName', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes.getUserByUserRoleName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});



// USER ROLE

app.post('/createUserRole', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes1.createUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getAllUserRoles', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes1.getAllUserRoles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getUserRole/:userRoleid', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes1.getUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//OIL WELL 

app.post('/updateOilWell', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes2.updateOilWell(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});


app.post('/createOilWell', upload2.single('filename'), function (req, res) {
  
  console.log(req.file);
  let response = routes2.createOilWell(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getOilWellDetailsByOWellID/:oilWellId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes2.getOilWellDetailsByOWellID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getOilWellDetailsByOHash/:oilHash', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes2.getOilWellDetailsByOHash(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getOilWellDetailsByArrayOfOHashes/:oilFieldId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes2.getOilWellDetailsByArrayOfOHashes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAllOilWells', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes2.getAllOilWells(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//SPV

// app.post('/saveSPV', jsonParser, function (req, res) {
//   console.log(req.body);
//   let response = routes3.saveSPV(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
//   //res.send(response);
// });

//image upload in SPV Screen

app.post('/saveSPV', upload1.single('filename'), function (req, res) {
  console.log(req.file);
  let response = routes3.saveSPV(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});

app.get('/getAllSPVs', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes3.getAllSPVs(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getSPVBySPVID/:spvId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes3.getSPVBySPVID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getSPVCCBySPVNamesArray/:SpvListStr', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes3.getSPVCCBySPVNamesArray(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/allocateOilFieldsToSPV', jsonParser, function (req, res) {
  console.log(req.body);
  
  let response = routes3.allocateOilFieldsToSPV(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});



//TRANSFER AGENT

app.post('/saveTransferCC', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes4.saveTransferCC(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getAllTransfers', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes4.getAllTransfers(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getTransRecByTransID/:transId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes4.getTransRecByTransID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getTransRecByInvestorName/:transInvestorName', jsonParser, function (req, res) {
  console.log(req.query);
  console.log(req.params);
  let response = routes4.getTransRecByInvestorName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


//OIL FIELDS

app.post('/createOilField', jsonParser, function (req, res) {
  console.log(req.body);
  let response = routes5.createOilField(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getAllOilFields', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes5.getAllOilFields(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getOilFieldDetailsByOFieldID/:oilFieldId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes5.getOilFieldDetailsByOFieldID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getOilFieldDetailsByArrayOfOFieldHashes/:SPVID', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes5.getOilFieldDetailsByArrayOfOFieldHashes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/allocateOilWellsToOilField', jsonParser, function (req, res) {
  console.log(req.body);
  
  let response = routes5.allocateOilWellsToOilField(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//document upload in OilField Screen

app.post('/documentUpload', upload.single('filename'), function (req, res) {
  console.log(req.file);
  let response = routes5.saveDocDataInSession(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

  });
});


//UploadFileCC

app.post('/saveUploadedFile', upload.single('filename'), function (req, res) {
  console.log("req.file:::"+req.file);
  console.log(req.body);
  let response = routes6.saveUploadedFile(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  //res.send(response);
});

app.get('/getAllFiles', jsonParser, function (req, res) {
  console.log(req.query);
  let response = routes6.getAllFiles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getFileByFileId/:fileid', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes6.getFileByFileId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getFileByFileTypeID/:FileTypeID', jsonParser, function (req, res) {
  console.log(req.query);
  console.log(req.params);
  let response = routes6.getFileByFileTypeID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


// Data provider 
 

app.post('/fetchOilWellDetailsfromDataProvider', jsonParser, function (req, res) {
 
  let response = routes7.fetchOilWellDetailsfromDataProvider(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getOilWellDetailsByWellID/:oilWellId', jsonParser, function (req, res) {
  console.log(req.query);

  let response = routes7.getOilWellDetailsByWellID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});



app.listen(3030, function () {
  console.log('server started on port 3030');
});
