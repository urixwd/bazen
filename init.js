/* load */
var csv = require('./csv.js');
_ = require('lodash');

data = csv.data;
/* /load */

/* init */
lessonsList = ["math_prep", "math_801", "math_802", "math_803", "english_prep", "english_3", "english_4", "english_5", "literature", "bible", "history_30", "history_70", "civics", "lashon_30", "lashon_70", "science", "phsycology", "cinema", "geography", "theatre_theoretical", "theatre_practic", "theatre_11", "theatre_12", "history_of_art", "art", "art_11", "art_12", "photography", "creative_writing", "music"];
studentsHash = {}; //hash for student by id
var student, keys, key;

//INIT - hash by lessons => level => students array
lessonStudents = {};
for (var i = 0; i < lessonsList.length; i++) {
  lessonStudents[lessonsList[i]] = {};
  lessonStudents[lessonsList[i]]['must'] = [];
  lessonStudents[lessonsList[i]]['wants'] = [];
  lessonStudents[lessonsList[i]]['agree'] = [];
  lessonStudents[lessonsList[i]]['dont want'] = [];
}

//build hashes
for(var i=0; i<data.length;i++){
  student = data[i];

  //lessons hash
  keys = Object.keys(student);
  for (var j = 0; j < keys.length; j++) {
    key = keys[j];
    if(lessonsList.indexOf(key) == -1)  continue;
    else  lessonStudents[key][student[key]].push(student.id);
  }

  //students hash
  studentsHash[student.id + ""] = student;

  student.lessons = {}; //lesson name
  student.slots = {}; //lesson hours (needed because lesson can have more than one slot)
}

slotsPerDay = {
  a: 4, b: 3, c: 3, d: 4, e: 3
};
slotsHash = {};
weekdays = Object.keys(slotsPerDay);
function classRoom(){
  return {
    students: [],
    lessonName: null
  }
};



function initSlot(slot){
  for(var i=0; i<4; i++){
    slot["r" + i] = classRoom();
  }
  slot["art1"] = classRoom();
  slot["art2"] = classRoom();
  slot["theatre"] = classRoom();
  slot["photo"] = classRoom();
  slot["center"] = classRoom();
  slot.completelyEmpty = true;
};

schedule = {
  a: null, b: null, c: null, d: null, e: null
};


for(var i in schedule){
  schedule[i] = [];
  for(var j=0; j<slotsPerDay[i]; j++){
    schedule[i][j] = {};
    initSlot(schedule[i][j]);
    schedule[i][j].weekday = i;
    schedule[i][j].index = j;
    slotsHash[i + '' + j] = schedule[i][j];
  }
}

lessonsOrder =  ["literature", "bible", "history_30", "history_70", "civics", "lashon_30", "lashon_70", "science", "phsycology", "cinema", "geography", "theatre_theoretical", "theatre_practic", "theatre_11", "theatre_12", "history_of_art", "art", "art_11", "art_12", "photography", "creative_writing", "music"];

//sort in order to start with the most demanded lessons
sortLessonsOrder = function(level){
  lessonsOrder.sort(function(a,b){
    var al = lessonStudents[a][level].length;
    var bl = lessonStudents[b][level].length;
    //console.log('a', a, al, 'b', b, bl);
    if (al < bl)
      return 1;
    if (al > bl)
      return -1;
    return 0;
  });
};

lessonsDefs = {"theatre_practic": { classType: ["theatre"]}, "theatre_11": { classType: ["theatre"]}, "theatre_12": { classType: ["theatre"]}, "art": { classType: ["art1", "art2"]}, "art_11": { classType: ["art1", "art2"]}, "art_12": { classType: ["art1", "art2"]}, "photography": { classType: ["photo"]}};
lessonDefDefaults = {
  classType: ['reg'],
  weeklyHours: 1
};

lessonsSlotsHash = {};
/* /init */


