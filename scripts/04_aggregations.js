// Agregações de exemplo
(async()=>{
 const { getDb } = require('../config/connection');
 const { client, db } = await getDb();
 try{
   const agg = await db.collection('orders').aggregate([{ $group: { _id: '$status', total: { $sum: '$total' } } }]).toArray();
   console.log(agg);
 }finally{ await client.close(); }
})();