import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {DateTime} from 'luxon';
import '../config.js';

const base=process.env.QA_BASE || 'http://localhost:4000';
let token;
async function request(path,{method='GET',data,expected=200,auth=false}={}){
 const response=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},body:data===undefined?undefined:JSON.stringify(data)});
 const body=await response.json();
 assert.equal(response.status,expected,JSON.stringify(body));
 return body.data;
}
const {timezone}=await request('/health');
const id=randomUUID().slice(0,8);
const date=DateTime.now().setZone(timezone).plus({days:5}).toISODate();
const password=process.env.ADMIN_PASSWORD;
const email=process.env.ADMIN_EMAIL;
assert.ok(email&&password,'Set seeded credentials before testing.');
await request('/admin/dashboard',{expected:401});
await request('/auth/login',{method:'POST',data:{email,password:password+'-invalid'},expected:401});
({token}=await request('/auth/login',{method:'POST',data:{email,password}}));
const admin=async(path,options={})=>request('/admin'+path,{...options,auth:true});
const table=await admin('/tables',{method:'POST',data:{number:'QA-'+id,capacity:4,category:'QA',available:true},expected:201});
const availability=(time,guests=4)=>request('/availability?'+new URLSearchParams({date,time,guests}));
const booking={name:'QA Guest',email:`qa-${id}@example.com`,phone:'+92 300 1234567',date,time:'17:00',table:table._id,guests:4,notes:'Window seat'};
const book=(data,expected)=>request('/reservations',{method:'POST',data,expected});
assert.ok((await availability('17:00')).some(row=>row._id===table._id));
assert.ok(!(await availability('17:00',5)).some(row=>row._id===table._id));
await book({...booking,guests:5},409);
await book({...booking,date:'2000-01-01'},422);
const attempts=await Promise.all(['17:00','17:30'].map((time,index)=>fetch(base+'/api/reservations',{
 method:'POST',headers:{'Content-Type':'application/json'},
 body:JSON.stringify({...booking,time,email:index===0?booking.email:'second-'+booking.email})
})));
assert.deepEqual(attempts.map(response=>response.status).sort(),[201,409]);
const winner=(await attempts.find(response=>response.status===201).json()).data;
assert.ok(winner.reference.startsWith('NR-'));
assert.equal(winner.status,'pending');
assert.ok(!(await availability('18:00')).some(row=>row._id===table._id));
const adjacent=winner.time==='17:00'?'18:30':'19:00';
assert.ok((await availability(adjacent)).some(row=>row._id===table._id));
const all=await admin('/reservations');
const row=all.find(item=>item.reference===winner.reference);
assert.ok(row);
await admin('/reservations/'+row._id,{method:'PATCH',data:{status:'confirmed'}});
const profile=await admin('/customers/'+row.customer);
assert.ok(profile.bookings.some(item=>item.reference===winner.reference));
await admin('/reservations/'+row._id,{method:'PATCH',data:{status:'cancelled'}});
assert.ok((await availability('18:00')).some(item=>item._id===table._id));
await admin('/tables/'+table._id,{method:'PATCH',data:{capacity:3}});
await admin('/tables/'+table._id,{method:'DELETE'});
const item=await admin('/menu',{method:'POST',data:{name:'QA dish',category:'QA',description:'Test',price:1,image:'/photos/1517248135467-4c7edcad34c4.jpg',available:true},expected:201});
await admin('/menu/'+item._id,{method:'PATCH',data:{available:false}});
assert.ok((await request('/menu')).some(row=>row._id===item._id&&!row.available));
await admin('/menu/'+item._id,{method:'DELETE'});
await request('/messages',{method:'POST',data:{name:'QA Guest',email:booking.email,subject:'QA '+id,message:'Test inbox'},expected:201});
const message=(await admin('/messages')).find(row=>row.subject==='QA '+id);
assert.ok(message);
await admin('/messages/'+message._id,{method:'PATCH',data:{read:true}});
await admin('/messages/'+message._id,{method:'DELETE'});
assert.ok((await admin('/dashboard')).total>0);
console.log('Passed: admin authentication, table capacity, past dates, overlapping concurrent bookings, adjacent availability, status changes, customer history, table and menu management, inbox, dashboard.');
