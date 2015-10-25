function folderMonitor() {

  //CONFIG
  var emails = "brian.bolton@gmail.com,harryebolton@gmail.com,imtoddecker@yahoo.com,eric.bolton@gmail.com";
  //var emails = "brian.bolton@gmail.com";
  //https://drive.google.com/drive/folders/{id}
  var folderId = "0B7l9d2idKpTvXzl4dGh2T1lZeUE";
  //var folderId = "0B7h-jwFjcCXgT01yVHRCUEtrdUk";

  var showsDrive = getShowsFromDrive(folderId, []);
  var showsSheet = getShowsFromSpreadSheet();
  
  log("showsDrive: " + showsDrive);
  log("showsSheet: " + showsSheet);
  
  var newFiles = getFileDiff(showsDrive, showsSheet);
  var deletedFiles = getFileDiff(showsSheet, showsDrive);
  
  log("newFiles: " + newFiles);
  log("deletedFiles: " + deletedFiles);
  
  //update sheet
  if (newFiles.length > 0 || deletedFiles.length > 0) {
    log("Changed Files!");
    updateShowList(showsDrive, showsSheet.length);
  }
  else {
    log("No changed files!");
  }

  if (newFiles.length > 0) {
      //Create email html body with a link to the monitored folder 
      var folderURL = "https://drive.google.com/drive/folders/" + folderId;

      var fileString = "<ul>";
      for (var i = 0; i < newFiles.length; i++) {
        fileString += "<li>" + newFiles[i] + "</li>";
      }
      fileString += "</ul>";

      var message = "<body>" +
                    "<p> New file(s) have been added.</p>" +
                    "<p><a href=" + folderURL + ">Open folder</a></p>" +
                    fileString +
                    "</body>";

      MailApp.sendEmail(emails, "Eric Uploaded a new Movie or TV Show",
        "New file has been added at " + folderURL, {htmlBody: message});
  }

//  MailApp.sendEmail("brian.bolton@gmail.com", "It is emailing!",
  //  "test run successful");
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

function getShowsFromDrive(folderId, shows) {
  
    var theFolder = DriveApp.getFolderById(folderId);
    var files = theFolder.getFiles();
  
    while (files.hasNext()) {
      var file = files.next();
      shows.push(file.getName());
    }
  
    var subfolders = theFolder.getFolders();
  
    while (subfolders.hasNext()) {
      var folder = subfolders.next();
      shows = getShowsFromDrive(folder.getId(), shows);
    }
      
    return shows;
}

function getShowsFromSpreadSheet()
{
  var sheet = SpreadsheetApp.getActiveSheet();
  var range = sheet.getRange(1, 2, 10000);
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
  var range = sheet.getRange(1, 2, max);
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


