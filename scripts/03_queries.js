// Consultas básicas
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   const users = await db.collection('users').find().toArray();
   console.log(users);
 }finally{ await client.close(); }
})();