import { CSSProperties, createElement, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { nodeSeeds, OrbitNode } from './romanceCore';

const h = createElement;
const el = (tag: string, props?: any, ...children: any[]) => h(tag as any, props, ...children);
const sceneRot = new THREE.Euler(-0.05, -0.18, 0.02);

const vertexShader = `
attribute float size;
attribute vec3 color;
varying vec3 vColor;
void main(){
  vColor=color;
  vec4 mv=modelViewMatrix*vec4(position,1.0);
  gl_PointSize=clamp(size*(340.0/max(1.0,-mv.z)),1.0,18.0);
  gl_Position=projectionMatrix*mv;
}`;
const fragmentShader = `
varying vec3 vColor;
void main(){
  vec2 p=gl_PointCoord-vec2(0.5);
  float d=length(p);
  float a=smoothstep(0.5,0.04,d);
  if(a<0.035) discard;
  gl_FragColor=vec4(vColor,a);
}`;
const dustVertex = `
attribute float size;
attribute vec3 color;
attribute float delay;
uniform float uProgress;
varying vec3 vColor;
varying float vAlpha;
float ease(float t){return 1.0-pow(1.0-t,3.0);} 
void main(){
  float t=clamp((uProgress-delay)/max(0.001,1.0-delay),0.0,1.0);
  float e=ease(t);
  vec3 start=normalize(position+vec3(0.01,0.02,0.03))*0.025;
  vec3 burst=normalize(position+vec3(0.1,-0.04,0.06))*sin(t*3.14159)*0.52;
  vec3 p=mix(start,position,e)+burst*(1.0-e);
  vColor=color;
  vAlpha=smoothstep(0.0,0.12,t)*(1.0-smoothstep(0.72,1.0,t));
  vec4 mv=modelViewMatrix*vec4(p,1.0);
  gl_PointSize=clamp(size*(340.0/max(1.0,-mv.z)),1.0,22.0);
  gl_Position=projectionMatrix*mv;
}`;
const dustFragment = `
varying vec3 vColor;
varying float vAlpha;
void main(){
  vec2 p=gl_PointCoord-vec2(0.5);
  float d=length(p);
  float a=smoothstep(0.5,0.04,d)*vAlpha;
  if(a<0.025) discard;
  gl_FragColor=vec4(vColor,a);
}`;

const detail: Record<string, { kicker: string; title: string; text: string; tags: string[] }> = {
  first: { kicker: 'SCENE 01 · 初见微光', title: '光点碎成花粉，开成第一朵玫瑰', text: '靠近后，星光核心会散成花粉，真正的半透明花瓣从中心生长出来，最后停成静态玫瑰。', tags: ['消散', '花粉', '玫瑰'] },
  rose: { kicker: 'SCENE 02 · 玫瑰星云', title: '一颗光点盛放成玫瑰星体', text: '不是点阵轮廓，而是由多层曲面花瓣组成的 3D 玫瑰，外侧保留少量星尘。', tags: ['花瓣曲面', '盛开', '静态'] },
  moon: { kicker: 'SCENE 03 · 月光来信', title: '月光落在玫瑰花瓣上', text: '光点消散后，月白花瓣与金色信笺环停在一起，像一封藏在玫瑰里的信。', tags: ['月光', '信笺', '玫瑰'] },
  aurora: { kicker: 'SCENE 04 · 极光慢舞', title: '极光从玫瑰背后升起', text: '玫瑰成形后，青绿色光幕停在花瓣背后，像极光凝固在夜空。', tags: ['极光', '光幕', '凝固'] },
  future: { kicker: 'SCENE 05 · 未来光环', title: '玫瑰被未来戒环收藏', text: '花瓣盛开后，多层戒环合拢，成为一个安静的未来坐标。', tags: ['戒环', '星门', '未来'] }
};

function random(seed:number){let s=seed;return()=>{s+=0x6d2b79f5;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return((t^(t>>>14))>>>0)/4294967296;};}
function easeOut(t:number){return 1-Math.pow(1-t,3);}
function mixVec(a:THREE.Vector3,b:THREE.Vector3,t:number){return a.clone().lerp(b,t);}
function curve(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Vector3,t:number){return mixVec(mixVec(a,b,t),mixVec(b,c,t),t);}
function heart(t:number,scale:number){const x=16*Math.pow(Math.sin(t),3)*scale;const y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*scale-0.18;return new THREE.Vector3(x,y,0);}
function makeNodes():OrbitNode[]{return nodeSeeds.map(([id,title,subtitle,color,note],i)=>{const t=i/nodeSeeds.length*Math.PI*2+0.42;const p=heart(t,0.2+(i%2)*0.018);p.z=Math.sin(t*2)*0.82;return{id,title,subtitle,color,note,pos:[p.x,p.y,p.z]};});}
function worldPosition(node:OrbitNode){return new THREE.Vector3(...node.pos).applyEuler(sceneRot);}

function pointGeometry(count:number,seed:number,make:(i:number,rand:()=>number)=>{p:THREE.Vector3;c:THREE.Color;s:number}){const rand=random(seed);const pos=new Float32Array(count*3);const col=new Float32Array(count*3);const size=new Float32Array(count);for(let i=0;i<count;i++){const it=make(i,rand);pos.set([it.p.x,it.p.y,it.p.z],i*3);col.set([it.c.r,it.c.g,it.c.b],i*3);size[i]=it.s;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('size',new THREE.BufferAttribute(size,1));return g;}
function GlowMaterial(){return el('shaderMaterial',{vertexShader,fragmentShader,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});}
function DeepStars(){const g=useMemo(()=>pointGeometry(3200,81723,(_i,rand)=>{const r=13+rand()*23;const a=rand()*Math.PI*2;const p=new THREE.Vector3(Math.cos(a)*r,(rand()-0.5)*15,Math.sin(a)*r);const c=new THREE.Color(rand()>0.55?'#ffb4df':'#92fff2');return{p,c,s:0.012+rand()*0.034};}),[]);return el('points',{geometry:g},h(GlowMaterial));}
function StarHeart(){const g=useMemo(()=>{const pal=['#ff7ac4','#ffc8e5','#bda4ff','#8ffff1','#fff0bc'].map(c=>new THREE.Color(c));return pointGeometry(15000,74019,(_i,rand)=>{const t=rand()*Math.PI*2;const layer=Math.pow(rand(),0.54);const p=heart(t,0.09+layer*0.22);p.x+=(rand()-0.5)*(0.16+layer*0.48);p.y+=(rand()-0.5)*(0.12+layer*0.34);p.z=Math.sin(t*2.15)*(0.16+layer*0.74)+(rand()-0.5)*0.72;const c=pal[Math.floor(rand()*pal.length)].clone().lerp(new THREE.Color('#fff7fb'),layer<0.24?0.38:rand()*0.16);return{p,c,s:0.018+Math.pow(rand(),2.1)*0.062};});},[]);return el('points',{geometry:g},h(GlowMaterial));}

function Ring({rx,ry,color,opacity,rot}:{rx:number;ry:number;color:string;opacity:number;rot:[number,number,number]}){const g=useMemo(()=>{const pts:THREE.Vector3[]=[];for(let i=0;i<=320;i++){const t=i/320*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(t)*rx,Math.sin(t)*ry,Math.sin(t*2)*0.16));}return new THREE.BufferGeometry().setFromPoints(pts);},[rx,ry]);return el('line',{geometry:g,rotation:rot},el('lineBasicMaterial',{color,transparent:true,opacity,blending:THREE.AdditiveBlending}));}

function petalGeometry(){const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(-0.34,0.18,-0.54,0.86,0,1.62);shape.bezierCurveTo(0.54,0.86,0.34,0.18,0,0);const g=new THREE.ShapeGeometry(shape,32);g.translate(0,-0.05,0);return g;}
function Petal({color,angle,layer,focusKey}:{color:string;angle:number;layer:number;focusKey:number}){const mesh=useRef<THREE.Mesh>(null);const mat=useRef<THREE.MeshBasicMaterial>(null);const age=useRef(-0.1-layer*0.06);useEffect(()=>{age.current=-0.1-layer*0.06;},[focusKey,layer]);const geo=useMemo(petalGeometry,[]);useFrame((_s,d)=>{age.current=Math.min(1,age.current+d*0.9);const e=easeOut(Math.max(0,age.current));if(mesh.current){const scale=(0.08+e*(layer>1?0.92:0.68))*(1+layer*0.18);mesh.current.scale.set(scale,scale*(0.9+layer*0.08),1);mesh.current.position.z=(layer-1)*0.12+e*0.06*Math.sin(angle*3);mesh.current.rotation.x=-0.75+layer*0.28+e*0.22;}if(mat.current)mat.current.opacity=(0.02+e*(0.28-layer*0.035));});return el('mesh',{ref:mesh,geometry:geo,rotation:[-0.72,0,angle]},el('meshBasicMaterial',{ref:mat,color,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));}

function makeDust(active:OrbitNode){const seed=active.id.split('').reduce((s,c)=>s+c.charCodeAt(0),117);const rand=random(seed);const count=1300;const pos=new Float32Array(count*3);const col=new Float32Array(count*3);const size=new Float32Array(count);const delay=new Float32Array(count);const base=new THREE.Color(active.color);for(let i=0;i<count;i++){const a=rand()*Math.PI*2;const r=Math.pow(rand(),0.42)*(0.7+rand()*0.8);const y=(rand()-0.5)*0.65;const p=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r*0.75);pos.set([p.x,p.y,p.z],i*3);const c=base.clone().lerp(new THREE.Color('#fff7fb'),0.25+rand()*0.5);col.set([c.r,c.g,c.b],i*3);size[i]=0.025+rand()*0.08;delay[i]=rand()*0.38;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('size',new THREE.BufferAttribute(size,1));g.setAttribute('delay',new THREE.BufferAttribute(delay,1));return g;}
function DustMaterial({materialRef}:{materialRef:any}){return el('shaderMaterial',{ref:materialRef,vertexShader:dustVertex,fragmentShader:dustFragment,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uProgress:{value:0}}});}

function SculptedRose({active,focusKey}:{active:OrbitNode;focusKey:number}){const group=useRef<THREE.Group>(null);const dustMat=useRef<any>(null);const age=useRef(-0.2);useEffect(()=>{age.current=-0.2;},[focusKey]);const dust=useMemo(()=>makeDust(active),[active.id,active.color]);useFrame((_s,d)=>{age.current=Math.min(1,age.current+d*0.8);const e=easeOut(Math.max(0,age.current));if(group.current){group.current.scale.setScalar(0.22+e*0.95);group.current.rotation.y=(1-e)*-0.75;group.current.rotation.z=(1-e)*0.55;}if(dustMat.current?.uniforms?.uProgress)dustMat.current.uniforms.uProgress.value=Math.max(0,age.current);});const petalColors=active.id==='aurora'?['#81fff0','#b6fff7','#ff8ed6']:active.id==='moon'?['#fff1bd','#ffcbe8','#ff79c6']:['#ff62b7','#ffc1e4','#ff8ad0'];const petals:any[]=[];for(let layer=0;layer<3;layer++){const total=layer===0?6:layer===1?9:13;for(let i=0;i<total;i++){petals.push(h(Petal,{key:`p-${layer}-${i}`,color:petalColors[(i+layer)%petalColors.length],angle:i/total*Math.PI*2+layer*0.18,layer,focusKey}));}}return el('group',{ref:group,position:active.pos},[
  el('points',{key:'dust',geometry:dust},h(DustMaterial,{materialRef:dustMat})),
  el('mesh',{key:'core'},el('sphereGeometry',{args:[0.12,32,32]}),el('meshBasicMaterial',{color:'#fff7fb',transparent:true,opacity:0.72,blending:THREE.AdditiveBlending})),
  ...petals,
  h(Ring,{key:'r1',rx:1.35,ry:0.7,color:active.color,opacity:0.22,rot:[0.45,0.08,0.15]}),
  h(Ring,{key:'r2',rx:0.95,ry:1.08,color:active.id==='future'?'#fff1bd':'#91fff0',opacity:0.13,rot:[-0.55,0.2,-0.35]})
]);}

function NodeMesh({node,active,select}:{node:OrbitNode;active:boolean;select:(node:OrbitNode)=>void}){const opacity=active?0.08:0.92;return el('group',{position:node.pos,onClick:(e:any)=>{e.stopPropagation();select(node);}},[
  el('mesh',{key:'core'},el('sphereGeometry',{args:[active?0.07:0.085,32,32]}),el('meshBasicMaterial',{color:node.color,transparent:true,opacity})),
  el('mesh',{key:'halo',scale:active?1.4:2.15},el('sphereGeometry',{args:[0.085,32,32]}),el('meshBasicMaterial',{color:node.color,transparent:true,opacity:active?0.015:0.085,depthWrite:false,blending:THREE.AdditiveBlending}))
]);}
function CameraFlight({active,focusKey,controlsRef}:{active:OrbitNode;focusKey:number;controlsRef:any}){const{camera}=useThree();const flight=useRef<any>(null);useEffect(()=>{const target=worldPosition(active);const dir=target.clone().normalize().multiplyScalar(0.9);const endTarget=target.clone();const endPos=target.clone().add(new THREE.Vector3(0.35,0.28,2.75)).add(dir);const startTarget=controlsRef.current?.target?.clone?.()??new THREE.Vector3();const startPos=camera.position.clone();const mid=startPos.clone().lerp(endPos,0.5).add(new THREE.Vector3(0,0.8,1.05));flight.current={t:0,startPos,mid,endPos,startTarget,endTarget};},[focusKey,active,camera,controlsRef]);useFrame((_s,d)=>{const data=flight.current;const controls=controlsRef.current;if(!data||!controls)return;data.t=Math.min(1,data.t+d/1.35);const e=easeOut(data.t);camera.position.copy(curve(data.startPos,data.mid,data.endPos,e));controls.target.copy(mixVec(data.startTarget,data.endTarget,e));camera.lookAt(controls.target);controls.update();if(data.t>=1)flight.current=null;});return null;}
function Scene({nodes,active,select,focusKey}:{nodes:OrbitNode[];active:OrbitNode;select:(node:OrbitNode)=>void;focusKey:number}){const controlsRef=useRef<any>(null);return h(Canvas,{camera:{position:[0,0.15,6.9],fov:38},dpr:[1,1.7]},[
  el('color',{key:'bg',attach:'background',args:['#05000d']}),el('ambientLight',{key:'amb',intensity:0.62}),el('pointLight',{key:'pink',position:[2.5,2.4,3.4],intensity:0.9,color:'#ffaddd'}),el('pointLight',{key:'cyan',position:[-2.2,-1.8,2.1],intensity:0.46,color:'#91fff0'}),
  h(CameraFlight,{key:'cam',active,focusKey,controlsRef}),h(DeepStars,{key:'stars'}),
  el('group',{key:'globe',rotation:[-0.05,-0.16,0]},[
    el('mesh',{key:'aura',scale:[1.05,0.72,0.56]},el('sphereGeometry',{args:[1,64,64]}),el('meshBasicMaterial',{color:'#ffaad8',transparent:true,opacity:0.045,depthWrite:false,blending:THREE.AdditiveBlending})),
    h(StarHeart,{key:'heart'}),h(Ring,{key:'ring1',rx:3.05,ry:1.94,color:'#ff83c8',opacity:0.28,rot:[0.18,0,0.08]}),h(Ring,{key:'ring2',rx:3.42,ry:2.22,color:'#91fff0',opacity:0.13,rot:[-0.58,0.04,-0.13]}),
    h(SculptedRose,{key:`rose-${active.id}-${focusKey}`,active,focusKey}),...nodes.map(n=>h(NodeMesh,{key:n.id,node:n,active:active.id===n.id,select}))
  ]),h(OrbitControls,{key:'ctl',ref:controlsRef,enablePan:false,enableDamping:true,dampingFactor:0.07,rotateSpeed:0.58,minDistance:2.25,maxDistance:9.5})
]);}
export function RomanceOrbitApp(){const nodes=useMemo(makeNodes,[]);const[active,setActive]=useState(nodes[0]);const[focusKey,setFocusKey]=useState(0);const[query,setQuery]=useState('');const visible=(query?nodes.filter(n=>`${n.title}${n.subtitle}${n.note}`.includes(query)):nodes).slice(0,5);const activeDetail=detail[active.id]??detail.first;const select=(n:OrbitNode)=>{setActive(n);setFocusKey(v=>v+1);};return h('main',{className:'romance-shell',style:{'--accent':active.color}as CSSProperties},[
  h(Scene,{key:'scene',nodes,active,select,focusKey}),h('div',{key:'v',className:'romance-vignette'}),
  h('section',{key:'brand',className:'brand-float'},[h('span',null,'ROMANCE ORBIT'),h('h1',null,'极光玫瑰宇宙'),h('p',null,'点击光点后，光点会碎成花粉并生成一朵真正的 3D 玫瑰。')]),
  h('section',{key:'search',className:'search-float'},[h('input',{value:query,onChange:(e:any)=>setQuery(e.target.value),placeholder:'搜索：玫瑰 / 月光 / 极光 / 未来'}),h('div',{className:'memory-list'},visible.map(n=>h('button',{key:n.id,onClick:()=>select(n),className:active.id===n.id?'is-active':''},[h('b',null,n.title),h('span',null,n.subtitle)])))]),
  h('section',{key:'detail',className:'detail-float'},[h('span',{className:'detail-kicker'},activeDetail.kicker),h('h2',null,active.title),h('p',null,active.subtitle),h('div',{className:'ritual-card'},[h('b',null,activeDetail.title),h('span',null,activeDetail.text)]),h('div',{className:'ritual-lines'},activeDetail.tags.map(t=>h('em',{key:t},t)))]),
  h('section',{key:'hint',className:'hint-float'},'点击光点：镜头靠近 · 光点消散 · 花瓣生成 · 停住成静态 3D 玫瑰场景')
]);}
