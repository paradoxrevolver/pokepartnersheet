let dotenv = require('dotenv').config();
let GoogleSpreadsheet = require('google-spreadsheet');
let async = require('async');

let gs = new GoogleSpreadsheet(process.env.SHEET_ID);
let accountInfo = require('./ignore/account-info.json');

async.series([
	function SetAuth(step) {
		gs.useServiceAccountAuth(accountInfo, (err) => {
			if(err) console.log('useServiceAccountAuth error: ' + err);
			step();
		});
	},
	function GetInfo(step) {
		gs.getInfo((err, info) => {
			if(err) console.log('getInfo error: ' + err);
			console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
			step();
		});
	},
], (err) => {
	if(err) console.log('async series error: ' + err);
});

//console.log(gs);
//gs.getInfo(console.log);
//console.log(gs.isAuthActive());