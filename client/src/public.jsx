import React,{useCallback,useEffect,useLayoutEffect,useState} from 'react';
import {ArrowUpRight,Check,MapPin,Menu as MenuIcon,X} from 'lucide-react';
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {useReducedMotion} from 'framer-motion';
import {FilmCards,isFirstVisit,OpeningScene,ScrollHero} from './cinema';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {api,price} from './api';
import {KitchenFeatures,KitchenLoop,MehndiDeals,PageMasthead,PremiumFooter} from './hospitality';
import {fastFood} from '../../shared/fast-food.mjs';
import {Feedback,Field,Heading,Reveal,useData} from './ui';

const navigation=[['/','Home'],['/menu','Menu'],['/reservations','Reservations'],['/contact','Contact']];
const photo=(id)=>`/photos/${id}.jpg`;
const restaurant=import.meta.env.VITE_RESTAURANT_ADDRESS || 'Clifton, Karachi, Pakistan';
const mapQuery=import.meta.env.VITE_MAP_QUERY || restaurant;
const phone='+92 21 555 0100';
export function PublicLayout(){
 const [open,setOpen]=useState(false);
 const location=useLocation();
 const reduced=useReducedMotion();
 const [intro,setIntro]=useState(isFirstVisit);
 const finishIntro=useCallback(()=>setIntro(false),[]);
 useEffect(()=>setOpen(false),[location.pathname]);
 useLayoutEffect(()=>{
  if(!location.hash||intro&&!reduced) return;
  const frame=requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));
  return ()=>cancelAnimationFrame(frame);
 },[location.pathname,location.hash,intro,reduced]);
 if(intro&&!reduced) return <OpeningScene onFinish={finishIntro}/>;
 return <>
  <header className="public-nav"><div className="nav-inner">
   <Link className="wordmark" to="/">NOIRÉ<span>DINING AFTER DARK</span></Link>
   <button type="button" className="menu-toggle icon-button" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<MenuIcon/>}</button>
   <nav aria-label="Main navigation" className={open?'open':''}>{navigation.map(([to,label])=><NavLink end key={to} to={to}>{label}</NavLink>)}</nav>
   <Link className="button nav-cta" to="/reservations">Book a table <ArrowUpRight size={15}/></Link>
  </div></header>
  <main id="main" className="route-content" key={location.pathname}><Outlet/></main>
  <PremiumFooter restaurant={restaurant} phone={phone}/>
 </>;
}
const builtInByName=new Map(fastFood.map(dish=>[dish.name.toLowerCase(),dish]));
function restaurantMenu(live) {
 const rows=live??[];
 const hasFastFood=rows.some(dish=>builtInByName.has(dish.name.toLowerCase()));
 const pictures=rows.map(dish=>{
  const match=builtInByName.get(dish.name.toLowerCase());
  return {...dish,image:dish.image||match?.image||'/photos/noire-menu-banner.jpg'};
 });
 return hasFastFood?pictures:[...fastFood,...pictures];
}
function Dish({dish}) {
 const fallback=builtInByName.get(dish.name.toLowerCase())?.image||'/photos/noire-menu-banner.jpg';
 return <article className="dish restaurant-card">
  <div className="restaurant-card-image"><img loading="lazy" src={dish.image||fallback} alt={dish.name} onError={event=>{
   if(event.currentTarget.getAttribute('src')!==fallback) event.currentTarget.src=fallback;
  }}/><span className="menu-price">{price(dish.price)}</span></div>
  <div className="dish-body"><p className="eyebrow">{dish.category}</p><h3>{dish.name}</h3><p className="muted">{dish.description}</p>
   {!dish.available&&<span className="tag">Unavailable</span>}
  </div>
 </article>;
}
export function Home(){
 const menu=useData('/menu');
 const signature=restaurantMenu(menu.data).filter(d=>d.available).sort((a,b)=>Number(b.image.includes('/photos/noire-'))-Number(a.image.includes('/photos/noire-'))).slice(0,6);
 return <>
  <ScrollHero menu={menu.data}/>
  <KitchenFeatures/>
  <KitchenLoop/>
  <FilmCards/>
  <div className="band"><div className="container section"><MehndiDeals compact/></div></div>
  <section className="container section split"><Reveal><p className="eyebrow">The experience</p><h2>Take your time.</h2><p className="muted">Come for the charcoal cooking. Stay for the slow pace, the warmth of the room and one more conversation over dessert.</p><Link className="text-link" to="/contact">Plan your visit <ArrowUpRight size={16}/></Link></Reveal><Reveal><img className="editorial-image" src={photo('1552566626-52f8b828add9')} alt="Warmly lit restaurant interior" loading="lazy"/></Reveal></section>
  <section className="band"><div className="container section"><Heading as="h2" label="From the kitchen" title="Signature dishes">A few favorites from the NOIRÉ menu.</Heading><Feedback empty={signature.length===0?'No dishes are featured right now.':null}/><div className="cards">{signature.map(d=><Reveal key={d._id||d.name}><Dish dish={d}/></Reveal>)}</div><Link className="text-link" to="/menu">See the full menu <ArrowUpRight size={16}/></Link></div></section>
  <section className="container section"><Heading as="h2" label="Inside NOIRÉ" title="The room, the table, the plate"/><div className="gallery">{[['1559339352-11d035aa65de','Dining room'],['1547592180-85f173990554','Seasonal cooking'],['1514933651103-005eec06c04b','Restaurant bar']].map(([id,alt])=><Reveal key={id}><img loading="lazy" src={photo(id)} alt={alt}/></Reveal>)}</div></section>
  <section className="band"><div className="container section quote"><p className="eyebrow">Sample guest testimonial</p><blockquote>“We ordered one more dessert just to stay a little longer.”</blockquote><Link className="button" to="/reservations">Find your table <ArrowUpRight size={16}/></Link></div></section>
 </>;
}
export function Menu(){
 const {data,loading,error}=useData('/menu');
 const [category,setCategory]=useState('All');
 const [query,setQuery]=useState('');
 const items=restaurantMenu(data);
 const actualCategories=new Set(items.map(d=>d.category));
 const fastCategories=[...new Set(fastFood.map(d=>d.category))].filter(c=>actualCategories.has(c));
 const categoryOrder=[...fastCategories,...[...actualCategories].filter(c=>!fastCategories.includes(c))];
 const search=query.trim().toLowerCase();
 const dishes=items.filter(d=>(category==='All'||d.category===category)&&[d.name,d.description,d.category].some(value=>value.toLowerCase().includes(search)));
 const sections=categoryOrder.map(name=>[name,dishes.filter(d=>d.category===name)]).filter(([,rows])=>rows.length);
 return <section className="container section page menu-page">
  <PageMasthead kind="menu" label="The kitchen" title="The NOIRÉ menu">Smash burgers, stone-baked pizza, fried chicken and shareable Mehndi boxes.</PageMasthead>
  <div className="toolbar restaurant-toolbar">
   <input type="search" aria-label="Search dishes" placeholder="Search dishes" value={query} onChange={event=>setQuery(event.target.value)}/>
   <a href="#mehndi-deals" className="text-link">Mehndi deals <ArrowUpRight size={15}/></a>
   <div className="filters">{['All',...categoryOrder].map(c=><button type="button" aria-pressed={category===c} key={c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
  </div>
  <Feedback loading={loading} error={error?'Showing the house menu while live updates are unavailable.':null} empty={!sections.length?'No dishes match your search.':null}/>
  <p className="menu-count" role="status">{dishes.length} {dishes.length===1?'dish':'dishes'} · Prices in PKR</p>
  {sections.map(([name,rows])=><section className="menu-category" key={name}>
   <header><h2>{name}</h2><span>{rows.length} {rows.length===1?'item':'items'}</span></header>
   <div className="cards">{rows.map(d=><Reveal key={d._id||d.name}><Dish dish={d}/></Reveal>)}</div>
  </section>)}
  <MehndiDeals/>
 </section>;
}

const identity={name:z.string().trim().min(1,'Enter your name.').max(120),email:z.string().trim().email('Enter a valid email.').max(254)};
const bookingInput=z.object({...identity,phone:z.string().regex(/^[+\d][\d ().-]{6,29}$/,'Enter a valid phone number.'),date:z.string().min(1,'Choose a date.'),time:z.string().min(1,'Choose a time.'),guests:z.coerce.number().int().min(1).max(30),table:z.string().min(1,'Choose an available table.'),notes:z.string().max(1200)});
function calendarDate(timezone, offset=0){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts();
 const get=type=>parts.find(part=>part.type===type).value;
 const date=new Date(Date.UTC(+get('year'),+get('month')-1,+get('day')+offset));
 return date.toISOString().slice(0,10);
}
const times=Array.from({length:10},(_,i)=>`${17+Math.floor(i/2)}:${i%2?'30':'00'}`);
export function Reservations(){
 const {register,watch,setValue,handleSubmit,formState:{errors,isSubmitting}}=useForm({resolver:zodResolver(bookingInput),defaultValues:{guests:2,table:'',notes:''}});
 const [date,time,guests]=watch(['date','time','guests']);
 const [availability,setAvailability]=useState({tables:[],loading:false,error:''});
 const [result,setResult]=useState(null);
 const [error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 const health=useData('/health');
 const zone=health.data?.timezone;
 const minDate=zone?calendarDate(zone):undefined;
 const maxDate=zone?calendarDate(zone,180):undefined;
 const chosen=date&&time&&Number.isInteger(Number(guests))&&guests>=1&&guests<=30;
 const selectionKey=chosen?`${date}/${time}/${guests}/${retry}`:'';
 const current=availability.key===selectionKey?availability:{tables:[],loading:Boolean(selectionKey),error:''};
 const restaurantTime=zone?new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format():null;
 const openTimes=date===minDate&&restaurantTime?times.filter(slot=>slot>restaurantTime):times;

 useEffect(()=>{
  setValue('table','');
  if(!selectionKey) return;
  const controller=new AbortController();
  setAvailability({key:selectionKey,tables:[],loading:true,error:''});
  const timer=setTimeout(async ()=>{
   try {
    const tables=await api('/availability',{params:{date,time,guests},signal:controller.signal});
    if(!controller.signal.aborted) setAvailability({key:selectionKey,tables,loading:false,error:''});
   } catch(error){
    if(!controller.signal.aborted) setAvailability({key:selectionKey,tables:[],loading:false,error:error.message});
   }
  },200);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[date,time,guests,selectionKey,setValue]);
 const submit=async data=>{
  setError('');
  try {setResult(await api('/reservations',{method:'post',data}));}
  catch(error){setError(error.message);if(error.status===409)setRetry(value=>value+1);}
 };
 return <section className="container section page booking-page"><PageMasthead kind="reservation" label="Reservations" title="A table for the evening">Dinner reservations are held in 90-minute sittings. Times are shown in {health.data?.timezone || 'the restaurant’s local time'}.</PageMasthead>
  {result?<div className="panel confirmation" role="status"><Check size={36}/><h2>Request received</h2><p>Table {result.table} for {result.guests} on {result.date} at {result.time}.</p><p>Your request is pending staff confirmation. Save your reference below.</p><strong className="reference">{result.reference}</strong><Link className="button secondary" to="/">Back to NOIRÉ</Link></div>:
  <form className="panel form-grid" onSubmit={handleSubmit(submit)}>
   <Field label="Full name" error={errors.name}><input autoComplete="name" {...register('name')}/></Field>
   <Field label="Email" error={errors.email}><input type="email" autoComplete="email" {...register('email')}/></Field>
   <Field label="Phone" error={errors.phone}><input type="tel" autoComplete="tel" {...register('phone')}/></Field>
   <Field label="Guests" error={errors.guests}><input type="number" min="1" max="30" {...register('guests')}/></Field>
   <Field label="Date" error={errors.date}><input type="date" min={minDate} max={maxDate} {...register('date',{onChange:()=>setValue('time','')})}/></Field>
   <Field label="Time" error={errors.time}><select {...register('time')}><option value="">Choose a time</option>{openTimes.map(t=><option key={t}>{t}</option>)}</select></Field>
   <Field label="Preferred table" wide error={errors.table}><select disabled={!current.tables.length} {...register('table')}><option value="">Choose an available table</option>{current.tables.map(t=><option value={t._id} key={t._id}>Table {t.number} · {t.category} · Seats {t.capacity}</option>)}</select></Field>
   <div className="wide"><Feedback {...current} empty={date&&!openTimes.length?'Service has finished for this date. Choose a later date.':selectionKey&&!current.tables.length?'No table is available for this party at that time. Try another time or a smaller party.':null}/></div>
   <Field label="Special requests (optional)" wide error={errors.notes}><textarea rows={3} {...register('notes')}/></Field>
   <div className="wide"><Feedback error={error}/><button className="button" disabled={isSubmitting||!current.tables.length}>{isSubmitting?'Submitting…':'Request reservation'} <ArrowUpRight size={16}/></button></div>
  </form>}
 </section>;
}
const contactInput=z.object({...identity,subject:z.string().trim().min(1,'Enter a subject.').max(160),message:z.string().trim().min(1,'Enter a message.').max(4000)});
export function Contact(){
 const {register,handleSubmit,reset,formState:{errors,isSubmitting}}=useForm({resolver:zodResolver(contactInput)});
 const [feedback,setFeedback]=useState({});
 const submit=async data=>{
  setFeedback({});
  try{await api('/messages',{method:'post',data});reset();setFeedback({success:true});}
  catch(error){setFeedback({error:error.message});}
 };
 return <section className="container section page contact-page"><PageMasthead kind="contact" label="Visit NOIRÉ" title="Get in touch">Find the restaurant, ask about a Mehndi deal, or plan your next visit.</PageMasthead>
  <div className="split contact-split"><div className="panel"><MapPin size={26}/><h2>Find us</h2><p>{restaurant}<br/>Daily, 5–11 pm<br/>{phone}<br/>hello@example.com</p><iframe title="Sample restaurant area on Google Maps" loading="lazy" src={'https://maps.google.com/maps?q='+encodeURIComponent(mapQuery)+'&output=embed'}/></div>
  <form className="panel form-grid" onSubmit={handleSubmit(submit)}>
   <Field label="Name" error={errors.name}><input autoComplete="name" {...register('name')}/></Field>
   <Field label="Email" error={errors.email}><input type="email" autoComplete="email" {...register('email')}/></Field>
   <Field label="Subject" wide error={errors.subject}><input {...register('subject')}/></Field>
   <Field label="Message" wide error={errors.message}><textarea rows={6} {...register('message')}/></Field>
   <div className="wide"><Feedback error={feedback.error}/>{feedback.success&&<p className="feedback" role="status">Your message was received.</p>}<button className="button" disabled={isSubmitting}>{isSubmitting?'Sending…':'Send message'}</button></div>
  </form></div>
 </section>;
}
