// Criação de collections com schemas simplificados
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   await db.createCollection('users');
   await db.createCollection('products');
   await db.createCollection('categories');
   await db.createCollection('orders');
   await db.createCollection('reviews');
   console.log('Collections criadas.');
 }finally{ await client.close(); }
})();