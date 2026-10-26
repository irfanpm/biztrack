'use client';
import dynamic from 'next/dynamic';
import {useEffect} from 'react';
const Dashboard=dynamic(()=>import('../App'),{ssr:false,loading:()=> <div className="auth-page">Opening BizTrack...</div>});
export default function Page(){
 useEffect(()=>{if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator){void navigator.serviceWorker.register('/sw.js').catch(error=>console.error('Offline setup failed:',error));}},[]);
 return <Dashboard/>;
}
