import React,{lazy,Suspense,useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,Link,useLocation} from 'react-router-dom';
import {MotionConfig} from 'framer-motion';
import {PublicLayout,Home,Menu,Reservations,Contact} from './public';
const adminPage=(name)=>lazy(()=>import('./admin').then(module=>({default:module[name]})));
const AdminShell=adminPage('AdminShell');
const Dashboard=adminPage('Dashboard');
const ManageBookings=adminPage('ManageBookings');
const Resource=adminPage('Resource');
const Customers=adminPage('Customers');
const Messages=adminPage('Messages');
const AdminFallback=adminPage('AdminFallback');
import {Feedback,Heading} from './ui';
import './style.css';
import './cinema.css';

function App(){
 const {pathname}=useLocation();
 useLayoutEffect(()=>{
  window.scrollTo({top:0,behavior:'instant'});
 },[pathname]);
 return <MotionConfig reducedMotion="user"><Suspense fallback={<Feedback loading/>}><Routes>
  <Route element={<PublicLayout/>}>
   <Route index element={<Home/>}/><Route path="menu" element={<Menu/>}/><Route path="reservations" element={<Reservations/>}/><Route path="contact" element={<Contact/>}/>
   <Route path="*" element={<section className="container section"><Heading label="404" title="Page not found"/><Link className="button" to="/">Back to NOIRÉ</Link></section>}/>
  </Route>
  <Route path="admin" element={<AdminShell/>}>
   <Route index element={<Dashboard/>}/><Route path="reservations" element={<ManageBookings/>}/><Route path="tables" element={<Resource key="tables" kind="tables"/>}/><Route path="menu" element={<Resource key="menu" kind="menu"/>}/><Route path="customers" element={<Customers/>}/><Route path="messages" element={<Messages/>}/><Route path="*" element={<AdminFallback/>}/>
  </Route>
 </Routes></Suspense></MotionConfig>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
