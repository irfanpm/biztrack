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
 if(typeof raw.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(raw.date)||!Number.isFinite(Date.parse(raw.date))||new Date(raw.date).toISOString().slice(0,10)!==raw.date)throw new InputError('Choose a valid calendar date.');
 if(!['completed','cancelled'].includes(raw.status))throw new InputError('Invalid order status.');
 Object.assign(result,{date:raw.date,status:raw.status,product_id:raw.product_id});
 if(raw.product_id!==null&&(typeof raw.product_id!=='string'||!/^[\da-f-]{36}$/i.test(raw.product_id)))throw new InputError('Invalid product.');
 for(const key of ['quantity','unit_price','revenue','ad_spend','enquiries','purchase_cost','delivery_fees','gateway_fees','other_costs','refunds'])result[key]=amount(key,['quantity','enquiries'].includes(key));
 if(result.business==='digital'&&result.quantity>0&&!result.product_id)throw new InputError('Choose a product for sales.');
 if(result.business==='digital'&&(result.enquiries||result.purchase_cost||result.delivery_fees)||result.business==='meesho'&&result.gateway_fees)throw new InputError('Costs do not match this business.');
 if(raw.gross_profit!==undefined){if(raw.business!=='meesho'||typeof raw.gross_profit!=='number'||!Number.isFinite(raw.gross_profit)||Math.abs(raw.gross_profit)>1e9)throw new InputError('Invalid total profit.');result.gross_profit=raw.gross_profit;}
 return result;
}

