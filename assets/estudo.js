/* Página do Estudo de frota (v4.2): a animação do topo, do questionário ao
   relatório, em quatro etapas (você responde, a planta sai, simula o turno,
   o relatório). Troca sozinha e dá para clicar; fora da tela, para.
   Com "reduzir movimento", fica parada no relatório. */
(() => {
    const fig = document.getElementById("estudoAnim");
    if (!fig) return;
    const passos = [...fig.querySelectorAll("#eaPassos button")];
    const status = document.getElementById("eaStatus");
    const NOMES = ["questionário", "planta de estudo", "simulando o turno…", "relatório pronto"];
    const DUR = [4800, 4200, 7000, 5600];
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grupo = document.getElementById("eaAttas");
    const hora = document.getElementById("eaHora"), dia = document.getElementById("eaDia"), prazo = document.getElementById("eaPrazo");
    // o anel (x 40..280, y 40..140), no sentido anti-horário, e os ramais até as estações
    const ANEL = [[40, 140], [280, 140], [280, 40], [40, 40], [40, 140]];
    const comp = []; let total = 0;
    for (let i = 1; i < ANEL.length; i++) { const d = Math.hypot(ANEL[i][0] - ANEL[i - 1][0], ANEL[i][1] - ANEL[i - 1][1]); comp.push(d); total += d; }
    const noAnel = s => {
        s = ((s % total) + total) % total;
        for (let i = 0; i < comp.length; i++) { if (s <= comp[i]) { const f = s / comp[i]; return [ANEL[i][0] + (ANEL[i + 1][0] - ANEL[i][0]) * f, ANEL[i][1] + (ANEL[i + 1][1] - ANEL[i][1]) * f]; } s -= comp[i]; }
        return ANEL[0];
    };
    const ns = "http://www.w3.org/2000/svg";
    const attas = [0, 0.25, 0.5, 0.75].map((o, i) => {
        const r = document.createElementNS(ns, "rect");
        r.setAttribute("width", 11); r.setAttribute("height", 8); r.setAttribute("rx", 2);
        r.setAttribute("class", "ea-atta" + (i < 2 ? " t" : ""));
        grupo.appendChild(r);
        return { r, o, v: i < 2 ? 0.055 : 0.07 };
    });
    let etapa = 0, timer = null, raf = null, t0 = 0, visivel = false;
    function desenharSim(agora) {
        const t = (agora - t0) / 1000;
        attas.forEach(a => {
            const [x, y] = noAnel((a.o + t * a.v) * total);
            a.r.setAttribute("x", (x - 5.5).toFixed(1)); a.r.setAttribute("y", (y - 4).toFixed(1));
        });
        const f = Math.min(1, t / (DUR[2] / 1000));
        const m = 360 + f * 16 * 60;
        hora.textContent = `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
        dia.textContent = String(1 + Math.min(7, Math.floor(f * 8)));
        prazo.textContent = f < 0.08 ? "--" : `${Math.round(92 + 7.5 * Math.min(1, f * 1.4))}%`;
        if (etapa === 2) raf = requestAnimationFrame(desenharSim);
    }
    function ir(e, auto) {
        etapa = e;
        fig.dataset.etapa = String(e);
        status.textContent = NOMES[e];
        fig.querySelectorAll(".ea-etapa").forEach(x => x.setAttribute("aria-hidden", x.dataset.e === String(e) ? "false" : "true"));
        passos.forEach((b, i) => {
            b.classList.toggle("ativo", i === e);
            b.setAttribute("aria-pressed", i === e ? "true" : "false");
            b.style.setProperty("--dur", `${DUR[i]}ms`);
            const barra = b.querySelector("i");
            barra.style.animation = "none"; void barra.offsetWidth; barra.style.animation = "";
        });
        cancelAnimationFrame(raf);
        if (e === 2) { t0 = performance.now(); raf = requestAnimationFrame(desenharSim); }
        clearTimeout(timer);
        if (auto && visivel && !reduzir) timer = setTimeout(() => ir((etapa + 1) % 4, true), DUR[e]);
    }
    passos.forEach((b, i) => b.addEventListener("click", () => ir(i, !reduzir)));
    if (reduzir) { ir(3, false); prazo.textContent = "99%"; return; }
    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => {
        const v = es.some(x => x.isIntersecting);
        if (v && !visivel) { visivel = true; ir(etapa, true); }
        if (!v && visivel) { visivel = false; clearTimeout(timer); cancelAnimationFrame(raf); }
    }) : null;
    if (io) io.observe(fig); else { visivel = true; ir(0, true); }
})();
