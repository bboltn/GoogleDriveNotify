//CONFIG
var adminemail = "###";
var emails = "###";
var folderId = "####";

// NEW FILE EMAIL TEXT
var newfilesubject = "###";

var schedule = 2; //1,2,4,6,8,12
var past = new Date();
past.setHours(past.getHours() - schedule);

function folderMonitor() {

  var showsDrive = getShowsFromDrive(folderId, []);
  var showsDriveList = convertToList(showsDrive);
  var showsSheet = getShowsFromSpreadSheet();
  
  var newFiles = getFileDiff(showsDriveList, showsSheet);
  var deletedFiles = getFileDiff(showsSheet, showsDriveList);
  var changedFiles = getChangedFiles(showsDrive, newFiles);

  log("newFiles: " + newFiles);
  log("deletedFiles: " + deletedFiles);
  log("changedFiles: " + changedFiles);
  
  //update sheet
  if (newFiles.length > 0 || deletedFiles.length > 0) {
    log("Update Show List!");
    updateShowList(showsDrive, showsSheet.length);
  }
  else {
    log("Do not update show list!");
  }

  if (newFiles.length > 0 || deletedFiles.length > 0 || changedFiles.length > 0) {
      sendEmail(newFiles, deletedFiles, changedFiles, newfilesubject);
  }
}

function buildFileULList(files, title) {
  var newStr = "";
  if (files.length > 0) {
    newStr = "<p>" + title + "</p><ul>";
    for (var i = 0; i < files.length; i++) {
      newStr += "<li>" + files[i] + "</li>";
    }
    newStr += "</ul>";
  }
  return newStr;
}

function sendEmail(newFiles, deletedFiles, changedFiles, subject) {
    //Create email html body with a link to the monitored folder 
    var folderURL = "https://drive.google.com/drive/folders/" + folderId;

    var newStr =  buildFileULList(newFiles, "New Files") +
                  buildFileULList(deletedFiles, "Deleted Files") +
                  buildFileULList(changedFiles, "Changed Files");

    var message = "<body>" +
                  "<p><a href=" + folderURL + ">Open folder</a></p>" +
                  newStr +
                  "</body>";

    MailApp.sendEmail(emails, subject,
      "Go here to view changes " + folderURL, {htmlBody: message});
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

function getChangedFiles(showsDrive, newFiles) {
  var changed = [];
  for (var i = 0; i < showsDrive.length; i++) {
    var file = showsDrive[i];
    if (file.getLastUpdated().getTime() > past.getTime() && newFiles.indexOf(file.getName()) == -1) {
      changed.push(file.getName());
    }
  }
  return changed;
}

function getShowsFromDrive(folderId, shows) {
  
    var theFolder = DriveApp.getFolderById(folderId);
    var files = theFolder.getFiles();
  
    while (files.hasNext()) {
      var file = files.next();
      shows.push(file);
    }
  
    var subfolders = theFolder.getFolders();
  
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      shows = getShowsFromDrive(folder.getId(), shows);
    }
      
    return shows;
}

function convertToList(files) {
  var filenames = [];
  for(var i = 0; i < files.length; i++) {
    filenames.push(files[i].getName());
  }
  return filenames;
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


