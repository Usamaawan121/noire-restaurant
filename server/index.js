import {timezone} from './config.js';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import {rateLimit} from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {z,ZodError} from 'zod';
import {DateTime} from 'luxon';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import * as models from './models.js';
import {Admin,Reservation,Table,Customer,MenuItem,ContactMessage} from './models.js';
import {availableTables,createBooking,updateBooking,fail,email,line,objectId} from './reservations.js';
import {contactMail} from './mail.js';

const {JWT_SECRET,MONGODB_URI,PORT=4000,CLIENT_ORIGIN='http://localhost:5173'}=process.env;
if(!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length<32) throw new Error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters in .env.');
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{directives:{imgSrc:["'self'",'https:','data:'],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],frameSrc:['https://maps.google.com','https://www.google.com'],upgradeInsecureRequests:null}}}));
app.use(cors({origin:CLIENT_ORIGIN.split(',').map(value=>value.trim())}));
app.use(express.json({limit:'32kb'}));
const api=express.Router();
app.use('/api',api);
const limiter=(limit)=>rateLimit({windowMs:15*60000,limit,handler:(_req,res)=>res.status(429).json({error:'Too many requests. Try again shortly.'})});
const ok=(res,data,status=200)=>res.status(status).json({data});
api.get('/health',(_req,res)=>ok(res,{status:'ok',timezone}));
api.get('/menu',async(_req,res)=>ok(res,await MenuItem.find().sort({category:1,name:1})));
api.get('/availability',limiter(120),async(req,res)=>ok(res,await availableTables(req.query)));
api.post('/reservations',limiter(15),async(req,res)=>ok(res,await createBooking(req.body),201));
api.post('/messages',limiter(10),async(req,res)=>{
 const input=z.object({name:line(120),email,subject:line(160),message:line(4000)}).parse(req.body);
 const message=await ContactMessage.create(input);
 contactMail(message);
 ok(res,{received:true},201);
});
api.post('/auth/login',limiter(10),async(req,res)=>{
 const input=z.object({email,password:line(200)}).parse(req.body);
 const admin=await Admin.findOne({email:input.email}).select('+passwordHash');
 if(!admin || !await bcrypt.compare(input.password,admin.passwordHash)) throw fail(401,'Invalid email or password.');
 const token=jwt.sign({role:admin.role},JWT_SECRET,{subject:admin.id,algorithm:'HS256',expiresIn:'2h',issuer:'noire'});
 ok(res,{token,email:admin.email});
});
const admin=express.Router();
api.use('/admin',admin);
admin.use(async(req,_res,next)=>{
 let claims;
 try {claims=jwt.verify(req.get('authorization')?.match(/^Bearer (.+)$/)?.[1],JWT_SECRET,{algorithms:['HS256'],issuer:'noire'});}
 catch {throw fail(401,'Sign in to continue.');}
 if(claims.role!=='admin' || !await Admin.exists({_id:claims.sub,role:'admin'})) throw fail(403,'Administrator access required.');
 next();
});
admin.param('id',(_req,_res,next,id)=>{objectId.parse(id);next();});
admin.get('/reservations',async(_req,res)=>ok(res,await Reservation.find().populate('table','number category').sort({createdAt:-1})));
admin.patch('/reservations/:id',async(req,res)=>ok(res,await updateBooking(req.params.id,req.body)));
const tableInput=z.object({number:line(30),capacity:z.coerce.number().int().min(1).max(30),category:line(70),available:z.boolean()});
const menuInput=z.object({name:line(120),category:line(70),description:line(600),price:z.coerce.number().min(0).max(1000000),available:z.boolean(),image:z.string().max(1200).refine(value=>/^\/photos\/[a-z0-9-]+\.jpg$/i.test(value) || (z.string().url().safeParse(value).success && /^https:\/\//i.test(value)), "Use an HTTPS URL or a bundled photo path.")});
function resource(path,model,input,filter={}){
 admin.get(path,async(_req,res)=>ok(res,await model.find(filter).sort({createdAt:-1})));
 admin.post(path,async(req,res)=>ok(res,await model.create(input.parse(req.body)),201));
 admin.patch(path+'/:id',async(req,res)=>{
  const row=await model.findOneAndUpdate({_id:req.params.id,...filter},input.partial().strict().parse(req.body),{new:true,runValidators:true});
  if(!row) throw fail(404,'Record not found.');
  ok(res,row);
 });
 admin.delete(path+'/:id',async(req,res)=>{
  const row=model===Table ? await Table.findOneAndUpdate({_id:req.params.id,archived:false},{archived:true,available:false}) : await model.findByIdAndDelete(req.params.id);
  if(!row) throw fail(404,'Record not found.');
  ok(res,{deleted:true});
 });
}
resource('/tables',Table,tableInput,{archived:false});
resource('/menu',MenuItem,menuInput);
admin.get('/customers',async(_req,res)=>ok(res,await Customer.find().sort({updatedAt:-1})));
admin.get('/customers/:id',async(req,res)=>{
 const customer=await Customer.findById(req.params.id);
 if(!customer) throw fail(404,'Customer not found.');
 ok(res,{customer,bookings:await Reservation.find({customer:customer.id}).sort({startsAt:-1})});
});
admin.get('/messages',async(_req,res)=>ok(res,await ContactMessage.find().sort({createdAt:-1})));
admin.patch('/messages/:id',async(req,res)=>{
 const row=await ContactMessage.findByIdAndUpdate(req.params.id,z.object({read:z.boolean()}).strict().parse(req.body),{new:true});
 if(!row) throw fail(404,'Message not found.');
 ok(res,row);
});
admin.delete('/messages/:id',async(req,res)=>{
 if(!await ContactMessage.findByIdAndDelete(req.params.id)) throw fail(404,'Message not found.');
 ok(res,{deleted:true});
});
admin.get('/dashboard',async(_req,res)=>{
 const now=DateTime.now().setZone(timezone);
 const days=Array.from({length:7},(_,i)=>now.minus({days:6-i}).toISODate());
 const slot=Math.floor(now.toMillis()/1800000);
 const [total,today,customers,tables,occupied,counts,recent,activity]=await Promise.all([
  Reservation.countDocuments(),Reservation.countDocuments({date:now.toISODate()}),Customer.countDocuments(),
  Table.find({available:true,archived:false}).select('_id'),Reservation.distinct('table',{active:true,slots:slot}),
  Reservation.aggregate([{$match:{date:{$in:days}}},{$group:{_id:'$date',count:{$sum:1}}}]),
  Reservation.find().sort({createdAt:-1}).limit(6),Customer.find().sort({updatedAt:-1}).limit(5)
 ]);
 const used=tables.filter(table=>occupied.some(id=>id.equals(table._id))).length;
 ok(res,{total,today,customers,available:tables.length-used,occupied:used,trends:days.map(date=>({date,count:counts.find(row=>row._id===date)?.count ?? 0})),recent,activity});
});
api.use((_req,_res,next)=>next(fail(404,'Endpoint not found.')));
const dist=fileURLToPath(new URL('../client/dist',import.meta.url));
if(existsSync(dist)){
 app.use(express.static(dist));
 app.get('/{*path}',(_req,res)=>res.sendFile(dist+'/index.html'));
}
app.use((error,_req,res,_next)=>{
 if(error instanceof ZodError) return res.status(422).json({error:error.issues.map(issue=>issue.path.join('.')+': '+issue.message).join(' · ')});
 if(error.code===11000) return res.status(409).json({error:error.keyPattern?.slots?'That table was just booked. Please select another table or time.':'A record with that identifier already exists.'});
 const status=error.status>=400 && error.status<500 ? error.status : 500;
 if(status===500) console.error('Request failed',error.name,error.code || '');
 res.status(status).json({error:status===500?'The server could not complete the request.':error.message});
});
await mongoose.connect(MONGODB_URI);
await Promise.all(Object.values(models).filter(value=>typeof value.init==='function').map(model=>model.init()));
app.listen(PORT,()=>console.log(`NOIRÉ listening on ${PORT}`));
