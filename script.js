/* Portfolio interactions. Each feature lives in its own function. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    $$('a', menu).forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) setOpen(false); });
  }

  /* ---------- Typing effect ---------- */
  function initTyping() {
    const target = $('#typed');
    const phrases = ['Aspiring Full Stack Developer', 'CSE Student', 'Technology Enthusiast'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { target.textContent = phrases[0]; return; }

    let phraseIndex = 0, charIndex = 0, deleting = false;
    (function tick() {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = phrase.slice(0, charIndex);

      let delay = deleting ? 40 : 80;
      if (!deleting && charIndex === phrase.length) { deleting = true; delay = 1500; }
      else if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 400; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  /* ---------- Active nav link + nav shadow + back-to-top ---------- */
  function initScrollState() {
    const nav = $('#nav');
    const toTop = $('#toTop');
    const links = $$('#menu a');
    const sections = links.map((a) => $(a.getAttribute('href')));

    const update = () => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 10);
      toTop.classList.toggle('show', y > 500);

      // The current section is the last one whose top has passed the nav bar.
      let current = sections[0].id;
      sections.forEach((section) => { if (section.offsetTop - 120 <= y) current = section.id; });
      if (window.innerHeight + y >= document.body.offsetHeight - 4) current = sections[sections.length - 1].id;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Contact form validation ---------- */
  function initContactForm() {
    const form = $('#contactForm');
    const status = $('#formStatus');
    const button = $('#submitBtn');
    const endpoint = form.dataset.endpoint.trim(); // e.g. https://formspree.io/f/yourFormId
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    let submitting = false;

    const rules = {
      name: (v) => (v.length < 2 ? 'Enter your name (at least 2 characters).' : ''),
      email: (v) => (!v ? 'Enter your email address.' : !emailPattern.test(v) ? 'Enter a valid email, like name@example.com.' : ''),
      subject: (v) => (v.length < 3 ? 'Enter a subject (at least 3 characters).' : ''),
      message: (v) => (v.length < 10 ? 'Write a message of at least 10 characters.' : '')
    };

    function validateField(field) {
      const message = rules[field.name](field.value.trim());
      field.classList.toggle('invalid', Boolean(message));
      field.setAttribute('aria-invalid', String(Boolean(message)));
      field.parentElement.querySelector('.err').textContent = message;
      return !message;
    }

    const fields = $$('input, textarea', form);
    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => { if (field.classList.contains('invalid')) validateField(field); });
    });

    function setStatus(text, type) { status.textContent = text; status.className = 'status ' + type; }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submitting) return; // blocks double submits

      const results = fields.map(validateField); // validate every field so all errors show
      if (results.includes(false)) {
        setStatus('Please fix the highlighted fields.', 'bad');
        fields[results.indexOf(false)].focus();
        return;
      }

      submitting = true;
      button.disabled = true;
      button.textContent = 'Sending...';

      try {
        if (endpoint) {
          const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('Request failed');
          setStatus('Thank you! Your message has been sent.', 'ok');
        } else {
          // Demo mode: no backend is configured, so nothing is delivered.
          await new Promise((resolve) => setTimeout(resolve, 600));
          setStatus('Form is valid. This is demo mode, so the message was not delivered. Add a Formspree URL to enable sending.', 'warn');
        }
        form.reset();
        fields.forEach((f) => f.setAttribute('aria-invalid', 'false'));
      } catch (error) {
        setStatus('Something went wrong. Please try again or email me directly.', 'bad');
      } finally {
        submitting = false;
        button.disabled = false;
        button.textContent = 'Send message';
      }
    });
  }

  /* ---------- Live demo dialogs ---------- */
  function initDemoDialogs() {
    $$('[data-demo]').forEach((button) => button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.demo);
      if (dialog && dialog.showModal) { dialog.showModal(); document.documentElement.classList.add('lock'); }
    }));
    $$('dialog.demo').forEach((dialog) => {
      dialog.addEventListener('close', () => document.documentElement.classList.remove('lock'));
      // Clicking the dark backdrop or a close button closes the demo
      dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });
    });
  }

  /* ---------- Demo 1: Matrix Operations ---------- */
  function initMatrix() {
// Fill size dropdowns (1 to 5) and build input grids
['ar','ac','br','bc'].forEach(id=>{$('#'+id).innerHTML=[1,2,3,4,5].map(n=>`<option ${n===3?'selected':''}>${n}</option>`).join('');$('#'+id).onchange=build});
function grid(el,r,c){el.style.gridTemplateColumns=`repeat(${c},56px)`;el.innerHTML=Array.from({length:r*c},(_,i)=>`<input type="number" step="any" value="${(i%c===Math.floor(i/c))?1:0}" aria-label="row ${Math.floor(i/c)+1} col ${i%c+1}">`).join('')}
function build(){grid($('#ga'),+$('#ar').value,+$('#ac').value);grid($('#gb'),+$('#br').value,+$('#bc').value)}
function read(el,r,c){const v=[...el.querySelectorAll('input')].map(i=>parseFloat(i.value)||0);return Array.from({length:r},(_,i)=>v.slice(i*c,i*c+c))}
const A=()=>read($('#ga'),+$('#ar').value,+$('#ac').value),B=()=>read($('#gb'),+$('#br').value,+$('#bc').value);
function det(m){if(m.length===1)return m[0][0];return m[0].reduce((s,x,j)=>s+(j%2?-1:1)*x*det(m.slice(1).map(r=>r.filter((_,k)=>k!==j))),0)}
const ops={
 add:(a,b)=>{if(a.length!==b.length||a[0].length!==b[0].length)throw'Addition needs both matrices to have the same size.';return a.map((r,i)=>r.map((x,j)=>x+b[i][j]))},
 sub:(a,b)=>{if(a.length!==b.length||a[0].length!==b[0].length)throw'Subtraction needs both matrices to have the same size.';return a.map((r,i)=>r.map((x,j)=>x-b[i][j]))},
 mul:(a,b)=>{if(a[0].length!==b.length)throw'Multiplication needs columns of A to equal rows of B.';return a.map(r=>b[0].map((_,j)=>r.reduce((s,x,k)=>s+x*b[k][j],0)))},
 tr:a=>a[0].map((_,j)=>a.map(r=>r[j])),
 det:a=>{if(a.length!==a[0].length)throw'Determinant needs a square matrix A.';return det(a)}};
const fmt=n=>Math.round(n*1e4)/1e4;
document.querySelectorAll('[data-op]').forEach(btn=>btn.onclick=()=>{$('#msg').textContent='';try{const res=ops[btn.dataset.op](A(),B());
 $('#out').innerHTML=Array.isArray(res)?'<table>'+res.map(r=>'<tr>'+r.map(x=>`<td>${fmt(x)}</td>`).join('')+'</tr>').join('')+'</table>':`<p>Determinant = <b>${fmt(res)}</b></p>`}catch(e){$('#out').innerHTML='';$('#msg').textContent=e}});
build();
  }

  /* ---------- Demo 2: Smart Student task tracker ---------- */
  function initSmartStudent() {
let tasks=[],study=0,filter='all';
// Browser storage can be blocked, so every access is wrapped
const load=()=>{try{tasks=JSON.parse(localStorage.getItem('ss-tasks')||'[]');study=+localStorage.getItem('ss-study')||0}catch(e){}};
const save=()=>{try{localStorage.setItem('ss-tasks',JSON.stringify(tasks));localStorage.setItem('ss-study',study)}catch(e){}};
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const done=tasks.filter(t=>t.done).length,late=tasks.filter(t=>!t.done&&t.due<today()).length;
 $('#sT').textContent=tasks.length;$('#sD').textContent=done;$('#sP').textContent=tasks.length-done;$('#sO').textContent=late;
 $('#bar').style.width=(tasks.length?done/tasks.length*100:0)+'%';$('#study').textContent=study;
 const shown=tasks.filter(t=>filter==='all'||(filter==='done')===t.done).sort((a,b)=>a.due.localeCompare(b.due));
 $('#empty').hidden=shown.length>0;
 $('#list').innerHTML=shown.map(t=>`<li class="${t.done?'done':''}"><input type="checkbox" data-id="${t.id}" ${t.done?'checked':''} aria-label="Mark done"><div class="t"><b>${esc(t.title)}</b><br><span class="muted ${!t.done&&t.due<today()?'late':''}">${esc(t.subj||'General')} &middot; due ${t.due}${!t.done&&t.due<today()?' (overdue)':''}</span></div><span class="tag ${t.pri==='High'?'high':''}">${t.pri}</span><button class="alt" data-del="${t.id}" aria-label="Delete task">&times;</button></li>`).join('');}
$('#f').onsubmit=e=>{e.preventDefault();tasks.push({id:Date.now(),title:$('#title').value.trim(),subj:$('#subj').value.trim(),due:$('#due').value,pri:$('#pri').value,done:false});e.target.reset();$('#pri').value='Medium';save();render()};
$('#list').onclick=e=>{const d=e.target.dataset;if(d.del){tasks=tasks.filter(t=>t.id!=d.del)}else if(d.id){const t=tasks.find(t=>t.id==d.id);t.done=!t.done}else return;save();render()};
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f;render()});
$('#addStudy').onclick=()=>{const m=parseInt($('#mins').value);if(m>0){study+=m;$('#mins').value='';save();render()}};
load();render();
  }

  /* ---------- Boot ---------- */
  $('#year').textContent = new Date().getFullYear();
  initMenu();
  initTyping();
  initReveal();
  initScrollState();
  initContactForm();
  initDemoDialogs();
  initMatrix();
  initSmartStudent();
})();
