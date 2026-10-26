import {MongoClient} from 'mongodb';
const client=new MongoClient(process.env.MONGODB_URI||'mongodb://127.0.0.1:27017',{serverSelectionTimeoutMS:5000});
try{await client.connect();const db=client.db(process.env.MONGODB_DB||'biztrack');await db.command({ping:1});console.log('MongoDB connected. Database: '+db.databaseName);}catch(e){console.error('MongoDB connection failed: '+e.message);process.exitCode=1;}finally{await client.close();}
