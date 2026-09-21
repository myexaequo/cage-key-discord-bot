const OPTIONS = {
  age: ['under18','18-20','21-30','31-40','41-50','51-60','61+'],
  orientation: ['gay','bisexual','heterosexual','pansexual','lesbian','asexual','other'],
  gender: ['cis_man','cis_woman','trans_man','trans_woman','nonbinary','genderfluid','agender','other'],
  role: ['keyholder','locked','switch','curious'],
  devices: ['flat_cage','inverted_cage','mini_cage','plastic_cage','metal_cage','silicone_cage','chastity_belt','none_yet','other'],
  keys: ['holds_keys','other_holds_my_keys','keeps_own_keys','no_key_management','not_applicable'],
  kinks: ['dom','sub','switch','puppy','furry','leather','rubber','sportswear','sneakers','mx_biker','abdl','chastity','other']
};

const COPY = {
  fr: {
    ageQ:'Quelle est ta tranche d’âge ?', orientationQ:'Quelle est ton orientation sexuelle ?', genderQ:'Quel est ton genre ?', roleQ:'Quel est ton rôle ?', devicesQ:'Quels dispositifs utilises-tu ?', keysQ:'Concernant les clés, quelles situations te correspondent ?', kinksQ:'Quels univers ou kinks t’intéressent ?', multiple:'Plusieurs choix possibles.', summary:'Vérifie ton profil', notice:'En validant, tu acceptes que les informations renseignées soient visibles sur ton profil par les autres membres du serveur.', submit:'Envoyer ma demande', restart:'Recommencer', next:'Continuer', pending:'Ta demande a été envoyée et attend la validation d’un modérateur.', under18:'Ce serveur est réservé aux personnes âgées de 18 ans ou plus. Tu ne peux donc pas rejoindre ce serveur. Merci de ta compréhension.', accepted:'Accès autorisé', acceptedBody:'Ta demande a été acceptée. Bienvenue sur Cage & Key !'
  },
  nl: {
    ageQ:'Wat is je leeftijdscategorie?', orientationQ:'Wat is je seksuele oriëntatie?', genderQ:'Wat is je gender?', roleQ:'Wat is je rol?', devicesQ:'Welke apparaten gebruik je?', keysQ:'Welke situaties rond de sleutels passen bij jou?', kinksQ:'Welke werelden of kinks interesseren je?', multiple:'Meerdere keuzes mogelijk.', summary:'Controleer je profiel', notice:'Door te bevestigen ga je ermee akkoord dat de ingevulde informatie zichtbaar is op je profiel voor andere leden van de server.', submit:'Mijn aanvraag versturen', restart:'Opnieuw beginnen', next:'Verder', pending:'Je aanvraag is verstuurd en wacht op goedkeuring door een moderator.', under18:'Deze server is alleen toegankelijk voor personen van 18 jaar of ouder. Je kunt daarom niet deelnemen. Bedankt voor je begrip.', accepted:'Toegang verleend', acceptedBody:'Je aanvraag is goedgekeurd. Welkom bij Cage & Key!'
  },
  en: {
    ageQ:'What is your age range?', orientationQ:'What is your sexual orientation?', genderQ:'What is your gender?', roleQ:'What is your role?', devicesQ:'Which devices do you use?', keysQ:'Which key-management situations apply to you?', kinksQ:'Which scenes or kinks are you interested in?', multiple:'You can select more than one.', summary:'Check your profile', notice:'By confirming, you agree that the information you entered will be visible on your profile to other server members.', submit:'Send my request', restart:'Start over', next:'Continue', pending:'Your request has been sent and is waiting for moderator approval.', under18:'This server is restricted to people aged 18 or older. You therefore cannot join this server. Thank you for understanding.', accepted:'Access granted', acceptedBody:'Your request has been approved. Welcome to Cage & Key!'
  }
};

const LABELS = {
  fr:{fr:'FR',nl:'NL',en:'EN',under18:'-18 ans','18-20':'18–20 ans','21-30':'21–30 ans','31-40':'31–40 ans','41-50':'41–50 ans','51-60':'51–60 ans','61+':'61 ans et +',gay:'Gay',bisexual:'Bisexuel·le',heterosexual:'Hétérosexuel·le',pansexual:'Pansexuel·le',lesbian:'Lesbienne',asexual:'Asexuel·le',other:'Autre',cis_man:'Homme cis',cis_woman:'Femme cis',trans_man:'Homme trans',trans_woman:'Femme trans',nonbinary:'Non-binaire',genderfluid:'Genre fluide',agender:'Agenré·e',keyholder:'Keyholder',locked:'Locked',switch:'Switch',curious:'Curieux·se / pas encore défini',flat_cage:'Cage plate',inverted_cage:'Cage inversée',mini_cage:'Mini cage',plastic_cage:'Cage en plastique',metal_cage:'Cage en métal',silicone_cage:'Cage en silicone',chastity_belt:'Ceinture de chasteté',none_yet:'Je n’en utilise pas encore',holds_keys:'Je détiens les clés d’une ou plusieurs personnes',other_holds_my_keys:'Quelqu’un d’autre détient mes clés',keeps_own_keys:'Je garde mes propres clés',no_key_management:'Pas de gestion particulière des clés',not_applicable:'Non applicable / pas encore',dom:'Dom',sub:'Sub',puppy:'Puppy',furry:'Furry',leather:'Leather',rubber:'Rubber',sportswear:'Sportswear',sneakers:'Sneakers',mx_biker:'MX / Biker',abdl:'ABDL',chastity:'Chasteté'},
  nl:{fr:'FR',nl:'NL',en:'EN',under18:'-18 jaar','18-20':'18–20 jaar','21-30':'21–30 jaar','31-40':'31–40 jaar','41-50':'41–50 jaar','51-60':'51–60 jaar','61+':'61 jaar en ouder',gay:'Gay',bisexual:'Biseksueel',heterosexual:'Heteroseksueel',pansexual:'Panseksueel',lesbian:'Lesbisch',asexual:'Aseksueel',other:'Andere',cis_man:'Cis man',cis_woman:'Cis vrouw',trans_man:'Trans man',trans_woman:'Trans vrouw',nonbinary:'Non-binair',genderfluid:'Genderfluïde',agender:'Agender',keyholder:'Keyholder',locked:'Locked',switch:'Switch',curious:'Nieuwsgierig / nog niet bepaald',flat_cage:'Platte kooi',inverted_cage:'Omgekeerde kooi',mini_cage:'Mini-kooi',plastic_cage:'Plastic kooi',metal_cage:'Metalen kooi',silicone_cage:'Siliconen kooi',chastity_belt:'Kuisheidsgordel',none_yet:'Ik gebruik er nog geen',holds_keys:'Ik heb de sleutels van één of meerdere personen',other_holds_my_keys:'Iemand anders heeft mijn sleutels',keeps_own_keys:'Ik houd mijn eigen sleutels',no_key_management:'Geen specifieke sleutelregeling',not_applicable:'Niet van toepassing / nog niet',dom:'Dom',sub:'Sub',puppy:'Puppy',furry:'Furry',leather:'Leather',rubber:'Rubber',sportswear:'Sportswear',sneakers:'Sneakers',mx_biker:'MX / Biker',abdl:'ABDL',chastity:'Kuisheid'},
  en:{fr:'FR',nl:'NL',en:'EN',under18:'Under 18','18-20':'18–20','21-30':'21–30','31-40':'31–40','41-50':'41–50','51-60':'51–60','61+':'61+',gay:'Gay',bisexual:'Bisexual',heterosexual:'Heterosexual',pansexual:'Pansexual',lesbian:'Lesbian',asexual:'Asexual',other:'Other',cis_man:'Cis man',cis_woman:'Cis woman',trans_man:'Trans man',trans_woman:'Trans woman',nonbinary:'Non-binary',genderfluid:'Genderfluid',agender:'Agender',keyholder:'Keyholder',locked:'Locked',switch:'Switch',curious:'Curious / not defined yet',flat_cage:'Flat cage',inverted_cage:'Inverted cage',mini_cage:'Mini cage',plastic_cage:'Plastic cage',metal_cage:'Metal cage',silicone_cage:'Silicone cage',chastity_belt:'Chastity belt',none_yet:'I don’t use one yet',holds_keys:'I hold one or more people’s keys',other_holds_my_keys:'Someone else holds my keys',keeps_own_keys:'I keep my own keys',no_key_management:'No particular key management',not_applicable:'Not applicable / not yet',dom:'Dom',sub:'Sub',puppy:'Puppy',furry:'Furry',leather:'Leather',rubber:'Rubber',sportswear:'Sportswear',sneakers:'Sneakers',mx_biker:'MX / Biker',abdl:'ABDL',chastity:'Chastity'}
};

const state={stage:'language',lang:null,data:{},submitted:false,accepted:false,kicked:false};
const order=['age','orientation','gender','role','devices','keys','kinks','summary'];
const multi=new Set(['devices','keys','kinks']);
const $=s=>document.querySelector(s);

function l(code){return LABELS[state.lang||'fr'][code]||code}
function ls(values){return (values||[]).map(l).join(', ')}
function esc(s=''){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function reset(){Object.assign(state,{stage:'language',lang:null,data:{},submitted:false,accepted:false,kicked:false});renderMember();renderValidation();unlockChannels(false)}
function nextStage(stage){const i=order.indexOf(stage);return order[i+1]||'summary'}

function profileFields(){
  return `<div class="fields">
    <div class="field"><b>Langue</b><span>${esc((state.lang||'').toUpperCase())}</span></div>
    <div class="field"><b>Âge</b><span>${esc(l(state.data.age))}</span></div>
    <div class="field"><b>Orientation</b><span>${esc(l(state.data.orientation))}</span></div>
    <div class="field"><b>Genre</b><span>${esc(l(state.data.gender))}</span></div>
    <div class="field"><b>Rôle</b><span>${esc(l(state.data.role))}</span></div>
    <div class="field full"><b>Dispositifs</b><span>${esc(ls(state.data.devices))}</span></div>
    <div class="field full"><b>Clés</b><span>${esc(ls(state.data.keys))}</span></div>
    <div class="field full"><b>Kinks</b><span>${esc(ls(state.data.kinks))}</span></div>
  </div>`;
}

function languageScreen(){
  return `<div class="embed"><h2>Cage & Key</h2><p>Choisis ta langue • Kies je taal • Choose your language</p><img class="hero" src="/assets/cage-key-welcome.gif" alt="Animation néon Cage & Key"></div>
  <div class="components">${['fr','nl','en'].map(x=>`<button class="discord-btn primary lang-btn" data-lang="${x}">${x.toUpperCase()}</button>`).join('')}</div>`;
}
function questionScreen(stage){
  const c=COPY[state.lang], key=stage+'Q'; const selected=state.data[stage]||[]; const arr=Array.isArray(selected)?selected:[selected];
  return `<div class="embed"><h2>Cage & Key</h2><p>${esc(c[key])}${multi.has(stage)?`<br><em class="notice">${esc(c.multiple)}</em>`:''}</p></div>
    <div class="select-card"><div class="option-grid">${OPTIONS[stage].map(code=>`<button class="choice ${arr.includes(code)?'selected':''} ${code==='under18'?'danger-choice':''}" data-choice="${code}">${esc(l(code))}</button>`).join('')}</div></div>
    ${multi.has(stage)?`<div class="components"><button class="discord-btn primary" id="continueBtn" ${arr.length?'':'disabled'}>${esc(c.next)}</button></div>`:''}`;
}
function summaryScreen(){const c=COPY[state.lang];return `<div class="embed"><h2>${esc(c.summary)}</h2><p class="notice">${esc(c.notice)}</p>${profileFields()}</div><div class="components"><button class="discord-btn success" id="submitBtn">${esc(c.submit)}</button><button class="discord-btn secondary" id="restartBtn">${esc(c.restart)}</button></div>`}
function pendingScreen(){const c=COPY[state.lang];return `<div class="pending-box"><span class="spinner">⏳</span> ${esc(c.pending)}</div><div class="toolbar"><button class="discord-btn secondary" id="openValidation">Voir la simulation #validation</button></div><div class="toolbar-note">Dans Discord réel, le membre reste avec le rôle « En attente » pendant cette étape.</div>`}
function kickedScreen(){const c=COPY[state.lang||'fr'];return `<div class="embed kicked"><h2>🚫 Accès impossible</h2><p>${esc(c.under18)}</p></div><div class="toolbar"><button class="discord-btn secondary" id="restartBtn">Relancer la preview</button></div><div class="toolbar-note">En production, le bot supprime le brouillon, journalise la raison puis retire immédiatement le compte du serveur.</div>`}
function acceptedScreen(){const c=COPY[state.lang];return `<div class="embed accepted"><h2>🔓 ${esc(c.accepted)}</h2><p>${esc(c.acceptedBody)}</p><img class="hero" src="/assets/cage-key-unlock.gif" alt="Animation cadenas qui s'ouvre"></div><div class="toolbar"><button class="discord-btn secondary" id="restartBtn">Relancer la preview</button></div>`}

function renderMember(){
  const el=$('#botContent');
  if(state.kicked) el.innerHTML=kickedScreen();
  else if(state.accepted) el.innerHTML=acceptedScreen();
  else if(state.submitted) el.innerHTML=pendingScreen();
  else if(state.stage==='language') el.innerHTML=languageScreen();
  else if(state.stage==='summary') el.innerHTML=summaryScreen();
  else el.innerHTML=questionScreen(state.stage);
  bindMember();
}
function bindMember(){
  document.querySelectorAll('.lang-btn').forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang;state.stage='age';renderMember()});
  document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{
    const code=b.dataset.choice, stage=state.stage;
    if(stage==='age'&&code==='under18'){state.data.age=code;state.kicked=true;renderMember();return}
    if(multi.has(stage)){
      const cur=new Set(state.data[stage]||[]); cur.has(code)?cur.delete(code):cur.add(code); state.data[stage]=[...cur]; renderMember();
    } else {state.data[stage]=code;state.stage=nextStage(stage);renderMember()}
  });
  $('#continueBtn')?.addEventListener('click',()=>{if((state.data[state.stage]||[]).length){state.stage=nextStage(state.stage);renderMember()}});
  $('#submitBtn')?.addEventListener('click',()=>{state.submitted=true;renderMember();renderValidation()});
  $('#restartBtn')?.addEventListener('click',reset);
  $('#openValidation')?.addEventListener('click',()=>switchView('moderator'));
}

function renderValidation(){
  const el=$('#validationContent');
  if(!state.submitted && !state.accepted){el.innerHTML=`<div class="embed validation-card"><h2>#validation</h2><p>Aucune demande simulée pour le moment.</p><p class="notice">Termine le questionnaire dans « Vue membre » pour voir ici la fiche transmise aux modérateurs.</p></div>`;return}
  if(state.accepted){el.innerHTML=`<div class="embed accepted"><h2>✅ Demande traitée</h2><p><span class="member-tag">@Mathieu</span> a été accepté. Les boutons de validation disparaissent et les rôles <strong>Membre</strong> + <strong>${(state.lang||'').toUpperCase()}</strong> sont attribués.</p></div>`;return}
  el.innerHTML=`<div class="embed validation-card"><h2>Nouvelle demande — Mathieu</h2><p>Utilisateur : <span class="member-tag">@Mathieu</span><br>ID : <code>123456789012345678</code></p>${profileFields()}</div>
  <div class="components"><button class="discord-btn success" id="acceptBtn">✅ Accepter</button><button class="discord-btn danger" id="rejectBtn">❌ Refuser</button><button class="discord-btn secondary" id="clarifyBtn">💬 Demander une précision</button></div>`;
  $('#acceptBtn').onclick=()=>{state.accepted=true;state.submitted=false;unlockChannels(true);renderValidation();renderMember();toast('Simulation : rôles Membre + '+state.lang.toUpperCase()+' attribués');setTimeout(()=>switchView('member'),450)};
  $('#rejectBtn').onclick=()=>toast('Simulation : en production, un motif est demandé puis le membre est retiré.');
  $('#clarifyBtn').onclick=()=>toast('Simulation : en production, le membre reçoit une question privée et peut répondre au modérateur.');
}
function switchView(view){
  $('#memberView').classList.toggle('hidden',view!=='member'); $('#moderatorView').classList.toggle('hidden',view!=='moderator');
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
function unlockChannels(ok){document.querySelectorAll('.channel.locked,.category.locked-cat').forEach(x=>{x.style.opacity=ok?'1':''});document.querySelectorAll('.category.locked-cat span:last-child').forEach(x=>{if(ok)x.textContent='✓';else x.textContent='🔒'})}
function toast(msg){const old=$('.toast');if(old)old.remove();const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
renderMember();renderValidation();
