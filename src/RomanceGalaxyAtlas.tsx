import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { atlasNodes, atlasZones, AtlasNode, getZone } from './romanceAtlasData';

const h = createElement;
const rot = new THREE.Euler(-0.13, 0.26, 0.03);

function rand(seed: number) {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function ease(t: number) { return t * t * (3 - 2 * t); }
function nodePos(n: AtlasNode) {
  const z = getZone(n.zoneId);
  const y = z.band + n.bandOffset;
  const flat = Math.sqrt(Math.max(0.2, 1 - y * y));
  const r = z.radius + n.radiusOffset;
  return new THREE.Vector3(Math.cos(n.theta) * r * flat, y, Math.sin(n.theta) * r * 0.72 * flat).applyEuler(rot);
}
function mix(a: THREE.Vector3, b: THREE.Vector3, t: number) { return a.clone().lerp(b, t); }
function bezier(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, t: number) { return mix(mix(a,b,t), mix(b,c,t), t); }

function PointMat({ opacity = 1, maxSize = 8 }: { opacity?: number; maxSize?: number }) {
  return h('shaderMaterial', {
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: opacity }, uMax: { value: maxSize } },
    vertexShader: `attribute float aSize; attribute vec3 aColor; varying vec3 vColor; uniform float uMax; void main(){vColor=aColor; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=clamp(aSize*(320.0/max(1.0,-mv.z)),0.6,uMax); gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform float uOpacity; varying vec3 vColor; void main(){vec2 p=gl_PointCoord-vec2(.5); float d=length(p); float a=smoothstep(.5,.04,d); if(a<.025) discard; gl_FragColor=vec4(vColor,a*uOpacity);}`
  });
}
function geom(count: number, seed: number, fn: (i: number, r: () => number) => { p: THREE.Vector3; c: THREE.Color; s: number }) {
  const r = rand(seed); const pos = new Float32Array(count*3); const col = new Float32Array(count*3); const size = new Float32Array(count);
  for (let i=0;i<count;i++){const it=fn(i,r); pos.set([it.p.x,it.p.y,it.p.z],i*3); col.set([it.c.r,it.c.g,it.c.b],i*3); size[i]=it.s;}
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos,3)); g.setAttribute('aColor', new THREE.BufferAttribute(col,3)); g.setAttribute('aSize', new THREE.BufferAttribute(size,1)); return g;
}
function Background() {
  const g = useMemo(()=>geom(2400, 42, (_i,r)=>{const a=r()*Math.PI*2; const rr=16+r()*30; return {p:new THREE.Vector3(Math.cos(a)*rr,(r()-.5)*18,Math.sin(a)*rr), c:new THREE.Color(r()>.55?'#f5d5ff':'#9fffee'), s:.012+r()*.03};}), []);
  return h('points', { geometry:g }, h(PointMat, { opacity:.38, maxSize:3.5 }));
}
function GalaxyCloud() {
  const g = useMemo(()=>geom(22000, 9101, (_i,r)=>{const zone=atlasZones[Math.floor(r()*atlasZones.length)]; const t=r()*Math.PI*2; const shell=Math.pow(r(),.48); const y=zone.band+(r()-.5)*.17; const arm=Math.sin(t*5+shell*4)*.09; const rr=.35+shell*(zone.radius+.38)+arm; const p=new THREE.Vector3(Math.cos(t)*rr*Math.sqrt(Math.max(.22,1-y*y)),y,Math.sin(t)*rr*.72); p.applyEuler(rot); const c=new THREE.Color(zone.color).lerp(new THREE.Color('#ffffff'), r()*.16); return {p,c,s:.009+Math.pow(r(),2.4)*.045};}), []);
  return h('points', { geometry:g }, h(PointMat, { opacity:.62, maxSize:6 }));
}
function ZoneRings() {
  return h('group', null, atlasZones.map(z=>h(ZoneRing,{key:z.id,zone:z})));
}
function ZoneRing({ zone }: any) {
  const g = useMemo(()=>{const pts:THREE.Vector3[]=[]; for(let i=0;i<=260;i++){const t=i/260*Math.PI*2; const y=zone.band; const flat=Math.sqrt(Math.max(.2,1-y*y)); const p=new THREE.Vector3(Math.cos(t)*zone.radius*flat,y,Math.sin(t)*zone.radius*.72*flat).applyEuler(rot); pts.push(p);} return new THREE.BufferGeometry().setFromPoints(pts);},[zone]);
  return h('line',{geometry:g},h('lineBasicMaterial',{color:zone.accent,transparent:true,opacity:.18,blending:THREE.AdditiveBlending}));
}
function NodeOrb({ n, active, onClick }: { n: AtlasNode; active: boolean; onClick: () => void }) {
  const p = nodePos(n); const z = getZone(n.zoneId); const size=.018*n.weight;
  return h('group',{position:p,onClick:(e:any)=>{e.stopPropagation();onClick();}},[
    h('mesh',{key:'halo'},h('sphereGeometry',{args:[active?.13:.055*n.weight,24,24]}),h('meshBasicMaterial',{color:z.accent,transparent:true,opacity:active?.28:.12,blending:THREE.AdditiveBlending})),
    h('mesh',{key:'core'},h('sphereGeometry',{args:[Math.max(.018,size),24,24]}),h('meshStandardMaterial',{color:z.color,emissive:z.accent,emissiveIntensity:active?1.8:.75,roughness:.28})),
    active?h(Html,{key:'label',center:true,distanceFactor:6,position:[.12,.08,0]},h('span',{className:'atlas-label'},n.title)):null
  ]);
}
function LocalField({ n, keySeed }: { n: AtlasNode; keySeed: number }) {
  const ref=useRef<THREE.Group>(null); const age=useRef(0); const z=getZone(n.zoneId); const p=nodePos(n);
  useEffect(()=>{age.current=0;},[keySeed]);
  useFrame((_s,d)=>{age.current=Math.min(1,age.current+d*.7); if(ref.current){const e=ease(age.current); ref.current.scale.setScalar(.15+e*.95);}});
  const g=useMemo(()=>geom(2600,n.id.length*1009,(_i,r)=>{const a=r()*Math.PI*2; const rr=Math.pow(r(),.58)*.9; const p=new THREE.Vector3(Math.cos(a)*rr,(r()-.5)*.42,Math.sin(a)*rr*.72); const c=new THREE.Color(z.color).lerp(new THREE.Color(z.accent),r()*.7); return {p,c,s:.012+r()*.04};}),[n.id,z.color,z.accent]);
  return h('group',{ref,position:p,rotation:[.08,-.25,.04]},[
    h('points',{key:'dust',geometry:g},h(PointMat,{opacity:.78,maxSize:7})),
    h(LocalRing,{key:'a',color:z.accent,rx:1.05,rz:.56,opacity:.32}),
    h(LocalRing,{key:'b',color:'#ffffff',rx:.7,rz:.9,opacity:.12}),
    h('pointLight',{key:'light',color:z.accent,intensity:1.2,distance:3})
  ]);
}
function LocalRing({ color, rx, rz, opacity }: any) {
  const g=useMemo(()=>{const pts:THREE.Vector3[]=[]; for(let i=0;i<=180;i++){const t=i/180*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(t)*rx,Math.sin(t*2)*.04,Math.sin(t)*rz));} return new THREE.BufferGeometry().setFromPoints(pts);},[rx,rz]);
  return h('line',{geometry:g,rotation:[.35,.1,.22]},h('lineBasicMaterial',{color,transparent:true,opacity,blending:THREE.AdditiveBlending}));
}
function FocusCam({ active }: { active: AtlasNode | null }) {
  const { camera } = useThree(); const start=useRef(new THREE.Vector3()); const end=useRef(new THREE.Vector3()); const ctrl=useRef(new THREE.Vector3()); const time=useRef(1); const last=useRef('');
  useEffect(()=>{if(!active||last.current===active.id)return; last.current=active.id; const target=nodePos(active); start.current.copy(camera.position); end.current.copy(target.clone().normalize().multiplyScalar(2.7).add(target.clone().multiplyScalar(.5))); ctrl.current.copy(start.current.clone().lerp(end.current,.45).add(new THREE.Vector3(0,.9,.55))); time.current=0;},[active,camera]);
  useFrame((_s,d)=>{if(!active||time.current>=1)return; time.current=Math.min(1,time.current+d*.55); const t=ease(time.current); camera.position.copy(bezier(start.current,ctrl.current,end.current,t)); camera.lookAt(nodePos(active));}); return null;
}
function Controls({ active }: { active: AtlasNode | null }) { const ref=useRef<any>(null); useFrame(()=>{if(ref.current&&active){ref.current.target.lerp(nodePos(active),.08); ref.current.update();}}); return h(OrbitControls as any,{ref,enableDamping:true,dampingFactor:.08,minDistance:1.5,maxDistance:8,enablePan:false}); }
function Scene({ active, setActive }: { active: AtlasNode | null; setActive: (n:AtlasNode)=>void }) { const [keySeed,setKey]=useState(0); useEffect(()=>{if(active)setKey(k=>k+1);},[active]); return h('group',null,[h('ambientLight',{key:'amb',intensity:.45}),h('pointLight',{key:'p1',position:[3,2,4],intensity:1.2,color:'#ffd8ef'}),h(Background,{key:'bg'}),h(FocusCam,{key:'cam',active}),h(GalaxyCloud,{key:'cloud'}),h(ZoneRings,{key:'rings'}),...atlasNodes.map(n=>h(NodeOrb,{key:n.id,n,active:active?.id===n.id,onClick:()=>setActive(n)})),active?h(LocalField,{key:active.id,n:active,keySeed}):null,h(Controls,{key:'ctl',active})]); }
export default function RomanceGalaxyAtlas(){const [active,setActive]=useState<AtlasNode|null>(null); const zone=active?getZone(active.zoneId):null; return h('div',{className:'atlas-shell'},[h('div',{className:'atlas-canvas'},h(Canvas,{camera:{position:[0,.35,5.1],fov:45},dpr:[1,1.7],gl:{antialias:true,alpha:true}},h(Scene,{active,setActive}))),h('div',{className:'atlas-ui'},[h('section',{className:'atlas-title'},[h('p',null,'ROMANCE GALAXY ATLAS'),h('h1',null,'浪漫星系'),h('span',null,'拖动旋转 · 点击光点飞入 · Esc 返回总览')]),h('aside',{className:'atlas-card'},[h('p',null,active?zone?.subtitle:'SELECT A MEMORY ZONE'),h('h2',null,active?active.title:'108 个浪漫节点'),h('p',null,active?active.line:'这是 poem-galaxy 同构的浪漫主题项目：大规模 3D 星系、分区星带、点击飞入和局部星域。'),h('div',{className:'atlas-tags'},(active?[zone?.title,'局部星域','静态观测']:['初见','月光','雨夜','极光','星港','誓约']).map(x=>h('span',{key:x},x)))]),h('nav',{className:'atlas-zones'},atlasZones.map(z=>h('button',{key:z.id,onClick:()=>setActive(atlasNodes.find(n=>n.zoneId===z.id)!)},z.title)))] )]);}
