import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {getDb} from './db.mjs';
import {checkOrigin} from './security.mjs';
import {InputError,validate} from './validation.mjs';
const digest=token=>createHash('sha256').update(token).digest('hex');
const publicRecord=({_id,user_id,...record})=>record;
async function readBody(req){let text='';if(req.body){for await(const chunk of req.body){text+=Buffer.from(chunk).toString('utf8');if(Buffer.byteLength(text)>16384)throw new InputError('Request too large.',413);}}try{return JSON.parse(text||'{}');}catch{throw new InputError('Invalid JSON.');}}
function cookie(token='',maxAge=604800){return 'biztrack_session='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+maxAge+(process.env.NODE_ENV==='production'?'; Secure':'');}
async function newSession(db,user_id,headers){const token=randomBytes(32).toString('hex');await db.collection('sessions').insertOne({_id:digest(token),user_id,expires_at:new Date(Date.now()+604800000)});headers.set('Set-Cookie',cookie(token));return {user:{id:user_id}};}
// Serialize mutations so product checks and entry changes cannot race in this single local API.
let queue=Promise.resolve();
function locked(fn){const result=queue.then(fn);queue=result.catch(()=>{});return result;}
const attempts=new Map();

/** @param {Request} req */
export async function handleRequest(req){
 const headers=new Headers({'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 const send=(status,data)=>new Response(JSON.stringify(data),{status,headers});
 try{
  checkOrigin(req);
  const db=await getDb();
  const path=new URL(req.url).pathname;
  if(path==='/api/health'&&req.method==='GET'){await db.command({ping:1});return send(200,{ok:true,database:db.databaseName});}
  const token=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('biztrack_session='))?.slice(17);
  const stored=token?await db.collection('sessions').findOne({_id:digest(token),expires_at:{$gt:new Date()}}):null;
  const owner=stored?.user_id;
  if(path==='/api/auth/session'&&req.method==='GET')return send(200,{session:owner?{user:{id:owner}}:null});
  if(['/api/auth/register','/api/auth/login'].includes(path)&&req.method==='POST'){
   const key='local';const now=Date.now();const attempt=attempts.get(key)||{count:0,until:now+60000};if(now>attempt.until){attempt.count=0;attempt.until=now+60000;}attempt.count++;attempts.set(key,attempt);if(attempt.count>10)throw new InputError('Too many attempts. Wait one minute.',429);
   const body=await readBody(req);const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
   if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||typeof body.password!=='string'||body.password.length<8||body.password.length>256)throw new InputError('Use a valid email and a password of 8–256 characters.');
   if(path.endsWith('register')){
    const salt=randomBytes(16).toString('hex');const hash=scryptSync(body.password,salt,64).toString('hex');
    try{await db.collection('users').insertOne({_id:'owner',email,salt,hash});}catch(e){if(e.code===11000)throw new InputError('The owner account already exists. Sign in.',409);throw e;}
   }else{
    const user=await db.collection('users').findOne({_id:'owner'});
    if(!user)throw new InputError('No owner account exists yet. Choose Create your workspace to register first.',409);
    const candidate=scryptSync(body.password,user?.salt||'dummy-salt',64);
    if(!user||user.email!==email||!timingSafeEqual(candidate,Buffer.from(user.hash,'hex')))throw new InputError('Email or password is incorrect.',401);
   }
   return send(200,{session:await newSession(db,'owner',headers)});
  }
  if(!owner)throw new InputError('Please sign in.',401);
  if(path==='/api/auth/logout'&&req.method==='POST'){await db.collection('sessions').deleteOne({_id:digest(token)});headers.set('Set-Cookie',cookie('',0));return send(200,{ok:true});}
  const match=/^\/api\/(products|entries)(?:\/([\da-f-]{36}))?$/.exec(path);
  if(!match)throw new InputError('Not found.',404);
  const [,kind,id]=match;const collection=db.collection(kind);
  if(req.method==='GET'&&!id)return send(200,(await collection.find({user_id:owner}).toArray()).map(publicRecord));
  if(req.method==='PUT'&&!id){const record=validate(kind,await readBody(req));await locked(async()=>{
   if(kind==='entries'&&record.product_id&&!await db.collection('products').findOne({user_id:owner,id:record.product_id,business:record.business}))throw new InputError('Product not found in this business.');
   if(kind==='products'){const existing=await collection.findOne({user_id:owner,id:record.id});if(existing&&existing.business!==record.business)throw new InputError('A product cannot change businesses.');}
   await collection.updateOne({user_id:owner,id:record.id},{$set:{...record,user_id:owner}},{upsert:true});
  });return send(200,record);}
  if(req.method==='DELETE'&&id){await locked(async()=>{if(kind==='products'&&await db.collection('entries').findOne({user_id:owner,product_id:id}))throw new InputError('Delete product entries first.',409);const result=await collection.deleteOne({user_id:owner,id});if(!result.deletedCount)throw new InputError('Record not found.',404);});return send(200,{ok:true});}
  throw new InputError('Method not allowed.',405);
 }catch(e){if(!e.status)console.error('API error:',e.message);return send(e.status||500,{error:e.status?e.message:'Database unavailable. Start MongoDB and retry.'});}
}


