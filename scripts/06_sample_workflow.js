// Workflow exemplo: compra + avaliação
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   const user = await db.collection('users').findOne();
   if(user) console.log('Usuário encontrado', user.name);
 }finally{ await client.close(); }
})();