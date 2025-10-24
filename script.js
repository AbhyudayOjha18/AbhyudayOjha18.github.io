// script.js (uses Three.js and GSAP loaded in index)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.159.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded',()=>{

  // header year
  document.getElementById('year').textContent = new Date().getFullYear();

  // simple typing effect:
  const typed = ['Web Developer', 'Student', 'Graphic Designer', '3D & Visual Web Apps'];
  let pos = 0, char=0, forward=true;
  const el = document.getElementById('typed-text');

  function step(){
    if(!el) return;
    if(forward){
      el.textContent = typed[pos].slice(0,++char);
      if(char === typed[pos].length){ forward=false; setTimeout(step,1200); return; }
    } else {
      el.textContent = typed[pos].slice(0,--char);
      if(char === 0){ forward=true; pos = (pos+1)%typed.length; }
    }
    setTimeout(step, forward?80:40);
  }
  step();

  // Contact form: Formspree submission + mailto fallback
  const contactForm = document.getElementById('contactForm');
  const result = document.getElementById('formResult');
  const mailtoBtn = document.getElementById('mailtoBtn');

  if(contactForm){
    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const action = contactForm.getAttribute('action');
      // If Formspree endpoint still set to placeholder, use mailto
      if(!action || action.includes('YOUR_FORM_ID')){
        result.textContent = 'Formspree not configured — opening mail client...';
        openMailFallback();
        return;
      }
      const data = new FormData(contactForm);
      try {
        const res = await fetch(action, { method:'POST', body:data, headers:{ Accept:'application/json' }});
        if(res.ok){ result.textContent = 'Message sent — thank you!'; contactForm.reset(); }
        else { result.textContent = 'Send failed — opening mail client as fallback.'; openMailFallback(); }
      } catch(err){
        result.textContent = 'Network error — opening mail client as fallback.';
        openMailFallback();
      }
    });
  }

  function openMailFallback(){
    const name = contactForm.querySelector('[name=name]').value || '';
    const email = contactForm.querySelector('[name=email]').value || '';
    const message = contactForm.querySelector('[name=message]').value || '';
    const mailto = `mailto:abhyudayojha18@yahoo.com?subject=${encodeURIComponent('Contact from portfolio: '+name)}&body=${encodeURIComponent(message+'\n\n— '+name+' — '+email)}`;
    window.open(mailto,'_blank');
  }
  mailtoBtn?.addEventListener('click', openMailFallback);

  // === THREE.JS Scene (simple interactive object + mouse parallax) ===
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.00115);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 60);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 20);
  scene.add(dir);

  // create animated group of objects (a stylized "animal-like" abstract)
  const group = new THREE.Group();
  scene.add(group);

  // create big glossy torus (acts like centerpiece)
  const geo = new THREE.TorusKnotGeometry(10, 2.8, 256, 32);
  const mat = new THREE.MeshStandardMaterial({ color:0x8b5cf6, metalness:0.8, roughness:0.15, emissive:0x2b076e, emissiveIntensity:0.08 });
  const torus = new THREE.Mesh(geo, mat);
  torus.scale.set(0.9,0.9,0.9);
  group.add(torus);

  // floating small spheres
  const sphereGeo = new THREE.SphereGeometry(0.9, 32, 32);
  for(let i=0;i<9;i++){
    const m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random()*0.15+0.55,0.8,0.5),
      metalness:0.6,
      roughness:0.3
    }));
    m.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*30, (Math.random()-0.5)*50);
    m.userData.speed = 0.2 + Math.random()*0.6;
    group.add(m);
  }

  // mouse parallax
  const mouse = { x:0, y:0 };
  window.addEventListener('mousemove', (e)=>{
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  // Resize
  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // animate
  let t = 0;
  function animate(){
    t += 0.01;
    // base rotation
    torus.rotation.x += 0.002;
    torus.rotation.y += 0.005;
    // group parallax towards mouse
    group.rotation.y += (mouse.x * 0.5 - group.rotation.y) * 0.06;
    group.rotation.x += (-mouse.y * 0.2 - group.rotation.x) * 0.06;

    // sphere loot float
    group.children.forEach((child, i)=>{
      if(child.geometry && child.geometry.type === 'SphereGeometry'){
        child.position.y += Math.sin(t*child.userData.speed + i)*0.02;
        child.rotation.y += 0.01*i*0.005;
      }
    });

    // subtle camera movement
    camera.position.lerp(new THREE.Vector3(mouse.x*10, -mouse.y*6, 60 + Math.sin(t)*2), 0.03);
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // GSAP scroll reveal for panels
  if(window.gsap){
    gsap.utils.toArray('.panel').forEach((panel, i)=>{
      gsap.from(panel, { y: 40, autoAlpha: 0, duration: 0.9, scrollTrigger:{
        trigger: panel, start: "top 80%", toggleActions: "play none none reverse"
      }});
    });
  }

});
