# GSheetAsDB

## What is it?
GSheetAsDB is a plugin that you can add to your website to allow it to get data from and post data to a Google Spreadsheet. Instructions are provided below for setting up your sheet and adding the plugin to your project.

## Getting Started

### Setting Up Your Sheet
1. First create your raw Google Spreadsheet (it can be blank for now). We will then add a script to the sheet's script editor in order to handle posting of data.

2. Go the to "Tools" menu for your sheet and click "Script editor...". This will open a new tab with a Google Script file. Title it whatever you'd like at the top. You will see a tab titled "Code.gs". If there is anything in that tab already, delete it. Then paste in the following:

  ```javascript
  //Original script by Martin Hawksey (modified by Nick Hayward)
  //https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/

  //  1. Enter sheet name where data is to be written below
         var SHEET_NAME = "Sheet1";

  //  2. Run > setup
  //     Note: You may be asked to authorize the script to access your data. Go ahead and allow it to do so.
  //
  //  3. Publish > Deploy as web app
  //    - enter Project Version name and click 'Save New Version'
  //    - set security level and enable service (execute as 'me' and access 'anyone, even anonymously')
  //
  //  4. Copy the 'Current web app URL' and put it aside for now. You will paste this into the sheet object initialization as "postScriptURL" shortly.
  //
  //  5. Insert column names on your destination sheet matching the parameter names of the data you are passing in
  //     Note: You must exactly match case and any spaces or special characters when posting data

  var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service

  function doPost(e){
   return handleResponse(e);
  }

  function handleResponse(e) {
   // we want a public lock, one that locks for all invocations
   var lock = LockService.getPublicLock();
   lock.waitLock(30000);  // wait 30 seconds before conceding defeat.

   try {
     // next set where we write the data
     var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
     var sheet = doc.getSheetByName(SHEET_NAME);

     // we'll assume header is in row 1 but you can override with header_row in GET/POST data
     var headRow = e.parameter.header_row || 1;
     var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
     var nextRow = sheet.getLastRow()+1; // get next row
     var row = [];
     // loop through the header columns
     for (i in headers){
       if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
         row.push(new Date());
       } else { // else use header name to get data
         row.push(e.parameter[headers[i]]);
       }
     }
     // more efficient to set values as [][] array than individually
     sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
     // return json success results
     return ContentService
           .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
           .setMimeType(ContentService.MimeType.JSON);
   } catch(e){
     // if error return this
     return ContentService
           .createTextOutput(JSON.stringify({"result":"error", "error": e}))
           .setMimeType(ContentService.MimeType.JSON);
   } finally { //release lock
     lock.releaseLock();
   }
  }

  function setup() {
     var doc = SpreadsheetApp.getActiveSpreadsheet();
     SCRIPT_PROP.setProperty("key", doc.getId());
  }
  ```
  Click the save icon or go to File -> Save. Follow the instructions found at the top of the script.

3. Now you need to publish your sheet. This is necessary in order to allow your application to access sheet data.
  * Go to File -> Publish to the web...
  * Make sure "Entire Document" and "Web page" are selected. Then click "Publish".

4. Lastly you need to locate your spreadsheet ID. You can find it in your sheet's URL in the address bar between "/d/" and "/edit". Save this and put it aside for now.
  * For example: in the URL "https<span></span>://docs.google.com/spreadsheets/d/1F4PMz8MtmlcNhE-WkCp0FMBgz834lkvarlumGPuJTlQ/edit", the spreadsheet ID is "1F4PMz8MtmlcNhE-WkCp0FMBgz834lkvarlumGPuJTlQ"

Your sheet setup is now complete!

### Setting Up Your Application

Include the following in your head tag:

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script type="text/javascript" src="GSheetAsDB.min.js"></script>
<script type="text/javascript">
  $.holdReady(true);
  var gsheet = {
    "id": "put your spreadsheet ID here",
    "postScriptURL": "put your web app URL from the script editor here"
  };
  initSheetData([gsheet]);
</script>
```

An array is passed to the function "initSheetData". You can define multiple sheet objects and pass them in the array as well. If you have multiple tabs in your spreadsheet, you can optionally include a tab number in your gsheet object (ex: "tab": 2). If no tab number is provided, tab number 1 will be used as the default.

## Working With the Plugin

Once initSheetData has finished running, spreadsheet data will be available as an array of objects. Each object in the array is a single row from the sheet. This array is stored in the gsheet object as "data" (gsheet.data). Since the data is obtained asynchronously, you will want to wrap any immediate references to the data object in your application within $(document).ready. The $.holdReady(true) line in the script tag above will delay any following scripting which is within $(document).ready. The function initSheetData ends in $.holdReady(false), which will allow such scripting to run. Any use of the data after the document has fully loaded does not require any special treatment.

### Posting Data

You can post data to a sheet by using the "postDataToSheet" function. The function takes three arguments: the data to post, the sheet object, and an optional boolean to specify whether or not to push the data you are posting to the gsheet objects data property. The optional update boolean will default to true. This is handy for if you are posting to the same sheet that you are getting your data from. In that case, the data on the sheet and the data within your application will be kept in sync. If you are posting to a different sheet, pass false to the function as the third argument.

The data will post to the tab you specified in the Google script attached to your spreadsheet. When posting data you must match the column names of the sheet you are posting to. For example, if you have a sheet with columns "Test 1", "Test 2", and "Test 3", your data object will look like this:
```javascript
var data = {
  "Test 1": "hi",
  "Test 2": "hello",
  "Test 3": "howdy"
};

postDataToSheet(data, gsheet);
```
