

fetchOilWellDetailsfromDataProvider: function (req, res, next) {

    console.log(req.body);
    //calling external API using OAuth HTTP Request

    //API to hit Petroviser 

    var petroviserEmit = new EventEmitter();
    var petroviserResponseEmit = new EventEmitter();
    var responseEmit = new EventEmitter();
    var oilWellDetails = new EventEmitter();
    var flag = 0;
    var flagB=0;
    var transID = [];
    var TxIdStr = "";

    var wellId = req.body.OilWellIDs;
    console.log(wellId + "::oilwellIDs");
    var WellIDStr = wellId.split("#");

    for(var j=0;j<WellIDStr.length;j++){

        var petOilWellId = WellIDStr[j];

    
    var options = {
        method: 'POST',
        url: 'http://petrovisor.cloudapp.net:8095/PetroVisor/API/token',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        form: {
            grant_type: 'password',
            username: 'Raghu',
            password: 'PV123!',
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        //console.log(body);
        petroviserEmit.data = JSON.parse(body);
        petroviserEmit.emit('updatePetroviser');
    });

    petroviserEmit.on('updatePetroviser', function () {
        // console.log("Inside Emitter");
        //console.log("petroviserEmitToken:::"+petroviserEmit.data.access_token);


        var options = {
            method: 'POST',
            url: 'http://petrovisor.cloudapp.net:8095/PetroVisor/API/SAWOCS30/PSharpScripts/ExecuteScript',
            headers:
            {
                'cache-control': 'no-cache',
                Authorization: 'Bearer ' + petroviserEmit.data.access_token,
                'Content-Type': 'application/json'
            },
            body:
            {
                ScriptContent: 'NPV Calculation',
                Options:
                {
                    OverrideEntitySet:
                    {
                        Name: 'Specified Entities',
                        Entities: [{ Name: petOilWellId , EntityTypeName: 'Well' }]
                    },
                    TreatScriptContentAsScriptName: true,
                    ScenarioRunOptions: { ScenarioName: 'Custom', RunName: 'Field1 Scenario' }
                }
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            flagB = flagB + 1;
            var forSize = body[3].Data[0].Data.length;

            for (var i = 0; i < forSize; i++) {
                petroviserResponseEmit.data = body;
                petroviserResponseEmit.emit('update', i);
            }


            // console.log(body[1].Data[4].Result.Unit.Factor + "::::::RON value");
            // console.log(body.length + ":body length:" + body[3].Data.length + ":Data Length" + body[0].Data[0].Data.length + "Data length");
        });

    }); // end of petroviserEmit
}// end of OilWellId(String) for loop


    petroviserResponseEmit.on('update', function (k) {
        var updateDate = " ";
        console.log("k is ::" + k);
        console.log("gasproduction:::::" + petroviserResponseEmit.data[3].Data[1].Data[k].Value);
        try {
            var OGasProduction = petroviserResponseEmit.data[3].Data[1].Data[k].Value.toString();
            updateDate = petroviserResponseEmit.data[3].Data[1].Data[k].Date.toString();
        } catch (e) {
            var OGasProduction = ' ';
        }
        try {
            var OPricePerTon = petroviserResponseEmit.data[3].Data[2].Data[k].Value.toString();
        } catch (e) {
            var OPricePerTon = ' ';
        }
        try {
            var OGasPrice = petroviserResponseEmit.data[3].Data[3].Data[k].Value.toString();
            updateDate = petroviserResponseEmit.data[3].Data[3].Data[k].Date.toString();
        } catch (e) {
            var OGasPrice = ' ';
        }
        try {
            var ORevenueSum = petroviserResponseEmit.data[3].Data[4].Data[k].Value.toString();
        } catch (e) {
            var ORevenueSum = ' ';
        }
        try {
            var OGasRevenueSum = petroviserResponseEmit.data[3].Data[5].Data[k].Value.toString();
        } catch (e) {
            var OGasRevenueSum = ' ';
        }
        try {
            var ORevenueFromProduction = petroviserResponseEmit.data[3].Data[6].Data[k].Value.toString();
        } catch (e) {
            var ORevenueFromProduction = ' ';
        }
        try {
            var ORiskedRevenue = petroviserResponseEmit.data[3].Data[7].Data[k].Value.toString();
            updateDate = petroviserResponseEmit.data[3].Data[7].Data[k].Date.toString();
        } catch (e) {
            var ORiskedRevenue = ' ';
        }
        try {
            var ORevenueNet = petroviserResponseEmit.data[3].Data[8].Data[k].Value.toString();
        } catch (e) {
            var ORevenueNet = ' ';
        }
        try {
            var ORoyality = petroviserResponseEmit.data[3].Data[9].Data[k].Value.toString();
        } catch (e) {
            var ORoyality = ' ';
        }
        try {
            var OGasRoyality = petroviserResponseEmit.data[3].Data[10].Data[k].Value.toString();
        } catch (e) {
            var OGasRoyality = ' ';
        }
        try {
            var ORoyalitySum = petroviserResponseEmit.data[3].Data[11].Data[k].Value.toString();
        } catch (e) {
            var ORoyalitySum = ' ';
        }
        try {
            var OGasRoyalitySum = petroviserResponseEmit.data[3].Data[12].Data[k].Value.toString();
        } catch (e) {
            var OGasRoyalitySum = ' ';
        }
        try {
            var OGasTaxSum = petroviserResponseEmit.data[3].Data[13].Data[k].Value.toString();
        } catch (e) {
            var OGasTaxSum = ' ';
        }
        try {
            var OCapexTotal = petroviserResponseEmit.data[3].Data[14].Data[k].Value.toString();
        } catch (e) {
            var OCapexTotal = ' ';
        }
        try {
            var OOpex = petroviserResponseEmit.data[3].Data[15].Data[k].Value.toString();
        } catch (e) {
            var OOpex = ' ';
        }
        try {
            var ODepSum = petroviserResponseEmit.data[3].Data[16].Data[k].Value.toString();
        } catch (e) {
            var ODepSum = ' ';
        }
        try {
            var OInfraTax = petroviserResponseEmit.data[3].Data[17].Data[k].Value.toString();
        } catch (e) {
            var OInfraTax = ' ';
        }
        try {
            var OIncomeTax = petroviserResponseEmit.data[3].Data[18].Data[k].Value.toString();
        } catch (e) {
            var OIncomeTax = ' ';
        }
        try {
            var OEBITDSum = petroviserResponseEmit.data[3].Data[19].Data[k].Value.toString();
        } catch (e) {
            var OEBITDSum = ' ';
        }
        try {
            var OEBITSum = petroviserResponseEmit.data[3].Data[20].Data[k].Value.toString();
        } catch (e) {
            var OEBITSum = ' ';
        }
        try {
            var ORiskFactor = petroviserResponseEmit.data[3].Data[21].Data[k].Value.toString();
        } catch (e) {
            var ORiskFactor = ' ';
        }
        try {
            var ONPVRiskedFinal = petroviserResponseEmit.data[3].Data[22].Data[k].Value.toString();
        } catch (e) {
            var ONPVRiskedFinal = ' ';
        }
        try {
            var ONPVRiskedFinalAt9 = petroviserResponseEmit.data[3].Data[23].Data[k].Value.toString();
        } catch (e) {
            var ONPVRiskedFinalAt9 = ' ';
        }
        try {
            var ONPVRiskedFinalAt12 = petroviserResponseEmit.data[3].Data[24].Data[k].Value.toString();
        } catch (e) {
            var ONPVRiskedFinalAt12 = ' ';
        }
        try {
            var OilProduction = petroviserResponseEmit.data[3].Data[0].Data[k].Value.toString();
        } catch (e) {
            var OilProduction = ' ';
        }
        try {
            var Entity = petroviserResponseEmit.data[3].Data[0].Entity.toString();
        } catch (e) {
            var Entity = ' ';
        }
        try {
            var OWellHasKO = petroviserResponseEmit.data[3].Data[25].Data[k].Value.toString();
        } catch (e) {
            var OWellHasKO = ' ';
        }
        try {
            var ORiskfactor = petroviserResponseEmit.data[2].Data[1].Data[0].Value.toString();
        } catch (e) {
            var ORiskfactor = ' ';
        }
        try {
            var ODiscountAt9 = petroviserResponseEmit.data[2].Data[12].Data[0].Value.toString();
        } catch (e) {
            var ODiscountAt9 = ' ';
        }
        try {
            var ODiscountAt12 = petroviserResponseEmit.data[2].Data[14].Data[0].Value.toString();
        } catch (e) {
            var ODiscountAt12 = ' ';
        }

        var id = uuidv4();

        var postData = {
            peers: req.body.peers,
            fcn: "SaveOilWellDetails",
            args: [id, Entity, OGasProduction, OPricePerTon, OGasPrice, ORevenueSum, OGasRevenueSum, ORevenueFromProduction, ORiskedRevenue, ORevenueNet, ORoyality,
                OGasRoyality, ORoyalitySum, OGasRoyalitySum, OGasTaxSum, OCapexTotal, OOpex, ODepSum, OInfraTax, OIncomeTax, OEBITDSum, OEBITSum, ORiskFactor,
                ONPVRiskedFinal, ONPVRiskedFinalAt9, ONPVRiskedFinalAt12, OWellHasKO, OilProduction, ORiskfactor, ODiscountAt9, ODiscountAt12, updateDate]
        };
        console.log(JSON.stringify(postData));
        request.post({
            uri: fabricURL + '/channels/' + 'mychannel' + '/chaincodes/' + 'OilWellDetailsCC',
            headers: {
                'content-type': 'application/json',
                'authorization': 'Bearer ' + req.body.token
            },
            body: JSON.stringify(postData)
        },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    response = JSON.parse(body);
                    flag = flag + 1;
                    transID.push(response.TransactionID);
                    console.log(response);

                    if (flag === petroviserResponseEmit.data[3].Data[0].Data.length) {
                        responseEmit.data = petroviserResponseEmit.data;
                        responseEmit.emit('updateRes');
                    }
                  //  responseEmit.data = petroviserResponseEmit.data;
                   // responseEmit.emit('updateRes');

                } else {
                    console.log(response.statusCode + response.body);

                    res.send({ dataProvider: -1 });
                }
            });

        console.log(k + 1 + "::" + flag);

    });

    responseEmit.on('updateRes', function () {
        var getData = {
            peer: req.body.peers[0],
            fcn: "GetOilWellDetailsByOWellID",
            args: '[\"' + wellId + '\"]'
        };

        console.log(JSON.stringify(getData) + ":::::::::::::::::::::::::::::"+ req.body.token);

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
                        var dataObj ={
                            wellData: JSON.parse(body),
                            petroData: responseEmit.data
                        };
                    oilWellDetails.data = dataObj;
                    oilWellDetails.emit('updateOilWell');


                } else {
                    console.log(response.statusCode + response.body);
                    res.send({ dataProvider: -1 });
                }
            });


       
    });



    oilWellDetails.on('updateOilWell', function () {


        var postData = {
            peers: req.body.peers,
            fcn: "CreateOilWell",
            args: [oilWellDetails.data.wellData.OWellID, oilWellDetails.data.wellData.OHash, oilWellDetails.data.wellData.OWellName, oilWellDetails.data.wellData.OCountry, oilWellDetails.data.wellData.OState, oilWellDetails.data.wellData.OWellType, oilWellDetails.data.wellData.OPermitDate, oilWellDetails.data.wellData.OCurrentOperator, oilWellDetails.data.wellData.OWellOwner, 'U', oilWellDetails.data.wellData.OTimeStamp, oilWellDetails.data.wellData.OOiFieldID, oilWellDetails.data.wellData.OWellDigType, oilWellDetails.data.wellData.OWellDescrpition, oilWellDetails.data.wellData.OWellImgHash ,oilWellDetails.data.wellData.OWellImgPath , oilWellDetails.data.wellData.Status]
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

                    console.log("flag value in the last emitter::"+flag);
                    if (flag === oilWellDetails.data.petroData[3].Data[0].Data.length && flagB === WellIDStr.length) {
                        for (var j = 0; j < transID.length; j++) {
                            console.log(transID[j] + ":::inside for");
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
                            success: true
                        }
                        console.log("finalRes::" + JSON.stringify(finalRes));
        
                        res.send(finalRes);
                    }




                   
                } else {
                    console.log(response.statusCode + response.body);

                    res.send({ dataProvider: -1 });
                }

           
            });// end of function
    });

}