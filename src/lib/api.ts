// Same-origin API: MongoDB credentials never enter the browser bundle.
type Session = {user:{id:string}} | null;
type Listener = (event:string, session:Session)=>void;
const listeners = new Set<Listener>();
async function request(path:string,method='GET',body?:unknown) {
  try {
    const response=await fetch('/api'+path,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
    const payload=await response.json();
    if(!response.ok)return {data:null,error:{message:payload.error||'Database request failed.'}};
    return {data:payload,error:null};
  } catch {return {data:null,error:{message:'Local API unavailable. Start MongoDB and run npm run dev.'}};}
}
export const database={
  auth:{
    async getSession(){const r=await request('/auth/session');return {data:{session:r.data?.session||null},error:r.error};},
    onAuthStateChange(callback:Listener){listeners.add(callback);return {data:{subscription:{unsubscribe(){listeners.delete(callback);}}}};},
    async signInWithPassword(credentials:{email:string;password:string}){const r=await request('/auth/login','POST',credentials);if(!r.error)listeners.forEach(fn=>fn('SIGNED_IN',r.data.session));return {data:{session:r.data?.session||null},error:r.error};},
    async signUp(credentials:{email:string;password:string}){const r=await request('/auth/register','POST',credentials);if(!r.error)listeners.forEach(fn=>fn('SIGNED_IN',r.data.session));return {data:{session:r.data?.session||null},error:r.error};},
    async signOut(){const r=await request('/auth/logout','POST',{});if(!r.error)listeners.forEach(fn=>fn('SIGNED_OUT',null));return r;}
  },
  from(kind:'products'|'entries'|'customers') {return {
    select:(_columns:string)=>request('/'+kind),
    upsert:(record:unknown,_options?:unknown)=>request('/'+kind,'PUT',record),
    delete:()=>({eq:(_column:string,id:string)=>request('/'+kind+'/'+encodeURIComponent(id),'DELETE')})
  };}
};

