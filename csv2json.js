//Converter Class
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var jsonfile = require('jsonfile');
//end_parsed will be emitted once parsing finished
converter.on("end_parsed", function (jsonArray) {
  var file = 'data.json';
  jsonfile.writeFile(file, jsonArray, function (err) {
    console.log('json file created');
  });
  console.log(jsonArray); //here is your result jsonarray
});

//read from file
require("fs").createReadStream("./data.csv").pipe(converter);