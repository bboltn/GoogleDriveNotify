//CONFIG
var adminemail = "###";
var emails = "###";
var folderId = "###";

// NEW FILE EMAIL TEXT
var newfilesubject = "###";

var schedule = 2; //1,2,4,6,8,12
var past = new Date();
past.setHours(past.getHours() - schedule);

function folderMonitor() {

  var filesDrive = getFilesFromDrive(folderId, []);
  var filesDriveList = convertToList(filesDrive);
  var filesSheet = getFilesFromSpreadSheet();
  
  var newFiles = getFileDiff(filesDriveList, filesSheet);
  var deletedFiles = getFileDiff(filesSheet, filesDriveList);
  var changedFiles = getChangedFiles(filesDrive, newFiles);

  log("newFiles: " + newFiles);
  log("deletedFiles: " + deletedFiles);
  log("changedFiles: " + changedFiles);
  
  //update sheet
  if (newFiles.length > 0 || deletedFiles.length > 0) {
    log("Update Spreadsheet!");
    updateSpreadsheetList(filesDrive, filesSheet.length);
  }
  else {
    log("Do not update spreadsheet!");
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
    var file = lfSide[i];
    var hasit = rtSide.indexOf(file);
     if (hasit === -1)
     {
       files.push(file);
     }
   }
  
  return files;
}

function getChangedFiles(filesDrive, newFiles) {
  var changed = [];
  for (var i = 0; i < filesDrive.length; i++) {
    var file = filesDrive[i];
    if (file.getLastUpdated().getTime() > past.getTime() && newFiles.indexOf(file.getName()) == -1) {
      changed.push(file.getName());
    }
  }
  return changed;
}

function getFilesFromDrive(folderId, fileList) {
  
    var theFolder = DriveApp.getFolderById(folderId);
    var files = theFolder.getFiles();
  
    while (files.hasNext()) {
      var file = files.next();
      fileList.push(file);
    }
  
    var subfolders = theFolder.getFolders();
  
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      fileList = getFilesFromDrive(folder.getId(), fileList);
    }
      
    return fileList;
}

function convertToList(files) {
  var filenames = [];
  for(var i = 0; i < files.length; i++) {
    filenames.push(files[i].getName());
  }
  return filenames;
}

function getFilesFromSpreadSheet()
{
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1, 1, 10000);
  var fileNames = [];
  var vals = range.getValues();
  var i;
  for(i = 0; i< 10000; i++) {
    if (vals[i] != "")
      fileNames.push(vals[i][0]);
     else
       break;
  }
  
  return fileNames;
}

function updateSpreadsheetList(newFiles, limit)
{
  var max = limit;
  if (newFiles.length > limit)
    max = newFiles.length;
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1, 1, max);
  for(var i = 0; i < max; i++) {
        var cell = range.getCell(i+1, 1);
        if (i >= newFiles.length)
          cell.setValue("");
        else
          cell.setValue(newFiles[i]);
  }
}

function log(msg) {
  Logger.log(msg);
  Logger.log("");
}


