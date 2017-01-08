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

function initSheetData() {
	// check for optional "tab" key in sheet object and default to 1 if not found
	var tab = sheet.tab ? sheet.tab : 1;
	// the following sheet URL structure will return JSON from a publicly published ghseet at the specified tab number
	var sheetURL = 'https://spreadsheets.google.com/feeds/list/' + sheet.id + '/' + tab + '/public/values?alt=json';
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
		sheet.data = sheetData;
	});
}

function postDataToSheet(data) {
	$.post(
		sheet.postScriptURL,
		data // creates a new row with the data you send here
	);
}
