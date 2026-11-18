const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.nav-link');

const brandIntro=document.getElementById('brand-intro');
if(brandIntro){
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipButton=brandIntro.querySelector('.brand-intro-skip');
  let dismissed=false;
  const dismissIntro=()=>{
    if(dismissed)return;
    dismissed=true;
    window.clearTimeout(introTimer);
    document.removeEventListener('keydown',handleIntroKeydown);
    brandIntro.classList.add('is-leaving');
    window.setTimeout(()=>brandIntro.remove(),reducedMotion?30:500);
  };
  const handleIntroKeydown=event=>{
    if(event.key==='Escape')dismissIntro();
  };
  const introTimer=window.setTimeout(dismissIntro,reducedMotion?700:2600);
  skipButton.addEventListener('click',dismissIntro);
  document.addEventListener('keydown',handleIntroKeydown);
}

function closeMenu(){
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Abrir menú');
  document.body.classList.remove('menu-open');
}
menuButton.addEventListener('click',()=>{
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
  document.body.classList.toggle('menu-open',open);
});
navLinks.forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));
    }
  });
},{rootMargin:'-35% 0px -55% 0px'});
sections.forEach(section=>sectionObserver.observe(section));

const backTop = document.getElementById('back-top');
window.addEventListener('scroll',()=>backTop.classList.toggle('visible',window.scrollY>550),{passive:true});
backTop.addEventListener('click',()=>document.getElementById('top').scrollIntoView({behavior:'smooth'}));
document.getElementById('year').textContent = new Date().getFullYear();

// Prepara el formulario con el servicio o plan seleccionado. No envía datos
// hasta que se configure un proveedor de formularios o backend real.
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{
  const select=document.querySelector('select[name="service"]');
  const option=[...select.options].find(o=>o.text===link.dataset.service);
  if(option)select.value=option.value;
}));
document.querySelectorAll('[data-plan]').forEach(link=>link.addEventListener('click',()=>{
  const select=document.querySelector('select[name="service"]');
  select.value='Consulta general';
  document.querySelector('textarea[name="message"]').value=`Me interesa recibir información sobre el plan ${link.dataset.plan}.`;
}));

const form=document.getElementById('contact-form');
const status=document.getElementById('form-status');
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity()){
    status.textContent='Revisá los campos obligatorios antes de continuar.';
    status.className='form-status error';
    return;
  }
  status.textContent='¡Formulario validado! Esta versión todavía no envía ni almacena la información. Antes de publicar, conectá un servicio de formularios seguro para recibir solicitudes.';
  status.className='form-status success';
});

// Textos legales iniciales: deben revisarse y adaptarse al negocio antes de publicar.
const legalContent={
  privacidad:`<h4>Política de privacidad — borrador</h4><p>CyberFixCR utilizará los datos que una persona facilite únicamente para atender su consulta, preparar una propuesta o mantener la comunicación solicitada.</p><p>Esta versión del sitio no envía ni almacena los datos del formulario. Antes de activar un sistema de recepción, se deberá identificar al responsable, la finalidad, la base legal, los proveedores, el plazo de conservación, los derechos de las personas y el canal para ejercerlos, conforme a la normativa costarricense aplicable, incluida la Ley 8968.</p><p>No enviés contraseñas, códigos de verificación ni información sensible por formularios o correo.</p><p><strong>Importante:</strong> este texto es un punto de partida y no constituye asesoría legal ni una política lista para publicar.</p>`,
  terminos:`<h4>Términos de uso — borrador</h4><p>El contenido de este sitio tiene fines informativos. La publicación de un servicio no constituye por sí sola una oferta vinculante ni garantiza la disponibilidad de una intervención.</p><p>El alcance, precio, calendario, responsabilidades y entregables de cada trabajo deberán acordarse por escrito antes de comenzar. Toda evaluación técnica requiere autorización expresa del titular del sistema y límites claramente definidos.</p><p>Este texto debe revisarse y completarse con asesoría legal antes de publicar la web comercial.</p>`
};
const dialog=document.getElementById('legal-dialog');
document.querySelectorAll('a[href="#privacidad"],a[href="#terminos"]').forEach(link=>link.addEventListener('click',e=>{
  e.preventDefault();
  const key=link.getAttribute('href').slice(1);
  document.getElementById('dialog-title').textContent=key==='privacidad'?'Privacidad':'Términos y condiciones';
  document.getElementById('dialog-content').innerHTML=legalContent[key];
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
