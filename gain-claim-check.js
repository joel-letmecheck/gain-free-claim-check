/* Gain Lawyers Free Claim Check v0.1.0
   (c) 2026 Gain Lawyers Pty Ltd. All rights reserved.
   One script for all flows. Usage:
   <div id="gain-claim-check" data-flow="motor-vehicle"></div>
   Optional: data-endpoint="https://..." overrides the submission endpoint. */
(function(){
'use strict';

var ENDPOINT='https://claim-check.gainlawyers.com.au/submit';
var CALC_URL='/personal-injury/compensation-calculator';
var PHONE_TXT='1300 11 GAIN',PHONE_TEL='1300114246';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

// ---------- Content ----------
function qld(t){return function(a){return a.location==='qld'?t:'';};}
function notQld(t){return function(a){return a.location!=='nsw'?t:'';};}
function o(v,l,n,x){var r={v:v,l:l};if(n)r.n=n;if(x)for(var k in x)r[k]=x[k];return r;}
var OUT_NOTE='We mainly act in Queensland and NSW matters. Leave your details and a member of our legal team will talk through your options and, where we can\u2019t act ourselves, point you in the right direction.';
function loc(opts){return{id:'location',q:'Where did it happen?',o:opts};}
var LOC_DEFAULT=[o('qld','Queensland'),o('nsw','New South Wales'),o('other','Another state or territory',OUT_NOTE,{out:1}),o('overseas','Overseas',OUT_NOTE,{out:1}),o('unsure','I\u2019m not sure')];
var IMPACT_COMMON=[o('pain','Ongoing pain or reduced movement'),o('timeoff','Time off work'),o('surgery','Surgery or hospital treatment'),o('family','Help needed from family or carers'),o('costs','Medical or out-of-pocket costs'),o('job','Can\u2019t do my previous job'),o('none','None of these yet',0,{x:1})];
function impact(opts,opt){return{id:'impact',q:'How has it affected you?',h:'Select all that apply.',multi:1,opt:opt,o:opts||IMPACT_COMMON};}

var N_MV_9M='In Queensland, a Notice of Accident Claim Form generally needs to be given to the CTP insurer within 9 months of the accident (or of symptoms first appearing), or within 1 month of first instructing a lawyer, whichever is earlier. A late notice can often still be accepted with a reasonable excuse for the delay. Claims involving an unidentified vehicle (hit-and-run) have much tighter deadlines \u2013 initial notice within 3 months, with an absolute bar at 9 months \u2013 so it\u2019s worth speaking to us as soon as possible. A member of our legal team can confirm where you stand on your free call.';
var N_MV_3Y='Queensland generally allows 3 years from the date of the accident to start court proceedings. There are exceptions \u2013 people who were under 18 at the time generally have until their 21st birthday, and a court can extend the time in limited circumstances. Don\u2019t rule yourself out \u2013 we\u2019ll let you know on the callback.';
var N_WC_6M='A Queensland workers\u2019 compensation application should be lodged within 6 months of the day a doctor first assesses your injury, under the Workers\u2019 Compensation and Rehabilitation Act 2003 (Qld). Late applications can still be accepted in some circumstances. Common law damages claims have a separate 3-year time limit. A member of our legal team can confirm whether you still have options.';
var N_WC_3Y='Common law claims generally need to be started within 3 years of the injury. A court can extend the time in limited circumstances, and some conditions caused by dust exposure (silicosis, asbestos-related disease) have no time limit. Don\u2019t rule yourself out \u2013 we\u2019ll let you know on the callback.';
var N_WC_REJ='A rejected claim doesn\u2019t necessarily mean you don\u2019t have options. Rejections can be reviewed and then appealed, but a review generally needs to be lodged within 3 months of the decision, so it\u2019s worth speaking to us soon. A member of our legal team can look at the specifics on your free call.';
var N_PL_9M='Under the Personal Injuries Proceedings Act 2002 (Qld), notice of a claim generally needs to be given within 9 months of the incident (or of symptoms first appearing), or within 1 month of first instructing a lawyer, whichever is earlier. A late notice can still be given with a reasonable excuse for the delay. A member of our legal team can confirm whether you still have options.';
var N_PL_3Y='The limitation period for personal injury claims in Queensland is generally 3 years. There are exceptions \u2013 people who were under 18 at the time generally have until their 21st birthday, and a court can extend the time in limited circumstances. Don\u2019t rule yourself out \u2013 we\u2019ll let you know on the callback.';
var N_MN_RECENT='Queensland generally allows 3 years to start a medical negligence claim in court. Where the harm, or its link to your treatment, only became clear later, the time limit may start later or a court may extend it. A member of our legal team can review whether your claim is still within time.';
var N_MN_KNOWN='There may still be options depending on your specific circumstances. If the person harmed was under 18 at the time, the time limit generally doesn\u2019t start until they turn 18. Don\u2019t rule yourself out \u2013 a member of our legal team can confirm on your free call.';
var N_MN_9M='Medical negligence claims in Queensland also have an early notice step, generally within 9 months, so it\u2019s worth talking to us soon.';
var N_AB_CHILD='In Queensland, there is no time limit for a civil claim about sexual abuse or serious physical abuse that happened to you as a child, however long ago it was. A member of our legal team can confirm what applies to your situation.';
var N_VAQ='A Victims Assist Queensland application may be available in addition to any civil claim.';
var CONFIRM='Thanks \u2013 we\u2019ll go through the detail on your call.';

var CRISIS='<p><strong>If you\u2019re in immediate danger, call 000.</strong> Support is also available any time through 1800RESPECT (<a href="tel:1800737732">1800 737 732</a>), Lifeline (<a href="tel:131114">13 11 14</a>), and the Blue Knot Helpline (<a href="tel:1300657380">1300 657 380</a>) for adult survivors of childhood trauma.</p>';
var ABUSE_INTRO='<p>You don\u2019t need to explain what happened here. These matters are deeply personal, and the right next step is a confidential conversation, not a form.</p>'+
'<p>In Queensland, there is no time limit for a civil claim about sexual abuse or serious physical abuse that happened to you as a child, however long ago it was. For abuse as an adult, different time limits apply, and we can explain them.</p>'+
'<p>Leave your details below and a lawyer experienced in abuse claims will call you within one business day. If a callback isn\u2019t right for you, call <a href="tel:'+PHONE_TEL+'">'+PHONE_TXT+'</a> directly. Everything you share stays confidential.</p>'+CRISIS;

var FLOWS={
'motor-vehicle':{final:'summary',steps:[
  loc(LOC_DEFAULT),
  {id:'when',q:'When did the accident happen?',o:[o('lt9','Less than 9 months ago'),o('9m3y','Between 9 months and 3 years ago',qld(N_MV_9M)),o('gt3','More than 3 years ago',qld(N_MV_3Y)),o('unsure','I\u2019m not sure')]},
  {id:'role',q:'How were you involved?',o:[o('driver','Driver'),o('passenger','Passenger'),o('pedestrian','Pedestrian'),o('cyclist','Cyclist'),o('motorcyclist','Motorcyclist'),o('escooter','E-scooter rider'),o('other','Other')]},
  impact(),
  {id:'ctp',q:'Have you lodged a CTP claim?',o:[o('yes','Yes','Good to know \u2013 we\u2019ll go through where it\u2019s up to.'),o('no','No','That\u2019s fine \u2013 we can talk through next steps.'),o('unsure','I don\u2019t know what that is','That\u2019s okay \u2013 we\u2019ll explain it on the call.')]}
]},
'workers-compensation':{final:'summary',steps:[
  loc([o('qld','Queensland workplace'),o('nsw','NSW workplace'),o('other','Another state or territory',OUT_NOTE,{out:1}),o('overseas','Overseas (my employer is based in QLD or NSW)'),o('unsure','I\u2019m not sure')]),
  {id:'when',q:'When did it happen (or when did symptoms first appear)?',o:[o('lt6','Less than 6 months ago'),o('6m3y','Between 6 months and 3 years ago',qld(N_WC_6M)),o('gt3','More than 3 years ago',qld(N_WC_3Y)),o('unsure','I\u2019m not sure')]},
  {id:'kind',q:'What kind of injury?',o:[o('incident','Physical injury from a specific incident'),o('gradual','Physical injury that built up over time (e.g. RSI, hearing loss)'),o('psych','Psychological injury'),o('combo','A combination'),o('illness','Illness or disease')]},
  impact([o('timeoff','Time off work'),o('reduced','Reduced duties'),o('surgery','Surgery or hospital treatment'),o('impairment','Permanent impairment diagnosed'),o('employer','No longer with the same employer'),o('costs','Medical or out-of-pocket costs'),o('none','None of these yet',0,{x:1})]),
  {id:'wc',q:'Have you lodged a WorkCover claim?',o:[o('accepted','Yes \u2013 accepted','Thanks \u2013 we\u2019ll go through where it\u2019s up to.'),o('rejected','Yes \u2013 rejected',N_WC_REJ),o('waiting','Yes \u2013 waiting to hear','Thanks \u2013 we\u2019ll go through where it\u2019s up to.'),o('no','No','That\u2019s fine \u2013 we can talk through next steps.'),o('unsure','I\u2019m not sure','That\u2019s okay \u2013 we\u2019ll help you work it out on the call.')]}
]},
'public-liability':{final:'summary',steps:[
  loc(LOC_DEFAULT),
  {id:'when',q:'When did the accident happen?',o:[o('lt9','Less than 9 months ago'),o('9m3y','Between 9 months and 3 years ago',qld(N_PL_9M)),o('gt3','More than 3 years ago',qld(N_PL_3Y)),o('unsure','I\u2019m not sure')]},
  {id:'place',q:'Where exactly did it happen?',o:[o('shop','Shop or business'),o('public','Footpath or public space'),o('private','Private property'),o('workplace','A workplace that isn\u2019t my employer\u2019s'),o('institution','School, hospital or government building'),o('sport','Sport or recreation'),o('other','Other')]},
  {id:'cause',q:'What caused it?',o:[o('fall','Slip, trip or fall'),o('hazard','Defect or hazard'),o('object','Falling object'),o('equipment','Faulty equipment'),o('assault','Attack or assault',notQld(N_VAQ)),o('other','Other')]},
  impact(),
  {id:'report',q:'Did you report it at the time?',o:[o('formal','Yes \u2013 a formal report','A formal report is helpful, and we\u2019ll go through what to do with it.'),o('told','I told someone','Thanks \u2013 that can still help.'),o('no','No','That\u2019s okay \u2013 a formal report helps but isn\u2019t essential.'),o('unsure','I\u2019m not sure','That\u2019s okay \u2013 a formal report helps but isn\u2019t essential.')]}
]},
'medical-negligence':{final:'thanks',story:1,heading:'Thanks for starting here.',body:'A lawyer experienced in medical negligence claims will call you within one business day. Everything you share is confidential. If you\u2019d rather talk to us first, you can call <a href="tel:'+PHONE_TEL+'">'+PHONE_TXT+'</a>.',storyLabel:'Briefly, what happened? A few sentences is fine \u2013 we\u2019ll go through the detail on the call.',steps:[
  {id:'when',q:'When did it happen (or when did you first realise)?',o:[o('lt3','Less than 3 years ago',N_MN_9M),o('recent','More than 3 years ago \u2013 I only recently became aware',function(){return[N_MN_RECENT,N_MN_9M];}),o('known','More than 3 years ago \u2013 I\u2019ve known for a while',N_MN_KNOWN),o('unsure','I\u2019m not sure')]},
  {id:'treatment',q:'What kind of treatment was it?',o:[o('surgery','Surgery or hospital care'),o('diagnosis','Diagnosis (missed, delayed or wrong)'),o('medication','Medication or prescribing'),o('birth','Birth injury'),o('dental','Dental'),o('mental','Mental health care'),o('other','Other')]}
]},
'abuse':{final:'abuse',heading:'Thanks for reaching out.',steps:[
  {id:'intro',info:ABUSE_INTRO,btn:'Next \u2192'},
  {id:'who',q:'Who was affected?',o:[o('me','Me'),o('loved','A loved one (I\u2019m asking on their behalf)'),o('others','Me and others (same institution)')]},
  {id:'when',q:'When did it happen (roughly)?',o:[o('child','As a child (under 18)',N_AB_CHILD),o('adult','As an adult'),o('both','Both',N_AB_CHILD),o('private','I\u2019d rather not say here')]}
]},
'other':{final:'thanks',heading:'Thanks for starting here.',body:'A member of our legal team will call you within one business day. Everything you share is confidential. If you\u2019d rather talk to us first, you can call <a href="tel:'+PHONE_TEL+'">'+PHONE_TXT+'</a>.',steps:[
  {id:'closest',q:'Which is closest to your situation?',o:[o('tpd','I can\u2019t work (super or TPD)'),o('dva','Veteran or ADF (DVA)'),o('product','Faulty product'),o('exposure','Harmful exposure (dust, silica, chemicals)'),o('multiple','Multiple situations'),o('unsure','I\u2019m not sure how to describe it')]},
  {id:'start',q:'Roughly when did this start?',o:[o('lt12','Less than 12 months ago'),o('1-3','1\u20133 years ago'),o('3-10','3\u201310 years ago'),o('gt10','More than 10 years ago'),o('ongoing','It\u2019s ongoing'),o('unsure','I\u2019m not sure')]},
  impact([o('job','I can\u2019t do my previous job'),o('nowork','I can\u2019t work at all'),o('medical','Significant medical costs'),o('family','Help needed from family'),o('mental','Mental health impact'),o('else','Something else')],1)
]}
};

// ---------- State ----------
var root,cfg,flowKey,endpoint;
var S={i:0,view:'q',ans:{},err:'',form:{name:'',phone:'',email:'',time:'',note:'',story:'',website:''},ferr:{},sending:false,subErr:'',first:''};

function steps(){return cfg.steps;}
function cur(){return steps()[S.i];}
function qsteps(){return steps().filter(function(s){return !s.info;});}
function selOpts(q){var v=S.ans[q.id];if(v==null)return[];v=[].concat(v);return q.o.filter(function(x){return v.indexOf(x.v)>-1;});}
function labels(q){return selOpts(q).map(function(x){return x.l;});}
function notesFor(q){
  var r=[];
  selOpts(q).forEach(function(x){
    if(x.out)r.push(x.n);
    else if(x.n){var n=typeof x.n==='function'?x.n(S.ans):x.n;if(n)r=r.concat(n);}
  });
  return r;
}
function answered(){return qsteps().filter(function(q){return S.ans[q.id]!=null&&[].concat(S.ans[q.id]).length;});}
function routedOut(){return qsteps().some(function(q){return selOpts(q).some(function(x){return x.out;});});}

// ---------- Rendering ----------
var LBL={location:'Location',when:'Timing',role:'Involvement',impact:'Impact',ctp:'CTP claim',kind:'Injury',wc:'WorkCover',place:'Place',cause:'Cause',report:'Reporting',treatment:'Treatment',who:'Who',closest:'Situation',start:'Start'};
function progress(){
  var qs=qsteps(),n=qs.length+1,idx=S.view==='form'?n:qs.indexOf(cur())+1,h='<div class="gcc-progress" role="progressbar" aria-valuemin="1" aria-valuemax="'+n+'" aria-valuenow="'+idx+'" aria-label="Step '+idx+' of '+n+'">';
  for(var i=1;i<=n;i++){
    var a=i===idx,d=i<idx;
    h+='<div class="gcc-pstep'+(a?' gcc-pa':'')+(d?' gcc-pd':'')+'"><div class="gcc-pdot">'+(d?'\u2713':i)+'</div><div class="gcc-plabel">'+(i<n?(LBL[qs[i-1].id]||''):'Details')+'</div></div>';
    if(i<n)h+='<div class="gcc-pline'+(d?' gcc-pd':'')+'"></div>';
  }
  return h+'</div>';
}
function opt(q,x){
  var v=S.ans[q.id],sel=q.multi?(v||[]).indexOf(x.v)>-1:v===x.v;
  return '<label class="gcc-opt'+(sel?' gcc-opt-sel':'')+(q.multi?' gcc-opt-multi':'')+'">'+
    '<input type="'+(q.multi?'checkbox':'radio')+'" name="gcc-'+q.id+'" data-q="'+q.id+'" value="'+esc(x.v)+'"'+(sel?' checked':'')+'>'+
    '<span class="gcc-opt-l">'+esc(x.l)+'</span></label>';
}
function notesHtml(list){
  return '<div class="gcc-notes" aria-live="polite">'+list.map(function(t){return '<p class="gcc-note">'+esc(t)+'</p>';}).join('')+'</div>';
}
function nav(next,showBack){
  return '<div class="gcc-nav"><button type="button" class="gcc-btn-back" data-act="back"'+(S.i===0&&S.view==='q'?' disabled':'')+'>\u2190 Back</button>'+
    '<button type="button" class="gcc-btn-next" data-act="'+next[0]+'">'+next[1]+'</button></div>';
}
function renderQ(){
  var q=cur();
  if(q.info)return '<h3 class="gcc-h" tabindex="-1">Confidential help for survivors of abuse</h3><div class="gcc-info">'+q.info+'</div>'+nav(['next',q.btn||'Next \u2192']);
  return '<h3 class="gcc-h" id="gcc-q" tabindex="-1">'+esc(q.q)+'</h3>'+
    (q.h||q.opt?'<p class="gcc-help">'+esc(q.h||'')+(q.opt?(q.h?' ':'')+'Optional.':'')+'</p>':'')+
    '<div class="gcc-opts" role="'+(q.multi?'group':'radiogroup')+'" aria-labelledby="gcc-q">'+q.o.map(function(x){return opt(q,x);}).join('')+'</div>'+
    notesHtml(notesFor(q))+
    (S.err?'<p class="gcc-err" role="alert">'+esc(S.err)+'</p>':'')+
    nav(['next','Next \u2192']);
}
function field(id,label,type,opts){
  opts=opts||{};
  var e=S.ferr[id];
  return '<div class="gcc-fg"><label class="gcc-label" for="gcc-f-'+id+'">'+esc(label)+(opts.req?'':' <span class="gcc-opt-tag">(optional)</span>')+'</label>'+
    (type==='textarea'?'<textarea class="gcc-input" id="gcc-f-'+id+'" data-f="'+id+'" rows="3" maxlength="2000">'+esc(S.form[id])+'</textarea>':
    '<input class="gcc-input'+(e?' gcc-input-err':'')+'" id="gcc-f-'+id+'" data-f="'+id+'" type="'+type+'" autocomplete="'+(opts.ac||'off')+'"'+(opts.im?' inputmode="'+opts.im+'"':'')+' value="'+esc(S.form[id])+'"'+(e?' aria-invalid="true"':'')+'>')+
    (e?'<p class="gcc-err">'+esc(e)+'</p>':'')+'</div>';
}
function summary(){
  var a=answered();
  if(!a.length)return '';
  return '<div class="gcc-sum"><h4>Your situation so far</h4><dl>'+a.map(function(q){
    return '<dt>'+esc(q.q)+'</dt><dd>'+labels(q).map(esc).join(', ')+'</dd>';
  }).join('')+'</dl></div>';
}
function renderForm(){
  var ab=cfg.final==='abuse',head;
  if(ab)head='<h3 class="gcc-h" tabindex="-1">'+cfg.heading+'</h3><div class="gcc-info">'+CRISIS+'</div>';
  else if(cfg.final==='thanks')head='<h3 class="gcc-h" tabindex="-1">'+cfg.heading+'</h3><p class="gcc-intro">'+cfg.body+'</p>';
  else head='<h3 class="gcc-h" tabindex="-1">Where should we call you?</h3><p class="gcc-intro">'+(routedOut()?OUT_NOTE:'Thanks \u2013 that\u2019s everything we need to ask. A member of our legal team will call you within one business day.')+'</p>'+summary();
  var times=[['morning','Morning'],['afternoon','Afternoon'],['evening','Evening']];
  return head+
    '<form class="gcc-form" novalidate>'+
    (cfg.story?'<div class="gcc-fg"><label class="gcc-label" for="gcc-f-story">'+esc(cfg.storyLabel)+' <span class="gcc-opt-tag">(optional)</span></label><textarea class="gcc-input" id="gcc-f-story" data-f="story" rows="4" maxlength="2000">'+esc(S.form.story)+'</textarea></div>':'')+
    field('name','Full name','text',{req:1,ac:'name'})+
    field('phone','Phone number','tel',{req:!ab,ac:'tel',im:'tel'})+
    field('email','Email','email',{req:0,ac:'email'})+
    (ab?'<p class="gcc-help">Please give us at least a phone number or an email address.</p>':'')+
    '<div class="gcc-fg" role="radiogroup" aria-labelledby="gcc-time-l"><span class="gcc-label" id="gcc-time-l">Preferred callback time</span><div class="gcc-times">'+
    times.map(function(t){return '<label class="gcc-opt'+(S.form.time===t[0]?' gcc-opt-sel':'')+'"><input type="radio" name="gcc-time" data-f="time" value="'+t[0]+'"'+(S.form.time===t[0]?' checked':'')+'><span class="gcc-opt-l">'+t[1]+'</span></label>';}).join('')+'</div></div>'+
    field('note','Anything else we should know?','textarea')+
    '<div class="gcc-hp" aria-hidden="true"><label>Website<input type="text" tabindex="-1" autocomplete="off" data-f="website" value=""></label></div>'+
    (S.subErr?'<p class="gcc-err" role="alert">'+esc(S.subErr)+'</p>':'')+
    '<div class="gcc-nav"><button type="button" class="gcc-btn-back" data-act="back">\u2190 Back</button>'+
    '<button type="submit" class="gcc-btn-cta"'+(S.sending?' disabled':'')+'>'+(S.sending?'Sending\u2026':'Request my free callback')+'</button></div>'+
    '<p class="gcc-fine">A member of our legal team will call you within one business day. Your information is confidential and used only to contact you about your matter.</p>'+
    '</form>';
}
function renderDone(){
  return '<div class="gcc-done"><h3 class="gcc-h" tabindex="-1">Thanks'+(S.first?', '+esc(S.first):'')+'. We\u2019ll call you within one business day.</h3>'+
    (cfg.final==='abuse'?'<div class="gcc-info">'+CRISIS+'</div>':'')+
    '<p class="gcc-intro">In the meantime, if you want to understand what your claim might be worth, you can use our Compensation Payout Calculator.</p>'+
    '<p><a class="gcc-btn-cta" href="'+CALC_URL+'">Use the calculator</a></p>'+
    '<p class="gcc-fine">Or call us directly on <a href="tel:'+PHONE_TEL+'">'+PHONE_TXT+'</a> if you\u2019d rather not wait.</p></div>';
}
function render(focusSel){
  var inner=S.view==='done'?renderDone():S.view==='form'?renderForm():renderQ();
  var sub=S.view==='done'?'Request received':'A free, confidential check \u2013 about 90 seconds';
  root.innerHTML='<div class="gain-claim-check"><div class="gcc-header"><p class="gcc-title">Free Claim Check</p><p class="gcc-sub">'+sub+'</p></div>'+
    (S.view==='done'||(S.view==='q'&&cur().info)?'':progress())+
    '<div class="gcc-body">'+inner+'</div>'+
    '<p class="gcc-disclaimer">This tool is a general guide only and does not constitute legal advice.</p></div>';
  if(focusSel){var f=root.querySelector(focusSel);if(f)f.focus();}
}
function go(view){
  S.view=view;S.err='';render();
  var h=root.querySelector('.gcc-h');if(h)h.focus({preventScroll:true});
  if(root.scrollIntoView)try{root.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){root.scrollIntoView(true);}
}

// ---------- Actions ----------
function next(){
  var q=cur();
  if(!q.info){
    var v=S.ans[q.id];
    if(!q.opt&&(v==null||![].concat(v).length)){S.err='Please choose an option to continue.';render();return;}
  }
  if(routedOut()||S.i>=steps().length-1)go('form');
  else{S.i++;go('q');}
}
function back(){
  if(S.view==='form'){go('q');return;}
  if(S.i>0){S.i--;go('q');}
}
function validateForm(){
  var f=S.form,e={},ab=cfg.final==='abuse',digits=f.phone.replace(/\D/g,'');
  if(!f.name.trim())e.name='Please enter your name';
  if(f.phone.trim()){if(digits.length<8||digits.length>15)e.phone='Please enter a valid phone number';}
  else if(!ab)e.phone='Please enter a phone number';
  if(f.email.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))e.email='Please enter a valid email address';
  if(ab&&!f.phone.trim()&&!f.email.trim()){e.phone='Please give us a phone number or email';}
  return e;
}
function payload(){
  var f=S.form,a={};
  qsteps().forEach(function(q){if(S.ans[q.id]!=null)a[q.id]={question:q.q,value:S.ans[q.id],label:q.multi?labels(q):labels(q)[0]};});
  return{flow:flowKey,answers:a,routedOut:routedOut(),fullName:f.name.trim(),phone:f.phone.trim(),email:f.email.trim(),callbackTime:f.time,note:f.note.trim(),story:f.story.trim(),timestamp:new Date().toISOString(),pageUrl:location.href,website:f.website};
}
function submit(){
  S.ferr=validateForm();S.subErr='';
  if(Object.keys(S.ferr).length){render('[aria-invalid="true"],.gcc-input-err');return;}
  S.sending=true;render();
  var ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort();},15000);
  fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:ctl?ctl.signal:undefined})
    .then(function(r){if(!r.ok)throw new Error('http '+r.status);S.first=S.form.name.trim().split(/\s+/)[0];S.sending=false;go('done');})
    .catch(function(){S.sending=false;S.subErr='Sorry, something went wrong sending your request. Please try again, or call us on '+PHONE_TXT+'.';render();})
    .then(function(){clearTimeout(t);});
}

function bind(){
  root.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button[data-act]');
    if(!b)return;
    if(b.getAttribute('data-act')==='next')next();else back();
  });
  root.addEventListener('change',function(e){
    var el=e.target,id=el.getAttribute('data-q');
    if(!id)return;
    var q=cur();
    if(q.multi){
      var cur_=S.ans[id]||[],v=el.value,x=q.o.filter(function(z){return z.v===v;})[0];
      if(el.checked){cur_=x.x?[v]:cur_.filter(function(z){return !q.o.filter(function(y){return y.v===z;})[0].x;}).concat(v);}
      else cur_=cur_.filter(function(z){return z!==v;});
      S.ans[id]=cur_;
    }else{
      S.ans[id]=el.value;
      var rest=steps().slice(S.i+1);if(routedOut()){/* later answers stay but are ignored on route-out */}
    }
    S.err='';
    render('input[data-q="'+id+'"][value="'+el.value.replace(/"/g,'\\"')+'"]');
  });
  root.addEventListener('input',function(e){
    var k=e.target.getAttribute('data-f');
    if(k&&e.target.type!=='radio')S.form[k]=e.target.value;
  });
  root.addEventListener('change',function(e){
    if(e.target.getAttribute('data-f')==='time'){S.form.time=e.target.value;render('input[name="gcc-time"]:checked');}
  });
  root.addEventListener('submit',function(e){
    e.preventDefault();
    if(S.form.website||S.sending)return;
    submit();
  });
}

function init(){
  root=document.getElementById('gain-claim-check');
  if(!root){console.warn('Gain Claim Check: #gain-claim-check not found');return;}
  flowKey=root.getAttribute('data-flow');cfg=FLOWS[flowKey];
  if(!cfg){console.warn('Gain Claim Check: unknown data-flow "'+flowKey+'"');return;}
  endpoint=root.getAttribute('data-endpoint')||ENDPOINT;
  bind();render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
