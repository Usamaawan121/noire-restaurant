import {DateTime} from 'luxon';
import {z} from 'zod';
import {timezone} from './config.js';
import {Customer, Reservation, Table, statuses} from './models.js';
import {randomUUID} from 'node:crypto';
import {bookingMail} from './mail.js';

export const fail=(status,message)=>Object.assign(new Error(message),{status});
export const email=z.string().trim().email().max(254).transform(value=>value.toLowerCase());
export const line=(max)=>z.string().trim().min(1).max(max);
const selection=z.object({
 date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
 time:z.string().regex(/^(1[7-9]|2[01]):(00|30)$/),
 guests:z.coerce.number().int().min(1).max(30)
});
export const objectId=z.string().regex(/^[a-f0-9]{24}$/i);
const details=selection.extend({
 name:line(120),email,phone:z.string().trim().regex(/^[+\d][\d ().-]{6,29}$/),
 table:objectId,notes:z.string().trim().max(1200).default('')
});
function windowFor({date,time}) {
 const start=DateTime.fromISO(`${date}T${time}`,{zone:timezone});
 if(!start.isValid || start<=DateTime.now() || start>DateTime.now().plus({days:180})) throw fail(422,'Choose a future slot within 180 days.');
 const slots=[0,30,60].map(minutes=>Math.floor(start.plus({minutes}).toMillis()/1800000));
 return {startsAt:start.toJSDate(),slots};
}
export async function availableTables(input){
 const criteria=selection.parse(input);
 const {slots}=windowFor(criteria);
 const occupied=await Reservation.distinct('table',{active:true,slots:{$in:slots}});
 return Table.find({_id:{$nin:occupied},capacity:{$gte:criteria.guests},available:true,archived:false}).sort({capacity:1,number:1});
}
export async function createBooking(input) {
 const data=details.parse(input);
 const window=windowFor(data);
 const table=await Table.findOne({_id:data.table,available:true,archived:false,capacity:{$gte:data.guests}});
 if(!table) throw fail(409,'That table is unavailable for this party.');
 const customer=await Customer.findOneAndUpdate({email:data.email},{$set:{name:data.name,phone:data.phone}},{upsert:true,new:true});
 const booking=await Reservation.create({...data,...window,customer:customer.id,reference:`NR-${randomUUID().toUpperCase()}`,status:'pending',active:true});
 bookingMail(booking,table.number,true);
 return {reference:booking.reference,date:booking.date,time:booking.time,guests:booking.guests,table:table.number,status:booking.status};
}
export async function updateBooking(id,input) {
 const original=await Reservation.findById(id);
 if(!original) throw fail(404,'Reservation not found.');
 const patch=details.pick({date:true,time:true,table:true,guests:true,notes:true}).extend({status:z.enum(statuses)}).partial().strict().parse(input);
 const status=patch.status ?? original.status;
 const active=['pending','confirmed'].includes(status);
 const data={...original.toObject(),...patch};
 const moved=['date','time','table','guests'].some(key=>key in patch && String(patch[key])!==String(original[key]));
 const window=moved || (active&&!original.active) ? windowFor(data) : {};
 const table=await Table.findById(data.table);
 if((moved || (active&&!original.active)) && (!table || table.archived || !table.available || table.capacity<data.guests)) throw fail(409,'That table is unavailable for this party.');
 const booking=await Reservation.findOneAndUpdate({_id:id,__v:original.__v},{$set:{...patch,...window,status,active},$inc:{__v:1}},{new:true,runValidators:true});
 if(!booking) throw fail(409,'The reservation changed. Refresh and try again.');
 if(status!==original.status) bookingMail(booking,table?.number);
 return booking;
}
