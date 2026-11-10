/* Página do Estudo de frota: o gráfico do topo mostra o estudo "achando a
   frota" (4 a 9 Atta, a % de entregas no prazo subindo até a meta).
   Com "reduzir movimento", mostra o quadro final parado. */
(() => {
    const g = document.getElementById("ebGrafico"), eixo = document.getElementById("ebEixo");
    const status = document.getElementById("ebStatus"), res = document.getElementById("ebResultado");
    if (!g) return;
    const FROTAS = [[4, 13], [5, 45], [6, 70], [7, 78], [8, 91], [9, 95]];
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const barras = FROTAS.map(([n, v]) => {
        const b = document.createElement("div");
        b.className = "eb-barra" + (v >= 95 ? " ok" : "");
        b.innerHTML = `<i></i><span>${v}%</span>`;
        b.style.setProperty("--v", v + "%");
        g.appendChild(b);
        const e = document.createElement("span");
        e.textContent = `${n} Atta`;
        eixo.appendChild(e);
        return b;
    });
    function quadro(k) {
        barras.forEach((b, i) => b.classList.toggle("cheia", i < k));
        const atual = FROTAS[Math.min(k, FROTAS.length) - 1];
        status.textContent = k <= 0 ? "simulando…" : k >= FROTAS.length ? "9 Atta ✓ meta cumprida" : `${atual[0]} Atta · ${atual[1]}% no prazo`;
        res.classList.toggle("visivel", k >= FROTAS.length);
    }
    if (reduzir) { quadro(FROTAS.length); return; }
    let k = 0, rodando = false, timer = null;
    const passo = () => { k = k >= FROTAS.length + 3 ? 0 : k + 1; quadro(Math.min(k, FROTAS.length)); timer = setTimeout(passo, k === 0 ? 600 : k >= FROTAS.length ? 1400 : 900); };
    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => {
        const v = es.some(e => e.isIntersecting);
        if (v && !rodando) { rodando = true; passo(); }
        if (!v && rodando) { rodando = false; clearTimeout(timer); }
    }) : null;
    quadro(0);
    if (io) io.observe(g); else quadro(FROTAS.length);
})();
