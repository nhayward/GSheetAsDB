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

function getSheetData(sheetID, tab) {
	tab = tab ? tab : 1;
	var sheetURL = 'https://spreadsheets.google.com/feeds/list/' + sheetID + '/' + tab + '/public/values?alt=json';
	$.getJSON(sheetURL).done(function(data) {
		return data.feed.entry;
	});
}

function postDataToSheet(scriptURL, data) {
	$.post(
		scriptURL,
		data // creates a new row with the data you send here
	);
}
