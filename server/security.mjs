import {InputError} from './validation.mjs';
export function checkOrigin(req,env=process.env){
 const url=new URL(req.url);
 const configured=[env.APP_URL,...[env.VERCEL_URL,env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(host=>'https://'+host)];
 const allowed=new Set(configured.filter(Boolean).map(value=>new URL(value).origin));
 if(!env.VERCEL&&['localhost','127.0.0.1'].includes(url.hostname))allowed.add(url.origin);
 if(!allowed.has(url.origin))throw new InputError('Deployment URL not allowed. Configure APP_URL.',403);
 if(req.headers.get('origin')&&req.headers.get('origin')!==url.origin)throw new InputError('Origin not allowed.',403);
 if(req.headers.get('sec-fetch-site')==='cross-site')throw new InputError('Cross-site requests are not allowed.',403);
}
//hai