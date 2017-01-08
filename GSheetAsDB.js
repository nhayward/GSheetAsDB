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
	var tab = sheet.tab ? sheet.tab : 1;
	var sheetURL = 'https://spreadsheets.google.com/feeds/list/' + sheet.id + '/' + tab + '/public/values?alt=json';
	$.getJSON(sheetURL, function(data) {
		var sheetData = [];
		var rowData = {};
		$.each(data.feed.entry, function() {
			$.each($(this)[0], function(key, value) {
				if (key.startsWith("gsx$")) {
					rowData[key.substring(4)] = value.$t;
				}
			});
			sheetData.push(rowData);
			rowData = {};
		});
		sheet.data = sheetData;
	});
}

function postDataToSheet(data) {
	$.post(
		sheet.postScriptURL,
		data // creates a new row with the data you send here
	);
}
