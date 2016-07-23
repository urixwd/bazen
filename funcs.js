/* general */
Array.prototype.pushUnique = function (item){
  if(this.indexOf(item) == -1) {
    //if(jQuery.inArray(item, this) == -1) {
    this.push(item);
    return true;
  }
  return false;
};
var CONSTS = {
  debug: true
};
clog = function(str, force){
  force = force || false;
  if(CONSTS.debug || force)  console.log(str);
};
jlog = function (obj, force) {
  force = force || false;
    if(CONSTS.debug || force){
    var keys = Object.keys(obj);
    clog('{');
    for(var i=0; i<keys.length;i++){
      clog(keys[i] + ': ' + obj[keys[i]]);

    }
    clog('}');
  }
};
/* /general */
getSlotForLesson = function(lessonName, slotType, onlyEmptySlots, slotsToAvoid){
  var currentSlot, numOfSlots, day;
  onlyEmptySlots = onlyEmptySlots || false;
  slotsToAvoid = slotsToAvoid || [];
  //_.forOwn(slotsPerDay, function(numOfSlots, day) {
  for(day in slotsPerDay){
    numOfSlots = slotsPerDay[day];
    //console.log('slotsPerDay: ' + numOfSlots);
    for (var i = 0; i < numOfSlots; i++) {
      currentSlot = schedule[day][i];

      if(slotType == 'reg'){
        if(onlyEmptySlots && !currentSlot.completelyEmpty){ //slot is not empty
          continue;
        }
        if(getClassRoomInSlot(slotType, currentSlot, lessonName) && slotsToAvoid.indexOf(day + '' + i) == -1){
          clog('lesson ' + lessonName + '  slot found ' + ' ' + day + ' ' + i);
          return currentSlot;
        }
      }
    }
  }
  return null;
};
getClassRoomInSlot = function(classType, slot, lessonName){
  if(classType.indexOf('reg') != -1) classType = ['r0', 'r1', 'r2', 'r3']

  //iterate reg classes
  for(var i=0;i<classType.length;i++){
    if(slot[classType[i]].lessonName == null)  return slot[classType[i]];
  }
  return null;
};
getRegClassRoomInSlot = function(slot, lessonName){

};
studentInSlot = function(student, slot){
  return student.slots.hasOwnProperty(slot.weekday + '' + slot.index);
}
_assignStudent = function(classRoom, student, lessonName, slot, limit){
  limit = limit || false;
  if(limit && classRoom.students.length >= 14)  throw new Exception('more than 14 students');

  if(!lessonsSlotsHash.hasOwnProperty(lessonName)){
    lessonsSlotsHash[lessonName] = {};
  }
  lessonsSlotsHash[lessonName][slot.weekday + '' + slot.index] = classRoom;

  student.lessons[lessonName] = true;
  student.slots[slot.weekday + '' + slot.index] = true;
  classRoom.students.push(student.id);
  classRoom.lessonName = lessonName;
  slot.completelyEmpty = false;
  return true;
};
assignStudentsSimple = function(weekday, index, lessonName, level){
  level = level || ['must'];
  var slot = schedule[weekday][index];
  var classRoom = getClassRoomInSlot(['reg'], slot, lessonName);
  classRoom.lessonName = lessonName;
  var studentsList = getGroupOfStudents(lessonName, level, false);
  //console.log('assignStudentsSimple', lessonName, 'must', level, 'num of students', studentsList.length, weekday, index);

  //iterate and assign
  for(var i=0;i<studentsList.length; i++){
      _assignStudent(classRoom, studentsList[i], lessonName, slot, false);
  }

  //empty - mark as taken care
  lessonStudents[lessonName][level] = [];

};
getGroupOfStudents = function(lessonName, level, limit) {
  limit = limit || false;
  var dt = data.filter(student => (level.indexOf(student[lessonName]) >= 0 ) );

  //console.log('original length', dt.length);
  if(limit) dt = _.take(dt, 14);
  return dt;
};
assignStudentListToLesson = function(lessonName, slot, classRoom, studentsList){
  var student, studentId;
  for (var i = 0; i < studentsList.length; i++) {
    studentId = studentsList[i];
    student = studentsHash[studentId];

    _assignStudent(classRoom, student, lessonName, slot, false);
  }

  slot.completelyEmpty = false;
};
lessonHasClass = function(lessonName) {
  return lessonsSlotsHash.hasOwnProperty(lessonName);
}
/* assigns english and math, hard coded */
assignEnglishMath = function(){
  assignStudentsSimple('a', 0, "math_prep", ['must']);
  assignStudentsSimple('a', 1, "math_801", ['must']);
  assignStudentsSimple('a', 2, "math_802", ['must']);
  assignStudentsSimple('a', 3, "math_803", ['must']);
  //assignStudentsSimple('a', 0, "english_prep", ['must']);
  assignStudentsSimple('b', 0, "english_3", ['must']);
  assignStudentsSimple('b', 1, "english_4", ['must']);
  assignStudentsSimple('b', 2, "english_5", ['must']);

  assignStudentsSimple('c', 0, "math_prep", ['must']);
  assignStudentsSimple('c', 1, "math_801", ['must']);
  assignStudentsSimple('c', 2, "math_802", ['must']);
  assignStudentsSimple('d', 0, "math_803", ['must']);
  //assignStudentsSimple('c', 0, "english_prep", ['must']);
  assignStudentsSimple('d', 1, "english_3", ['must']);
  assignStudentsSimple('d', 2, "english_4", ['must']);
  assignStudentsSimple('d', 3, "english_5", ['must']);
};
/* assigns musts which are no english and math */
assignStudentsToMustLesson = function(lessonName, classType, level, emptySlotsOnly){
  emptySlotsOnly = emptySlotsOnly || false;
  var studentsList = lessonStudents[lessonName][level];
  if(!studentsList.length)  return true;

  var slot, classRoom, studentId, student, cnt, possibleAssignes = [];

  //iterate slotsHash for completely empty slots
  for(var slotKey in slotsHash){
    classRoom = null;
    slot = slotsHash[slotKey];
    if(emptySlotsOnly && !slot.completelyEmpty) continue;

    //get classroom
    classRoom = getClassRoomInSlot(classType, slot, lessonName);
    if(!classRoom)  continue;

    //iterate students
    cnt = 0; //reset counter
    for (var i = 0; i < studentsList.length; i++) {
      studentId = studentsList[i];
      student = studentsHash[studentId];

      //check if student can be assigned
      if(cnt < 14 && !studentInSlot(student, slot)){
        cnt++;
      }
    }

    if(cnt == studentsList.length){ //all students can be assigned
      assignStudentListToLesson(lessonName, slot, classRoom, studentsList);
      lessonStudents[lessonName][level] = [];
      console.log('lesson ', lessonName, 'assigned', slot.weekday, slot.index);
      return true;
    }else{ //NOT all students can be assigned, remember the number
      //console.log('lesson ', lessonName, 'NOT all students can be assigned', slot.weekday, slot.index);
      possibleAssignes.push({
        cnt: cnt,
        classRoom: classRoom
      });
    }
  }
  //if we reached here it means that NOT all students can be assigned
  if(!possibleAssignes.length){
    //console.log('lesson ', lessonName, 'no slots left');
    return assignStudentsToMustLesson(lessonName, classType, level, false);
  }
};
/* assigns agrees/wants */
assignStudentsToLesson = function(lessonName, lessonsDef, level, emptySlotsOnly){
  emptySlotsOnly = emptySlotsOnly || false;
  var studentsList = lessonStudents[lessonName][level];
  if(!studentsList.length)  return true;

  var slot, classRoom, studentId, student, cnt, possibleAssignes = [];
  var biggestCntSoFar = 0, slotSoFar = null, classRoomSoFar = null, studentsListSoFar = null;

  if(!lessonHasClass(lessonName)){
    //not taking care of that case for now
    //all lessons have musts
    console.log('NOT lessonHasClass', lessonName);
    //iterate slotsHash for completely empty slots
    for(var slotKey in slotsHash){
      classRoom = null;
      studentsListSoFar = [];
      slot = slotsHash[slotKey];
      if(emptySlotsOnly && !slot.completelyEmpty) continue;

      //get classroom
      classRoom = getClassRoomInSlot(lessonsDef.classType, slot, lessonName);
      if(!classRoom)  continue;

      //iterate students
      cnt = 0; //reset counter
      for (var i = 0; i < studentsList.length; i++) {
        studentId = studentsList[i];
        student = studentsHash[studentId];

        //check if student can be assigned
        //if(cnt < 14 && !studentInSlot(student, slot)){
        if(!studentInSlot(student, slot)){
          cnt++;
          studentsListSoFar.push(studentId);
        }
      }

      if(cnt == studentsList.length){ //all students can be assigned
        assignStudentListToLesson(lessonName, slot, classRoom, studentsList);
        lessonStudents[lessonName][level] = [];
        console.log('lesson ', lessonName, 'assigned', slot.weekday, slot.index);
        return true;
      }else{ //NOT all students can be assigned, remember the number
        console.log('lesson ', lessonName, 'NOT all students can be assigned', slot.weekday, slot.index, 'cnt', cnt);
        if(cnt > biggestCntSoFar){
          biggestCntSoFar = cnt;
          slotSoFar = slot;
          classRoomSoFar = classRoom;
        }
        possibleAssignes.push({
          cnt: cnt,
          classRoom: classRoom
        });
      }
    }

    //if can assign
    if(possibleAssignes.length){
      //if we reached here it means that NOT all students can be assigned
      assignStudentListToLesson(lessonName, slotSoFar, classRoomSoFar, studentsListSoFar);
      //clean
      for (var i = 0; i < studentsListSoFar.length; i++) {
        lessonStudents[lessonName][level].splice(lessonStudents[lessonName][level].indexOf(studentsListSoFar[i]) ,1);
      }
      console.log('lesson', lessonName, 'Assigned the largest amount possible');
      return true;
    }else{
      //try again not slot completely empty
      console.log('lesson ', lessonName, 'no slots left');
      return assignStudentsToLesson(lessonName, lessonsDef, level, false);
    }
  }else{ //lesson already assigned, add students
    console.log('lessonHasClass', lessonName);

    var lessons = Object.keys(lessonsSlotsHash[lessonName]);
    var slot, slotHashCode;
    for (var j = 0; j < lessons.length; j++) {
      slotHashCode = lessons[j];
      classRoom = lessonsSlotsHash[lessonName][slotHashCode];
      slot = slotsHash[slotHashCode];
      //iterate students
      var listToIterator = _.clone(studentsList);
      for (var i = 0; i < listToIterator.length; i++) {
        studentId = listToIterator[i];
        student = studentsHash[studentId];
        //check if student can be assigned
        if(!studentInSlot(student, slot)){
          //assign..
          _assignStudent(classRoom, student, lessonName, slot, false);
          slot.completelyEmpty = false;
          lessonStudents[lessonName][level].splice(lessonStudents[lessonName][level].indexOf(studentId) ,1);
        }
      }
    }
    console.log('lesson', lessonName, 'Assigned the largest amound possible');
  }

};

module.exports = {};