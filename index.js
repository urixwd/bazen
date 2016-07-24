var d = require('./init.js');
var idx = require('./funcs.js');

var startD = new Date(); //start time

//english math - hard coded
assignEnglishMath(); //assigns english and math - fixed slots

/* MUSTS */
sortLessonsOrder('must');
{
  for (var i = 0; i < lessonsOrder.length; i++) {
    var lessonName = lessonsOrder[i];
    var lessonsDef = _.defaults(lessonsDefs[lessonName], lessonDefDefaults);

    assignStudentsToMustLesson(lessonName, lessonsDef.classType, 'must', true);
  }
}/* WANTS/AGREES */
function assignLevel(level){
  sortLessonsOrder(level);
  for (var i = 0; i < lessonsOrder.length; i++) {
    var lessonName = lessonsOrder[i];
    var lessonsDef = _.defaults(lessonsDefs[lessonName] ,lessonDefDefaults);

    assignStudentsToLesson(lessonName, lessonsDef, level, true);
  }
}
assignLevel('wants');
assignLevel('agree');
//finish...
console.log('Runtime: ' + (new Date().getTime() - startD.getTime()));


/* save to json file */
var outputJSON = {
  schedule: schedule,
  students_data: data
};
var jsonfile = require('jsonfile')
var file = 'schedule.json'
jsonfile.writeFile(file, outputJSON, function (err) {
  clog('json file created');
});

