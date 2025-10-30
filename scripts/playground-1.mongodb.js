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
use('marketplace');

db.counters.insertOne({
  _id: "userId",  // identificador da sequência
  seq: 0             // começa do 0
});

// Insert a few documents into the sales collection.
db.getCollection('users').insertMany([
    {
        _id: getNextSequenceValue("userId"),
        nome: "Ana Silva",
        email: "ana@example.com",
        senha: "REPLACE_WITH_HASHED_PASSWORD",
        endereco: {
            rua: "Rua das Flores",
            numero: "123",
            cidade: "São Paulo",
            estado: "SP",
            cep: "01000-000",
            pais: "BR"
        },
        localizacao_geografica: { "type": "Point", "coordinates": [-46.633309, -23.55052] },
        pontos_fidelidade: 0
    },
    {
        _id: getNextSequenceValue("userId"),
        nome: "Eduardo Erthal",
        email: "eduardo@exemplo.com",
        senha: "REPLACE_WITH_HASHED_PASSWORD",
        endereco: {
            rua: "Avenida Central",
            numero: "500",
            cidade: "Rio de Janeiro",
            estado: "RJ",
            cep: "20000-000",
            pais: "BR"
        },
        localizacao_geografica: { "type": "Point", "coordinates": [-43.209373, -22.903539] },
        pontos_fidelidade: 0
    },
    {
        _id: getNextSequenceValue("userId"),
        nome: "Leo Pedreiro",
        email: "leonardo@exemplo.com",
        senha: "REPLACE_WITH_HASHED_PASSWORD",
        endereco: {
            rua: "Travessa do Sol",
            numero: "45",
            cidade: "Belo Horizonte",
            estado: "MG",
            cep: "30000-000",
            pais: "BR"
        },
        localizacao_geografica: { "type": "Point", "coordinates": [-43.940539, -19.920833] },
        pontos_fidelidade: 0
    },
    {
    _id: getNextSequenceValue("userId"),
nome: "Mil Enas",
email: "Thousand@exemplo.com",
senha: "REPLACE_WITH_HASHED_PASSWORD",
endereco: {
    rua: "Rua do Mercado",
    numero: "10",
    cidade: "Curitiba",
    estado: "PR",
    cep: "80000-000",
    pais: "BR"
},
localizacao_geografica: { type: "Point", coordinates: [-49.264587, -25.428954] },
pontos_fidelidade: 0
},
{
    _id: getNextSequenceValue("userId"),
    nome: "Jon Doe",
    email: "jondoe@exemplo.com",
    senha: "REPLACE_WITH_HASHED_PASSWORD",
    endereco: {
        rua: "Alameda Verde",
        numero: "77",
        cidade: "Porto Alegre",
        estado: "RS",
        cep: "90000-000",
        pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-51.2302, -30.0277] },
    pontos_fidelidade: 0
},
{
    _id: getNextSequenceValue("userId"),
    nome: "Dude Person",
    email: "dudeperson@exemplo.com",
    senha: "REPLACE_WITH_HASHED_PASSWORD",
    endereco: {
        rua: "Praça do Comércio",
        numero: "1",
        cidade: "Salvador",
        estado: "BA",
        cep: "40000-000",
        pais: "BR"
    },
    localizacao_geografica: { type: "Point", coordinates: [-38.5023, -12.9714] },
    pontos_fidelidade: 0
}
]);

db.getCollection('products').insertMany([
    {
        "nome": "Fone sem fio",
        "descricao": "Fone bluetooth sem fio, bateria de longa duração.",
        "preco": { "valor": 199.9, "moeda": "BRL" },
        "quantidade_disponivel": 10,
    "localizacao": "São Paulo",
        "categoria": "eletrônicos",
        "promocoes_ativas": [],
        "vendedor": "ana@example.com"
    },
    {
        "nome": "Televisor",
        "descricao": "Televisor LED 55'' com resolução 4K.",
        "preco": { "valor": 2500, "moeda": "BRL" },
        "quantidade_disponivel": 5,
    "localizacao": "Rio de Janeiro",
        "categoria": "eletrônicos",
        "promocoes_ativas": [],
        "vendedor": "eduardo@exemplo.com"
    },
    {
        "nome": "É Jordão",
        "descricao": "Item variado / colecionável (descrição original preservada no título).",
        "preco": { "valor": 822.8, "moeda": "BRL" },
        "quantidade_disponivel": 3,
    "localizacao": "Minas Gerais",
        "categoria": "colecionáveis",
        "promocoes_ativas": [],
        "vendedor": "leonardo@exemplo.com"
    },
    {
        "nome": "Adidas Sambódromo",
        "descricao": "Tênis / calçado Adidas edição Sambódromo.",
        "preco": { "valor": 456.4, "moeda": "BRL" },
        "quantidade_disponivel": 20,
    "localizacao": "Paraná",
        "categoria": "vestuário",
        "promocoes_ativas": [],
        "vendedor": "Thousand@exemplo.com"
    },
    {
        "nome": "Regata Minnesotta Timberwolves City Edition 2025/26",
        "descricao": "Regata oficial Timberwolves - edição City 2025/26.",
        "preco": { "valor": 380, "moeda": "BRL" },
        "quantidade_disponivel": 15,
    "localizacao": "Rio Grande do Sul",
        "categoria": "vestuário",
        "promocoes_ativas": [],
        "vendedor": "jondoe@exemplo.com"
    },
    {
        "nome": "Camisa Crontias Total 80",
        "descricao": "Camisa esportiva - coleção Total 80.",
        "preco": { "valor": 49, "moeda": "BRL" },
        "quantidade_disponivel": 50,
    "localizacao": "Bahia",
        "categoria": "vestuário",
        "promocoes_ativas": [],
        "vendedor": "dudeperson@exemplo.com"
    },
    {
        "nome": "Bola Brazuka copa 2014 (mto raro)",
        "descricao": "Bola da Copa 2014 - item de colecionador, muito rara.",
        "preco": { "valor": 900000, "moeda": "BRL" },
        "quantidade_disponivel": 1,
    "localizacao": "São Paulo",
        "categoria": "colecionáveis",
        "promocoes_ativas": [],
        "vendedor": "ana@example.com"
    },
    {
        "nome": "A famosa jabulani copa 2010 (mais raro ainda)",
        "descricao": "Jabulani 2010 - peça de colecionador, extremamente rara.",
        "preco": { "valor": 10000000, "moeda": "USD" },
        "quantidade_disponivel": 1,
    "localizacao": "Rio de Janeiro",
        "categoria": "colecionáveis",
        "promocoes_ativas": [],
        "vendedor": "eduardo@exemplo.com"
    },
    {
        "nome": "Sacola plástica 40x90mm",
        "descricao": "SACOLA plástica resistente 40x90mm (pacote).",
        "preco": { "valor": 49, "moeda": "BRL" },
        "quantidade_disponivel": 200,
    "localizacao": "Minas Gerais",
        "categoria": "embalagem",
        "promocoes_ativas": [],
        "vendedor": "leonardo@exemplo.com"
    },
    {
        "nome": "Caixa de papelão 250x80x190mm",
        "descricao": "Caixa de papelão para transporte e armazenamento.",
        "preco": { "valor": 60, "moeda": "BRL" },
        "quantidade_disponivel": 120,
    "localizacao": "Paraná",
        "categoria": "embalagem",
        "promocoes_ativas": [],
        "vendedor": "Thousand@exemplo.com"
    },
    {
        "nome": "Carro pika",
        "descricao": "Veículo usado - descrição breve preservada no título.",
        "preco": { "valor": 9000000, "moeda": "BRL" },
        "quantidade_disponivel": 1,
    "localizacao": "Rio Grande do Sul",
        "categoria": "veículos",
        "promocoes_ativas": [],
        "vendedor": "jondoe@exemplo.com"
    },
    {
        "nome": "Celta 2012",
        "descricao": "Celta ano 2012, usado.",
        "preco": { "valor": 4500, "moeda": "BRL" },
        "quantidade_disponivel": 1,
    "localizacao": "Bahia",
        "categoria": "veículos",
        "promocoes_ativas": [],
        "vendedor": "dudeperson@exemplo.com"
    }
]);
db.getCollection('orders').insertMany([
    {
        "usuario_id": 1,
        "usuario_email": "ana@example.com",
        "items": [{ "product": "Fone sem fio", "qty": 1 }],
        "total": 199.9,
        "status": "completo",
        "data": "2025-10-01T10:15:00.000Z",
        "pontos_fidelidade_gerados": 19
    },
    {
        "usuario_id": 2,
        "usuario_email": "eduardo@exemplo.com",
        "items": [{ "product": "Televisor", "qty": 1 }],
        "total": 2500,
        "status": "em trânsito",
        "data": "2025-09-20T14:30:00.000Z",
        "pontos_fidelidade_gerados": 250
    },
    {
        "usuario_id": 3,
        "usuario_email": "leonardo@exemplo.com",
        "items": [{ "product": "É Jordão", "qty": 2 }],
        "total": 1645.6,
        "status": "completo",
        "data": "2025-10-10T09:00:00.000Z",
        "pontos_fidelidade_gerados": 164
    },
    {
        "usuario_id": 4,
        "usuario_email": "Thousand@exemplo.com",
        "items": [
            { "product": "Regata Minnesotta Timberwolves City Edition 2025/26", "qty": 1 },
            { "product": "Camisa Crontias Total 80", "qty": 1 }
        ],
        "total": 429,
        "status": "entregue",
        "data": "2025-08-15T16:45:00.000Z",
        "pontos_fidelidade_gerados": 42
    },
    {
        "usuario_id": 5,
        "usuario_email": "jondoe@exemplo.com",
        "items": [{ "product": "Caixa de papelão 250x80x190mm", "qty": 5 }],
        "total": 300,
        "status": "completo",
        "data": "2025-10-05T11:20:00.000Z",
        "pontos_fidelidade_gerados": 30
    },
    {
        "usuario_id": 6,
        "usuario_email": "dudeperson@exemplo.com",
        "items": [{ "product": "Celta 2012", "qty": 1 }],
        "total": 4500,
        "status": "pendente",
        "data": "2025-10-25T08:00:00.000Z",
        "pontos_fidelidade_gerados": 450
    },
    {
        "usuario_id": 7,
        "usuario_email": "ana@example.com",
        "items": [{ "product": "Adidas Sambódromo", "qty": 2 }],
        "total": 912.8,
        "status": "completo",
        "data": "2025-09-30T12:00:00.000Z",
        "pontos_fidelidade_gerados": 91
    },
    {
        "usuario_id": 8,
        "usuario_email": "eduardo@exemplo.com",
        "items": [{ "product": "A famosa jabulani copa 2010 (mais raro ainda)", "qty": 1 }],
        "total": 10000000,
        "status": "completo",
        "data": "2025-07-01T07:30:00.000Z",
        "pontos_fidelidade_gerados": 1000000
    },
    {
        "usuario_id": 9,
        "usuario_email": "leonardo@exemplo.com",
        "items": [
            { "product": "Televisor", "qty": 2 },
            { "product": "Fone sem fio", "qty": 2 }
        ],
        "total": 5399.8,
        "status": "em trânsito",
        "data": "2025-10-12T13:10:00.000Z",
        "pontos_fidelidade_gerados": 539
    },
    {
        "usuario_id": 10,
        "usuario_email": "Thousand@exemplo.com",
        "items": [
            { "product": "Caixa de papelão 250x80x190mm", "qty": 2 },
            { "product": "Sacola plástica 40x90mm", "qty": 3 }
        ],
        "total": 267,
        "status": "cancelado",
        "data": "2025-09-01T18:00:00.000Z",
        "pontos_fidelidade_gerados": 26
    }
]);
db.getCollection('reviews').insertMany([
    {
		"userId": 1,
		"productName": "Fone sem fio",
		"rating": 5,
		"comment": "Ótimo fone, bateria dura muito!",
		"date": "2025-10-26"
	},
	{
		"userId": 2,
		"productName": "Televisor",
		"rating": 5,
		"comment": "Imagem perfeita, recomendo muito",
		"date": "2025-10-25"
	},
	{
		"userId": 3,
		"productName": "É Jordão",
		"rating": 4,
		"comment": "Tênis muito bom, só achei um pouco caro",
		"date": "2025-10-24"
	},
	{
		"userId": 4,
		"productName": "Regata Minnesotta Timberwolves City Edition 2025/26",
		"rating": 5,
		"comment": "me sinto o ja morant <3",
		"date": "2025-10-24"
	},
	{
		"userId": 4,
		"productName": "Camisa Crontias Total 80",
		"rating": 5,
		"comment": "nostalgia pura, meu pai torcia para o crontias em 507 d.C, quando vencemos Tenochtitlán",
		"date": "2025-10-24"
	},
	{
		"userId": 5,
		"productName": "Caixa de papelão 250x80x190mm",
		"rating": 4,
		"comment": "Caixas resistentes, cumprem o prometido",
		"date": "2025-10-23"
	},
	{
		"userId": 6,
		"productName": "Celta 2012",
		"rating": 3,
		"comment": "Carro econômico, motor bom, só precisa de uma regulagem",
		"date": "2025-10-22"
	},
	{
		"userId": 7,
		"productName": "Adidas Sambódromo",
		"rating": 5,
		"comment": "Tênis lindo demais, super confortável, faltou uma listra",
		"date": "2025-10-21"
	},
	{
		"userId": 8,
		"productName": "A famosa jabulani copa 2010 (mais raro ainda)",
		"rating": 1,
		"comment": "a bola era falsa :(",
		"date": "2025-10-20"
	},
	{
		"userId": 9,
		"productName": "Televisor",
		"rating": 2,
		"comment": "Segunda TV que compro dessa marca, mas infelizmente nenhuma funciona",
		"date": "2025-10-19"
	},
	{
		"userId": 9,
		"productName": "Fone sem fio",
		"rating": 4,
		"comment": "Muito bom, mas a conexão às vezes falha",
		"date": "2025-10-19"
	},
	{
		"userId": 10,
		"productName": "Caixa de papelão 250x80x190mm",
		"rating": 5,
		"comment": "Ótimas para organização, muito resistentes",
		"date": "2025-10-18"
	},
	{
		"userId": 10,
		"productName": "Sacola plástica 40x90mm",
		"rating": 4,
		"comment": "Boas sacolas, resistentes e práticas",
		"date": "2025-10-18"
	}
])
function getNextSequenceValue(sequenceName) {
  const sequenceDocument = db.counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } }, // incrementa o contador
    { returnDocument: "after" } // retorna o novo valor
  );
  return sequenceDocument.value.seq;
}


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
