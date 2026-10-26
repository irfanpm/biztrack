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

test('saves customer details and delivery date',()=>{const r=validate('entries',{...entry,customer_name:' Anila ',customer_phone:'+91 9876543210',delivery_date:'2026-10-25'});assert.equal(r.customer_name,'Anila');assert.equal(r.customer_phone,'+91 9876543210');assert.equal(r.delivery_date,'2026-10-25');});
test('rejects malformed customer data and invalid delivery dates',()=>{for(const fields of [{customer_name:{}},{customer_phone:'hello'},{delivery_date:'2026-02-30'},{delivery_date:'2026-10-22'}])assert.throws(()=>validate('entries',{...entry,...fields}));});
test('allows spending entries without customer details',()=>assert.equal(validate('entries',{...entry,quantity:0,customer_name:'',customer_phone:'',delivery_date:''}).quantity,0));

const customer={id,business:'meesho',product_id:id,customer_name:'Anila',customer_phone:'9876543210',order_date:'2026-10-26',delivery_date:'2026-10-30'};
test('customer orders save independently without financial fields',()=>{const r=validate('customers',customer);assert.equal(r.customer_name,'Anila');assert.equal(r.revenue,undefined);});
test('customer orders require product, name, phone and valid dates',()=>{for(const fields of [{product_id:null},{customer_name:''},{customer_phone:'abc'},{delivery_date:'2026-10-25'},{order_date:'2026-02-30'}])assert.throws(()=>validate('customers',{...customer,...fields}));});

test('customer payment method accepts COD and prepaid',()=>{for(const payment_method of ['cod','prepaid'])assert.equal(validate('customers',{...customer,payment_method}).payment_method,payment_method);});
test('rejects invalid customer payment method',()=>assert.throws(()=>validate('customers',{...customer,payment_method:'other'})));

test('persists delivery statuses and manual reminder state',()=>{for(const delivery_status of ['pending','out_for_delivery','delivered','cancelled','problem']){const r=validate('customers',{...customer,delivery_status,reminder_sent_for:customer.delivery_date});assert.equal(r.delivery_status,delivery_status);assert.equal(r.reminder_sent_for,customer.delivery_date);}});
test('rejects invalid status and reminder date',()=>{assert.throws(()=>validate('customers',{...customer,delivery_status:'bad'}));assert.throws(()=>validate('customers',{...customer,reminder_sent_for:'2026-02-30'}));});
