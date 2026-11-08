import React,{useState} from 'react';
import {Link,NavLink,Navigate,Outlet,useLocation,useOutletContext} from 'react-router-dom';
import {ArrowUpRight,Calendar,ChartNoAxesColumn,Mail,Users,Utensils,Armchair,LogOut} from 'lucide-react';
import {api,price} from './api';
import {Feedback,Field,Heading,useData} from './ui';

const links=[['','Overview',ChartNoAxesColumn],['reservations','Reservations',Calendar],['tables','Tables',Armchair],['menu','Menu',Utensils],['customers','Customers',Users],['messages','Messages',Mail]];
const statuses=['pending','confirmed','rejected','completed','cancelled'];
export function AdminShell(){
 const {pathname}=useLocation();
 const [token,setToken]=useState(()=>sessionStorage.getItem('noire-token')||'');
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const logout=()=>{sessionStorage.removeItem('noire-token');setToken('');};
 async function login(event){
  event.preventDefault();setBusy(true);setError('');
  try{
   const data=Object.fromEntries(new FormData(event.currentTarget));
   const session=await api('/auth/login',{method:'post',data});
   sessionStorage.setItem('noire-token',session.token);setToken(session.token);
  }catch(error){setError(error.message);}
  finally{setBusy(false);}
 }
 if(!token)return <main className="container section narrow login route-content"><Link className="wordmark" to="/">NOIRÉ<span>DINING AFTER DARK</span></Link><Heading label="Staff access" title="Sign in"/><form className="panel stack" onSubmit={login}><Field label="Admin email"><input name="email" type="email" autoComplete="username" required/></Field><Field label="Password"><input name="password" type="password" autoComplete="current-password" required/></Field><Feedback error={error}/><button className="button" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowUpRight size={16}/></button></form></main>;
 return <div className="admin-layout"><aside className="admin-nav">
  <Link to="/" className="wordmark">NOIRÉ<span>RESTAURANT MANAGEMENT</span></Link>
  <nav aria-label="Admin navigation">{links.map(([route,label,Icon])=><NavLink end={!route} key={label} to={route||'.'}><Icon size={17}/>{label}</NavLink>)}</nav>
  <button className="text-link" onClick={logout}><LogOut size={16}/> Sign out</button>
 </aside><main className="admin-main"><div className="route-content" key={pathname}><Outlet context={{token,logout}}/></div></main></div>;
}
function useAdmin(path,revision=0){
 const {token,logout}=useOutletContext();
 return {...useData('/admin'+path,token,revision),token,logout};
}
function AdminFeedback({status,logout,...feedback}){
 return <><Feedback {...feedback}/>{(status===401||status===403)&&<button className="button secondary" onClick={logout}>Return to sign in</button>}</>;
}
function BookingList({rows}){
 return rows.length?<div className="list">{rows.map(row=><div key={row._id} className="list-row"><div><strong>{row.name}</strong><small>{row.date} · {row.time} · {row.guests} guests</small></div><span className="tag">{row.status}</span></div>)}</div>:<Feedback empty="No reservations yet."/>;
}
export function Dashboard(){
 const state=useAdmin('/dashboard');
 const d=state.data;
 return <><Heading label="Management" title="Service overview">Live reservation and table activity.</Heading><AdminFeedback {...state}/>
  {d&&<><div className="stats">{[['Reservations',d.total],['Today',d.today],['Available now',d.available],['Occupied now',d.occupied],['Customers',d.customers],['Revenue · demo',price(82500)]].map(([label,value])=><div className="panel stat" key={label}><p>{label}</p><strong>{value}</strong></div>)}</div>
  <div className="dashboard-grid"><section className="panel"><h2>Reservation trends</h2><p className="muted">Bookings by dining date · last seven days</p><div className="chart">{d.trends.map(day=><div key={day.date}><span>{day.count}</span><i style={{height:(day.count/Math.max(1,...d.trends.map(x=>x.count))*100+3)+'px'}}/><small>{day.date.slice(5)}</small></div>)}</div></section>
  <section className="panel"><h2>Recent bookings</h2><BookingList rows={d.recent}/></section>
  <section className="panel"><h2>Customer activity</h2>{d.activity.length?d.activity.map(customer=><div className="list-row" key={customer._id}><strong>{customer.name}</strong><small>{customer.email}</small></div>):<Feedback empty="No customer activity yet."/>}</section></div></>}
 </>;
}
const definitions={
 tables:{title:'Tables',fields:[['number','Table number'],['capacity','Capacity','number'],['category','Category'],['available','Accepts reservations','checkbox']],summary:row=>`${row.capacity} seats · ${row.category}`,name:row=>'Table '+row.number},
 menu:{title:'Menu',fields:[['name','Dish name'],['category','Category'],['description','Description','textarea'],['price','Price (PKR)','number'],['image','Image URL (HTTPS) or bundled photo path'],['available','Available','checkbox']],summary:row=>`${row.category} · ${price(row.price)}`,name:row=>row.name}
};
function EditorFields({fields,row}){
 return fields.map(([name,label,type])=><Field key={name} label={label} wide={type==='textarea'}>
  {type==='textarea'?<textarea name={name} defaultValue={row[name]} required rows={3}/>:type==='checkbox'?<input name={name} type="checkbox" defaultChecked={row[name]??true}/>:<input type={type||'text'} name={name} defaultValue={row[name]} min={type==='number'?0:undefined} step={name==='price'?'0.01':undefined} required/>}
 </Field>);
}
function useMutation(token){
 const [revision,setRevision]=useState(0);
 const [action,setAction]=useState({busy:false,error:''});
 async function mutate(path,method,data){
  setAction({busy:true,error:''});
  try{await api('/admin'+path,{method,data,token});setRevision(n=>n+1);setAction({busy:false,error:''});return true;}
  catch(error){setAction({busy:false,error:error.message});return false;}
 }
 return {revision,action,mutate};
}
export function Resource({kind}){
 const {token}=useOutletContext();
 const {revision,action,mutate}=useMutation(token);
 const state=useAdmin('/'+kind,revision);
 const [editing,setEditing]=useState(null);
 const def=definitions[kind];
 async function submit(event){
  event.preventDefault();
  const values=new FormData(event.currentTarget);
  const data=Object.fromEntries(def.fields.map(([name,,type])=>[name,type==='checkbox'?values.has(name):values.get(name)]));
  if(await mutate('/'+kind+(editing._id?'/'+editing._id:''),editing._id?'patch':'post',data))setEditing(null);
 }
 return <><Heading label="Management" title={def.title}/><div className="toolbar"><button className="button" onClick={()=>setEditing({})}>Add {kind==='menu'?'dish':'table'}</button></div><AdminFeedback {...state} empty={state.data?.length===0?'No records yet.':null}/><Feedback error={action.error}/>
  {editing&&<form key={editing._id||'new'} className="panel form-grid admin-editor" onSubmit={submit}><h2 className="wide">{editing._id?'Edit record':'New record'}</h2><EditorFields fields={def.fields} row={editing}/><div className="wide actions"><button disabled={action.busy} className="button">Save</button><button type="button" className="button secondary" onClick={()=>setEditing(null)}>Close editor</button></div></form>}
  <div className="list">{state.data?.map(row=><article className="list-row" key={row._id}><div><strong>{def.name(row)}</strong><small>{def.summary(row)} · {row.available?'Available':'Unavailable'}</small></div><div className="actions"><button className="button secondary compact" onClick={()=>setEditing(row)}>Edit</button><button disabled={action.busy} className="button secondary compact" onClick={()=>{if(window.confirm('Delete this record?'))void mutate('/'+kind+'/'+row._id,'delete');}}>Delete</button></div></article>)}</div>
 </>;
}
export function ManageBookings(){
 const {token}=useOutletContext();
 const {revision,action,mutate}=useMutation(token);
 const state=useAdmin('/reservations',revision);
 const tables=useAdmin('/tables');
 const [query,setQuery]=useState('');
 const [status,setStatus]=useState('');
 const [editing,setEditing]=useState(null);
 const rows=state.data?.filter(row=>(!status||row.status===status)&&[row.reference,row.name,row.email,row.date].some(value=>value.toLowerCase().includes(query.trim().toLowerCase())));
 async function submit(event){
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget));
  if(await mutate('/reservations/'+editing._id,'patch',data))setEditing(null);
 }
 return <><Heading label="Management" title="Reservations"/><div className="toolbar"><input type="search" aria-label="Search reservations" placeholder="Search by name, email or reference" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filter by status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><AdminFeedback {...state} empty={rows?.length===0?'No matching reservations.':null}/><Feedback error={action.error}/>
  {editing&&<form key={editing._id} className="panel form-grid admin-editor" onSubmit={submit}>
   <h2 className="wide">{editing.name}</h2><p className="wide muted reference">{editing.reference}<br/>{editing.email} · {editing.phone}</p>
   <Field label="Date"><input name="date" type="date" defaultValue={editing.date} required/></Field>
   <Field label="Time"><input name="time" type="time" step="1800" min="17:00" max="21:30" defaultValue={editing.time} required/></Field>
   <Field label="Guests"><input name="guests" type="number" min="1" max="30" defaultValue={editing.guests} required/></Field>
   <Field label="Table"><select name="table" defaultValue={editing.table?._id} required>{editing.table&&!tables.data?.some(t=>t._id===editing.table._id)&&<option value={editing.table._id}>{editing.table.number}</option>}{tables.data?.map(t=><option key={t._id} value={t._id}>Table {t.number} · {t.capacity} seats</option>)}</select></Field>
   <Field label="Status"><select name="status" defaultValue={editing.status}>{statuses.map(s=><option key={s}>{s}</option>)}</select></Field>
   <Field label="Special requests" wide><textarea name="notes" defaultValue={editing.notes} maxLength={1200}/></Field>
   <div className="wide actions"><button className="button" disabled={action.busy}>Save reservation</button><button type="button" className="button secondary" onClick={()=>setEditing(null)}>Close editor</button></div>
  </form>}
  <div className="list">{rows?.map(row=><article className="list-row" key={row._id}><div><strong>{row.name}</strong><small>{row.date} · {row.time} · Table {row.table?.number} · {row.guests} guests</small></div><div className="actions"><span className="tag">{row.status}</span><button className="button secondary compact" onClick={()=>setEditing(row)}>View / edit</button></div></article>)}</div>
 </>;
}
function CustomerDetail({id}){
 const state=useAdmin('/customers/'+id);
 return <section className="panel"><AdminFeedback {...state}/>{state.data&&<><h2>{state.data.customer.name}</h2><p className="muted">{state.data.customer.email} · {state.data.customer.phone}</p><h3>Booking history</h3><BookingList rows={state.data.bookings}/></>}</section>;
}
export function Customers(){
 const state=useAdmin('/customers');
 const [selected,setSelected]=useState(null);
 return <><Heading label="Management" title="Customers"/><AdminFeedback {...state} empty={state.data?.length===0?'No customers yet.':null}/>
  {selected&&<CustomerDetail id={selected}/>}<div className="list">{state.data?.map(row=><div className="list-row" key={row._id}><div><strong>{row.name}</strong><small>{row.email} · {row.phone}</small></div><button className="button secondary compact" onClick={()=>setSelected(selected===row._id?null:row._id)}>{selected===row._id?'Close profile':'View profile'}</button></div>)}</div></>;
}
export function Messages(){
 const {token}=useOutletContext();
 const {revision,action,mutate}=useMutation(token);
 const state=useAdmin('/messages',revision);
 return <><Heading label="Management" title="Inbox"/><AdminFeedback {...state} empty={state.data?.length===0?'No messages yet.':null}/><Feedback error={action.error}/>
  <div className="stack">{state.data?.map(row=><article className="panel message" key={row._id}><p className="eyebrow">{row.read?'Read':'Unread'}</p><h2>{row.subject}</h2><p className="muted">{row.name} · {row.email}</p><p>{row.message}</p><div className="actions"><button disabled={action.busy} className="button secondary compact" onClick={()=>mutate('/messages/'+row._id,'patch',{read:!row.read})}>{row.read?'Mark unread':'Mark read'}</button><button disabled={action.busy} className="button secondary compact" onClick={()=>{if(window.confirm('Delete this message?'))void mutate('/messages/'+row._id,'delete');}}>Delete</button></div></article>)}</div>
 </>;
}
export const AdminFallback=()=> <Navigate to="/admin" replace/>;
