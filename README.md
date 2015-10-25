# GoogleDriveNotify
Monitors a Google Drive folder and notifies of new or deleted files by email.

## Installation
- Create a 1 column google spreadsheet with 10,000 rows.  
- Click Tools > Script Editor
- Copy paste this script into editor
- Add your own emails, folder id, and subject
  - Get the folder id from the URL of the folder
- Click Resources > All your triggers
- Create a time driven event that runs every 2 hours.  This value must match the 'schedule' variable.
