import React,{useEffect,useRef,useState} from 'react';
import {ArrowUpRight,Clock,Flame,MapPin,Pause,Play,Users,Utensils} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useReducedMotion} from 'framer-motion';
import {Heading,Reveal} from './ui';
import {price} from './api';


function AmbientMedia({name,poster}) {
 const media=useRef(null);
 const reduced=useReducedMotion();
 const [paused,setPaused]=useState(false);
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const element=media.current;
  if(!window.IntersectionObserver){setVisible(true);return;}
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));
  observer.observe(element);
  return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(visible&&!paused&&!reduced) media.current.play().catch(()=>{});
  else media.current.pause();
 },[visible,paused,reduced]);
 return <>
  <video className="masthead-video" ref={media} muted loop playsInline preload="none" poster={poster} src={reduced?undefined:`/motion/${name}.mp4`} aria-hidden="true"/>
  {!reduced&&<button type="button" className="masthead-play" onClick={()=>setPaused(value=>!value)} aria-label={paused?'Play background video':'Pause background video'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>}
 </>;
}

export function PageMasthead({kind,label,title,children}) {
 return <div className={`page-masthead masthead-${kind}`}>
  {kind==='reservation'&&<AmbientMedia name="reservation-ambience" poster="/photos/noire-reservation-banner.jpg"/>}
  <Heading label={label} title={title}>{children}</Heading>
 </div>;
}

export function KitchenLoop() {
 return <section className="container section home-film-section">
  <div className="page-masthead masthead-menu home-film">
   <AmbientMedia name="kitchen-ambience" poster="/photos/noire-menu-banner.jpg"/>
   <div><p className="eyebrow">From the kitchen</p><h2>Good food. Late nights.</h2><Link className="text-link" to="/menu">Explore the full menu <ArrowUpRight size={16}/></Link></div>
  </div>
 </section>;
}

const deals=[
 {name:'Dholki Duo',guests:'2–3 guests',cost:3490,image:'smash',includes:['2 smash burgers','1 loaded fries','2 soft drinks']},
 {name:'Mehndi Night Box',guests:'4–5 guests',cost:6490,image:'fried',includes:['5 fried chicken pieces','1 large BBQ chicken pizza','2 salted fries','4 soft drinks']},
 {name:'Baraat Feast',guests:'6–8 guests',cost:9990,image:'bbq',includes:['2 large pizzas','8 fried chicken pieces','2 loaded fries','6 soft drinks']}
];

export function MehndiDeals({compact=false}) {
 return <section id="mehndi-deals" className={compact?'deal-section compact-deals':'deal-section'} aria-labelledby="deals-title">
  <p className="eyebrow">The celebration menu</p>
  <h2 id="deals-title">Mehndi deals</h2>
  <p className="muted deals-lead">Shareable fast-food boxes for dholki nights, Mehndi celebrations and the whole table.</p>
  <div className="deal-grid">{deals.map((deal,index)=><Reveal key={deal.name}><article className="deal-card">
   <div className="deal-media"><img src={`/photos/noire-${deal.image}.jpg`} loading="lazy" alt=""/><span>0{index+1} / CELEBRATION BOX</span></div>
   <div className="deal-body"><span className="deal-guests"><Users size={14}/> {deal.guests}</span>
    <h3>{deal.name}</h3><ul>{deal.includes.map(entry=><li key={entry}>{entry}</li>)}</ul>
    <strong>{price(deal.cost)}</strong>
   </div>
  </article></Reveal>)}</div>
  <Link className="text-link" to={compact?'/menu#mehndi-deals':'/contact'}>{compact?'See all Mehndi deals':'Ask about group deals'} <ArrowUpRight size={16}/></Link>
 </section>;
}

export function KitchenFeatures() {
 const features=[
  ['The griddle','Smash burgers','Brioche, crispy edges and our own house sauce.','smash',Flame],
  ['The stone oven','Pizza nights','Hand-stretched 12-inch pizzas with plenty of char.','pepperoni',Utensils],
  ['The fryer','Golden chicken','Crunchy bone-in pieces, wings and loaded fries.','fried',Clock]
 ];
 return <section className="container section kitchen-features">
  <Heading as="h2" label="Straight from the kitchen" title="Three reasons to come hungry"/>
  <div className="feature-grid">{features.map(([label,title,copy,image,Icon])=><Reveal key={title}><article className="feature-tile">
   <img src={`/photos/noire-${image}.jpg`} loading="lazy" alt=""/>
   <div><Icon size={19}/><p className="eyebrow">{label}</p><h3>{title}</h3><p>{copy}</p></div>
  </article></Reveal>)}</div>
 </section>;
}

export function PremiumFooter({restaurant,phone}) {
 return <footer className="site-footer premium-footer">
  <div className="container">
   <div className="footer-invite"><div><p className="eyebrow">Open daily · Clifton, Karachi</p><h2>See you after dark.</h2></div><Link className="button" to="/reservations">Reserve your table <ArrowUpRight size={17}/></Link></div>
   <div className="footer-grid">
    <div><Link className="wordmark" to="/">NOIRÉ<span>DINING AFTER DARK</span></Link><p className="muted">Smash burgers, stone-baked pizza and late-night tables in Karachi.</p></div>
    <div><strong>Explore</strong><nav aria-label="Footer links"><Link to="/menu">Full menu</Link><Link to="/menu#mehndi-deals">Mehndi deals</Link><Link to="/reservations">Reservations</Link></nav></div>
    <div><strong>Visit</strong><p><MapPin size={15}/> {restaurant}</p><p><Clock size={15}/> Daily, 5–11 pm</p></div>
    <div><strong>Get in touch</strong><nav aria-label="Footer contact"><Link to="/contact">Contact page</Link><a href={`tel:${phone.replace(/\s/g,'')}`}>{phone}</a><Link to="/admin">Staff sign in</Link></nav></div>
   </div>
   <div className="footer-base"><span>NOIRÉ · Dining After Dark</span><span>Karachi, Pakistan</span></div>
  </div>
 </footer>;
}
