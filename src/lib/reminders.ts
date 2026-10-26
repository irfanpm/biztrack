export function nextDay(date:string){const d=new Date(date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1);return d.toISOString().slice(0,10);}
export function whatsappReminder(phone:string,name:string,product:string,payment?:'cod'|'prepaid'){
 let digits=phone.replace(/\D/g,'');if(digits.length===10)digits='91'+digits;
 if(!/^[1-9]\d{7,14}$/.test(digits))throw new Error('Edit this customer and enter a valid phone number with country code.');
 const text='നമസ്കാരം '+name+' 😊\nനിങ്ങൾ ഓർഡർ ചെയ്ത '+product+' നാളെ ഡെലിവറി ചെയ്യുമെന്നാണ് പ്രതീക്ഷിക്കുന്നത്. ഡെലിവറി സമയത്ത് ഫോണിൽ ലഭ്യമായിരിക്കണേ.'+(payment==='cod'?'\nഇത് Cash on Delivery ഓർഡറാണ്. തുക ഡെലിവറി സമയത്ത് നൽകാം.':payment==='prepaid'?'\nനിങ്ങളുടെ ഓർഡർ Prepaid ആണ്.':'')+'\nനന്ദി!';
 return 'https://wa.me/'+digits+'?text='+encodeURIComponent(text);
}
