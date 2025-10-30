/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('mongodbVSCodePlaygroundDB');

// Insert a few documents into the sales collection.
db.getCollection('users').insertMany([
    {
        "nome": "Ana Silva",
        "email": "ana@example.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Rua das Flores",
            "numero": "123",
            "cidade": "São Paulo",
            "estado": "SP",
            "cep": "01000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-46.633309, -23.55052] },
        "pontos_fidelidade": 0
    },
    {
        "nome": "Eduardo Erthal",
        "email": "eduardo@exemplo.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Avenida Central",
            "numero": "500",
            "cidade": "Rio de Janeiro",
            "estado": "RJ",
            "cep": "20000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-43.209373, -22.903539] },
        "pontos_fidelidade": 0
    },
    {
        "nome": "Leo Pedreiro",
        "email": "leonardo@exemplo.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Travessa do Sol",
            "numero": "45",
            "cidade": "Belo Horizonte",
            "estado": "MG",
            "cep": "30000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-43.940539, -19.920833] },
        "pontos_fidelidade": 0
    },
    {
        "nome": "Mil Enas",
        "email": "Thousand@exemplo.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Rua do Mercado",
            "numero": "10",
            "cidade": "Curitiba",
            "estado": "PR",
            "cep": "80000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-49.264587, -25.428954] },
        "pontos_fidelidade": 0
    },
    {
        "nome": "Jon Doe",
        "email": "jondoe@exemplo.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Alameda Verde",
            "numero": "77",
            "cidade": "Porto Alegre",
            "estado": "RS",
            "cep": "90000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-51.2302, -30.0277] },
        "pontos_fidelidade": 0
    },
    {
        "nome": "Dude Person",
        "email": "dudeperson@exemplo.com",
        "senha": "REPLACE_WITH_HASHED_PASSWORD",
        "endereco": {
            "rua": "Praça do Comércio",
            "numero": "1",
            "cidade": "Salvador",
            "estado": "BA",
            "cep": "40000-000",
            "pais": "BR"
        },
        "localizacao_geografica": { "type": "Point", "coordinates": [-38.5023, -12.9714] },
        "pontos_fidelidade": 0
    }
]);

// Run a find command to view items sold on April 4th, 2014.
const salesOnApril4th = db.getCollection('sales').find({
  date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
}).count();

// Print a message to the output window.
console.log(`${salesOnApril4th} sales occurred in 2014.`);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
db.getCollection('sales').aggregate([
  // Find all of the sales that occurred in 2014.
  { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
  // Group the total sales for each product.
  { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: [ '$price', '$quantity' ] } } } }
]);
