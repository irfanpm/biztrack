import { database } from './api';
export type Business = 'meesho' | 'digital';
export type Product = { id:string; business:Business; name:string; price:number };
export type Entry = { id:string; business:Business; date:string; product_id:string|null; quantity:number; gross_profit?:number; unit_price:number; revenue:number; ad_spend:number; enquiries:number; purchase_cost:number; delivery_fees:number; gateway_fees:number; other_costs:number; refunds:number; status:'completed'|'cancelled' };
export type Records = {products:Product[]; entries:Entry[]};
export { database };
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const money = (v:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(v);
export function totals(entries:Entry[]) { return entries.reduce((a,e)=>{const revenue=e.status==='completed'?Number(e.revenue):0; const quantity=e.status==='completed'?e.quantity:0; const cost=Number(e.ad_spend)+Number(e.purchase_cost)+Number(e.delivery_fees)+Number(e.gateway_fees)+Number(e.other_costs)+Number(e.refunds);return {revenue:a.revenue+revenue,ad:a.ad+Number(e.ad_spend),profit:a.profit+(e.business==='meesho'&&e.gross_profit!==undefined?(e.status==='completed'?e.gross_profit:0)-Number(e.ad_spend):revenue-cost),sales:a.sales+quantity,enquiries:a.enquiries+e.enquiries};},{revenue:0,ad:0,profit:0,sales:0,enquiries:0}); }
export function validateEntry(e:Entry) { if(e.gross_profit!==undefined&&(e.business!=='meesho'||!Number.isFinite(e.gross_profit)||Math.abs(e.gross_profit)>1e9))throw new Error('Enter a valid total profit.'); for(const key of ['quantity','unit_price','revenue','ad_spend','enquiries','purchase_cost','delivery_fees','gateway_fees','other_costs','refunds'] as const) {if(!Number.isFinite(e[key])||e[key]<0||e[key]>1e9) throw new Error('Enter valid non-negative amounts below 1 billion.');} if(!Number.isInteger(e.quantity)||!Number.isInteger(e.enquiries)) throw new Error('Sales and enquiries must be whole numbers.'); if(e.business==='digital'&&e.quantity>0&&!e.product_id)throw new Error('Choose a product for sales.'); if(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) throw new Error('Choose a valid date.'); }
export function readCache(owner:string):Records {try{return JSON.parse(localStorage.getItem('biztrack:'+owner)||'{"products":[],"entries":[]}');}catch{return {products:[],entries:[]};}}
export function writeCache(owner:string,data:Records) {localStorage.setItem('biztrack:'+owner,JSON.stringify(data));}




