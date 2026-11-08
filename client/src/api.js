import axios from 'axios';
const http=axios.create({baseURL:'/api',timeout:12000});
export async function api(path,{method='get',data,params,token,signal}={}){
 try{
  return (await http({url:path,method,data,params,signal,headers:token?{Authorization:'Bearer '+token}:undefined})).data.data;
 }catch(error){
  if(axios.isCancel(error)) throw error;
  throw Object.assign(new Error(error.response?.data?.error || 'Could not reach the server. Please try again.'),{status:error.response?.status});
 }
}
export const price=(value)=>new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(value);
