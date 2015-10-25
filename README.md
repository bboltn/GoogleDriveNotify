# GoogleDriveNotify
Monitors a Google Drive folder and notifies of new or deleted files by email.

## Installation
- Create a 2 column google spreadsheet with 10,000 rows.  
- Click Tools > Script Editor
- Copy paste this script into editor
- Add your own emails and folder id
  - Get the folder id from the URL of the folder
- Click Resources > All your triggers
- Create a time driven event that runs every hour (or more often or less often)  Up to you.

## Optional Stuff
This script only emails for new files (because that is what I cared about), but it would be trivial to also notify about deleted files too.
