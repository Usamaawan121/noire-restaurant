import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';

process.env.SMTP_USER='test@example.com';
process.env.SMTP_APP_PASSWORD='test-placeholder';
process.env.MANAGEMENT_EMAIL='management@example.com';
const messages=[];
nodemailer.createTransport=(options)=>{
 assert.equal(options.service,'gmail');
 assert.equal(options.auth.pass,'test-placeholder');
 return {sendMail:async message=>{
  messages.push(message);
  if(message.to==='management@example.com')throw Object.assign(new Error('Injected failure'),{code:'EAUTH'});
 }};
};
const warnings=[];
const warn=console.warn;
console.warn=(...args)=>warnings.push(args.join(' '));
try {
 const {bookingMail,contactMail}=await import('../mail.js');
 const booking={reference:'NR-TEST',status:'pending',name:'Example',email:'guest@example.com',phone:'123456789',date:'2026-12-01',time:'19:00',guests:2,notes:'<script>test</script>'};
 bookingMail(booking,'01',true);
 bookingMail({...booking,status:'confirmed'},'01');
 contactMail({name:'Example',email:booking.email,subject:'Question',message:'Sample'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(messages.map(message=>message.to),['management@example.com','guest@example.com','guest@example.com','management@example.com']);
 assert.ok(messages[0].html.includes('NR-TEST'));
 assert.ok(messages[0].html.includes('&lt;script&gt;test&lt;/script&gt;'));
 assert.ok(messages[2].html.includes('confirmed'));
 assert.equal(warnings.length,2);
 assert.ok(warnings.every(message=>message.endsWith('EAUTH')&&!message.includes('test-placeholder')));
} finally {
 console.warn=warn;
}
console.log('Passed: Gmail transport configuration, recipients, escaped HTML, status updates and handled SMTP rejection using a simulated transport.');
