let fs = require('fs');
let async = require('async');
let dotenv = require('dotenv').config();
let Pokedex = require('pokedex-promise-v2');
let GoogleSpreadsheet = require('google-spreadsheet');

let gs = new GoogleSpreadsheet(process.env.SHEET_ID);
let p = new Pokedex();
let accountInfo = require('./ignore/account-info.json');

let DATA_PATH = './data/';
let FILE_NAME = 'pokedex.json';

let pokedex;
let UpdatePokedexFile = function() {
	fs.writeFile(DATA_PATH + FILE_NAME, JSON.stringify(pokedex, null, 4), (err) => {
		if(err) console.log('writing pokemon list to file error: ' + err)
	});
}

async.series([
	function FetchPokemonList(step) {
		p.getPokemonsList().then((response) => {
			pokedex = response;
			UpdatePokedexFile();
			step();
		}).catch((err) => {
			console.log('getPokemonsList error: ' + err);
		});
	},
	function FetchPokemonSprites(step) {
		p.resource(pokedex.results.map((pokemon) => { return pokemon.url; })).then(() => {
			
		}).catch((err) => {
			console.log('resource error: ' + err);
		});
	},
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