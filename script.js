/* ── helpers ── */
var curTab='pg';
function go(id,el){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on')});document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')});document.getElementById(id).classList.add('on');el.classList.add('on');curTab=id}
function lg(id,cls,msg){var e=document.getElementById(id),d=document.createElement('div');d.className='le '+cls;d.textContent=msg;e.insertBefore(d,e.firstChild);while(e.children.length>25)e.removeChild(e.lastChild)}
function hx(n){return'0x'+n.toString(16).toUpperCase().padStart(3,'0')}
function mkStep(num,lbl,det,state){return'<div class="step '+state+'"><div class="step-num">'+num+'</div><div class="step-body"><div class="step-lbl">'+lbl+'</div><div class="step-det">'+det+'</div></div></div>'}

/* ── keyboard shortcuts ── */
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;
  if(e.code==='Space'){e.preventDefault();if(curTab==='vm')vmStep()}
  if(e.code==='KeyR'){if(curTab==='pg')pgReset();else if(curTab==='seg')segReset();else if(curTab==='vm')vmReset();else if(curTab==='al')alReset()}
});

/* ══════════════════════════════════════════
   PAGING
══════════════════════════════════════════ */
var PG=16,NF=16,NP=16,pgMem,pgTbls,pgP=0;
var pcols=[['#eff6ff','#2563eb','#2563eb'],['#f0fdf4','#16a34a','#16a34a'],['#fffbeb','#d97706','#d97706']];
var pnm=['P0','P1','P2'];

function pgInit(){
  pgMem=Array(NF).fill(null);
  pgTbls=[Array(NP).fill(null),Array(NP).fill(null),Array(NP).fill(null)];
  pgMem[0]={p:'os',pg:'ker'};pgMem[1]={p:'os',pg:'pcb'};
  for(var i=0;i<3;i++){pgMem[2+i]={p:0,pg:i};pgTbls[0][i]=2+i}
  for(var i=0;i<2;i++){pgMem[6+i]={p:1,pg:i};pgTbls[1][i]=6+i}
  pgRender()
}
function pgRender(){pgDrawMem();pgDrawPT();pgDrawStats();pgTrans()}
function pgDrawMem(){
  var h='';
  for(var i=0;i<NF;i++){
    var f=pgMem[i],bg='#f9fafb',cl='#9ca3af',lbl='free';
    if(f){if(f.p==='os'){bg='#f1f5f9';cl='#64748b';lbl='OS:'+f.pg}else{bg=pcols[f.p][0];cl=pcols[f.p][1];lbl=pnm[f.p]+':p'+f.pg}}
    h+='<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px"><span class="mono" style="color:#334155;width:40px;text-align:right">'+hx(i*PG)+'</span><div style="flex:1;height:21px;border-radius:3px;background:'+bg+';color:'+cl+';display:flex;align-items:center;padding:0 7px;font-family:monospace;font-size:12px">'+lbl+'</div></div>'
  }
  document.getElementById('pg-mem').innerHTML=h
}
function pgDrawPT(){
  var t=pgTbls[pgP],h='';
  t.forEach(function(pfn,vpn){
    if(pfn===null)return;
    h+='<div class="ptrow"><span class="badge b-blue">VPN'+vpn+'</span><span class="badge b-amber">PFN'+pfn+'</span><span style="color:#16a34a">&#10003;</span><span style="color:#0284c7;font-family:monospace">'+hx(pfn*PG)+'</span></div>'
  });
  document.getElementById('pg-pt').innerHTML=h||'<span style="font-size:11px;color:#334155">No pages mapped</span>';
  document.getElementById('pg-pname').textContent=pnm[pgP];
  for(var i=0;i<3;i++){var b=document.getElementById('ptb'+i);b.style.borderColor=i===pgP?pcols[i][2]:'#d0d5dd';b.style.color=i===pgP?pcols[i][1]:'#374151'}
}
function pgDrawStats(){
  var used=pgMem.filter(function(f){return f&&f.p!=='os'}).length;
  var osf=pgMem.filter(function(f){return f&&f.p==='os'}).length;
  var free=NF-pgMem.filter(function(f){return f}).length;
  /* internal fragmentation: last page of each process may be partial */
  var intFrag=pgP<3?(pgTbls[pgP].filter(function(p){return p!==null}).length>0?Math.floor(Math.random()*PG):0):0;
  document.getElementById('pg-stats').innerHTML=
    '<div class="statb"><div class="statv" style="color:#2563eb">'+used+'</div><div class="statl">Proc Pages</div></div>'+
    '<div class="statb"><div class="statv" style="color:#64748b">'+osf+'</div><div class="statl">OS Frames</div></div>'+
    '<div class="statb"><div class="statv" style="color:#16a34a">'+free+'</div><div class="statl">Free</div></div>'+
    '<div class="statb"><div class="statv">'+Math.round((used+osf)/NF*100)+'%</div><div class="statl">Utilisation</div></div>'
}
function pgTrans(){
  var va=parseInt(document.getElementById('pg-va').value)||0,vpn=Math.floor(va/PG),off=va%PG,pfn=pgTbls[pgP][vpn];
  var h='<div style="margin-bottom:6px"><span class="badge b-blue">VPN:'+vpn+'</span> &nbsp;<span style="color:#334155">+</span>&nbsp; <span class="badge b-green">off:'+off+'</span></div>';
  if(pfn!=null){
    var pa=pfn*PG+off;
    h+='<span class="badge b-amber">PFN:'+pfn+'</span> &nbsp;+&nbsp; off:'+off+' &nbsp;=&nbsp; <span class="badge b-purple">PA:'+hx(pa)+'</span>';
    h+='<div style="color:#16a34a;font-size:12px;margin-top:6px">&#10003; VA '+hx(va)+' &rarr; PA '+hx(pa)+'</div>'
  }else{
    h+='<div style="color:#dc2626;font-size:12px">&#10007; PAGE FAULT &mdash; VPN '+vpn+' not mapped for '+pnm[pgP]+'</div>'
  }
  document.getElementById('pg-result').innerHTML=h;
  pgShowProc(va,vpn,off,pfn)
}
function pgProc(p){pgP=p;pgRender()}
function pgAlloc(){
  var ff=pgMem.findIndex(function(f){return!f});if(ff<0){lg('pg-log','lerr','Out of physical memory');return}
  var np=pgTbls[pgP].findIndex(function(p){return p===null});if(np<0){lg('pg-log','lerr','No VPN left for '+pnm[pgP]);return}
  pgMem[ff]={p:pgP,pg:np};pgTbls[pgP][np]=ff;lg('pg-log','lw',pnm[pgP]+': VPN'+np+' &rarr; PFN'+ff);pgRender()
}
function pgFree(){
  var pp=pgTbls[pgP].map(function(pfn,vpn){return{vpn:vpn,pfn:pfn}}).filter(function(e){return e.pfn!==null});
  if(!pp.length){lg('pg-log','lerr','No pages to free for '+pnm[pgP]);return}
  var last=pp[pp.length-1];pgMem[last.pfn]=null;pgTbls[pgP][last.vpn]=null;
  lg('pg-log','lok','Freed VPN'+last.vpn+' (PFN'+last.pfn+')');pgRender()
}
function pgReset(){document.getElementById('pg-log').innerHTML='';pgInit();lg('pg-log','linfo','Reset')}
function pgShowProc(va,vpn,off,pfn){
  var ok=pfn!=null;
  var s1=mkStep(1,'Split Virtual Address','VA <span class="iv iv-b">'+va+'</span> &rarr; VPN=<span class="iv iv-b">'+vpn+'</span>, Offset=<span class="iv iv-g">'+off+'</span>  <span style="color:#9ca3af;font-size:10px">(VA&divide;'+PG+'='+vpn+' rem '+off+')</span>','done');
  var s2d=ok?'VPN <span class="iv iv-b">'+vpn+'</span> found &rarr; PFN = <span class="iv iv-a">'+pfn+'</span>':'VPN <span class="iv iv-b">'+vpn+'</span> <span class="iv iv-r">NOT in table</span> &rarr; PAGE FAULT';
  var s2=mkStep(2,'Lookup Page Table',s2d,ok?'done':'active');
  var s3d=ok?'PA = <span class="iv iv-a">'+pfn+'</span>&times;'+PG+' + <span class="iv iv-g">'+off+'</span> = <span class="iv iv-p">'+(pfn*PG+off)+'</span>  &nbsp;<span style="color:#9ca3af;font-size:10px">(='+(pfn*PG)+'+'+off+')</span>':'<span class="iv iv-r">Cannot compute PA &mdash; page not in memory</span>';
  var s3=mkStep(3,'Compute Physical Address',s3d,ok?'done':'');
  document.getElementById('pg-proc').innerHTML=s1+s2+s3
}

/* ══════════════════════════════════════════
   SEGMENTATION
══════════════════════════════════════════ */
var ST=256,segs,sdef=[{n:'Code',b:0,l:64,r:1,w:0,x:1},{n:'Data',b:64,l:48,r:1,w:1,x:0},{n:'Heap',b:112,l:64,r:1,w:1,x:0},{n:'Stack',b:176,l:32,r:1,w:1,x:0}];
var scols=['#2563eb','#16a34a','#7c3aed','#d97706'],sbg=['#1e2d4a','#14271f','#1e1a3a','#271f0a'],sbr=['#2563eb','#166534','#5b21b6','#92400e'];

function segInit(){segs=sdef.map(function(s){return Object.assign({},s)});segRender()}
function segRender(){segBar();segTable();segStats();segTrans()}
function segBar(){
  var sorted=segs.slice().sort(function(a,b){return a.b-b.b}),h='',cur=0;
  sorted.forEach(function(s){
    var idx=segs.indexOf(s),w=s.l/ST*100;
    if(s.b>cur)h+='<div style="width:'+((s.b-cur)/ST*100)+'%;background:#f3f4f6;color:#9ca3af;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:monospace;min-width:2px">gap</div>';
    h+='<div style="width:'+w+'%;background:'+sbg[idx]+';color:'+scols[idx]+';border-right:1px solid '+sbr[idx]+';display:flex;align-items:center;justify-content:center;font-size:10px;font-family:monospace;font-weight:600;min-width:2px;overflow:hidden">'+s.n+'</div>';
    cur=s.b+s.l
  });
  if(cur<ST)h+='<div style="width:'+((ST-cur)/ST*100)+'%;background:#f3f4f6;color:#9ca3af;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:monospace;min-width:2px">free</div>';
  document.getElementById('seg-bar').innerHTML=h;
  document.getElementById('seg-legend').innerHTML=segs.map(function(s,i){return'<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:8px;height:8px;background:'+scols[i]+';opacity:.7;border-radius:2px;display:inline-block"></span>'+s.n+':'+s.l+'B</span>'}).join('')
}
function segTable(){
  document.getElementById('seg-tbody').innerHTML=segs.map(function(s,i){return'<tr><td>'+i+'</td><td style="color:'+scols[i]+';font-weight:600">'+s.n+'</td><td>'+s.b+'</td><td>'+s.l+'</td><td>'+(s.r?'R':'-')+'</td><td>'+(s.w?'W':'-')+'</td><td>'+(s.x?'X':'-')+'</td></tr>'}).join('')
}
function segStats(){
  var used=segs.reduce(function(s,e){return s+e.l},0),fr=ST-used;
  var sorted=segs.slice().sort(function(a,b){return a.b-b.b}),holes=[],cur=0;
  sorted.forEach(function(s){if(s.b>cur)holes.push({st:cur,sz:s.b-cur});cur=s.b+s.l});
  if(cur<ST)holes.push({st:cur,sz:ST-cur});
  var ef=holes.length>1?holes.slice(0,-1).reduce(function(s,h){return s+h.sz},0):0;
  document.getElementById('seg-stats').innerHTML=
    '<div class="statb"><div class="statv" style="color:#2563eb">'+used+'B</div><div class="statl">Used</div></div>'+
    '<div class="statb"><div class="statv" style="color:#16a34a">'+fr+'B</div><div class="statl">Free</div></div>'+
    '<div class="statb"><div class="statv" style="color:'+(ef>0?'#f87171':'#4ade80')+'">'+ef+'B</div><div class="statl">Ext Frag</div></div>'+
    '<div class="statb"><div class="statv" style="color:#7c3aed">'+holes.length+'</div><div class="statl">Holes</div></div>';
  document.getElementById('seg-holes').innerHTML=holes.length?holes.map(function(h){return h.sz+'B free @ addr '+h.st}).join(' &nbsp;|&nbsp; '):'<span style="color:#16a34a">✓ No holes</span>'
}
function segTrans(){
  var si=parseInt(document.getElementById('seg-s').value),off=parseInt(document.getElementById('seg-o').value)||0,s=segs[si];
  var ok=off<s.l;
  var h='<span style="color:'+scols[si]+';font-weight:600">seg'+si+'('+s.n+')</span> &nbsp;+&nbsp; <span class="badge b-green">off:'+off+'</span><br><br>';
  h+=ok?'base <span class="badge b-amber">'+s.b+'</span> + '+off+' = <span class="badge b-purple">PA '+(s.b+off)+'</span>':'<span style="color:#dc2626">&#10007; SEGFAULT &mdash; offset '+off+' &ge; limit '+s.l+'</span>';
  document.getElementById('seg-result').innerHTML=h;
  segShowProc(si,off,s,ok)
}
function segResize(){
  var idx=parseInt(document.getElementById('seg-rs').value),nl=parseInt(document.getElementById('seg-rl').value)||0;
  if(nl<1||nl>100){lg('seg-log','lerr','Limit must be 1-100');return}
  var old=segs[idx].l;segs[idx].l=nl;
  var base=0,sorted=segs.map(function(s,i){return Object.assign({},s,{i:i})}).sort(function(a,b){return a.b-b.b});
  sorted.forEach(function(s){segs[s.i].b=base;base+=segs[s.i].l});
  lg('seg-log','lok','Seg'+idx+'('+segs[idx].n+'): '+old+'B &rarr; '+nl+'B, repacked');segRender()
}
function segReset(){document.getElementById('seg-log').innerHTML='';segInit()}
function segShowProc(si,off,s,ok){
  var s1=mkStep(1,'Read Logical Address','Segment# = <span class="iv iv-b">'+si+'</span> <span style="color:#6b7280">('+s.n+')</span>, Offset = <span class="iv iv-g">'+off+'</span>','done');
  var s2d='Check: <span class="iv iv-g">'+off+'</span> &lt; limit <span class="iv iv-a">'+s.l+'</span> ? &rarr; '+(ok?'<span class="iv iv-g">YES &mdash; VALID</span>':'<span class="iv iv-r">NO &mdash; SEGFAULT</span>');
  var s2=mkStep(2,'Bounds Check  (offset &lt; limit)',s2d,ok?'done':'active');
  var s3d=ok?'PA = base <span class="iv iv-a">'+s.b+'</span> + offset <span class="iv iv-g">'+off+'</span> = <span class="iv iv-p">'+(s.b+off)+'</span>':'<span class="iv iv-r">Access denied &mdash; Segmentation Fault raised by OS</span>';
  var s3=mkStep(3,'Compute Physical Address',s3d,ok?'done':'');
  document.getElementById('seg-proc').innerHTML=s1+s2+s3
}

/* ══════════════════════════════════════════
   VIRTUAL MEMORY
══════════════════════════════════════════ */
var vmF,vmTLB,vmH,vmFlt,vmStp,vmHist,vmRes,vmFIFO,vmLRU;
function vmFC(){return parseInt(document.getElementById('vm-fc').value)}
function vmRefs(){return document.getElementById('vm-ref').value.split(',').map(function(s){return parseInt(s.trim())}).filter(function(n){return!isNaN(n)})}
function vmAlgo(){return document.getElementById('vm-algo').value}
function vmInit(){var fc=vmFC();vmF=Array(fc).fill(null);vmTLB=[];vmH=0;vmFlt=0;vmStp=0;vmHist=[];vmFIFO=[];vmLRU={};vmRes=vmRefs().map(function(){return'p'})}
function vmReset(){document.getElementById('vm-log').innerHTML='';vmInit();vmRender();lg('vm-log','linfo','Reset &mdash; Space to step')}
function vmRender(){vmDrawRefs();vmDrawFrames();vmDrawTLB();vmDrawStats();vmDrawHist()}
function vmDrawRefs(){document.getElementById('vm-refs').innerHTML=vmRefs().map(function(p,i){var c='rp';if(i<vmStp)c+=' '+(vmRes[i]==='h'?'hit':'fault');else if(i===vmStp)c+=' cur';return'<div class="'+c+'" title="page '+p+'">'+p+'</div>'}).join('')}
function vmDrawFrames(){var fc=vmFC();document.getElementById('vm-frames').style.gridTemplateColumns='repeat('+fc+',1fr)';document.getElementById('vm-frames').innerHTML=vmF.map(function(p,i){return'<div class="sframe '+(p!=null?'sf-on':'sf-empty')+'"><div style="font-size:10px;color:#9ca3af">F'+i+'</div><div style="font-size:18px;font-weight:700">'+(p!=null?p:'--')+'</div></div>'}).join('')}
function vmDrawTLB(){document.getElementById('vm-tlb').innerHTML=vmTLB.length?vmTLB.map(function(e){return'<tr><td>'+e.vpn+'</td><td>'+e.pfn+'</td><td>'+e.age+'</td></tr>'}).join(''):'<tr><td colspan="3" style="color:#9ca3af">empty</td></tr>'}
function vmDrawStats(){var tot=vmH+vmFlt;document.getElementById('vm-stats').innerHTML='<div class="statb"><div class="statv" style="color:#16a34a">'+vmH+'</div><div class="statl">Hits</div></div><div class="statb"><div class="statv" style="color:#dc2626">'+vmFlt+'</div><div class="statl">Faults</div></div><div class="statb"><div class="statv">'+(tot?Math.round(vmH/tot*100):0)+'%</div><div class="statl">Hit Rate</div></div>'}
function vmDrawHist(){
  var fc=vmFC();
  document.getElementById('vm-hh').innerHTML='<tr><th>Page</th>'+Array.from({length:fc},function(_,i){return'<th>F'+i+'</th>'}).join('')+'<th>Result</th></tr>';
  document.getElementById('vm-hb').innerHTML=vmHist.map(function(h){return'<tr><td style="color:#2563eb;font-weight:600">'+h.pg+'</td>'+h.fr.map(function(f){return'<td style="color:'+(f!=null?'#0284c7':'#d1d5db')+'">'+(f!=null?f:'--')+'</td>'}).join('')+'<td style="color:'+(h.fault?'#dc2626':'#16a34a')+'">'+(h.fault?'FAULT':'HIT')+'</td></tr>'}).reverse().join('')||'<tr><td colspan="99" style="color:#9ca3af;font-size:12px">No history yet</td></tr>'
}
function vmUpdTLB(vpn,pfn){vmTLB=vmTLB.filter(function(e){return e.vpn!==vpn});vmTLB.forEach(function(e){e.age++});vmTLB.unshift({vpn:vpn,pfn:pfn,age:0});if(vmTLB.length>4)vmTLB.pop()}
function vmStep(){
  var refs=vmRefs();if(vmStp>=refs.length){lg('vm-log','linfo','End of string. Reset to replay.');return}
  var pg=refs[vmStp],algo=vmAlgo();
  /* TLB hit */
  var tl=vmTLB.find(function(e){return e.vpn===pg});
  if(tl){vmH++;vmRes[vmStp]='h';vmTLB.forEach(function(e){e.age++});tl.age=0;vmHist.push({pg:pg,fr:vmF.slice(),fault:false});lg('vm-log','lok','#'+(vmStp+1)+' pg'+pg+' TLB HIT &rarr; F'+tl.pfn);vmShowProc(pg,'tlb',tl.pfn);vmStp++;vmRender();return}
  /* memory hit */
  if(vmF.includes(pg)){vmH++;vmRes[vmStp]='h';var pfn=vmF.indexOf(pg);vmUpdTLB(pg,pfn);if(algo==='lru')vmLRU[pg]=vmStp;vmHist.push({pg:pg,fr:vmF.slice(),fault:false});lg('vm-log','lok','#'+(vmStp+1)+' pg'+pg+' in frame '+pfn+' HIT');vmShowProc(pg,'mem',pfn);vmStp++;vmRender();return}
  /* page fault */
  vmFlt++;vmRes[vmStp]='f';
  var fi=vmF.indexOf(null);
  if(fi>=0){vmF[fi]=pg;vmUpdTLB(pg,fi);if(algo==='fifo')vmFIFO.push(pg);if(algo==='lru')vmLRU[pg]=vmStp;vmHist.push({pg:pg,fr:vmF.slice(),fault:true});lg('vm-log','lerr','#'+(vmStp+1)+' pg'+pg+' FAULT &rarr; free frame '+fi);vmShowProc(pg,'fault',fi)}
  else{
    var vic=0,vp=vmF[0];
    if(algo==='fifo'){vp=vmFIFO.shift();vic=vmF.indexOf(vp)}
    else if(algo==='lru'){var mn=Infinity;vmF.forEach(function(p,i){var a=vmLRU[p]!==undefined?vmLRU[p]:-1;if(a<mn){mn=a;vic=i;vp=p}})}
    else{var fut=refs.slice(vmStp+1),md=-1;vmF.forEach(function(p,i){var nx=fut.indexOf(p);var d=nx<0?9999:nx;if(d>md){md=d;vic=i;vp=p}})}
    vmTLB=vmTLB.filter(function(e){return e.vpn!==vp});vmF[vic]=pg;
    if(algo==='fifo')vmFIFO.push(pg);if(algo==='lru')vmLRU[pg]=vmStp;
    vmUpdTLB(pg,vic);vmHist.push({pg:pg,fr:vmF.slice(),fault:true});
    lg('vm-log','lerr','#'+(vmStp+1)+' pg'+pg+' FAULT, evict pg'+vp+' F'+vic+' ['+algo.toUpperCase()+']');vmShowProc(pg,'replace',{evict:vp,frame:vic})
  }
  vmStp++;vmRender()
}
function vmRunAll(){var refs=vmRefs(),n=refs.length-vmStp,i=0;function run(){if(i++<n){vmStep();setTimeout(run,110)}}run()}
function vmShowProc(pg,event,info){
  var isTLB=event==='tlb',isMem=event==='mem',isFault=event==='fault',isRep=event==='replace';
  var s1d=isTLB?'Page <span class="iv iv-b">'+pg+'</span> found in TLB &rarr; PFN = <span class="iv iv-a">'+info+'</span>  <span class="iv iv-g">TLB HIT</span>':'Page <span class="iv iv-b">'+pg+'</span> not in TLB &rarr; <span class="iv iv-r">TLB MISS</span>';
  var s1=mkStep(1,'Check TLB',s1d,'done');
  var s2d=isTLB?'<span class="iv iv-g">Translation complete</span> &mdash; no page table walk needed':'Must search physical frames for page <span class="iv iv-b">'+pg+'</span>';
  var s2=mkStep(2,'TLB Result',s2d,'done');
  var s3d=isTLB?'Physical address computed from TLB entry directly':isMem?'Page <span class="iv iv-b">'+pg+'</span> found in frame <span class="iv iv-a">'+info+'</span> &rarr; <span class="iv iv-g">HIT</span>':'Page <span class="iv iv-b">'+pg+'</span> <span class="iv iv-r">not in any frame</span> &rarr; PAGE FAULT';
  var s3=mkStep(3,'Check Physical Frames',s3d,isTLB?'done':'done');
  var s4d=isTLB||isMem?'No replacement needed &mdash; page already available':isFault?'Free frame <span class="iv iv-a">'+info+'</span> available &rarr; load page <span class="iv iv-g">'+pg+'</span>':'<span class="iv iv-r">Evict</span> page <span class="iv iv-r">'+info.evict+'</span> from frame <span class="iv iv-a">'+info.frame+'</span>, load <span class="iv iv-g">'+pg+'</span>';
  var s4=mkStep(4,'Page Replacement',s4d,isRep?'active':isFault?'done':'done');
  document.getElementById('vm-proc').innerHTML=s1+s2+s3+s4
}

/* ══════════════════════════════════════════
   ALLOCATION
══════════════════════════════════════════ */
var AL=256,alBlocks,alIdx,alNameIdx;
var alPal=['#2563eb','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#dc2626'];
function alInit(){
  alBlocks=[{id:'OS',st:0,sz:40,fr:false,cl:alPal[6]},{id:'P1',st:40,sz:32,fr:false,cl:alPal[0]},{id:'P2',st:72,sz:24,fr:false,cl:alPal[1]},{id:'f1',st:96,sz:16,fr:true},{id:'P3',st:112,sz:48,fr:false,cl:alPal[2]},{id:'f2',st:160,sz:96,fr:true}];
  alIdx=3;alNameIdx=4;alRender();lg('al-log','linfo','Memory initialised')
}
function alRender(){alBar();alList();alFrSel();alStats();alInfo()}
function alBar(){document.getElementById('al-bar').innerHTML=alBlocks.map(function(b){var w=b.sz/AL*100;if(b.fr)return'<div style="width:'+w+'%;background:#f3f4f6;color:#9ca3af;display:flex;align-items:center;justify-content:center;font-size:9px;font-family:monospace;min-width:2px">'+b.sz+'B</div>';var bg=b.cl+'33',bd=b.cl;return'<div style="width:'+w+'%;background:'+bg+';color:'+bd+';border-right:1px solid '+bd+';display:flex;align-items:center;justify-content:center;font-size:10px;font-family:monospace;font-weight:600;min-width:2px;overflow:hidden">'+b.id+'</div>'}).join('')}
function alList(){document.getElementById('al-list').innerHTML=alBlocks.map(function(b){if(b.fr)return'<tr><td style="color:#9ca3af">FREE</td><td style="color:#6b7280">'+b.st+'</td><td style="color:#6b7280">'+b.sz+'B</td><td style="color:#d1d5db">—</td></tr>';return'<tr><td style="color:'+(b.cl||'#3b82f6')+';font-weight:600">'+b.id+'</td><td>'+b.st+'</td><td>'+b.sz+'B</td><td><span style="color:#16a34a;font-size:11px">&#9679; allocated</span></td></tr>'}).join('')}
function alFrSel(){document.getElementById('al-free-sel').innerHTML=alBlocks.filter(function(b){return!b.fr}).map(function(b){return'<option value="'+b.id+'">'+b.id+' ('+b.sz+'B @ '+b.st+')</option>'}).join('')||'<option style="color:#9ca3af">— none —</option>'}
function alStats(){
  var used=alBlocks.filter(function(b){return!b.fr}).reduce(function(s,b){return s+b.sz},0);
  var fr=AL-used,holes=alBlocks.filter(function(b){return b.fr});
  var ef=holes.length>1?holes.slice(0,-1).reduce(function(s,b){return s+b.sz},0):0;
  document.getElementById('al-stats').innerHTML=
    '<div class="statb"><div class="statv" style="color:#2563eb">'+used+'B</div><div class="statl">Used</div></div>'+
    '<div class="statb"><div class="statv" style="color:#16a34a">'+fr+'B</div><div class="statl">Free</div></div>'+
    '<div class="statb"><div class="statv" style="color:'+(ef>0?'#f87171':'#4ade80')+'">'+ef+'B</div><div class="statl">Ext Frag</div></div>'+
    '<div class="statb"><div class="statv">'+Math.round(used/AL*100)+'%</div><div class="statl">Util</div></div>';
  document.getElementById('al-holes').innerHTML=holes.length?holes.map(function(h){return'<span class="badge b-amber">'+h.sz+'B @ '+h.st+'</span>'}).join(' '):'<span style="color:#16a34a">No holes</span>'
}
function alInfo(){
  var a=document.getElementById('al-algo').value;
  var t={first:'<b style="color:#2563eb">First Fit:</b> Scans from address 0, picks the <b>first</b> free hole large enough. Fast O(n) but tends to leave small unusable holes near the start of memory.',
         best:'<b style="color:#16a34a">Best Fit:</b> Scans <b>all</b> free holes, picks the <b>smallest</b> one that fits. Minimises wasted space per allocation, but can create many tiny holes over time.',
         worst:'<b style="color:#d97706">Worst Fit:</b> Picks the <b>largest</b> free hole. Leaves larger remainders after splitting, which may be useful for future big allocations. Slowest.'};
  document.getElementById('al-info').innerHTML=t[a]
}
function alAlloc(){
  var sz=parseInt(document.getElementById('al-sz').value),nm=document.getElementById('al-name').value.trim();
  if(!nm){nm='P'+(++alNameIdx);document.getElementById('al-name').value='P'+(alNameIdx+1)}
  else{/* auto-increment name for next time */
    var match=nm.match(/^([A-Za-z]*)(\d+)$/);
    if(match)document.getElementById('al-name').value=match[1]+(parseInt(match[2])+1);
    else document.getElementById('al-name').value=nm+(alNameIdx++)}
  var algo=document.getElementById('al-algo').value;
  if(!sz||sz<1){lg('al-log','lerr','Invalid size');return}
  var holes=alBlocks.map(function(b,i){return Object.assign({},b,{i:i})}).filter(function(b){return b.fr&&b.sz>=sz});
  if(!holes.length){lg('al-log','lerr','['+algo.toUpperCase()+'] No hole >= '+sz+'B found');alShowNoHole(algo,sz);return}
  var ch;if(algo==='first')ch=holes[0];else if(algo==='best')ch=holes.reduce(function(a,b){return b.sz<a.sz?b:a});else ch=holes.reduce(function(a,b){return b.sz>a.sz?b:a});
  var col=alPal[alIdx%alPal.length];alIdx++;
  var nb={id:nm,st:ch.st,sz:sz,fr:false,cl:col};
  if(ch.sz>sz)alBlocks.splice(ch.i,1,nb,{id:'f'+ch.st,st:ch.st+sz,sz:ch.sz-sz,fr:true});
  else alBlocks[ch.i]=nb;
  lg('al-log','lw','['+algo.toUpperCase()+'] '+nm+'('+sz+'B) @ '+ch.st+', rem='+(ch.sz-sz)+'B');
  alShowProc(algo,sz,holes.length,ch,nm);alRender()
}
function alFree(){
  var id=document.getElementById('al-free-sel').value,idx=alBlocks.findIndex(function(b){return b.id===id});
  if(idx<0)return;var fr=alBlocks[idx];alBlocks[idx]={id:'f'+fr.st,st:fr.st,sz:fr.sz,fr:true};
  var i=0;while(i<alBlocks.length-1){if(alBlocks[i].fr&&alBlocks[i+1].fr){alBlocks[i]={id:'f'+alBlocks[i].st,st:alBlocks[i].st,sz:alBlocks[i].sz+alBlocks[i+1].sz,fr:true};alBlocks.splice(i+1,1)}else i++}
  lg('al-log','lok','Freed '+fr.id+' ('+fr.sz+'B), coalesced adjacent holes');alShowFreeProc(fr.id,fr.sz);alRender()
}
function alCompact(){
  var used=alBlocks.filter(function(b){return!b.fr}),fr=AL-used.reduce(function(s,b){return s+b.sz},0),addr=0;
  alBlocks=used.map(function(b){var nb=Object.assign({},b,{st:addr});addr+=b.sz;return nb});
  if(fr>0)alBlocks.push({id:'fc',st:addr,sz:fr,fr:true});
  lg('al-log','lok','Compacted: all '+used.length+' blocks shifted left, '+fr+'B free at end');
  var s1=mkStep(1,'Move All Allocated Blocks','Shift each block to fill gaps, starting from address 0','done');
  var s2=mkStep(2,'Merge All Free Space','All free holes combined into one large block at end','done');
  var s3=mkStep(3,'Result','<span class="iv iv-g">'+fr+'B</span> of contiguous free space now available &mdash; external fragmentation eliminated','active');
  document.getElementById('al-proc').innerHTML=s1+s2+s3;alRender()
}
function alReset(){document.getElementById('al-log').innerHTML='';alInit();alNameIdx=4;document.getElementById('al-name').value='P5'}
function alShowProc(algo,sz,hcnt,chosen,nm){
  var af={first:'First Fit',best:'Best Fit',worst:'Worst Fit'};
  var ad={first:'Scanned from addr 0, picked <b>first</b> hole &ge; '+sz+'B',best:'Evaluated all '+hcnt+' holes, picked <b>smallest</b> sufficient hole',worst:'Evaluated all '+hcnt+' holes, picked <b>largest</b> hole'};
  var s1=mkStep(1,'Scan Free Holes','Found <span class="iv iv-b">'+hcnt+'</span> hole(s) with size &ge; <span class="iv iv-a">'+sz+'</span>B','done');
  var s2=mkStep(2,'Apply '+af[algo],ad[algo],'done');
  var rem=chosen.sz-sz;
  var s3=mkStep(3,'Allocate + Split','<span class="iv iv-g">'+nm+'</span> at addr <span class="iv iv-a">'+chosen.st+'</span>, size <span class="iv iv-b">'+sz+'</span>B. '+(rem>0?'Remaining hole = <span class="iv iv-r">'+rem+'</span>B':'Exact fit &mdash; no remainder'),'active');
  document.getElementById('al-proc').innerHTML=s1+s2+s3
}
function alShowFreeProc(id,sz){
  var s1=mkStep(1,'Mark Block as Free','Block <span class="iv iv-r">'+id+'</span> ('+sz+'B) returned to free pool','done');
  var s2=mkStep(2,'Coalesce Adjacent Holes','Check left & right neighbours; merge if also free (reduces fragmentation)','done');
  var s3=mkStep(3,'Hole List Updated','Use <b>Compact</b> to move all blocks left and consolidate all holes at end','active');
  document.getElementById('al-proc').innerHTML=s1+s2+s3
}
function alShowNoHole(algo,sz){
  var s1=mkStep(1,'Scan Free Holes','<span class="iv iv-r">No hole &ge; '+sz+'B found</span> in entire memory','active');
  var s2=mkStep(2,'Allocation Failed','Try freeing blocks, compacting, or allocating smaller size','');
  document.getElementById('al-proc').innerHTML=s1+s2
}

/* ── boot & initial process panels ── */
pgInit();segInit();vmInit();vmRender();alInit();
document.getElementById('pg-proc').innerHTML=mkStep(1,'Split Virtual Address','Enter a VA above (0-255) to see steps','active')+mkStep(2,'Lookup Page Table','VPN checked against page table','')+mkStep(3,'Compute Physical Address','PA = PFN &times; 16 + Offset','');
document.getElementById('seg-proc').innerHTML=mkStep(1,'Read Logical Address','Choose segment and enter offset above','active')+mkStep(2,'Bounds Check','offset &lt; limit ?','')+mkStep(3,'Compute Physical Address','PA = base + offset','');
document.getElementById('vm-proc').innerHTML=mkStep(1,'Check TLB','Press Step or Space to begin','active')+mkStep(2,'TLB Result','shown after step','')+mkStep(3,'Check Physical Frames','frame state shown here','')+mkStep(4,'Page Replacement','only when all frames full','');
document.getElementById('al-proc').innerHTML=mkStep(1,'Scan Free Holes','Press Allocate to see process','active')+mkStep(2,'Apply Strategy','First / Best / Worst Fit logic','')+mkStep(3,'Allocate + Split','block placed, remainder shown','');
pgTrans();segTrans();
