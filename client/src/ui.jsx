import React,{useEffect,useId,useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {api} from './api';
export function Reveal({children,className=''}){
 const reduced=useReducedMotion();
 return <motion.div className={className} initial={reduced?false:{y:18,rotateX:3}} whileInView={{y:0,rotateX:0}} viewport={{once:true,amount:.12}} transition={{duration:.55}}>{children}</motion.div>;
}
export function Heading({label,title,children,as:Title='h1'}){
 return <header className="section-heading"><p className="eyebrow">{label}</p><Title>{title}</Title>{children&&<p className="muted">{children}</p>}</header>;
}
export function Feedback({loading,error,empty}){
 return loading?<p className="feedback" role="status"><span className="spinner"/> Loading…</p>:error?<p className="feedback error" role="alert">{error}</p>:empty?<p className="feedback">{empty}</p>:null;
}
export function Field({label,error,children,wide=false}){
 const id=useId();
 return <label className={wide?'wide':''} htmlFor={id}><span id={id+'-label'}>{label}</span>{React.cloneElement(children,{id,'aria-labelledby':id+'-label','aria-invalid':error?true:undefined,'aria-describedby':error?id+'-error':undefined})}{error&&<span id={id+'-error'} className="field-error">{error.message}</span>}</label>;
}
export function useData(path,token,revision=0){
 const [state,setState]=useState({data:null,loading:true,error:'',status:null});
 useEffect(()=>{
  const controller=new AbortController();
  setState({data:null,loading:true,error:'',status:null});
  api(path,{token,signal:controller.signal}).then(data=>{if(!controller.signal.aborted) setState({data,loading:false,error:'',status:null});}).catch(error=>{
   if(!controller.signal.aborted) setState({data:null,loading:false,error:error.message,status:error.status});
  });
  return ()=>controller.abort();
 },[path,token,revision]);
 return state;
}
