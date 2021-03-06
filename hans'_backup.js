// BUGS + FIXES NEEDED
//        \   /
//        .\-/.
//    /\ ()   ()
//   /  \/~---~\.-~^-.
//.-~^-./   |   \---.
//     {    |    }   \
//   .-~\   |   /~-.
//  /    \  A  /    \
//        \/ \/


// BUGS KILLED
//        \   /
//        .\-/.
//    /\ XX   XX
//   /  \/~---~\.-~^-.
//.-~^-./   |   \---.
//     {    |    }   \
//   .-~\   |   /~-.
//  /    \  A  /    \
//        \/ \/

// if there are no tutors, we need to have smth to deal with that -- like "sorry, no tutors avaliable type thing"

// HANS written wherever code was edited

// edits to this code: 
// students is now a list of student objects 
// replace every "student" with student.first_name
// same for tutors

// reminders on obj: 
// {
//          type_of_user: 
//          email: 
//          first_name: 
//          last_name: 
//          phone_num: 
//          home_num: 
//          times_free: 
//          subjects_wanted: 
//  }

// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// new google form -- run first time
function newForm() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.create('New Matching Form');
  var sheet = ss.getSheetByName('Matches');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  var filteredSheetURL = 'https://docs.google.com/spreadsheets/d/1U0W6xLDJ8bGpBPZCPmlLvhboHq-JAeVsLU92uXpPYQ4/edit#gid=678831187';
  var filteredSheet = SpreadsheetApp.openByUrl(filteredSheetURL).getSheetByName('Roster');
   
  // set up student drop down list
  var studentsList = form.addListItem();
  
  // get student emails from filtered sheet
  var students = [];
  var studentsRows = {};
  var studentNum = 0
  
  // loop over entries of students 
  for (var n = 2; n < filteredSheet.getLastRow() - 1; n++) {
    var studentData = filteredSheet.getRange(n, 13).getValue();
    if (studentData == '') {
      continue;
    }
    
    // Logger.log(studentData)
    
    // process the student data
    Logger.log(studentData)
    
    var student_obj = JSON.parse(studentData)
    
    studentNum++
    studentsRows[studentNum] = n
    // HANS
    students.push(student_obj);
  }
  
  // testing to see if it parsed thru 
  // Logger.log(students[0].first_name)
  
  var studentPages = []; // for collecting the choices in the list item
  for (var n = 0; n < students.length; n++){
    var student = students[n];
    
    // making a section for student
    var newStudentPage = form.addPageBreakItem()
    .setTitle(student.first_name)
    .setGoToPage(FormApp.PageNavigationType.SUBMIT)
    
//    // push our choice to the list select
//    studentPages.push(studentsList.createChoice(student.email,newStudentPage));
    
    // set up tutors drop down list
    var tutorsList = form.addListItem();
    
    // get tutor emails from filtered sheet
    var tutors = [];
    // Logger.log(filteredSheet.getLastColumn())
    for (var m = 14; m < filteredSheet.getLastColumn() + 1; m++) {
//      Logger.log("students rows")
//      Logger.log(studentsRows[n + 1])
//      Logger.log("m")
//      Logger.log(m)
      
      var rawTutorData = filteredSheet.getRange(studentsRows[n + 1], m).getValue();
      
      // Logger.log(tutorData)
      
      if (rawTutorData == '') {
        continue;
      }
      
      // Logger.log("here!")
      
      // parse tutor data HANS
      
      Logger.log("rawTutorData")
      Logger.log(rawTutorData)
      
      tutorData = rawTutorData.split("|")
      var tutor_info = tutorData[0].trim()
      var tutor_times = tutorData[1].trim()
      var tutor_subjects = tutorData[2].trim()
      
      var tutor_obj = JSON.parse(tutor_info)
      
      tutor_obj.times_free = tutor_times.split(",")
      
      // improve readability of meeting times
      for (var time in tutor_obj.times_free) {
        var meeting = tutor_obj.times_free[time]
        Logger.log(meeting)
        if (meeting[0] == 'm') {
          meeting = 'Monday ' + meeting.substring(1);
        } else if (meeting[0] == 't') {
          meeting = 'Tuesday ' + meeting.substring(1);
        } else if (meeting[0] == 'w') {
          meeting = 'Wednesday ' + meeting.substring(1);
        } else if (meeting[0] == 'r') {
          meeting = 'Thursday ' + meeting.substring(1);
        } else if (meeting[0] == 'f') {
          meeting = 'Friday ' + meeting.substring(1);
        }
        Logger.log(meeting)
        tutor_obj.times_free[time] = meeting
      }
      
      tutor_obj.subjects_wanted = tutor_subjects.split(",")
      
      tutors.push(tutor_obj);
    }
    
    // Logger.log(tutors.length)
    // Logger.log(tutors[0].times_free)
    
    var tutorPages = []; // for collecting the choices in the list item
    for (var m = 0; m < tutors.length; m++){
      var tutor = tutors[m];
      
      // making a section for tutor
      var newTutorPage = form.addPageBreakItem()
      .setTitle(tutor.first_name)
      .setGoToPage(FormApp.PageNavigationType.SUBMIT);
      
      // push our choice to the list select
      tutorPages.push(tutorsList.createChoice(tutor.email,newTutorPage));
      
      // if you need any questions for the tutor in answer add them here e.g.
      var times = form.addCheckboxItem();
      times.setTitle('Select meeting time(s)')
      .setChoiceValues(tutor.times_free); // HANS
      
      var subjects = form.addListItem()
      .setTitle('Select subject')
      .setChoiceValues(tutor.subjects_wanted); // HANS
    }
    
    // adding each of the tutors to our select list
    if (tutorPages.length > 0) {
      tutorsList.setTitle('Select tutor email')
      .setChoices(tutorPages);
      // push our choice to the list select
      studentPages.push(studentsList.createChoice(student.email,newStudentPage));
    }
    
  } // end loop thru students
  
  // adding each of the students to our select list 
  studentsList.setTitle('Select student email')
      .setChoices(studentPages);
  
  // add headings to matches sheet
  if (sheet.getRange(1, 1).getValue() == '') {
    sheet.appendRow(['STUDENT NAME', 
                   'STUDENT EMAIL', 
                   'TUTOR NAME', 
                   'TUTOR EMAIL', 
                   'MEETING TIMES', 
                   'SUBJECT']);
  }
  
  Logger.log(ss.getSheets());
  Logger.log(ss.getSheets()[0].getName());
//  var responses = ss.getSheets()[0];
//  responses.setName('Form Responses');
  
}

// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// for testing bc i'm lazy
function howManyFuckingSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log(ss.getSheets());
  Logger.log(ss.getSheets()[0].getName());
  Logger.log(ss.getSheets()[1].getName());
}

// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function deleteShit() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Matches')
  var form = FormApp.openByUrl(ss.getFormUrl());
  var formID = form.getId();
  var responses = ss.getSheets()[0];
  
  FormApp.openById(formID).removeDestination();
  DriveApp.getFileById(formID).setTrashed(true);
  ss.deleteSheet(responses);
}

// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// update google form
function createOnUpdateTrigger() {
  // FIX THIS LINK
  var rosterURL = 'https://docs.google.com/spreadsheets/d/1U0W6xLDJ8bGpBPZCPmlLvhboHq-JAeVsLU92uXpPYQ4/edit#gid=678831187'
  var roster = SpreadsheetApp.openByUrl(rosterURL).getSheetByName('Roster')
  ScriptApp.newTrigger('onUpdate')
      .forSpreadsheet(roster)
      .onChange()
      .create();
}

// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


function onUpdate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.openByUrl(ss.getFormUrl());
  var formID = form.getId();
  var responses = ss.getSheets()[0];
  
  // delete and unlink form
  DriveApp.getFileById(formID).setTrashed(true);
  FormApp.openById(formID).removeDestination();
  ss.deleteSheet(responses);
  
  newForm();
}


// NEW FUNCTION ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// update master(?) spreadsheet
function onFormSubmit() {
  console.log("hello???")
  
  // constants HANS
  var NAME_COL = 2
  var EMAIL_COL = 1
  var MON_TIME_COL = 6
  var SUBJ_COL = 11    
  
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Matches');
  var responses = ss.getSheets()[0];
  var filteredSheetURL = 'https://docs.google.com/spreadsheets/d/1U0W6xLDJ8bGpBPZCPmlLvhboHq-JAeVsLU92uXpPYQ4/edit#gid=678831187';
  var filteredSheet = SpreadsheetApp.openByUrl(filteredSheetURL).getSheetByName('Roster');
  
  // get most recent submission
  var data = responses.getDataRange().getValues();
  var recentRow = data[responses.getLastRow() - 1];
  var recentResponse = []; 
  for (var col = 0; col < responses.getLastColumn(); col++) {
    if (recentRow[col] == '') {
      continue;
    }
    recentResponse.push(recentRow[col]);
  }
  
  // bleh integerate code so it is nice
  var STUDENT = 0
  var TUTOR = 1
  
  // add to sheet
  
  var timestamp = recentResponse[0];
  var studentEmail = recentResponse[1];
  var tutorEmail = recentResponse[2];
  var emails = [studentEmail, tutorEmail];
  var meetingTimes = recentResponse[3].split(", "); // times are listed: Monday, ___.
  var subject = recentResponse[4]; 
  var names = ["Student Not Found", "Tutor Not Found"]
  
  // HANS
  var filteredData = filteredSheet.getDataRange().getValues()
  
  // Logger.log(filteredData)
  
  var days = ["Monday ", "Tuesday ", "Wednesday ", "Thursday ", "Friday "]
  
  for (var i = 0; i < filteredData.length; i ++) {
    Logger.log("i: " + i.toString())
    for (var mode = 0; mode < 2; mode ++) {
      Logger.log("mode: " + mode.toString())
      if (filteredData[i][EMAIL_COL] == emails[mode]) {
        // Logger.log("filteredData[i][EMAIL_COL]: " + filteredData[i][EMAIL_COL])
        // console.log(i)
        
        
        names[mode] = filteredData[i][NAME_COL];
        
        // update avalibilitis + times 
        
        // grabbing student times from sheet (doesn't have the things)
        var times = []
        
        for (var d = 0; d < 5; d++ ) {
          var trimmed_data = filteredData[i][MON_TIME_COL + d].split(",")
          
          for (td in trimmed_data) {
            times.push(days[d] + trimmed_data[td].trim())
          }
          
          
          // student_times_by_day.push(trimmed_data)
        }  
        
        // grabbing subjects from sheet
        var subjects = filteredData[i][SUBJ_COL].split(",")
        
        for (s in subjects) {
          subjects[s] = subjects[s].trim()
        }
        
        console.log("finished updating subjects")
        
        // update stuff
        var updated_times = []
        for (t in times) { 
          
          if (meetingTimes.indexOf(times[t]) < 0) {
            updated_times.push(times[t])
          }  
        }
        Logger.log(updated_times)
        
        // TODO: update time entry
        
        var updated_times_in_row = [[],[],[],[],[]]
        // for each thing, edit to see when is good 
        for (time in updated_times) {
          Logger.log(updated_times[time])
          // add to monday avaiblitles.
          for (d = 0; d < 5; d ++) {
            if (updated_times[time].substring(0,2) == days[d].substring(0,2)) {
              
              var space_index = updated_times.indexOf(" ")
              updated_times_in_row[d].push(updated_times[time].substring(space_index + 1))
              // TODO: process updated times so it no longer has the day of the week
              
            }
          }
           
        }
        
        // for number 1 to 5 
        // if the first character matches days [ number]
        //    update the range.
        
        for (d = 0; d < 5; d ++) {
          if (updated_times_in_row[d].length == 0){
            filteredSheet.getRange(i + 1,MON_TIME_COL + d + 1).setValue("none")
          } else {
            filteredSheet.getRange(i + 1,MON_TIME_COL + d + 1).setValue(updated_times_in_row[d])
          }
        }
        
        console.log("finished updating times")
        
        var updated_student_subjects = []
        if (mode == STUDENT) {
          for (s in subjects) { 
            if (subjects[s] != subject) {
              updated_student_subjects.push(subjects[s])
            }  
          } 
          
          // TODO: update student subject entry
          filteredSheet.getRange(i + 1,SUBJ_COL + 1).setValue(updated_student_subjects.toString())
        }
        
        
        
        // Logger.log("updated_student_times")
        // Logger.log(updated_times[STUDENT])
        Logger.log("mode at end of if statement: " + mode.toString())
        
      } // end if matches if statement.
      Logger.log("mode at end of mode loop: " + mode.toString())
    } // end mode
    
    //    if (filteredData[i][EMAIL_COL] == tutorEmail) {
    //      tutorName = filteredData[i][NAME_COL];
    //      
    //      // update avalibilitis + times 
    //      var tutor_times = []
    //      for (var d = 0; d < 5; d++ ) {
    //        var trimmed_data = filteredData[i][MON_TIME_COL + d].split(",")
    //        
    //        for (t_td in trimmed_data) {
    //          trimmed_data[t_td] = trimmed_data[t_td].trim()
    //        }
    //        
    //        tutor_times.push(days[d] + trimmed_data)
    //      }  
    //      
    //      var tutor_subjects = filteredData[i][SUBJ_COL].split(",")
    //      
    //      for (ts in tutor_subjects) {
    //        tutor_subjects[ts] = tutor_subjects[ts].trim()
    //      }
    //      
    //      var updated_tutor_times = []
    //      for (tt in tutor_times) { 
    //        if (meetingTimes.indexOf(tutor_times[tt]) < 0) {
    //          updated_tutor_times.push(tutor_times[tt])
    //        }  
    //      }
    //      
    //      // edit: realized that we dont need to update tutor subjects, bc tturos can tutor multiple ppl in one subject
    ////      var updated_tutor_subjects = []
    ////      for (ts in tutor_subjects) { 
    ////        if (tutor_subjects[ts] != subject) {
    ////          updated_tutor_subjects.push(tutor_subjects[ts])
    ////        }  
    ////      } 
    //    } // end tutor ifstement 
    
  }  // end loop thru all students
  
  
  
  // Logger.log(meetingTimes)
  
  // TODO: allow to tutor in  mulitple subjects + times 
  sheet.appendRow([names[STUDENT], emails[STUDENT], names[TUTOR], emails[TUTOR], meetingTimes.toString(), subject]);

}

