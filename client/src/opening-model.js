import {
 AmbientLight, BoxGeometry, Color, CylinderGeometry, DirectionalLight, Group, HemisphereLight,
 Mesh, MeshStandardMaterial, OrthographicCamera, PCFShadowMap, PlaneGeometry, Scene,
 SphereGeometry, CanvasTexture, SRGBColorSpace, WebGLRenderer
} from './vendor/three.module.min.js';

const shades = {
 foundation:0x242023, stone:0x53473d, mortar:0x6b5140, wall:0x393030, dark:0x1b181b,
 brass:0xcf9b57, glass:0x805833, roof:0x29252b, awning:0x672d27, cream:0xe7bb81,
 green:0x586545, leaf:0x82905a, chair:0x824c37
};
const duration = 4200;

export function playOpening(canvas, onFinish) {
 const renderer = new WebGLRenderer({canvas, antialias:true, alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
 renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = PCFShadowMap;
 renderer.outputColorSpace = SRGBColorSpace;
 const scene = new Scene();
 const camera = new OrthographicCamera(-5,5,5,-5,.1,55);
 const model = new Group();
 scene.add(model);
 const key = new DirectionalLight(0xffd4a5,3);
 key.position.set(4,9,5);
 key.castShadow = true;
 key.shadow.mapSize.set(1024,1024);
 Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,far:24});
 key.shadow.normalBias = .035;
 scene.add(key,new HemisphereLight(0xffe1ba,0x443038,1.55),new AmbientLight(0x957b86,.33));

 const materials = Object.fromEntries(Object.entries(shades).map(([name,color])=>[name,new MeshStandardMaterial({
  color,roughness:name==='glass'?.43:.76,metalness:name==='brass'?.42:0,
  ...(name==='glass'?{emissive:new Color(0xb76a2b),emissiveIntensity:.52}:{})
 })]));
 const boxGeo = new BoxGeometry(1,1,1);
 const ballGeo = new SphereGeometry(1,10,8);
 const cylinder = new CylinderGeometry(1,.8,1,12);
 const groups = [];
 function step(start, height, x=0, z=0) {
  const group = new Group();
  group.visible = false;
  model.add(group);
  groups.push({group,start,height,x,z});
  return group;
 }
 function shape(parent, geometry, material, x,y,z,w,h,d) {
  const mesh = new Mesh(geometry,typeof material==='string'?materials[material]:material);
  mesh.position.set(x,y,z);
  mesh.scale.set(w,h,d);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
 }
 const box = (p,m,x,y,z,w,h,d) => shape(p,boxGeo,m,x,y,z,w,h,d);
 const round = (p,m,x,y,z,w,h,d) => shape(p,cylinder,m,x,y,z,w,h,d);

 const plinth = step(0,1.1);
 box(plinth,'foundation',0,.17,0,6.3,.34,5.6);
 box(plinth,'stone',0,.39,0,6.02,.13,5.34);
 box(plinth,'brass',0,.28,0,6.25,.026,5.55);
 for(let x=-2.75;x<3;x+=.55){
  for(let z=-2.45;z<2.6;z+=.55){
   box(plinth,(Math.round(x*10+z*10)%3===0?'mortar':'stone'),x,.466,z,.532,.04,.53);
  }
 }
 const structure = step(.46,2.6,-.32,.16);
 box(structure,'wall',0,1.39,-.32,4.02,1.83,2.94);
 box(structure,'dark',0,.63,-.32,4.1,.28,3.04);
 box(structure,'wall',0,2.44,-.32,4.16,.43,3.03);
 const fixtures = step(.91,2.6,.38,.32);
 for(const x of [-1.45,-.58,.48,1.38]){
  const door=x===.48;
  const y=door?1.28:1.56;
  const height=door?1.51:1.06;
  box(fixtures,'dark',x,y,1.178,.77,height+.14,.085);
  box(fixtures,'glass',x,y,1.228,.68,height,.037);
  box(fixtures,'brass',x,y,1.253,.025,height,.025);
  box(fixtures,'brass',x,y+.16,1.253,.69,.026,.025);
  if(!door) box(fixtures,'stone',x,y-.59,1.26,.81,.065,.20);
  else box(fixtures,'brass',x+.22,y-.1,1.285,.035,.19,.042);
 }
 for(const z of [-1.3,-.36,.58]){
  box(fixtures,'dark',2.027,1.56,z,.084,1.18,.8);
  box(fixtures,'glass',2.073,1.56,z,.032,1.04,.71);
  box(fixtures,'brass',2.099,1.56,z,.023,1.06,.022);
  box(fixtures,'brass',2.099,1.75,z,.023,.024,.72);
  box(fixtures,'stone',2.13,.96,z,.21,.072,.82);
 }
 for(const x of [-1.96,-1.02,-.12,.94,1.94]){
  box(fixtures,'dark',x,1.59,1.232,.09,1.89,.13);
  box(fixtures,'brass',x,1.58,1.303,.019,1.84,.016);
 }
 const rooftop = step(1.22,2.8,.07,-.35);
 box(rooftop,'dark',0,2.71,-.32,4.32,.15,3.18);
 box(rooftop,'brass',0,2.78,-.32,4.33,.035,3.2);
 box(rooftop,'roof',0,2.82,-.32,4.23,.07,3.10);
 for(const z of [-1.82,1.17]) box(rooftop,'wall',0,2.95,z,4.2,.24,.13);
 for(const x of [-2.04,2.04]) box(rooftop,'wall',x,2.95,-.32,.13,.24,2.94);
 box(rooftop,'stone',-.99,2.98,-.96,.65,.25,.68);
 box(rooftop,'dark',-.99,3.14,-.96,.72,.075,.73);
 for(let z=-.81;z>-1.18;z-=.105) box(rooftop,'brass',-.99,3.18,z,.49,.02,.022);
 for(let x=-1.72;x<1.94;x+=.32) box(rooftop,'dark',x,2.86,-.27,.014,.014,2.62);

 const awnings = step(1.68,2.9,-.45,.55);
 const canopy = box(awnings,'awning',-.77,2.21,1.48,2.46,.094,.68);
 canopy.rotation.x=.20;
 for(let x=-1.88;x<.45;x+=.23) box(awnings,'brass',x,2.165,1.806,.025,.035,.028);
 const rightCanopy = box(awnings,'awning',2.28,2.22,-.32,.59,.089,2.66);
 rightCanopy.rotation.z=-.20;
 box(awnings,'brass',2.565,2.167,-.32,.045,.043,2.64);
 box(awnings,'brass',.72,2.50,1.235,2.47,.35,.08);
 const sign = document.createElement('canvas');
 sign.width=768; sign.height=118;
 const ctx=sign.getContext('2d');
 ctx.fillStyle='#241a18'; ctx.fillRect(0,0,768,118);
 ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#f4c486';
 ctx.font='68px Georgia'; ctx.fillText('N O I R É',384,63);
 const lettering = new CanvasTexture(sign);
 lettering.colorSpace = SRGBColorSpace;
 const signMaterial = new MeshStandardMaterial({map:lettering,roughness:.65});
 shape(awnings,new PlaneGeometry(1,1),signMaterial,.72,2.50,1.282,2.4,.29,1);

 for(const [x,z,delay] of [[-2.58,1.43,1.97],[2.57,1.56,2.02],[-1.99,2.25,2.10],[2.60,-1.32,2.14]]){
  const plant=step(delay,2.6,x*.12,z*.12);
  round(plant,'chair',x,.63,z,.19,.33,.19);
  round(plant,'dark',x,.81,z,.175,.045,.175);
  for(const [dx,dz,dy] of [[0,0,.31],[.12,.03,.22],[-.12,.08,.20],[.04,-.13,.19]]){
   shape(plant,ballGeo,dy>.25?'leaf':'green',x+dx,.81+dy,z+dz,.14,.19,.13);
  }
 }
 for(const [x,z,delay] of [[-.9,1.95,2.12],[1.5,1.98,2.27]]){
  const patio=step(delay,2.4);
  round(patio,'dark',x,.68,z,.052,.40,.052);
  round(patio,'chair',x,.90,z,.31,.056,.31);
  for(const side of [-1,1]){
   const cx=x+side*.46;
   box(patio,'dark',cx,.615,z,.21,.27,.21);
   box(patio,'chair',cx,.76,z,.25,.066,.27);
   box(patio,'chair',cx+side*.115,.88,z,.041,.23,.27);
  }
  round(patio,'cream',x,.96,z,.043,.07,.043);
 }

 function resize(){
  const {clientWidth:w,clientHeight:h}=canvas;
  if(!w||!h) return;
  const ratio=w/h;
  const vertical=Math.max(4.18,4.75/ratio);
  Object.assign(camera,{left:-vertical*ratio,right:vertical*ratio,top:vertical,bottom:-vertical});
  camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
 }
 const observer=new ResizeObserver(resize);
 observer.observe(canvas);
 resize();
 const started=performance.now();
 let frame;
 function draw(now){
  const time=(now-started)/1000;
  for(const {group,start,height,x,z} of groups){
   const progress=Math.min(1,Math.max(0,(time-start)/.68));
   group.visible=progress>0;
   const glide=1-Math.pow(1-progress,3);
   group.position.set(x*(1-glide),height*(1-glide),z*(1-glide));
   group.rotation.y=(1-glide)*.24;
  }
  const angle=.85-Math.min(time/4,1)*.34;
  camera.position.set(Math.sin(angle)*11,7.3,Math.cos(angle)*11);
  camera.lookAt(0,1.35,0);
  renderer.render(scene,camera);
  if(now-started<duration) frame=requestAnimationFrame(draw);
  else onFinish();
 }
 frame=requestAnimationFrame(draw);
 return ()=>{
  cancelAnimationFrame(frame);
  observer.disconnect();
  const geometries=new Set();
  const allMaterials=new Set();
  scene.traverse(object=>{
   if(object.isMesh){ geometries.add(object.geometry); allMaterials.add(object.material); }
  });
  geometries.forEach(geometry=>geometry.dispose());
  allMaterials.forEach(material=>material.dispose());
  lettering.dispose();
  renderer.dispose();
 };
}
