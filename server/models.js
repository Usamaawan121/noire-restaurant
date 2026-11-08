import mongoose from 'mongoose';
const {Schema}=mongoose;
const ref=(name)=>({type:Schema.Types.ObjectId,ref:name,required:true});
const schema=(fields)=>new Schema(fields,{timestamps:true});
const required={type:String,required:true};
export const Admin=mongoose.model('Admin',schema({email:{...required,unique:true},passwordHash:{...required,select:false},role:{type:String,enum:['admin'],default:'admin'}}));
export const Table=mongoose.model('Table',schema({number:{...required,unique:true},capacity:{type:Number,min:1,max:30,required:true},category:required,available:{type:Boolean,default:true},archived:{type:Boolean,default:false}}));
export const Customer=mongoose.model('Customer',schema({email:{...required,unique:true},name:required,phone:required}));
export const statuses=['pending','confirmed','rejected','completed','cancelled'];
const reservation=schema({
 reference:{...required,unique:true},customer:ref('Customer'),name:required,email:required,phone:required,
 table:ref('Table'),date:required,time:required,startsAt:{type:Date,required:true,index:true},
 slots:{type:[Number],required:true},active:{type:Boolean,required:true},guests:{type:Number,min:1,max:30,required:true},
 notes:{type:String,default:''},status:{type:String,enum:statuses,required:true}
});
reservation.index({table:1,slots:1},{unique:true,partialFilterExpression:{active:true}});
reservation.index({customer:1,startsAt:-1});
export const Reservation=mongoose.model('Reservation',reservation);
export const MenuItem=mongoose.model('MenuItem',schema({name:required,category:required,description:required,image:required,price:{type:Number,min:0,required:true},available:{type:Boolean,default:true}}));
export const ContactMessage=mongoose.model('ContactMessage',schema({name:required,email:required,subject:required,message:required,read:{type:Boolean,default:false}}));
