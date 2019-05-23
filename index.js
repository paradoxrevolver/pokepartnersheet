let fs = require('fs');
let async = require('async');
let dotenv = require('dotenv').config();
let Pokedex = require('pokedex-promise-v2');
let GoogleSpreadsheet = require('google-spreadsheet');

/* information for fetching pokemon data */
let DATA_PATH = './data/';
let FILE_NAME = 'pokedex.json';
let FETCH_DELAY = 650;

let pokedex = JSON.parse(fs.readFileSync(DATA_PATH + FILE_NAME));

let UpdatePokedexFile = function() {
	fs.writeFileSync(DATA_PATH + FILE_NAME, JSON.stringify(pokedex, null, 4), (err) => {
		if(err) console.log('writing pokemon list to file error:', err);
	});
}

/* information for writing to the spreadsheet */
let gs = new GoogleSpreadsheet(process.env.SHEET_ID);
let p = new Pokedex();
let accountInfo = require('./ignore/account-info.json');

let sheet;

async.series([
	/*function FetchPokemonList(step) {
		p.getPokemonsList().then((response) => {
			pokedex = response;
			UpdatePokedexFile();
			step();
		}).catch((err) => {
			console.log('getPokemonsList error:', err);
		});
	},
	function FetchPokemonInfo(step) {
		pokedex.results.map(pokemon => pokemon.url).reduce((prev, url, i, pokemon) => {
			return prev.then(() => {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						p.resource(url).then((response) => {
							console.log(`fetched pokemon object on ${response.name}`);
							let {front_default, back_default} = response.sprites;
							pokedex.results[i].sprites = {front_default, back_default};
							// if this is the last fetch
							if(i === pokedex.results.length - 1) {
								UpdatePokedexFile();
								step();
							}
							resolve();
						}).catch(reject);
					}, FETCH_DELAY);
				});
			}).catch((err) => {
				console.log(`resource error on ${url}:`, err);
			});
		}, Promise.resolve());
	},*/
	function SetAuth(step) {
		gs.useServiceAccountAuth(accountInfo, (err) => {
			if(err) console.log('useServiceAccountAuth error:', err);
			step();
		});
	},
	function GetInfo(step) {
		gs.getInfo((err, info) => {
			if(err) console.log('getInfo error: ' + err);
			console.log(`loaded document: ${info.title} by ${info.author.email}`);
			sheet = info.worksheets.find((worksheet) => { return worksheet.id === process.env.REF_WORKSHEET_ID});
			console.log(`loaded sheet: ${sheet.title} (${sheet.id}) [${sheet.rowCount} rows, ${sheet.colCount} cols]`);
			step();
		});
	},
	function AlterCells(step) {
		let size = pokedex.results.length;
		let options = {
			'min-row': 2,
			'max-row': 2 + size - 1,
			'min-col': 1,
			'max-col': 2,
			'return-empty': true,
		};
		sheet.getCells(options, (err, cells) => {
			if(err) console.log(`problem trying to alter cells:`, err);
			pokedex.results.forEach((pokemon, i) => {
				cells[2*i].value = pokemon.name;
				if(pokemon.sprites.front_default)
					cells[2*i+1].value = pokemon.sprites.front_default;
				else
					cells[2*i+1].value = 'n/a';
			});
			sheet.bulkUpdateCells(cells);
			let colMinLetter = String.fromCharCode(65 + options["min-col"] - 1);
			let colMaxLetter = String.fromCharCode(65 + options["max-col"] - 1);
			console.log(`changed and saved values in ${sheet.title} from ${colMinLetter}${options["min-row"]} to ${colMaxLetter}${options["max-row"]}`);
			step();
		});
	},
], (err) => {
	if(err) console.log('async series error: ' + err);
});

console.log('sheet edit complete');