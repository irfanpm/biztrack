import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkOrigin} from './security.mjs';
const env={NODE_ENV:'production',VERCEL:'1',APP_URL:'https://biztrack-q9js.vercel.app'};
const req=(url,origin)=>new Request(url,{headers:origin?{origin}:{}});
test('allows deployed same-origin login',()=>assert.doesNotThrow(()=>checkOrigin(req(env.APP_URL+'/api/auth/login',env.APP_URL),env)));
test('rejects foreign origin',()=>assert.throws(()=>checkOrigin(req(env.APP_URL+'/api/auth/login','https://evil.example'),env)));
test('rejects unknown host',()=>assert.throws(()=>checkOrigin(req('https://evil.example/api/auth/login'),env)));
test('allows Vercel domain',()=>assert.doesNotThrow(()=>checkOrigin(req('https://preview.vercel.app/api/auth/session'),{VERCEL:'1',VERCEL_URL:'preview.vercel.app'})));
test('allows localhost development',()=>assert.doesNotThrow(()=>checkOrigin(req('http://127.0.0.1:3000/api/auth/session'),{})));

test('accepts production alias origin with Vercel deployment request URL',()=>{const deployed={...env,VERCEL_URL:'biztrack-build.vercel.app'};assert.doesNotThrow(()=>checkOrigin(req('https://biztrack-build.vercel.app/api/auth/login',env.APP_URL),deployed));});
test('rejects foreign origin even with trusted deployment host',()=>assert.throws(()=>checkOrigin(req(env.APP_URL+'/api/auth/login','https://evil.example'),{...env,VERCEL_URL:'biztrack-build.vercel.app'})));
test('blocks cross-site fetch even from an allowlisted origin',()=>assert.throws(()=>checkOrigin(new Request(env.APP_URL+'/api/auth/login',{headers:{origin:env.APP_URL,'sec-fetch-site':'cross-site'}}),env)));
