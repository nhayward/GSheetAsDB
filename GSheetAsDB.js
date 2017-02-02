/*
 *  _____  _____  _                  _     ___       ______ ______
 * |  __ \/  ___|| |                | |   / _ \      |  _  \| ___ \
 * | |  \/\ `--. | |__    ___   ___ | |_ / /_\ \ ___ | | | || |_/ /
 * | | __  `--. \| '_ \  / _ \ / _ \| __||  _  |/ __|| | | || ___ \
 * | |_\ \/\__/ /| | | ||  __/|  __/| |_ | | | |\__ \| |/ / | |_/ /
 *  \____/\____/ |_| |_| \___| \___| \__|\_| |_/|___/|___/  \____/
 *
 * Written by Nick Hayward
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE', which is part of this source code package.
 * (https://github.com/nhayward/GSheetAsDB/blob/master/LICENSE)
 */

function initSheetData(sheets) {
	var completionCount = 0;
	sheets.forEach(function(sheetToInit, i) {
		// check for optional "tab" key in sheet object and default to 1 if not found
		var tab = sheetToInit.tab ? sheetToInit.tab : 1;
		// the following sheet URL structure will return JSON from a publicly published ghseet at the specified tab number
		var sheetURL = 'https://spreadsheets.google.com/feeds/list/' + sheetToInit.id + '/' + tab + '/public/values?alt=json';
		$.getJSON(sheetURL, function(data) {
			var sheetData = [];
			var rowData = {};
			$.each(data.feed.entry, function() {
				// iterate through each entry object's keys
				$.each($(this)[0], function(key, value) {
					// keys relevant to columns will all start with "gsx$" 
					// followed by the column name in lowercase without spaces
					// ex: column "Test 1" will show up as "gsx$test1"
					if (key.startsWith("gsx$")) {
						// add key to rowData object without the leading "gsx$"
						// the value of the cell is stored as "$t" within the value of the "gsx$" key
						rowData[key.substring(4)] = value.$t;
					}
				});
				// push rowData to the sheetData array and reset the rowData object
				sheetData.push(rowData);
				rowData = {};
			});
			// set the sheetData array as the value of the "data" key in the sheet object
			sheetToInit.data = sheetData;
		}).always(function() {
			completionCount++;
			if (completionCount === sheets.length) {
				// allow any further JavaScript that is within $(document).ready(...) to execute now
				$.holdReady(false);
			}
		});
	});
}

function postDataToSheet(data, sheetToPost, update) {
	// post to your sheet using the sheet's Google script
	$.post(
		sheetToPost.postScriptURL,
		data // creates a new row with the data you provide here
	);
	// check if update has been explicitly passed, default to true
	if (typeof(update) === "undefined") {
		update = true;
	}
	// only update the data object on the front end if update is true
	if (update) {
		// now we will update the sheet data object on the front end
		// 
		// the data keys must be massaged to look like they do when
		// spreadsheet data is returned
		for (var key in data) {
			// lowercase the key and remove anything non-alphanumeric
			var newKey = key.toLowerCase().replace(/[^a-zA-Z0-9]/gi, "");
			data[newKey] = data[key];
			// remove the old key
			delete data[key];
		}
		// update the data object on the front end
		sheetToPost.data.push(data);
	}
}
