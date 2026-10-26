import type {Metadata, Viewport} from 'next';
import type {ReactNode} from 'react';
import '../style.css';
export const metadata:Metadata={title:'BizTrack - Your everyday business companion',description:'Your two businesses. One clear picture.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'BizTrack'},icons:{apple:'/apple-touch-icon.png',icon:'/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#16A34A'};
export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}
