import nodemailer from 'nodemailer';
const {SMTP_USER,SMTP_APP_PASSWORD,MANAGEMENT_EMAIL='8174245usama@gmail.com'}=process.env;
const transport=SMTP_USER && SMTP_APP_PASSWORD ? nodemailer.createTransport({
 service:'gmail',auth:{user:SMTP_USER,pass:SMTP_APP_PASSWORD},connectionTimeout:8000,socketTimeout:10000
}):null;
const escape=(value)=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function send(to,subject,fields) {
 if (!transport) return;
 try {
  await transport.sendMail({from:{name:'NOIRÉ Reservations',address:SMTP_USER},to,subject,
   html:`<main style="background:#151412;color:#f7efe1;padding:32px;font-family:Arial"><h1 style="color:#dbb679">NOIRÉ</h1><h2>${escape(subject)}</h2>${Object.entries(fields).map(([key,value])=>`<p><strong>${escape(key)}</strong> · ${escape(value)}</p>`).join('')}</main>`});
 } catch(error) {console.warn('Notification delivery failed',error.code || 'SMTP_ERROR');}
}
export function bookingMail(booking,table,created=false){
 const fields={Reference:booking.reference,Status:booking.status,Name:booking.name,Email:booking.email,Phone:booking.phone,Date:booking.date,Time:booking.time,Guests:booking.guests,Table:table,Requests:booking.notes};
 if(created) void send(MANAGEMENT_EMAIL,'New reservation',fields);
 void send(booking.email,created?'Reservation request received':'Reservation status updated',fields);
}
export function contactMail(message){
 void send(MANAGEMENT_EMAIL,'New contact message',{Name:message.name,Email:message.email,Subject:message.subject,Message:message.message});
}
