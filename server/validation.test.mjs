import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate} from './validation.mjs';
const id='a0000000-0000-4000-8000-000000000001';
const entry={id,business:'meesho',date:'2026-10-23',product_id:id,quantity:1,unit_price:199,revenue:199,ad_spend:0,enquiries:0,purchase_cost:50,delivery_fees:0,gateway_fees:0,other_costs:0,refunds:0,status:'completed'};
test('accepts product and strips owner / unknown fields',()=>assert.deepEqual(validate('products',{id,business:'digital',name:' Guide ',price:59,user_id:'attacker',$set:{price:0}}),{id,business:'digital',name:'Guide',price:59}));
test('accepts completed sale',()=>assert.equal(validate('entries',entry).quantity,1));
test('allows ad spend with no sales',()=>assert.equal(validate('entries',{...entry,product_id:null,quantity:0,revenue:0,ad_spend:150}).ad_spend,150));
test('rejects fractional and negative values',()=>{assert.throws(()=>validate('entries',{...entry,quantity:1.5}));assert.throws(()=>validate('entries',{...entry,ad_spend:-5}));});
test('rejects calendar overflow',()=>assert.throws(()=>validate('entries',{...entry,date:'2026-02-30'})));
test('rejects cross-business costs',()=>assert.throws(()=>validate('entries',{...entry,business:'digital'})));
test('allows a quick Meesho sale without product setup',()=>assert.equal(validate('entries',{...entry,product_id:null}).quantity,1));
test('requires a product for digital sales',()=>assert.throws(()=>validate('entries',{...entry,business:'digital',purchase_cost:0,product_id:null})));
test('rejects objects where identifiers are expected',()=>assert.throws(()=>validate('entries',{...entry,product_id:{$ne:null}})));


test('preserves total profit and allows losses',()=>assert.equal(validate('entries',{...entry,gross_profit:-50}).gross_profit,-50));
test('rejects invalid total profit',()=>assert.throws(()=>validate('entries',{...entry,gross_profit:'500'})));
