# pokepartnersheet

a project for punching data about pokemon into a spreadsheet about pokemon, so we don't have to write all that stuff manually.

#### to get pokemon data
i referred to [pokeapi.co](https://pokeapi.co/docs/v2.html/#pokemon) for names and sprites. i used [pokedex-promise-v2](https://www.npmjs.com/package/pokedex-promise-v2) to make fetching that data a lot more convenient.

#### to access the google spreadsheet
i created a service account according to the [google-spreadsheet npm directions for authentication](https://www.npmjs.com/package/google-spreadsheet#service-account-recommended-method). the google developer console spit out a .json file that i put at /ignore/account-info.json (not in this project for security reasons). 