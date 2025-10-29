// Inserção de dados exemplo
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   await db.collection('users').insertOne({ name:'Ana', email:'ana@example.com', role:'buyer', createdAt:new Date() });
   console.log('Dados inseridos.');
 }finally{ await client.close(); }
})();