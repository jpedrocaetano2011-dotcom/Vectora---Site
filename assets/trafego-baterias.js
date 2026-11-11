/* Eciton (v4.2): as animações do Controle de Tráfego e das Baterias.
   Cada uma tem capítulos (botões embaixo): troca sozinha, dá para clicar e
   para fora da tela. Com "reduzir movimento", mostra o quadro final de cada
   capítulo, sem movimento. */
(() => {
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // um palco com capítulos: quadro(cap, t) desenha o instante t (s) do capítulo
    function palco(fig, caps, DUR, quadro) {
        if (!fig || !caps.length) return;
        let cap = 0, t0 = 0, raf = null, visivel = false;
        function marcar() {
            caps.forEach((b, i) => {
                b.classList.toggle("ativo", i === cap);
                b.setAttribute("aria-pressed", i === cap ? "true" : "false");
                const barra = b.querySelector("i");
                if (barra) barra.style.width = i < cap ? "100%" : "0%";
            });
        }
        function laco(agora) {
            const t = (agora - t0) / 1000;
            if (t >= DUR[cap]) { cap = (cap + 1) % DUR.length; t0 = agora; marcar(); }
            const tt = Math.min(DUR[cap], (agora - t0) / 1000);
            quadro(cap, tt);
            const barra = caps[cap].querySelector("i");
            if (barra) barra.style.width = `${(tt / DUR[cap]) * 100}%`;
            raf = requestAnimationFrame(laco);
        }
        function ir(i) {
            cap = i;
            marcar();
            if (reduzir) { quadro(cap, DUR[cap]); const b = caps[cap].querySelector("i"); if (b) b.style.width = "100%"; return; }
            t0 = performance.now();
            if (visivel) { cancelAnimationFrame(raf); raf = requestAnimationFrame(laco); }
        }
        caps.forEach((b, i) => b.addEventListener("click", () => ir(i)));
        if (reduzir) { ir(0); return; }
        quadro(0, 0); marcar();
        const io = "IntersectionObserver" in window ? new IntersectionObserver(es => {
            const v = es.some(x => x.isIntersecting);
            if (v && !visivel) { visivel = true; t0 = performance.now(); raf = requestAnimationFrame(laco); }
            if (!v && visivel) { visivel = false; cancelAnimationFrame(raf); }
        }) : null;
        if (io) io.observe(fig); else { visivel = true; raf = requestAnimationFrame(laco); }
    }

    /* ---------------- Controle de Tráfego ---------------- */
    (() => {
        const svg = document.getElementById("ctSvg");
        if (!svg) return;
        const $ = id => document.getElementById(id);
        const A = $("ctA"), B = $("ctB"), zona = $("ctZona"), caixa = $("ctCaixa"), bat = $("ctBat"), rota = $("ctRota"), fechados = $("ctFechados"), legenda = $("ctLegenda");
        const ns = "http://www.w3.org/2000/svg";
        // um caminho (pontos) e a posição a uma distância s dele
        const comp = p => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);
        function em(p, s) {
            for (let i = 1; i < p.length; i++) {
                const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
                if (s <= d || i === p.length - 1) { const f = d ? Math.min(1, Math.max(0, s / d)) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f, Math.atan2(p[i][1] - p[i - 1][1], p[i][0] - p[i - 1][0]) * 180 / Math.PI]; }
                s -= d;
            }
            return [p[0][0], p[0][1], 0];
        }
        const pos = (g, x, y, a) => g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})`);
        const halo = (g, cls) => { g.classList.remove("espera", "parado", "sem-bateria"); if (cls) g.classList.add(cls); };
        const linhaRota = p => rota.setAttribute("d", p.length ? "M" + p.map(q => q.join(" ")).join("L") : "");
        function fechar(lista) {
            fechados.textContent = "";
            lista.forEach(([x1, y1, x2, y2, rot]) => {
                const l = document.createElementNS(ns, "line");
                l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2);
                fechados.appendChild(l);
                if (rot) { const t = document.createElementNS(ns, "text"); t.setAttribute("x", (x1 + x2) / 2 + (x1 === x2 ? 12 : 0)); t.setAttribute("y", (y1 + y2) / 2 + (x1 === x2 ? 4 : -10)); t.textContent = rot; fechados.appendChild(t); }
            });
        }
        let ultimaLegenda = "";
        const dizer = t => { if (t !== ultimaLegenda) { legenda.textContent = t; ultimaLegenda = t; } };
        const zonaDe = q => { zona.classList.toggle("ocupada", Boolean(q)); zona.dataset.q = q || ""; };

        const DUR = [7, 8.5, 9, 8.5];
        const quadros = [
            // 1. cruzamento: A reserva a zona; B espera fora dela; depois passa
            t => {
                fechar([]); linhaRota([]); caixa.setAttribute("opacity", 0); bat.setAttribute("opacity", 0);
                const xa = 190 + 75 * t;
                pos(A, xa, 170, 0);
                const livre = 2.45, parar = 136;
                const yb = t < livre ? Math.min(parar, 70 + 45 * t) : parar + 50 * (t - livre);
                pos(B, 320, Math.min(275, yb), 90);
                halo(A, ""); halo(B, t >= (parar - 70) / 45 && t < livre ? "espera" : "");
                const aDentro = xa + 13 > 298 && xa - 13 < 342, bDentro = yb + 13 > 148 && yb - 13 < 192;
                zonaDe(aDentro ? "A" : bDentro ? "B" : "");
                dizer(t < 1.3 ? "Dois Atta chegando ao mesmo cruzamento." : t < livre ? "O A reservou a zona; o B espera fora dela." : "A zona ficou livre: o B passa. Um por vez, sem disputa.");
            },
            // 2. trecho fechado: o líder fecha o atalho; o Atta troca de rota no próximo ponto
            t => {
                caixa.setAttribute("opacity", 0); bat.setAttribute("opacity", 0); zonaDe("");
                const fecha = 1.4, chega = (320 - 90) / 80;
                const original = [[90, 60], [320, 60], [320, 280], [480, 280]];
                const nova = [[90, 60], [320, 60], [580, 60], [580, 280], [480, 280]];
                fechar(t >= fecha ? [[320, 60, 320, 170, "fechado: limpeza"]] : []);
                const r = t < chega ? original : nova;
                linhaRota(t < fecha ? original : nova);
                const [x, y, a] = em(r, 80 * t);
                pos(A, x, y, a); halo(A, "");
                pos(B, -60, -60, 0);
                dizer(t < fecha ? "Missão do A: descer pelo atalho." : t < chega ? "O líder fechou o atalho: o Eciton refaz a rota de quem está andando." : "No próximo ponto, o A troca para a rota nova (nunca no meio de um trecho).");
            },
            // 3. obstáculo: para na hora, espera o caminho livre por 3 s e segue sozinho
            t => {
                fechar([]); linhaRota([]); zonaDe(""); bat.setAttribute("opacity", 0);
                const aparece = 0.8, para = 300, chegaPara = (para - 100) / 70, some = 4.4, volta = some + 3;
                caixa.setAttribute("opacity", t >= aparece && t < some ? 1 : 0);
                caixa.setAttribute("transform", "translate(372 280)");
                const x = t < volta ? Math.min(para, 100 + 70 * t) : para + 70 * (t - volta);
                pos(A, x, 280, 0);
                halo(A, t >= chegaPara && t < volta ? "parado" : "");
                pos(B, -60, -60, 0);
                const falta = Math.ceil(volta - t);
                dizer(t < chegaPara ? "O A segue pelo corredor de baixo." : t < some ? "Obstáculo à frente: o A para na hora, a uma distância segura." : t < volta ? `Caminho livre: espera ${falta} s e segue sozinho.` : "Seguiu sem ninguém apertar nada.");
            },
            // 4. sem bateria: o Atta parado fecha os trechos dele; as rotas novas desviam
            t => {
                caixa.setAttribute("opacity", 0); zonaDe("");
                pos(B, 60, 225, 90); halo(B, "sem-bateria");
                bat.setAttribute("opacity", 1); bat.setAttribute("transform", "translate(60 225)");
                const fecha = 1.2, chega = (480 - 320) / 80;
                fechar(t >= fecha ? [[60, 170, 60, 280, "fechado: Atta sem bateria"]] : []);
                const original = [[480, 60], [320, 60], [60, 60], [60, 280], [200, 280]];
                const nova = [[480, 60], [320, 60], [320, 280], [200, 280]];
                const r = t < Math.max(fecha, chega) ? original : nova;
                linhaRota(t < fecha ? original : nova);
                const [x, y, a] = em(r, 80 * t);
                pos(A, x, y, a); halo(A, "");
                dizer(t < fecha ? "O B parou sem bateria no corredor da esquerda." : t < chega + 0.6 ? "O Eciton fecha sozinho os trechos dele: as rotas desviam." : "Com carga de novo, o B sai e os trechos reabrem.");
            }
        ];
        palco(svg.closest(".ct-cena"), [...document.querySelectorAll("#ctCaps button")], DUR, (c, t) => quadros[c](t));
    })();

    /* ---------------- Baterias ---------------- */
    (() => {
        const fig = document.getElementById("batAnim");
        if (!fig) return;
        const $ = id => document.getElementById(id);
        const cartoes = $("batCartoes"), hora = $("batHora"), cursor = $("batCursor"), carg = $("batCarregador"), fila = $("batFila"), alerta = $("batAlerta");
        // [hora (min), carga (%), estado] de cada Atta; a carga é linear entre os pontos
        const ATTA = [
            { id: "Atta 01", k: [[600, 70, "operando"], [870, 43, "operando"], [880, 40, "operando"], [935, 30, "na fila"], [960, 29, "carregando"], [1050, 90, "operando"], [1260, 62, "operando"]] },
            { id: "Atta 02", k: [[600, 55, "operando"], [810, 30, "indo carregar"], [825, 29, "carregando"], [955, 90, "operando"], [1260, 58, "operando"]] },
            { id: "Atta 03", k: [[600, 88, "operando"], [1095, 30, "aguarda o fim da ponta"], [1170, 19, "aguarda o fim da ponta"], [1260, 15, "carregando"]] }
        ];
        const caixas = ATTA.map(a => {
            const d = document.createElement("div");
            d.className = "bt-c";
            d.innerHTML = `<div class="bt-c-topo"><b>${a.id}</b><em>estimada</em></div><b class="bt-pct">--</b><div class="bt-barra"><i></i></div><span class="bt-estado">--</span>`;
            cartoes.appendChild(d);
            return d;
        });
        const naHora = (k, m) => {
            let i = 0;
            while (i < k.length - 1 && k[i + 1][0] <= m) i++;
            const a = k[i], b = k[Math.min(k.length - 1, i + 1)];
            const f = b[0] > a[0] ? Math.min(1, Math.max(0, (m - a[0]) / (b[0] - a[0]))) : 0;
            return { pct: a[1] + (b[1] - a[1]) * f, estado: a[2] };
        };
        const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
        // os capítulos: 10:00–13:30, 13:30–17:30, 17:30–21:00
        const FAIXAS = [[600, 810], [810, 1050], [1050, 1260]];
        const DUR = [6, 8, 8];
        function quadro(c, t) {
            const [a, b] = FAIXAS[c];
            const m = a + (b - a) * Math.min(1, t / DUR[c]);
            hora.textContent = hhmm(m);
            cursor.style.left = `${((m - 360) / (1320 - 360)) * 100}%`;
            const ponta = m >= 1080 && m < 1260;
            fig.classList.toggle("na-ponta", ponta);
            const est = ATTA.map(x => naHora(x.k, m));
            est.forEach((e, i) => {
                const d = caixas[i];
                d.querySelector(".bt-pct").textContent = `${Math.round(e.pct)}%`;
                d.querySelector(".bt-barra i").style.width = `${e.pct}%`;
                d.querySelector(".bt-estado").textContent = e.estado;
                d.classList.toggle("baixa", e.pct < 31);
                d.classList.toggle("critica", e.pct < 20);
                d.classList.toggle("carregando", e.estado === "carregando");
            });
            const quem = est.findIndex(e => e.estado === "carregando");
            carg.textContent = ponta && quem < 0 ? "pausado na ponta" : quem >= 0 ? `${ATTA[quem].id} carregando` : "livre";
            const esperam = est.map((e, i) => (/fila|aguarda/.test(e.estado) ? ATTA[i].id : null)).filter(Boolean);
            fila.textContent = esperam.length ? esperam.join(", ") : "ninguém";
            const critica = est.findIndex(e => e.pct < 20);
            alerta.textContent = critica >= 0 ? `✉ ${ATTA[critica].id} abaixo de 20%: alerta por e-mail` : ponta ? "Horário de ponta: a recarga espera (liberação de emergência no calendário)" : quem >= 0 ? "Recarga de oportunidade: carrega quando baixa e no tempo parado" : "";
            alerta.classList.toggle("vermelho", critica >= 0);
        }
        palco(fig, [...document.querySelectorAll("#batCaps button")], DUR, quadro);
    })();
})();
