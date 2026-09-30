const K="hms_v1",R0=101,R1=120,CAP=2;
let db=null;try{db=JSON.parse(localStorage.getItem(K))}catch(e){}
db=db||{};db.students=db.students||[];db.fee=db.fee||50000;db.pw=db.pw||"1234";
["log","req","cmp","notes","blocked","pay","gate"].forEach(k=>db[k]=db[k]||[]);db.students.forEach(s=>s.pin=s.pin||String(s.id));
const $=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rupee=n=>"₹"+Number(n).toLocaleString("en-IN");
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5),today=()=>new Date().toLocaleDateString();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}};
function log(m){db.log.unshift(new Date().toLocaleString()+" - "+m);db.log=db.log.slice(0,80);save()}
let tt;function toast(m){const t=$("toast");t.textContent=m;t.classList.remove("hidden");clearTimeout(tt);tt=setTimeout(()=>t.classList.add("hidden"),2600)}
const occ=r=>db.students.filter(s=>s.room==r).length;
const sn=id=>{const s=db.students.find(x=>x.id==id);return s?s.name:"Removed student"};
function check(r,self){if(!(r>=R0&&r<=R1))return"Room must be between 101 and 120.";if(db.blocked.includes(r))return"Room "+r+" is blocked for maintenance.";if(db.students.filter(s=>s.room==r&&s.id!=self).length>=CAP)return"Room "+r+" is full.";return""}
let role="student",me=null;
const gm=()=>db.students.find(s=>s.id==me);
function show(p){["launch","login","sp","ap"].forEach(x=>$(x).classList.toggle("hidden",x!==p));window.scrollTo(0,0)}
function setRole(r){role=r;$("rs").classList.toggle("on",r==="student");$("ra").classList.toggle("on",r==="admin");$("ul").textContent=r==="admin"?"Username":"Student ID";$("pl").textContent=r==="admin"?"Password":"PIN";$("lh").textContent=r==="admin"?"Demo login: admin / 1234. Runs in the browser, so for demonstration only.":"Your PIN is your student ID until you change it. Ask the warden to add you if you cannot sign in."}
function toLogin(r){setRole(r);show("login")}
function doLogin(){const u=$("u").value.trim(),p=$("p").value;
if(role==="admin"){if(u==="admin"&&p===db.pw){log("Admin signed in");show("ap");atab("dash")}else return toast("Wrong username or password.")}
else{const s=db.students.find(x=>x.id==u&&x.pin===p);if(!s)return toast("Wrong student ID or PIN.");me=s.id;show("sp");stab("home")}
$("u").value=$("p").value=""}
function logout(){if(role==="admin")log("Admin signed out");me=null;show("launch")}
function tabs(root,p,t){document.querySelectorAll("#"+root+" .tab").forEach(e=>e.classList.toggle("hidden",e.id!==p+"-"+t));document.querySelectorAll("#"+root+" .nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===t))}
function atab(t){tabs("ap","a",t);rA()}
function stab(t){tabs("sp","s",t);rS()}
function door(r,fn){const c=occ(r),m=gm()&&role==="student"&&gm().room==r,b=db.blocked.includes(r),k=m?"me":b?"b":c>=CAP?"f":c?"p":"";return `<div class="door ${k}" onclick="${fn}(${r})">${r}<small>${b?"Blocked":c+"/"+CAP}</small></div>`}
const stat=(p,d)=>d<=0?'<span class="tag ok">Paid</span>':p?'<span class="tag wn">Partial</span>':'<span class="tag bd">Unpaid</span>';
/* STUDENT PORTAL */
function rS(){const s=gm();if(!s)return;rXS(s);const due=Math.max(db.fee-s.fee,0),open=db.cmp.filter(c=>c.sid==s.id&&c.st==="open").length;
$("hi").textContent="Hello, "+s.name;
$("hc").innerHTML=[["My room",s.room||"Not assigned"],["Fee due",rupee(due)],["Open complaints",open],["Course",esc(s.course)]].map(c=>`<div class="card"><b>${c[1]}</b><span>${c[0]}</span></div>`).join("");
$("sn").innerHTML=db.notes.map(n=>`<div class="note">${esc(n.txt)}<br><small>${esc(n.t)}</small></div>`).join("")||'<p class="hint">No notices right now.</p>';
let h="";for(let r=R0;r<=R1;r++)h+=door(r,"sDet");$("srg").innerHTML=h;
$("srq").innerHTML=db.req.filter(x=>x.sid==s.id).map(x=>`<tr><td>${x.room}</td><td>${esc(x.t)}</td><td>${x.st}</td></tr>`).join("")||'<tr><td colspan="3">No requests yet.</td></tr>';
const p=Number(s.fee),pc=Math.min(Math.round(p/db.fee*100),100);
$("sfc").innerHTML=[["Total fee",rupee(db.fee)],["Paid",rupee(p)],["Due",rupee(due)]].map(c=>`<div class="card"><b>${c[1]}</b><span>${c[0]}</span></div>`).join("");
$("sfb").style.width=pc+"%";$("sft").textContent=pc+"% paid";
$("scl").innerHTML=db.cmp.filter(c=>c.sid==s.id).map(c=>`<div class="note">${esc(c.txt)}<br><small>${esc(c.t)} - ${c.st}</small></div>`).join("")||'<p class="hint">No complaints raised.</p>'}
function sDet(r){const s=gm(),c=occ(r),err=check(r,s.id),pend=db.req.some(x=>x.sid==s.id&&x.st==="pending");let a;
if(s.room)a=s.room==r?"This is your room.":"You already have room "+s.room+".";else if(pend)a="You have a request waiting for approval.";else if(err)a=err;else a=`<button onclick="reqRoom(${r})">Request room ${r}</button>`;
$("srd").innerHTML=`<h3>Room ${r}</h3><p>${db.blocked.includes(r)?"Blocked for maintenance":(CAP-c)+" of "+CAP+" beds free"}</p><p style="margin-top:10px">${a}</p>`}
function reqRoom(r){const s=gm();db.req.push({id:uid(),sid:s.id,room:r,st:"pending",t:today()});log(s.name+" requested room "+r);toast("Request sent to the warden.");rS();sDet(r)}
function setPin(){if($("np").value.length<4)return toast("Use at least 4 characters.");gm().pin=$("np").value;$("np").value="";log(gm().name+" changed their PIN");toast("PIN saved.")}
function addCmp(){const t=$("ct").value.trim();if(!t)return toast("Describe the problem first.");db.cmp.unshift({id:uid(),sid:me,txt:t,st:"open",t:today()});log("Complaint from "+gm().name);$("ct").value="";toast("Complaint submitted.");rS()}
/* ADMIN PORTAL */
function rA(){rDash();rStu();rReq();rRooms();rFees();rCmp();rNotes();rSet();rX()}
function badge(id,n){const e=$(id);e.textContent=n;e.classList.toggle("hidden",!n)}
function bars(o){const m=Math.max(1,...Object.values(o));return Object.entries(o).map(([k,v])=>`<div class="bl"><span>${esc(k)}</span><div class="bar"><i style="width:${v/m*100}%"></i></div><b>${v}</b></div>`).join("")||'<p class="hint">No data yet.</p>'}
function rDash(){const s=db.students,orm=new Set(s.filter(x=>x.room).map(x=>x.room)).size,tot=R1-R0+1,paid=s.reduce((t,x)=>t+Number(x.fee),0),due=Math.max(s.length*db.fee-paid,0),pr=db.req.filter(x=>x.st==="pending").length,oc=db.cmp.filter(x=>x.st==="open").length;
$("ac").innerHTML=[["Students",s.length],["Rooms occupied",orm],["Rooms free",tot-orm-db.blocked.length],["Fees collected",rupee(paid)],["Fees due",rupee(due)],["Pending requests",pr],["Open complaints",oc]].map(c=>`<div class="card"><b>${c[1]}</b><span>${c[0]}</span></div>`).join("");
const pct=Math.round(s.filter(x=>x.room).length/(tot*CAP)*100);$("occb").style.width=pct+"%";$("occt").textContent=pct+"% of beds filled. "+db.blocked.length+" rooms blocked.";
const c={},f={Paid:0,Partial:0,Unpaid:0};s.forEach(x=>{c[x.course]=(c[x.course]||0)+1;f[x.fee>=db.fee?"Paid":x.fee>0?"Partial":"Unpaid"]++});
$("crs").innerHTML=bars(c);$("fst").innerHTML=bars(f);
$("log1").innerHTML=db.log.slice(0,8).map(l=>`<div>${esc(l)}</div>`).join("")||"<div>No activity yet.</div>";badge("bq",pr);badge("bc",oc)}
let ed=null;
function clr(){ed=null;["sid","sname","sa","sc","sr"].forEach(i=>$(i).value="");$("sf").value=0;$("sid").disabled=false;$("fh").textContent="Add student";$("sbtn").textContent="Add student";$("scn").classList.add("hidden")}
function saveStu(){const id=$("sid").value.trim(),n=$("sname").value.trim(),a=$("sa").value.trim(),c=$("sc").value.trim(),r=Number($("sr").value||0),f=Number($("sf").value||0);
if(!id||!n||!a||!c)return toast("Please fill ID, name, age and course.");
if(!ed&&db.students.some(s=>s.id==id))return toast("Student ID already exists.");
if(r){const e=check(r,id);if(e)return toast(e)}
if(f<0||f>db.fee)return toast("Fee paid must be between 0 and "+db.fee+".");
if(ed){Object.assign(db.students.find(s=>s.id==ed),{name:n,age:a,course:c,room:r,fee:f});log("Updated student "+n)}
else{db.students.push({id,name:n,age:a,course:c,room:r,fee:f,pin:id});log("Added student "+n+" (ID "+id+")")}
toast(ed?"Changes saved.":"Student added.");clr();rA()}
function edit(id){const s=db.students.find(x=>x.id==id);ed=s.id;$("sid").value=s.id;$("sid").disabled=true;$("sname").value=s.name;$("sa").value=s.age;$("sc").value=s.course;$("sr").value=s.room||"";$("sf").value=s.fee;$("fh").textContent="Edit student";$("sbtn").textContent="Save changes";$("scn").classList.remove("hidden");window.scrollTo(0,0)}
function rStu(){const q=$("q").value.toLowerCase(),fl=$("fl").value,so=$("so").value;
const l=db.students.filter(s=>(!q||String(s.id).includes(q)||s.name.toLowerCase().includes(q))&&(!fl||(fl==="in")===!!s.room)).sort((a,b)=>so==="name"?a.name.localeCompare(b.name):so==="room"?(a.room||999)-(b.room||999):String(a.id).localeCompare(String(b.id),0,{numeric:true}));
$("sb").innerHTML=l.map(s=>{const i=esc(s.id);return `<tr><td>${i}</td><td>${esc(s.name)}</td><td>${esc(s.age)}</td><td>${esc(s.course)}</td><td>${s.room||"None"}</td><td>${rupee(s.fee)}</td><td><button class="g s" onclick="edit('${i}')">Edit</button> <button class="g s" onclick="vacate('${i}')">Vacate</button> <button class="g s" onclick="rpin('${i}')">Reset PIN</button> <button class="d s" onclick="del('${i}')">Delete</button></td></tr>`}).join("")||'<tr><td colspan="7">No students found.</td></tr>'}
function vacate(id){const s=db.students.find(x=>x.id==id);if(!s||!s.room)return toast("No room assigned.");log("Vacated room "+s.room+" for "+s.name);s.room=0;toast("Room vacated.");rA();if(window.cr)rDet(window.cr)}
function rpin(id){const s=db.students.find(x=>x.id==id);s.pin=String(s.id);log("Reset PIN for "+s.name);toast("PIN reset to the student ID.")}
function del(id){const s=db.students.find(x=>x.id==id);db.students=db.students.filter(x=>x.id!=id);db.req=db.req.filter(x=>x.sid!=id);db.gate=db.gate.filter(x=>x.sid!=id);log("Deleted student "+s.name);toast("Student deleted.");rA()}
function rReq(){const l=[...db.req].sort((a,b)=>(a.st==="pending"?0:1)-(b.st==="pending"?0:1));
$("rq").innerHTML=l.map(x=>`<tr><td>${esc(sn(x.sid))}</td><td>${x.room}</td><td>${esc(x.t)}</td><td>${x.st}</td><td>${x.st==="pending"?`<button class="s" onclick="decide('${x.id}',1)">Approve</button> <button class="d s" onclick="decide('${x.id}',0)">Reject</button>`:""}</td></tr>`).join("")||'<tr><td colspan="5">No room requests yet.</td></tr>'}
function decide(id,ok){const x=db.req.find(r=>r.id===id),s=db.students.find(v=>v.id==x.sid);
if(ok){if(!s)return toast("Student no longer exists.");if(s.room)return toast("Student already has a room.");const e=check(x.room,s.id);if(e)return toast(e);
s.room=x.room;x.st="approved";db.req.forEach(r=>{if(r.sid==x.sid&&r.st==="pending")r.st="rejected"});log("Approved room "+x.room+" for "+s.name)}
else{x.st="rejected";log("Rejected room "+x.room+" request from "+sn(x.sid))}
toast(ok?"Request approved.":"Request rejected.");rA()}
function rRooms(){let h="";for(let r=R0;r<=R1;r++)h+=door(r,"rDet");$("rg").innerHTML=h}
function rDet(r){window.cr=r;const l=db.students.filter(s=>s.room==r),b=db.blocked.includes(r);
$("rd").innerHTML=`<h3>Room ${r}: ${b?"blocked":l.length+" of "+CAP+" beds taken"}</h3>`+l.map(s=>`<p style="margin-bottom:8px">${esc(s.name)} (ID ${esc(s.id)}, ${esc(s.course)}) <button class="g s" onclick="vacate('${esc(s.id)}')">Vacate</button></p>`).join("")+(l.length?"":`<p class="hint" style="margin-bottom:10px">No students in this room.</p>`)+(l.length?"":`<button class="${b?"":"d"}" onclick="blk(${r})">${b?"Unblock room":"Block for maintenance"}</button>`)}
function blk(r){if(db.blocked.includes(r)){db.blocked=db.blocked.filter(x=>x!==r);log("Unblocked room "+r)}else{db.blocked.push(r);log("Blocked room "+r)}toast("Room updated.");rA();rDet(r)}
function rFees(){const f=$("ff").value;$("fb").innerHTML=db.students.filter(s=>{const p=Number(s.fee);return!f||(f==="paid"?p>=db.fee:f==="partial"?p>0&&p<db.fee:p===0)}).map(s=>{const p=Number(s.fee),d=Math.max(db.fee-p,0),pc=Math.min(Math.round(p/db.fee*100),100),i=esc(s.id);
return `<tr><td>${i}</td><td>${esc(s.name)}</td><td>${rupee(p)}</td><td>${rupee(d)}</td><td><div class="bar"><i style="width:${pc}%"></i></div></td><td>${stat(p,d)}</td><td>${d?`<input id="pay${i}" type="number" style="width:90px;padding:4px"> <button class="s" onclick="pay('${i}')">Add</button>`:"-"}</td></tr>`}).join("")||'<tr><td colspan="7">No students match.</td></tr>'}
function pay(id){const s=db.students.find(x=>x.id==id),v=Number($("pay"+id).value);if(!v||v<=0)return toast("Enter a payment amount.");if(Number(s.fee)+v>db.fee)return toast("Payment exceeds the amount due.");s.fee=Number(s.fee)+v;db.pay.unshift({id:uid(),sid:s.id,amt:v,t:today()});log("Recorded "+rupee(v)+" from "+s.name);toast("Payment recorded.");rA()}
function rCmp(){$("cl").innerHTML=db.cmp.map(c=>`<div class="note"><b>${esc(sn(c.sid))}</b> <span class="tag ${c.st==="open"?"wn":"ok"}">${c.st}</span><br>${esc(c.txt)}<br><small>${esc(c.t)}</small><div class="row" style="margin-top:6px"><button class="g s" onclick="togC('${c.id}')">${c.st==="open"?"Mark resolved":"Reopen"}</button><button class="d s" onclick="delC('${c.id}')">Delete</button></div></div>`).join("")||'<p class="hint">No complaints yet.</p>'}
function togC(id){const c=db.cmp.find(x=>x.id===id);c.st=c.st==="open"?"resolved":"open";log("Complaint "+c.st+" ("+sn(c.sid)+")");rA()}
function delC(id){db.cmp=db.cmp.filter(x=>x.id!==id);save();rA()}
function addNote(){const t=$("nt").value.trim();if(!t)return toast("Write a notice first.");db.notes.unshift({id:uid(),txt:t,t:today()});log("Posted a notice");$("nt").value="";toast("Notice posted.");rA()}
function rNotes(){$("nl").innerHTML=db.notes.map(n=>`<div class="note">${esc(n.txt)}<br><small>${esc(n.t)}</small> <button class="d s" onclick="delN('${n.id}')">Delete</button></div>`).join("")||'<p class="hint">No notices posted.</p>'}
function delN(id){db.notes=db.notes.filter(x=>x.id!==id);save();rA()}
function rSet(){$("nf").value=db.fee;exp();$("log2").innerHTML=db.log.map(l=>`<div>${esc(l)}</div>`).join("")||"<div>No activity yet.</div>"}
function setFee(){const v=Number($("nf").value);if(!v||v<=0)return toast("Enter a valid fee.");if(db.students.some(s=>s.fee>v))return toast("Some students have already paid more than this.");db.fee=v;log("Hostel fee set to "+rupee(v));toast("Fee saved.");rA()}
function setPw(){if($("op").value!==db.pw)return toast("Current password is wrong.");if($("npw").value.length<4)return toast("Use at least 4 characters.");db.pw=$("npw").value;$("op").value=$("npw").value="";log("Admin password changed");toast("Password changed.")}
function exp(){$("bk").value=JSON.stringify({students:db.students,fee:db.fee,req:db.req,cmp:db.cmp,notes:db.notes,blocked:db.blocked,pay:db.pay,gate:db.gate})}
function imp(){try{const d=JSON.parse($("bk").value);if(!Array.isArray(d.students))throw 0;db.students=d.students;db.fee=Number(d.fee)||db.fee;["req","cmp","notes","blocked","pay","gate"].forEach(k=>db[k]=d[k]||[]);db.students.forEach(s=>s.pin=s.pin||String(s.id));log("Restored backup");toast("Backup restored.");rA()}catch(e){toast("That backup text is not valid.")}}
function demo(){[["Aarav Kumar","B.Tech CSE"],["Meera Nair","BBA"],["Rohan Das","B.Sc Physics"],["Sana Khan","B.Com"],["Vikram Rao","B.Tech CSE"],["Isha Patel","BCA"]].forEach((x,i)=>{const id=String(1001+i);if(!db.students.some(s=>s.id==id)){const r=R0+Math.floor(i/2),ok=!check(r,id);db.students.push({id,name:x[0],age:String(18+i%4),course:x[1],room:ok&&i<4?r:0,fee:[0,25000,50000][i%3],pin:id})}});
log("Loaded demo students");toast("Demo students loaded. Student login: ID 1001, PIN 1001.");rA()}
let rc=0;function reset(){const b=$("rsb");if(!rc){rc=1;b.textContent="Click again to confirm";setTimeout(()=>{rc=0;b.textContent="Delete all data"},3000);return}
rc=0;b.textContent="Delete all data";db.students=[];db.req=[];db.cmp=[];db.notes=[];db.blocked=[];db.pay=[];db.gate=[];log("All data deleted");toast("All data deleted.");rA()}
$("bld").innerHTML=Array.from({length:30},(_,i)=>`<i class="${(i*7+3)%5<2?"l":""}"></i>`).join("")+"<b></b>";
setRole("student");
/* EXTRAS: gate passes, receipts, smart allocation, insights, CSV, theme */
const iso=()=>new Date().toISOString().slice(0,10);
const gtag=g=>{const late=g.st==="approved"&&g.back<iso();return `<span class="tag ${late||g.st==="pending"?"wn":g.st==="rejected"?"bd":"ok"}">${late?"overdue":g.st}</span>`};
function payList(l){return l.map(p=>`<div class="note">${rupee(p.amt)} <small>${esc(p.t)}${p.nm?" - "+esc(p.nm):""}</small> <button class="g s" onclick="rcpt('${p.id}')">Print receipt</button></div>`).join("")||'<p class="hint">No payments yet.</p>'}
function rXS(s){$("sgl").innerHTML=db.gate.filter(g=>g.sid==s.id).map(g=>`<div class="note">${esc(g.why)} ${gtag(g)}<br><small>${esc(g.out)} to ${esc(g.back)}</small></div>`).join("")||'<p class="hint">No passes yet.</p>';$("spl").innerHTML=payList(db.pay.filter(p=>p.sid==s.id))}
function rX(){const gp=db.gate.filter(g=>g.st==="pending").length;badge("bg",gp);
$("agl").innerHTML=db.gate.map(g=>{const b=g.st==="pending"?`<button class="s" onclick="gSet('${g.id}','approved')">Approve</button> <button class="d s" onclick="gSet('${g.id}','rejected')">Reject</button>`:g.st==="approved"?`<button class="g s" onclick="gSet('${g.id}','returned')">Mark returned</button>`:"";return `<div class="note"><b>${esc(sn(g.sid))}</b> ${gtag(g)}<br>${esc(g.why)}<br><small>${esc(g.out)} to ${esc(g.back)}</small><div class="row" style="margin-top:6px">${b}</div></div>`}).join("")||'<p class="hint">No gate pass requests.</p>';
$("apl").innerHTML=payList(db.pay.map(p=>({...p,nm:sn(p.sid)})).slice(0,30));
const s=db.students,tot=s.length*db.fee,pd=s.reduce((t,x)=>t+Number(x.fee),0),pc=tot?Math.round(pd/tot*100):0;
$("dn").style.background=`conic-gradient(var(--ok) ${pc}%,var(--line) 0)`;$("dnt").textContent=pc+"%";
const un=s.filter(x=>Number(x.fee)<=0).length,nr=s.filter(x=>!x.room).length,late=db.gate.filter(g=>g.st==="approved"&&g.back<iso()).length,half=Array.from({length:R1-R0+1},(_,i)=>R0+i).filter(r=>occ(r)===1&&!db.blocked.includes(r)).length,I=[];
if(un)I.push(un+" students have paid nothing yet.");if(nr)I.push(nr+" students have no room. Try Smart allocate in Settings.");if(late)I.push(late+" gate passes are overdue for return.");if(half)I.push(half+" rooms still have one free bed.");if(!I.length)I.push("All clear. Nothing needs attention.");
$("ins").innerHTML=I.map(t=>`<div class="note">${t}</div>`).join("")}
function addGate(){const s=gm(),w=$("gw").value.trim(),o=$("go").value,b=$("gb").value;if(!s.room)return toast("You need a room first.");if(!w||!o||!b)return toast("Fill the reason and both dates.");if(b<o)return toast("Return date is before leaving date.");db.gate.unshift({id:uid(),sid:s.id,why:w,out:o,back:b,st:"pending"});log("Gate pass requested by "+s.name);["gw","go","gb"].forEach(i=>$(i).value="");toast("Gate pass requested.");rS()}
function gSet(id,st){const g=db.gate.find(x=>x.id===id);g.st=st;log("Gate pass "+st+" for "+sn(g.sid));toast("Gate pass "+st+".");rA()}
function rcpt(id){const p=db.pay.find(x=>x.id===id),s=db.students.find(x=>x.id==p.sid),w=window.open("","_blank");if(!w)return toast("Allow pop-ups to print.");
w.document.write(`<title>Receipt ${esc(p.id)}</title><body style="font:16px Georgia,serif;max-width:420px;margin:40px auto"><h2>Hostel Fee Receipt</h2><p>Receipt no: ${esc(p.id)}<br>Date: ${esc(p.t)}</p><hr><p>Student: ${esc(s?s.name:"Removed student")} (ID ${esc(p.sid)})<br>Amount received: <b>${rupee(p.amt)}</b><br>Total paid so far: ${rupee(s?s.fee:0)}<br>Balance due: ${rupee(s?Math.max(db.fee-s.fee,0):0)}</p><hr><p>Signed: Warden</p><script>print()<\/script>`);w.document.close()}
function auto(){let n=0;db.students.filter(s=>!s.room).forEach(s=>{let b=0,bs=0;for(let r=R0;r<=R1;r++){if(check(r,s.id))continue;const m=db.students.filter(x=>x.room==r),sc=m.length?(m[0].course===s.course?3:1):2;if(sc>bs){bs=sc;b=r}}if(b){s.room=b;n++;db.req.forEach(r=>{if(r.sid==s.id&&r.st==="pending")r.st="rejected"})}});log("Smart allocation placed "+n+" students");toast(n?n+" students placed, course mates grouped together.":"No one to place, or no free beds.");rA()}
function csv(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"',rows=db.students.map(s=>[s.id,s.name,s.age,s.course,s.room||"",s.fee,Math.max(db.fee-s.fee,0)].map(q).join(",")),a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["ID,Name,Age,Course,Room,Paid,Due\n"+rows.join("\n")],{type:"text/csv"}));a.download="hostel-students.csv";a.click();log("Exported student CSV")}
function theme(){const r=document.documentElement,d=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark"}
