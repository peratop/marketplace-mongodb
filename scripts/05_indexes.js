// Índices
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   await db.collection('users').createIndex({ email: 1 }, { unique: true });
   console.log('Índices criados.');
 }finally{ await client.close(); }
})();