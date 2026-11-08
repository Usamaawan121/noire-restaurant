import './config.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {Admin,Table,MenuItem} from './models.js';
import {email} from './reservations.js';
import {fastFood} from '../shared/fast-food.mjs';
const {MONGODB_URI,ADMIN_EMAIL,ADMIN_PASSWORD}=process.env;
const fastFoodOnly=process.argv.includes('--fast-food-only');
const catalogOnly=fastFoodOnly || process.argv.includes('--catalog-only');
if(!MONGODB_URI) throw new Error('Set MONGODB_URI in .env.');
let address;
if(!catalogOnly){
 if(!ADMIN_PASSWORD || ADMIN_PASSWORD.length<12 || Buffer.byteLength(ADMIN_PASSWORD)>72) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12 characters minimum, 72 bytes maximum).');
 address=email.parse(ADMIN_EMAIL);
}
await mongoose.connect(MONGODB_URI);
try {
 await MenuItem.init();
 if(!fastFoodOnly) await Table.init();
 if(!catalogOnly){
  await Admin.init();
  await Admin.updateOne({email:address},{$setOnInsert:{passwordHash:await bcrypt.hash(ADMIN_PASSWORD,12),role:'admin'}},{upsert:true});
 }
 if(!fastFoodOnly) {
  for(const [number,capacity,category] of [['01',2,'Salon'],['02',2,'Window'],['03',4,'Salon'],['04',4,'Window'],['05',6,'Private'],['06',10,'Private']]){
   await Table.updateOne({number},{$setOnInsert:{capacity,category,available:true}},{upsert:true});
  }
  const dishes=[
   ['Charcoal Ribeye','From the fire','Aged beef, smoked shallot and black pepper jus.',5400,'1546833999-b9f581a1996d'],
   ['Garden Burrata','First plates','Heirloom tomatoes, basil oil and toasted sourdough.',2400,'1512621776951-a57141f2eefd'],
   ['Dark Chocolate Finale','Desserts','Bittersweet chocolate, sea salt and vanilla cream.',1800,'1563805042-7684c019e1cb'],
   ['Wild Mushroom Pasta','From the fire','Hand-cut pasta, forest mushrooms and aged Parmesan.',3200,'1473093295043-cdd812d0e601'],
   ['Citrus & Tonic','Drinks','Grapefruit, rosemary and sparkling tonic.',950,'1544145945-f90425340c7e']
  ];
  for(const [name,category,description,price,photo] of dishes){
   await MenuItem.updateOne({name},{$setOnInsert:{category,description,price,image:`/photos/${photo}.jpg`,available:true}},{upsert:true});
  }
 }
 const now=new Date();
 for(const dish of fastFood){
  await MenuItem.updateOne({name:dish.name},{$setOnInsert:{...dish,createdAt:now,updatedAt:now}},{upsert:true,timestamps:false});
 }
 if(fastFoodOnly) console.log(`Fast-food menu ready (${fastFood.length} catalog items).`);
 else console.log(catalogOnly?'Demo tables and menu ready.':'Admin, tables and sample menu ready.');
} finally {await mongoose.disconnect();}
