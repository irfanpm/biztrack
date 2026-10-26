import {describe,it,expect} from 'vitest';
import {totals,validateEntry,type Entry} from './data';
const base:Entry={id:'1',business:'meesho',date:'2026-10-23',product_id:'p',quantity:2,unit_price:300,revenue:600,ad_spend:100,enquiries:5,purchase_cost:200,delivery_fees:40,gateway_fees:0,other_costs:10,refunds:20,status:'completed'};
describe('business accounting',()=>{
 it('deducts every total cost exactly once',()=>expect(totals([base])).toEqual({revenue:600,ad:100,profit:230,sales:2,enquiries:5}));
 it('includes spending on a zero-sales day',()=>expect(totals([{...base,quantity:0,revenue:0,purchase_cost:0,delivery_fees:0,other_costs:0,refunds:0}]).profit).toBe(-100));
 it('excludes cancelled revenue and sales but retains actual costs',()=>expect(totals([{...base,status:'cancelled'}])).toMatchObject({revenue:0,sales:0,profit:-370}));
 it('calculates digital fees and refunds',()=>expect(totals([{...base,business:'digital',purchase_cost:0,delivery_fees:0,gateway_fees:30}]).profit).toBe(440));
 it('handles an empty business',()=>expect(totals([]).profit).toBe(0));
 it('rejects negative and fractional quantities',()=>{expect(()=>validateEntry({...base,ad_spend:-1})).toThrow();expect(()=>validateEntry({...base,quantity:1.5})).toThrow();});
 it('requires products only for sales',()=>{expect(()=>validateEntry({...base,business:'digital',product_id:null})).toThrow();expect(()=>validateEntry({...base,quantity:0,product_id:null})).not.toThrow();});
});


it('uses combined Meesho profit once and deducts ads once',()=>expect(totals([{...base,quantity:5,gross_profit:500,ad_spend:150}])).toMatchObject({sales:5,profit:350}));
it('supports a loss in total profit',()=>expect(totals([{...base,gross_profit:-50,ad_spend:100}]).profit).toBe(-150));
