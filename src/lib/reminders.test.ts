import {it,expect} from 'vitest';
import {nextDay,whatsappReminder} from './reminders';
it('handles month and year boundaries',()=>{expect(nextDay('2026-10-31')).toBe('2026-11-01');expect(nextDay('2026-12-31')).toBe('2027-01-01');});
it('uses customer recipient and Malayalam COD draft',()=>{const url=whatsappReminder('9876543210','Anila','Brush','cod');expect(url).toContain('https://wa.me/919876543210?');expect(decodeURIComponent(url)).toContain('നാളെ');expect(decodeURIComponent(url)).toContain('Cash on Delivery');});
it('retains international phone prefix',()=>expect(whatsappReminder('+974 5555 1234','A','B','prepaid')).toContain('/97455551234?'));
it('rejects unusable phone numbers',()=>expect(()=>whatsappReminder('123','A','B')).toThrow());
