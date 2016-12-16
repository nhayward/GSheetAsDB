// Written by Nick Hayward

function getSheetData(sheetID) {
	var yourSheet = 'https://spreadsheets.google.com/feeds/list/' + sheetID + '/1/public/values?alt=json';
	$.getJSON(yourSheet).success(function(data) {
		return data.feed.entry;
	});
}

function postDataToSheet(scriptURL, data) {
	$.post(
		scriptURL,
		data // creates a new row with the data you send here
	);
}
