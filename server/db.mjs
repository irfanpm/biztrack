import {MongoClient} from 'mongodb';
// Reuse the connection during Next.js hot reloads. Reset failures for a later retry.
const state=globalThis.__biztrackMongo||(globalThis.__biztrackMongo={promise:null});
export async function getDb(){
 if(!state.promise){
  state.promise=(async()=>{
   const client=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
   try{
    await client.connect();
    const db=client.db(process.env.MONGODB_DB||'biztrack');
    await Promise.all(['products','entries'].map(name=>db.collection(name).createIndex({user_id:1,id:1},{unique:true})));
    await db.collection('entries').createIndex({user_id:1,date:1});
    await db.collection('sessions').createIndex({expires_at:1},{expireAfterSeconds:0});
    return db;
   }catch(error){await client.close();throw error;}
  })().catch(error=>{state.promise=null;throw error;});
 }
 return state.promise;
}
