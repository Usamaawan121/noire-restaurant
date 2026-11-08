import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {ArrowDown, ArrowUpRight, Pause, Play} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Heading} from './ui';

import {heroDishes} from '../../shared/fast-food.mjs';

let introCompleted = false;

export function isFirstVisit() {
 const navigation = performance.getEntriesByType('navigation')[0];
 return !introCompleted && navigation?.type !== 'reload' && navigation?.type !== 'back_forward';
}

export function OpeningScene({onFinish}) {
 const canvas = useRef(null);
 const [ready,setReady] = useState(false);
 const finish = () => {
  introCompleted = true;
  onFinish();
 };
 useEffect(() => {
  let dispose;
  let cancelled = false;
  let fallback;
  const complete = () => {
   introCompleted = true;
   onFinish();
  };
  const timeout = setTimeout(complete,5500);
  import('./opening-model').then(({playOpening}) => {
   if(cancelled) return;
   dispose=playOpening(canvas.current,complete);
   setReady(true);
  }).catch(() => {
   if(!cancelled){
    clearTimeout(timeout);
    fallback=setTimeout(complete,2800);
   }
  });
  return () => {
   cancelled=true;
   clearTimeout(timeout);
   dispose?.();
  };
 }, [onFinish]);
 return <section className="opening" aria-label="Welcome to NOIRÉ" onKeyDown={event => {
  if(event.key==='Escape') finish();
 }}>
  <div className="opening-inner">
   <p className="eyebrow">Clifton · Karachi</p>
   <div className="opening-stage">
   <canvas className={ready?'opening-canvas ready':'opening-canvas'} ref={canvas} aria-hidden="true"/>
   <svg viewBox="0 0 480 400" className={ready?'opening-building fallback-hidden':'opening-building'} aria-hidden="true">
    <defs>
     <linearGradient id="front" x2="0" y2="1"><stop stopColor="#634634"/><stop offset="1" stopColor="#2b211b"/></linearGradient>
     <linearGradient id="glass" x2="0" y2="1"><stop stopColor="#281a15"/><stop offset="1" stopColor="#d2904b"/></linearGradient>
     <radialGradient id="shadow"><stop stopColor="#000" stopOpacity=".9"/><stop offset="1" stopColor="#000" stopOpacity="0"/></radialGradient>
    </defs>
    <ellipse cx="240" cy="345" rx="208" ry="51" fill="url(#shadow)"/>
    <g className="build-piece base-piece">
     <path d="M39 293 237 195 442 293 241 383Z" fill="#493a30" stroke="#9b7857"/>
     <path d="M39 293 241 383 442 293 442 308 241 398 39 308Z" fill="#241a16"/>
     <path d="M70 292 237 211 413 292 241 366Z" fill="#79634f" stroke="#ad8964"/>
     <path d="M94 301 241 366M119 313 387 278M150 326 397 285M179 338 404 291" stroke="#9b8167" opacity=".65"/>
    </g>
    <g className="build-piece wall-piece">
     <path d="M106 175 240 234 240 347 106 287Z" fill="url(#front)" stroke="#ad8055"/>
     <path d="M240 234 378 173 378 286 240 347Z" fill="#38271e" stroke="#a67650"/>
     <path d="M121 207 158 224 158 289 121 272Z M169 229 221 253 221 318 169 294Z M258 250 302 231 302 319 258 338Z M314 225 364 203 364 270 314 293Z" fill="url(#glass)" stroke="#c09059" strokeWidth="3"/>
     <path d="M139 216V280M195 241V307M280 242V327M339 214V281M121 244 158 261M169 267 221 291M314 262 364 239" stroke="#2a201c" strokeWidth="3"/>
     <path d="M246 339 376 281M110 280 235 336" stroke="#bd905e" opacity=".6"/>
    </g>
    <g className="build-piece roof-piece">
     <path d="M97 166 238 101 388 165 240 232Z" fill="#7d5b41" stroke="#deb57b" strokeWidth="2"/>
     <path d="M111 166 238 112 374 166 240 221Z" fill="#31231c" stroke="#a6774f"/>
     <path d="M128 165 238 119 354 166 240 214Z" fill="#513e32"/>
     <path d="M97 166 240 232 388 165 388 179 240 246 97 179Z" fill="#9a6c47" stroke="#c29460"/>
    </g>
    <g className="build-piece trim-piece">
     <path d="M108 204 224 257 213 271 96 219Z" fill="#704039" stroke="#b77958"/>
     <path d="M314 222 368 198 383 208 326 233Z" fill="#75423a" stroke="#b77958"/>
     <path d="M256 235 303 214 303 232 256 253Z" fill="#1b1512" stroke="#d1a16b"/>
     <text x="260" y="247" fill="#f7ce94" fontSize="12" fontFamily="Georgia" transform="skewY(-24) translate(0 116)">NOIRÉ</text>
     <path d="M266 340 300 325 315 331 281 347Z" fill="#2a2019"/>
    </g>
    <g className="build-piece plant-piece">
     {[[103,298],[161,323],[326,313],[393,288]].map(([x,y]) => <g key={x} transform={`translate(${x} ${y})`}>
      <path d="M-9 -5H9L6 9H-6Z" fill="#a66e46"/><ellipse cy="-7" rx="9" ry="4" fill="#453025"/>
      <path d="M0 -7Q-20 -13 -12 -24Q-3 -22 0 -13Q-7 -29 1 -36Q8 -27 4 -15Q13 -30 18 -24Q18 -13 0 -7Z" fill="#61724a" stroke="#879260"/>
     </g>)}
    </g>
   </svg></div>
   <strong className="opening-brand">NOIRÉ</strong><span className="eyebrow opening-tag">Dining after dark</span>
   <button type="button" className="text-link opening-skip" onClick={finish}>Enter restaurant <ArrowUpRight size={15}/></button>
  </div>
 </section>;
}

const dishMotion = {
 enter: direction => ({y: direction * 175, x:direction * 58, rotate:direction * 15, rotateX:direction * -24, rotateY:direction * 19, scale:.74, opacity:0}),
 show: {y:0,x:0,rotate:0,rotateX:0,rotateY:0,scale:1,opacity:1},
 exit: direction => ({y:direction * -148,x:direction * -42,rotate:direction * -14,rotateX:direction * 17,rotateY:direction * -16,scale:.79,opacity:0})
};

export function ScrollHero({menu}) {
 const dishes = heroDishes.map(featured=>{
  const live=menu?.find(dish=>dish.name===featured.name);
  return live?.available&&live.image ? live : featured;
 });
 const reduced = useReducedMotion();
 const stage = useRef(null);
 const [slide, setSlide] = useState({index:0, direction:1});
 useLayoutEffect(() => {
  let frame;
  function update() {
   const area = stage.current;
   const sticky = area.firstElementChild;
   const distance = area.offsetHeight - sticky.offsetHeight;
   const inset = Number.parseFloat(getComputedStyle(sticky).top) || 0;
   const progress = distance > 0 ? Math.min(1, Math.max(0, (inset - area.getBoundingClientRect().top) / distance)) : 0;
   const index = Math.min(dishes.length - 1, Math.floor(progress * dishes.length));
   setSlide(previous => previous.index === index ? previous : {index, direction:index > previous.index ? 1 : -1});
  }
  function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }
  update();
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  return () => {
   cancelAnimationFrame(frame);
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule);
  };
 }, [dishes.length]);
 const index = Math.min(slide.index, dishes.length - 1);
 const dish = dishes[index];
 return <section className="scroll-hero" ref={stage} style={{'--hero-travel':`${(dishes.length - 1) * 23}svh`}}>
  <div className="scroll-hero-pin"><div className="container hero-grid">
   <div className="hero-title">
    <p className="eyebrow hero-kicker">Clifton, Karachi <i/> Fast-food edit</p>
    <h1>Dining<br/><em>after dark.</em></h1>
    <p className="hero-subtitle">Smashed on the griddle. Baked on stone. Fried until golden. Come hungry.</p>
    <div className="actions"><Link className="button" to="/menu">Explore the menu <ArrowUpRight size={17}/></Link><Link className="button secondary" to="/reservations">Reserve a table</Link></div>
    <div className="hero-meta"><span>Made to order</span><span>Daily · 5–11 pm</span></div>
   </div>
   <div className="hero-showcase">
    <span className="hero-ordinal" aria-hidden="true">THE NIGHT MENU <i/> 0{index + 1} / 0{dishes.length}</span>
    <div className="dish-stage">
     <link rel="preload" as="image" href={dishes[(index+1)%dishes.length].image}/>
     <AnimatePresence initial={false} custom={slide.direction}>
      <motion.img fetchPriority={index===0?'high':'auto'} className="hero-dish" onError={event=>{
       const fallback=heroDishes[index].image;
       if(event.currentTarget.getAttribute('src')!==fallback) event.currentTarget.src=fallback;
      }} key={dish.image + dish.name} src={dish.image} alt={dish.name} custom={slide.direction} variants={dishMotion} initial={reduced?false:'enter'} animate="show" exit={reduced?undefined:'exit'} transition={{duration:reduced?0:.53,ease:[.22,1,.36,1]}}/>
     </AnimatePresence>
    </div>
    <div className="dish-caption"><span>{dish.category}</span><strong>{dish.name}</strong>
     <div className="hero-progress" aria-hidden="true">{dishes.map((entry,i)=><i key={entry.name} className={index===i?'active':''}/>)}</div>
    </div>
   </div>
  </div><a href="#experience" className="hero-scroll" aria-label="Skip to the experience"><ArrowDown size={17}/></a></div>
 </section>;
}

const clips = [['plating','At the pass'],['pastry','The pastry counter'],['table','Around the table'],['coffee','The final pour']];
export function FilmCards() {
 const section = useRef(null);
 const reduced = useReducedMotion();
 const [visible, setVisible] = useState(false);
 const [playing, setPlaying] = useState(null);
 const active = (playing ?? !reduced) && visible;
 useEffect(() => {
  if (!window.IntersectionObserver) { setVisible(true); return; }
  const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
  observer.observe(section.current);
  return () => observer.disconnect();
 }, []);
 useEffect(() => {
  section.current.querySelectorAll('video').forEach(video => {
   if (active) video.play().catch(() => {});
   else video.pause();
  });
 }, [active]);
 return <section id="experience" className="container section films" ref={section}>
  <div className="film-heading"><Heading as="h2" label="01 / The atmosphere" title="An evening in motion">A glimpse of what happens between the kitchen and the table.</Heading>
   <button className="button secondary" type="button" onClick={() => setPlaying(!(playing ?? !reduced))}>{(playing ?? !reduced) ? <><Pause size={15}/> Pause clips</> : <><Play size={15}/> Play clips</>}</button></div>
  <div className="film-grid">{clips.map(([file,title],index) => <figure className="film-card" key={file}>
   <video muted loop playsInline preload="none" poster={`/motion/${file}.jpg`} src={`/motion/${file}.mp4`} aria-hidden="true"/>
   <figcaption><span>0{index + 1}</span>{title}</figcaption>
  </figure>)}</div>
 </section>;
}
