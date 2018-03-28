const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const { Client } = require('pg');

// Initialise postgres client
const client = new Client({
  user: 'seliyansilvarajoo',
  host: '127.0.0.1',
  database: 'pokemons',
  port: 5432,
});

// client.connect((err) => {
//   if (err) console.error('connection error:', err.stack);
// });
/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

// Init express app
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// Set handlebars to be the default view engine
app.engine('handlebars', exphbs.create().engine);
app.set('view engine', 'handlebars');


/**
 * ===================================
 * Routes
 * ===================================
 */

function retrieveAllPokemons(res){
  let queryText="select * from pokemon";
  client.query(queryText,(err,response)=>{
    let pokemonList=response.rows;
    let context={pokemonList:pokemonList};
    res.render('home',context);
    // client.end();
  });
};

app.get('/new', (request, response) => {
  // respond with HTML page with form to create new pokemon
  response.render('new');
});

app.get('/:id',(req,res)=>{
    let pokemonQuery=req.params.id;
    let queryText="select * from pokemon where id="+pokemonQuery;
    client.connect();
    client.query(queryText,(err,dbResp)=>{
      let pokemon=dbResp.rows;
      let context={pokemon:pokemon[0]};
      res.render('edit',context);
      // client.end();
    })
});

app.get('/:id/edit',(req,res)=>{
  // client.end();
});

app.post('/',(req,res)=>{
  let newPokemon = req.body;
  client.connect();
  let values=[];
  values.push(newPokemon.num);
  values.push(newPokemon.name);
  values.push(newPokemon.img);
  values.push(newPokemon.height);
  values.push(newPokemon.weight);
  let queryText = "insert into pokemon (num,name,img,height,weight) values($1,$2,$3,$4,$5)";
  client.query(queryText,values,(err,response)=>{
    retrieveAllPokemons(res);
  });
});

app.get('/', (req, res) => {
  client.connect();
  let queryText="select * from pokemon";
  retrieveAllPokemons(res);
});

app.post('/pokemon', (req, response) => {
  let params = req.body;

  const queryString = 'INSERT INTO pokemon(name, height) VALUES($1, $2)'
  const values = [params.name, params.height];

  client.connect((err) => {
    if (err) console.error('connection error:', err.stack);

    client.query(queryString, values, (err, res) => {
      if (err) {
        console.error('query error:', err.stack);
      } else {
        console.log('query result:', res);

        // redirect to home page
        response.redirect('/');
      }
    });
  });
});

// function retrieveOnePokemon(pokemonQuery,res){
//   var createQuery = new Promise(function(resolve,reject){
//     let queryText="select * from pokemon where id="+pokemonQuery;
//     // console.log(queryText);
//     client.connect();
//     resolve(queryText);
//   });
//   createQuery.then((queryText)=>{
//     client.query(queryText)
//       .then((result)=>{
//         let pokemon=result.rows;
//         let context={pokemon:pokemon[0]};
//         res.render('edit',context);
//         client.end();
//       });
//     });
// };

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */
app.listen(3000, () => console.log('~~~ Tuning in to the waves of port 3000 ~~~'));
