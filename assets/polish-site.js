/* ============================================================
   E4M · Site — polimento (comportamento). Aditivo e defensivo.
   Reveal on scroll + count-up nos números dos mockups.
   ============================================================ */
(function(){
  "use strict";
  var reduz=false; try{ reduz=matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}

  function contar(el){
    try{
      if(el.__e4m) return; var orig=el.textContent;
      var m=orig.match(/-?\d[\d.\s]*\d|-?\d/); if(!m) return;
      var raw=m[0], alvo=parseFloat(raw.replace(/[.\s]/g,""));
      if(!isFinite(alvo)||alvo<=0||alvo>1000000) return;
      el.__e4m=true;
      var pre=orig.slice(0,m.index), post=orig.slice(m.index+raw.length);
      var agr= raw.indexOf(".")>=0 || /\d\s\d/.test(raw);
      var fmt=function(n){ n=Math.round(n); return agr?n.toLocaleString("pt-BR"):String(n); };
      el.classList.add("e4m-contando");
      var ini=performance.now(), dur=900;
      (function passo(t){ var p=Math.min(1,(t-ini)/dur), e=1-Math.pow(1-p,3);
        el.textContent=pre+fmt(alvo*e)+post;
        if(p<1) requestAnimationFrame(passo); else { el.textContent=orig; el.classList.remove("e4m-contando"); }
      })(ini);
    }catch(e){}
  }

  function armar(){
    try{
      // reveal: armar SÓ as seções (blocos inteiros) — nada aninhado trava
      var alvos=[].slice.call(document.querySelectorAll(".secao"));
      if(!("IntersectionObserver" in window) || reduz){ return; } // sem IO/reduced: tudo visível
      var io=new IntersectionObserver(function(ents){
        ents.forEach(function(en){
          if(en.isIntersecting){ en.target.classList.add("e4m-in");
            en.target.querySelectorAll(".ind-tile .tile-valor, .ind-tile b, .bt-pct, [data-contar]").forEach(contar);
            io.unobserve(en.target);
          }
        });
      }, {threshold:.08, rootMargin:"0px 0px -5% 0px"});
      alvos.forEach(function(el){ el.classList.add("e4m-reveal"); io.observe(el); });
      // rede de segurança: nada pode ficar preso invisível
      setTimeout(function(){ try{ alvos.forEach(function(el){
        var r=el.getBoundingClientRect();
        if(r.top < (innerHeight||800)) el.classList.add("e4m-in");
      }); }catch(e){} }, 2500);
      addEventListener("load",function(){ setTimeout(function(){ try{
        document.querySelectorAll(".secao.e4m-reveal:not(.e4m-in)").forEach(function(el){
          if(el.getBoundingClientRect().top < (innerHeight||800)) el.classList.add("e4m-in");
        }); }catch(e){} }, 300); });
    }catch(e){}
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",armar);
  else armar();
})();
