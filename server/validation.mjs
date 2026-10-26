export class InputError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export function validate(kind,raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new InputError('Invalid record.');
 if(typeof raw.id!=='string'||!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(raw.id))throw new InputError('Invalid record ID.');
 if(!['meesho','digital'].includes(raw.business))throw new InputError('Choose a valid business.');
 const result={id:raw.id,business:raw.business};
 function amount(key,integer=false){const value=raw[key];if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>1e9||(integer&&!Number.isInteger(value)))throw new InputError('Invalid '+key+'.');return value;}
 if(kind==='products'){
  if(typeof raw.name!=='string'||!raw.name.trim()||raw.name.trim().length>120)throw new InputError('Product name must be 1–120 characters.');
  return {...result,name:raw.name.trim(),price:amount('price')};
 }
 if(kind==='customers'){
  if(raw.delivery_status!==undefined&&!['pending','out_for_delivery','delivered','cancelled','problem'].includes(raw.delivery_status))throw new InputError('Invalid delivery status.');
  if(raw.reminder_sent_for!==undefined&&(typeof raw.reminder_sent_for!=='string'||(raw.reminder_sent_for!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(raw.reminder_sent_for)||!Number.isFinite(Date.parse(raw.reminder_sent_for))||new Date(raw.reminder_sent_for).toISOString().slice(0,10)!==raw.reminder_sent_for))))throw new InputError('Invalid reminder date.');

  if(raw.payment_method!==undefined&&!['cod','prepaid'].includes(raw.payment_method))throw new InputError('Choose Cash on Delivery or Prepaid.');
  if(raw.business!=='meesho')throw new InputError('Customers belong to Meesho.');
  if(typeof raw.product_id!=='string'||!/^[\da-f-]{36}$/i.test(raw.product_id))throw new InputError('Choose a product.');
  if(typeof raw.customer_name!=='string'||!raw.customer_name.trim()||raw.customer_name.length>120)throw new InputError('Enter a customer name.');
  if(typeof raw.customer_phone!=='string'||! /^[+0-9 ()-]{7,25}$/.test(raw.customer_phone)||raw.customer_phone.replace(/\D/g,'').length<7)throw new InputError('Enter a valid phone number.');
  for(const key of ['order_date','delivery_date'])if(typeof raw[key]!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw[key])||!Number.isFinite(Date.parse(raw[key]))||new Date(raw[key]).toISOString().slice(0,10)!==raw[key])throw new InputError('Choose valid order and delivery dates.');
  if(raw.delivery_date<raw.order_date)throw new InputError('Delivery cannot be before order date.');
  return {...result,...(raw.delivery_status!==undefined?{delivery_status:raw.delivery_status}:{}),...(raw.reminder_sent_for!==undefined?{reminder_sent_for:raw.reminder_sent_for}:{}),...(raw.payment_method!==undefined?{payment_method:raw.payment_method}:{}),product_id:raw.product_id,customer_name:raw.customer_name.trim(),customer_phone:raw.customer_phone.trim(),order_date:raw.order_date,delivery_date:raw.delivery_date};
 }
 if(typeof raw.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)||!Number.isFinite(Date.parse(raw.date))||new Date(raw.date).toISOString().slice(0,10)!==raw.date)throw new InputError('Choose a valid calendar date.');
 if(!['completed','cancelled'].includes(raw.status))throw new InputError('Invalid order status.');
 Object.assign(result,{date:raw.date,status:raw.status,product_id:raw.product_id});
 if(raw.product_id!==null&&(typeof raw.product_id!=='string'||!/^[\da-f-]{36}$/i.test(raw.product_id)))throw new InputError('Invalid product.');
 for(const key of ['quantity','unit_price','revenue','ad_spend','enquiries','purchase_cost','delivery_fees','gateway_fees','other_costs','refunds'])result[key]=amount(key,['quantity','enquiries'].includes(key));
 if(result.business==='digital'&&result.quantity>0&&!result.product_id)throw new InputError('Choose a product for sales.');
 if(result.business==='digital'&&(result.enquiries||result.purchase_cost||result.delivery_fees)||result.business==='meesho'&&result.gateway_fees)throw new InputError('Costs do not match this business.');
 if(raw.gross_profit!==undefined){if(raw.business!=='meesho'||typeof raw.gross_profit!=='number'||!Number.isFinite(raw.gross_profit)||Math.abs(raw.gross_profit)>1e9)throw new InputError('Invalid total profit.');result.gross_profit=raw.gross_profit;}
 if(raw.customer_name!==undefined){if(typeof raw.customer_name!=='string'||raw.customer_name.length>120)throw new InputError('Invalid customer name.');result.customer_name=raw.customer_name.trim();}
 if(raw.customer_phone!==undefined){if(typeof raw.customer_phone!=='string'||(raw.customer_phone!==''&&(!/^[+0-9 ()-]{7,25}$/.test(raw.customer_phone)||raw.customer_phone.replace(/\D/g,'').length<7)))throw new InputError('Invalid customer phone number.');result.customer_phone=raw.customer_phone.trim();}
 if(raw.delivery_date!==undefined){if(typeof raw.delivery_date!=='string'||(raw.delivery_date!==''&&(!/^\d{4}-\d{2}-\d{2}$/.test(raw.delivery_date)||!Number.isFinite(Date.parse(raw.delivery_date))||new Date(raw.delivery_date).toISOString().slice(0,10)!==raw.delivery_date||raw.delivery_date<raw.date)))throw new InputError('Delivery date must be on or after the order date.');result.delivery_date=raw.delivery_date;}
 return result;
}

