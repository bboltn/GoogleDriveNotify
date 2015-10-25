//CONFIG
// var adminemail = "brian.bolton@gmail.com";
// var emails = "brian.bolton@gmail.com,harryebolton@gmail.com,imtoddecker@yahoo.com,eric.bolton@gmail.com";
// var folderId = "0B7l9d2idKpTvXzl4dGh2T1lZeUE";

// TEST INFO
var adminemail = "brian.bolton@gmail.com";
var emails = "brian.bolton@gmail.com";
////https://drive.google.com/drive/folders/{id}
var folderId = "0B7h-jwFjcCXgT01yVHRCUEtrdUk";

// NEW FILE EMAIL TEXT
var newfilesubject = "Eric Uploaded a new Movie or TV Show";
var newfiletxtmsg = "New file has been added at ";
var newfilehtmlmsg = "New file(s) have been added.";

// DELETED FILE EMAIL TEXT
var deletedfilesubject = "Eric Deleted a show";
var deletedfiletxtmsg = "File has been deleted at ";
var deletedfilehtmlmsg = "These File(s) have been deleted.";

// CHANGED FILE EMAIL TEXT
var changedfilesubject = "Eric changed a show";
var changedfiletxtmsg = "File has been changed at ";
var changedfilehtmlmsg = "These File(s) have been changed.";

// NOTIFY ON WHAT?
var notifyOfDeleted = true;
var notifyOfAdded = true;
var notifyOfChange = true;

var schedule = 2; //1,2,4,6,8,12


function folderMonitor() {

  var result = getShowsFromDrive(folderId, [], [], schedule);
  var showsSheet = getShowsFromSpreadSheet();

  var showsDrive = result[0];
  var changedFiles = result[1];
  
  log("showsDrive: " + showsDrive);
  log("showsSheet: " + showsSheet);
  
  var newFiles = getFileDiff(showsDrive, showsSheet);
  var deletedFiles = getFileDiff(showsSheet, showsDrive);
  
  log("newFiles: " + newFiles);
  log("deletedFiles: " + deletedFiles);
  
  //update sheet
  if (newFiles.length > 0 || deletedFiles.length > 0) {
    log("Update Show List!");
    updateShowList(showsDrive, showsSheet.length);
  }
  else {
    log("Do not update show list!");
  }

  if (notifyOfAdded && newFiles.length > 0) {
      sendEmail(newFiles, newfilesubject, newfiletxtmsg, newfilehtmlmsg);
  }

  if (notifyOfDeleted && deletedFiles.length > 0) {
      sendEmail(deletedFiles, deletedfilesubject, deletedfiletxtmsg, deletedfilehtmlmsg);
  }

  if (notifyOfChange && changedFiles.length > 0) {
      sendEmail(changedFiles, changedfilesubject, changedfiletxtmsg, changedfilehtmlmsg);
  }

  MailApp.sendEmail(adminemail, "It is emailing!",
    "test run successful");
}

function sendEmail(files, subject, txtmsg, htmlmsg) {
      //Create email html body with a link to the monitored folder 
    var folderURL = "https://drive.google.com/drive/folders/" + folderId;

    var fileString = "<ul>";
    for (var i = 0; i < files.length; i++) {
      fileString += "<li>" + files[i] + "</li>";
    }
    fileString += "</ul>";

    var message = "<body>" +
                  "<p>" + htmlmsg + "</p>" +
                  "<p><a href=" + folderURL + ">Open folder</a></p>" +
                  fileString +
                  "</body>";

    MailApp.sendEmail(emails, subject,
      txtmsg + folderURL, {htmlBody: message});
}

function getFileDiff(lfSide, rtSide) {
  var files = [];
   for(var i = 0; i < lfSide.length; i++) {
    var show = lfSide[i];
    var hasit = rtSide.indexOf(show);
     if (hasit === -1)
     {
       files.push(show);
     }
   }
  
  return files;
}

function getShowsFromDrive(folderId, shows, changed, schedule) {
  
    var theFolder = DriveApp.getFolderById(folderId);
    var files = theFolder.getFiles();
  
    while (files.hasNext()) {
      var file = files.next();

      var updated = file.getLastUpdated();
      log("updated: " + updated);
      var now = Date.now();

      shows.push(file.getName());
    }
  
    var subfolders = theFolder.getFolders();
  
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      result = getShowsFromDrive(folder.getId(), shows, changed, schedule);
      shows = result[0];
      changed = result[1];
    }
      
    return [shows, changed];
}

function getShowsFromSpreadSheet()
{
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1, 1, 10000);
  var shows = [];
  var vals = range.getValues();
  var i;
  for(i = 0; i< 10000; i++) {
    if (vals[i] != "")
      shows.push(vals[i][0]);
     else
       break;
  }
  
  return shows;
}

function updateShowList(newShows, limit)
{
  var max = limit;
  if (newShows.length > limit)
    max = newShows.length;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1, 1, max);
  for(var i = 0; i < max; i++) {
        var cell = range.getCell(i+1, 1);
        if (i >= newShows.length)
          cell.setValue("");
        else
          cell.setValue(newShows[i]);
  }
}

function log(msg) {
  Logger.log(msg);
  Logger.log("");
}


