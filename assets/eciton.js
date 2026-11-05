/* Página do Eciton: cinco animações em SVG/HTML, cada uma só roda
   quando está na tela. Com "reduzir movimento", mostra um quadro parado. */
(() => {
    const NS = "http://www.w3.org/2000/svg";
    const S = (tag, attrs = {}, pai) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (pai) pai.appendChild(e);
        return e;
    };
    const T = (txt, attrs, pai) => { const e = S("text", attrs, pai); e.textContent = txt; return e; };
    const $ = id => document.getElementById(id);
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MONO = "JetBrains Mono, monospace";
    const COR = { azul: "#1E7BFF", azulC: "#63AEFF", verde: "#2BD46A", laranja: "#FF8A3D", roxo: "#A57BFF", vermelho: "#FF4D5E", ciano: "#2CE0FF", texto2: "#8E9BAE", linha: "#1B2533", prata: "#C9D1DA" };

    // percurso por uma lista de pontos: posição para uma distância d
    function trilha(pts) {
        const seg = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) {
            const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
            const len = Math.hypot(bx - ax, by - ay);
            seg.push({ ax, ay, bx, by, len, ini: tot }); tot += len;
        }
        return {
            tot,
            em(d) {
                d = Math.max(0, Math.min(tot, d));
                const s = seg.find(s => d <= s.ini + s.len) || seg[seg.length - 1];
                const u = s.len ? (d - s.ini) / s.len : 0;
                return [s.ax + (s.bx - s.ax) * u, s.ay + (s.by - s.ay) * u];
            },
            d: "M" + pts.map(p => p.join(" ")).join(" L")
        };
    }
    const suave = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    const fase = (t, a, b) => suave((t - a) / (b - a));
    const hhmm = m => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

    function veiculo(pai, cor, rotulo) {
        const g = S("g", {}, pai);
        S("circle", { r: 13, fill: cor, opacity: .18 }, g);
        S("rect", { x: -9, y: -7, width: 18, height: 14, rx: 3, fill: "#0B0F15", stroke: cor, "stroke-width": 2 }, g);
        S("rect", { x: -4, y: -3.5, width: 8, height: 7, rx: 1.2, fill: COR.laranja }, g);
        if (rotulo) T(rotulo, { x: 0, y: -14, "text-anchor": "middle", "font-family": MONO, "font-size": 8, fill: cor }, g);
        g.pos = (x, y) => g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        g.cor = c => { g.children[0].setAttribute("fill", c); g.children[1].setAttribute("stroke", c); if (g.children[3]) g.children[3].setAttribute("fill", c); };
        return g;
    }
    function rede(svg, segs, w = 3) {
        const g = S("g", { fill: "none", stroke: COR.azul, "stroke-width": w, "stroke-linecap": "round", opacity: .85 }, svg);
        segs.forEach(([a, b, c, d]) => S("line", { x1: a, y1: b, x2: c, y2: d }, g));
        return g;
    }
    function rotuloMapa(svg, txt, x, y, anchor = "start") {
        return T(txt, { x, y, "text-anchor": anchor, "font-family": MONO, "font-size": 9, fill: COR.texto2, "letter-spacing": ".06em" }, svg);
    }

    const cenas = [];
    const visivel = new WeakMap();
    const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => visivel.set(e.target, e.isIntersecting)), { rootMargin: "100px" }) : null;
    function registrar(el, cena) {
        if (!el) return;
        cena.el = el; cenas.push(cena);
        if (io) io.observe(el);
    }

    /* ---------------------------------------------------------
       1) PAINEL AO VIVO (topo): três Atta, cruzamento único
       --------------------------------------------------------- */
    (() => {
        const svg = $("ecMapa"); if (!svg) return;
        S("rect", { width: 400, height: 260, fill: "url(#gPainel)" }, svg);
        const defs = S("defs", {}, svg);
        const pat = S("pattern", { id: "gPainel", width: 20, height: 20, patternUnits: "userSpaceOnUse" }, defs);
        S("path", { d: "M20 0H0V20", fill: "none", stroke: "rgba(99,174,255,.06)" }, pat);
        rede(svg, [[60, 50, 340, 50], [60, 50, 60, 210], [60, 130, 340, 130], [200, 50, 200, 210], [40, 210, 340, 210]]);
        const zona = { x: 200, y: 130, r: 24, dono: null };
        const zEl = S("rect", { x: 182, y: 112, width: 36, height: 36, rx: 6, fill: "rgba(30,123,255,.12)", stroke: COR.azulC, "stroke-dasharray": "4 3" }, svg);
        [[60, 50, "ALMOX.", -10, -10], [340, 50, "M1", 8, -8], [340, 130, "M2", 8, -8], [340, 210, "M3", 8, -8], [40, 210, "BERÇO", -6, 22]].forEach(([x, y, n, dx, dy]) => {
            S("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 2, fill: "#fff", opacity: .85 }, svg);
            rotuloMapa(svg, n, x + dx, y + dy, n === "ALMOX." || n === "BERÇO" ? "start" : "start");
        });
        const frota = [
            { id: "Atta 01", cor: COR.azulC, rota: trilha([[60, 50], [60, 130], [200, 130], [340, 130]]), dest: "M2", kit: "K-204", d: 120, dir: 1, pausa: 0 },
            { id: "Atta 02", cor: COR.verde, rota: trilha([[60, 50], [200, 50], [200, 130], [200, 210], [340, 210]]), dest: "M3", kit: "K-205", d: 30, dir: 1, pausa: 0 },
            { id: "Atta 03", cor: COR.roxo, fixo: [40, 210] }
        ];
        const cartoes = $("ecCartoes");
        frota.forEach(v => {
            v.g = veiculo(svg, v.cor, v.id.slice(-2));
            const c = document.createElement("div"); c.className = "pc";
            c.innerHTML = `<div class="l1"><b>${v.id}</b><span class="pil"></span></div><small></small>`;
            cartoes.appendChild(c); v.card = c;
            if (v.fixo) v.g.pos(...v.fixo);
        });
        let entregas = 36, relogio = 7 * 60 + 42, acum = 0;
        const estado = (v, pil, txt, cor) => {
            if (v.ultimo === pil + txt) return;
            v.ultimo = pil + txt;
            v.card.style.setProperty("--c", cor);
            const p = v.card.querySelector(".pil"); p.textContent = pil; p.style.setProperty("--c", cor);
            v.card.querySelector("small").textContent = txt;
            v.g.cor(cor);
        };
        estado(frota[2], "no berço", "carregando · volta às 14:00", COR.roxo);
        const VEL = 42;
        const dentro = (x, y) => Math.hypot(x - zona.x, y - zona.y) < zona.r;
        const passo = dt => {
            acum += dt;
            if (acum > 3) { acum = 0; relogio++; $("ecHora").textContent = hhmm(relogio); }
            frota.forEach(v => {
                if (v.fixo) return;
                if (v.pausa > 0) {
                    v.pausa -= dt;
                    if (v.pausa <= 0) v.dir = v.d >= v.rota.tot ? -1 : 1;
                    return;
                }
                const [x0, y0] = v.rota.em(v.d);
                const nd = v.d + v.dir * VEL * dt;
                const [x1, y1] = v.rota.em(nd);
                if (!dentro(x0, y0) && dentro(x1, y1)) {
                    if (zona.dono && zona.dono !== v) { estado(v, "aguardando", "passagem no cruzamento", COR.laranja); return; }
                    zona.dono = v;
                }
                v.d = Math.max(0, Math.min(v.rota.tot, nd));
                const [x, y] = v.rota.em(v.d);
                v.g.pos(x, y);
                if (zona.dono === v && !dentro(x, y)) zona.dono = null;
                if (v.d >= v.rota.tot) {
                    v.pausa = 2.4; entregas++;
                    $("ecEntregas").textContent = `${entregas} entregas hoje`;
                    estado(v, "entregando", `soltando o kit em ${v.dest}`, COR.ciano);
                } else if (v.d <= 0) {
                    v.pausa = 2.4;
                    estado(v, "coletando", "prendendo o próximo kit", COR.ciano);
                } else if (v.dir > 0) estado(v, "em missão", `${v.kit} → ${v.dest}`, COR.azulC);
                else estado(v, "voltando", "para o almoxarifado", COR.verde);
            });
            const ocupado = zona.dono || frota.some(v => v.ultimo?.startsWith("aguardando"));
            zEl.setAttribute("stroke", frota.some(v => v.ultimo?.startsWith("aguardando")) ? COR.laranja : COR.azulC);
            zEl.setAttribute("fill", ocupado ? "rgba(30,123,255,.2)" : "rgba(30,123,255,.08)");
        };
        frota.forEach(v => { if (!v.fixo) { const [x, y] = v.rota.em(v.d); v.g.pos(x, y); estado(v, "em missão", `${v.kit} → ${v.dest}`, COR.azulC); } });
        $("ecEntregas").textContent = `${entregas} entregas hoje`;
        if (reduzir) return;
        registrar(svg.closest(".painel-ec"), { passo });
    })();

    /* ---------------------------------------------------------
       2) DESPACHO: tablet → Eciton → rota → chegada (15 s)
       --------------------------------------------------------- */
    (() => {
        const svg = $("dMapa"); if (!svg) return;
        rede(svg, [[40, 40, 280, 40], [160, 40, 160, 180], [40, 180, 280, 180], [280, 40, 280, 180]], 2.5).setAttribute("opacity", .5);
        [[40, 40, "ALMOX.", -8, 22], [280, 180, "MONTAGEM 2", 0, 22]].forEach(([x, y, n, dx, dy]) => {
            S("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 2, fill: "#fff", opacity: .85 }, svg);
            rotuloMapa(svg, n, x + dx, y + dy, n === "ALMOX." ? "start" : "end");
        });
        const rota = trilha([[52, 40], [280, 40], [280, 168]]);
        const rEl = S("path", { d: rota.d, fill: "none", stroke: COR.azulC, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": rota.tot, "stroke-dashoffset": rota.tot }, svg);
        rEl.style.filter = "drop-shadow(0 0 6px rgba(99,174,255,.8))";
        const a1 = veiculo(svg, COR.azulC, "01"), a2 = veiculo(svg, COR.verde, "02"), a3 = veiculo(svg, COR.roxo, "03");
        a3.pos(40, 180); a2.pos(52, 40);
        const bt = $("dBtKit"), toque = bt.querySelector(".toque"), est = $("dTabEstado"), tit = $("dCerTitulo"), env = $("dEnvio");
        const lis = [...document.querySelectorAll("#dCandidatos li")];
        lis.forEach(li => li.classList.add(li.dataset.c === "2" ? "sim" : "nao"));
        const passos = [...document.querySelectorAll("#dPassos li")];
        let t = 0, ultimoTexto = "";
        const tablet = (cls, html) => { if (ultimoTexto === html) return; ultimoTexto = html; est.className = "tab-estado " + cls; est.innerHTML = html; };
        const desenhar = (tt, anterior) => {
            if (anterior < 1 && tt >= 1) { toque.classList.remove("vai"); void toque.offsetWidth; toque.classList.add("vai"); bt.classList.add("apertado"); setTimeout(() => bt.classList.remove("apertado"), 180); }
            if (tt < 1.2) tablet("", "<span>Nada pendente</span>");
            else if (tt < 5.2) tablet("", "<b>Pedido enviado</b><span>o Eciton está escolhendo o Atta</span>");
            else if (tt < 11.6) tablet("vindo", "<b>Atta 02 a caminho</b><span>chega em cerca de 1 min</span>");
            else tablet("chegou", "<b>Atta 02 chegou</b><span>confirme o recebimento do kit</span>");
            tit.textContent = tt < 1.2 ? "esperando pedidos" : tt < 5.2 ? "pedido: kit para Montagem 2" : tt < 11.6 ? "missão em andamento" : "entregue";
            tit.classList.toggle("ativo", tt >= 1.2);
            const vistos = [2.4, 3.2, 4.1];
            lis.forEach((li, i) => li.classList.toggle("visto", tt >= vistos[i]));
            env.classList.toggle("ok", tt >= 5.2);
            const pIdx = tt < 1.2 ? -1 : tt < 2.4 ? 0 : tt < 5.2 ? 1 : tt < 11.6 ? 2 : 3;
            passos.forEach((p, i) => p.classList.toggle("agora", i === pIdx));
            rEl.setAttribute("stroke-dashoffset", (rota.tot * (1 - fase(tt, 5.2, 6.4))).toFixed(1));
            rEl.setAttribute("opacity", tt >= 11.6 ? .35 : 1);
            const [x, y] = rota.em(rota.tot * fase(tt, 6.2, 11.6));
            a2.pos(x, y);
            a2.cor(tt >= 11.6 ? COR.ciano : tt >= 6.2 ? COR.azulC : COR.verde);
            // Atta 01 ocupado, indo e voltando na rua do meio
            const u = (Math.sin(tt / 15 * Math.PI * 2) + 1) / 2;
            a1.pos(160, 60 + u * 100);
        };
        const DUR = 15;
        const passo = dt => { const ant = t; t = (t + dt) % DUR; desenhar(t, t < ant ? -1 : ant); };
        desenhar(reduzir ? 12 : 0, 0);
        if (!reduzir) registrar($("cenaDespacho"), { passo });
    })();

    /* ---------------------------------------------------------
       3) TURNOS: relógio de 24 h, cada Atta com o seu horário
       --------------------------------------------------------- */
    (() => {
        const svg = $("tRelogio"); if (!svg) return;
        const C = 150, R = 118;
        const ang = h => (h / 24) * Math.PI * 2 - Math.PI / 2;
        const pt = (h, r) => [C + Math.cos(ang(h)) * r, C + Math.sin(ang(h)) * r];
        S("circle", { cx: C, cy: C, r: R + 16, fill: "#070B11", stroke: COR.linha }, svg);
        S("circle", { cx: C, cy: C, r: R, fill: "none", stroke: "#22303F", "stroke-width": 1 }, svg);
        for (let h = 0; h < 24; h++) {
            const [x1, y1] = pt(h, R - (h % 3 ? 5 : 10)), [x2, y2] = pt(h, R);
            S("line", { x1, y1, x2, y2, stroke: h % 3 ? "#2A3646" : "#4A5B70", "stroke-width": h % 3 ? 1 : 2 }, svg);
            if (h % 3 === 0) { const [x, y] = pt(h, R - 22); T(String(h).padStart(2, "0"), { x, y: y + 3.5, "text-anchor": "middle", "font-family": MONO, "font-size": 10, fill: COR.texto2 }, svg); }
        }
        const frota = [
            { id: "Atta 01", cor: COR.azul, ini: 6 * 60, fim: 14 * 60, r: 84 },
            { id: "Atta 02", cor: COR.ciano, ini: 14 * 60, fim: 22 * 60, r: 74 },
            { id: "Atta 03", cor: COR.prata, ini: 8 * 60, fim: 18 * 60, r: 64 }
        ];
        const arco = (h1, h2, r) => {
            const [x1, y1] = pt(h1, r), [x2, y2] = pt(h2, r);
            return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${h2 - h1 > 12 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
        };
        frota.forEach(v => {
            S("circle", { cx: C, cy: C, r: v.r, fill: "none", stroke: "#141C27", "stroke-width": 7 }, svg);
            v.arco = S("path", { d: arco(v.ini / 60, v.fim / 60, v.r), fill: "none", stroke: v.cor, "stroke-width": 7, "stroke-linecap": "round", opacity: .45 }, svg);
        });
        const ponteiro = S("line", { x1: C, y1: C, x2: C, y2: C - R + 4, stroke: "#fff", "stroke-width": 2.2, "stroke-linecap": "round" }, svg);
        const ponta = S("circle", { cx: C, cy: C - R + 4, r: 4.5, fill: COR.azulC }, svg);
        ponta.style.filter = "drop-shadow(0 0 6px #63AEFF)";
        S("circle", { cx: C, cy: C, r: 34, fill: "#0A0F17", stroke: COR.linha }, svg);
        const hora = T("07:00", { x: C, y: C + 6, "text-anchor": "middle", "font-family": MONO, "font-size": 18, "font-weight": 500, fill: "#E9EEF5" }, svg);
        T("seg a sex", { x: C, y: C + 20, "text-anchor": "middle", "font-family": MONO, "font-size": 8, fill: COR.texto2 }, svg);
        const lista = $("tLista");
        frota.forEach(v => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="cor" style="--c:${v.cor}"></i><b>${v.id}</b><span class="hor">${hhmm(v.ini)}–${hhmm(v.fim)} · seg a sex</span><span class="pil"></span>`;
            lista.appendChild(li); v.pil = li.querySelector(".pil");
        });
        const status = (v, m) => {
            if (m < v.ini) return ["no berço · fora do turno", COR.roxo];
            if (m < v.ini + 6) return ["turno iniciado", COR.verde];
            if (m < v.fim - 25) return ["em missão", COR.azulC];
            if (m < v.fim) return ["finalizando a missão", COR.laranja];
            if (m < v.fim + 22) return ["indo para o berço", COR.roxo];
            return ["no berço · carregando", COR.roxo];
        };
        const INI = 4 * 60, FIM = 24 * 60, DUR = 22, ANDA = 20;
        let t = 0;
        const desenhar = tt => {
            const m = INI + (FIM - 1 - INI) * Math.min(1, tt / ANDA);
            const [x, y] = pt(m / 60, R - 4);
            ponteiro.setAttribute("x2", x.toFixed(1)); ponteiro.setAttribute("y2", y.toFixed(1));
            ponta.setAttribute("cx", x.toFixed(1)); ponta.setAttribute("cy", y.toFixed(1));
            hora.textContent = hhmm(m);
            frota.forEach(v => {
                const [txt, cor] = status(v, m);
                if (v.pil.textContent !== txt) { v.pil.textContent = txt; v.pil.style.setProperty("--k", cor); }
                v.arco.setAttribute("opacity", m >= v.ini && m < v.fim ? 1 : .35);
            });
        };
        desenhar(reduzir ? ANDA * (10.5 * 60 - INI) / (FIM - INI) : 0);
        if (!reduzir) registrar(svg, { passo: dt => { t = (t + dt) % DUR; desenhar(t); } });
    })();

    /* ---------------------------------------------------------
       4) FILA: missão em execução, pedidos entrando, urgente na frente
       --------------------------------------------------------- */
    (() => {
        const caixa = $("fLista"); if (!caixa) return;
        const ALT = 64;
        caixa.style.height = (4 * ALT - 8) + "px";
        const itens = {
            k205: { nome: "K-205 · Montagem 1", sub: "kit · pedido 07:41", tag: "kit" },
            v031: { nome: "V-031 · Prensa 1", sub: "levar vazio · pedido 07:43", tag: "vazio" },
            k206: { nome: "K-206 · Montagem 3", sub: "kit · pedido agora", tag: "novo", cls: "novo", entra: 4 },
            u012: { nome: "U-012 · Prensa 2", sub: "urgente · liberado pelo líder", tag: "urgente", cls: "urg", entra: -1 }
        };
        Object.entries(itens).forEach(([k, it]) => {
            const d = document.createElement("div");
            d.className = "fila-item " + (it.cls || "");
            d.innerHTML = `<span class="n"></span><div><b>${it.nome}</b><small>${it.sub}</small></div><span class="tag">${it.tag}</span>`;
            caixa.appendChild(d); it.el = d; it.n = d.querySelector(".n");
        });
        const exec = document.querySelector(".fila-exec"), execNome = $("fExecNome"), barra = $("fBarra");
        const passos = [...document.querySelectorAll("#fPassos li")];
        const conta = $("fConta");
        const ordemEm = tt => tt < 3.5 ? ["k205", "v031"] : tt < 6.5 ? ["k205", "v031", "k206"] : tt < 11.3 ? ["u012", "k205", "v031", "k206"] : ["k205", "v031", "k206"];
        let t = 0, ultimaOrdem = "";
        const desenhar = (tt, reinicio) => {
            const ordem = ordemEm(tt);
            if (reinicio) Object.values(itens).forEach(it => { it.el.style.transition = "none"; });
            if (ordem.join() !== ultimaOrdem || reinicio) {
                ultimaOrdem = ordem.join();
                Object.entries(itens).forEach(([k, it]) => {
                    const i = ordem.indexOf(k);
                    if (i >= 0) { it.el.style.opacity = 1; it.el.style.transform = `translateY(${i * ALT}px)`; it.n.textContent = String(i + 1).padStart(2, "0"); }
                    else { it.el.style.opacity = 0; it.el.style.transform = `translateY(${(it.entra ?? -1) * ALT * (it.entra > 0 ? 1 : .5)}px)`; }
                });
                conta.textContent = `${ordem.length} pedidos`;
            }
            if (reinicio) requestAnimationFrame(() => Object.values(itens).forEach(it => { it.el.style.transition = ""; }));
            const urg = tt >= 11.3;
            exec.classList.toggle("urgente", urg);
            execNome.textContent = urg ? "U-012 · Prensa 2" : "K-204 · Montagem 2";
            passos[3].textContent = urg ? "Ir até a Prensa 2" : "Ir até a Montagem 2";
            const p = urg ? Math.min(1, (tt - 11.3) / 10.5) : Math.min(1, tt / 10.5);
            const idx = p >= 1 ? 6 : Math.floor(p * 5);
            passos.forEach((li, i) => { li.classList.toggle("feito", i < idx || (i === 5 && p >= 1)); li.classList.toggle("agora", i === idx && p < 1); });
            barra.style.width = (p * 100).toFixed(1) + "%";
        };
        desenhar(reduzir ? 8 : 0, true);
        if (!reduzir) registrar($("cenaFila"), { passo: dt => { const ant = t; t = (t + dt) % 15; desenhar(t, t < ant); } });
    })();

    /* ---------------------------------------------------------
       5) PLANTA: layout importado → escala → rotas → postos → frota
       --------------------------------------------------------- */
    (() => {
        const svg = $("pSvg"); if (!svg) return;
        const cad = S("g", { fill: "none", stroke: "#3A4656", "stroke-width": 1.2 }, svg);
        S("rect", { x: 20, y: 20, width: 560, height: 300, rx: 2, "stroke-width": 2 }, cad);
        S("path", { d: "M20 120 H70 M110 120 H260 M300 20 V60 M300 100 V160", "stroke-width": 2 }, cad);
        for (let i = 0; i < 4; i++) S("rect", { x: 60, y: 36 + i * 20, width: 190, height: 10 }, cad);
        for (let i = 0; i < 3; i++) S("rect", { x: 60 + i * 70, y: 222, width: 50, height: 30 }, cad);
        S("rect", { x: 380, y: 50, width: 70, height: 46 }, cad); S("rect", { x: 470, y: 50, width: 80, height: 46 }, cad);
        S("rect", { x: 420, y: 236, width: 130, height: 56 }, cad);
        for (let x = 110; x < 580; x += 90) for (const y of [170]) S("rect", { x: x - 3, y: y - 3, width: 6, height: 6, fill: "#3A4656" }, cad);
        const tc = { "font-family": MONO, "font-size": 8, fill: "#4E5D70", stroke: "none" };
        T("ESTANTES · ALMOXARIFADO", { x: 62, y: 32, ...tc }, cad); T("PRENSA 1", { x: 384, y: 46, ...tc }, cad); T("PRENSA 2", { x: 474, y: 46, ...tc }, cad);
        T("MONTAGEM", { x: 424, y: 232, ...tc }, cad); T("PALETES", { x: 62, y: 266, ...tc }, cad);

        const esc = S("g", {}, svg);
        const pA = S("circle", { cx: 60, cy: 302, r: 5, fill: COR.laranja }, esc), pB = S("circle", { cx: 300, cy: 302, r: 5, fill: COR.laranja }, esc);
        const cota = S("line", { x1: 60, y1: 302, x2: 60, y2: 302, stroke: COR.laranja, "stroke-width": 1.6, "stroke-dasharray": "5 3" }, esc);
        const cotaT = T("12,0 m", { x: 180, y: 294, "text-anchor": "middle", "font-family": MONO, "font-size": 11, fill: COR.laranja }, esc);

        const rotas = [
            trilha([[40, 190], [330, 190], [330, 120], [415, 120], [415, 100]]),
            trilha([[330, 190], [330, 280], [400, 280]]),
            trilha([[330, 120], [510, 120], [510, 100]]),
            trilha([[40, 190], [40, 290]])
        ];
        const rEls = rotas.map(r => {
            const e = S("path", { d: r.d, fill: "none", stroke: COR.azul, "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": r.tot, "stroke-dashoffset": r.tot }, svg);
            e.style.filter = "drop-shadow(0 0 5px rgba(30,123,255,.8))";
            return e;
        });
        const marcas = S("g", {}, svg);
        const zonas = [[330, 190], [330, 120]].map(([x, y]) => S("rect", { x: x - 16, y: y - 16, width: 32, height: 32, rx: 5, fill: "rgba(30,123,255,.12)", stroke: COR.azulC, "stroke-dasharray": "4 3" }, marcas));
        const postos = [[415, 100, "PRENSA 1"], [510, 100, "PRENSA 2"], [400, 280, "MONTAGEM"], [40, 190, "ALMOX."], [40, 290, "BERÇO"]].map(([x, y, n]) => {
            const g = S("g", { transform: `translate(${x} ${y})` }, marcas);
            S("rect", { x: -6, y: -6, width: 12, height: 12, rx: 2, fill: "#fff" }, g);
            T(n, { x: 10, y: 4, "font-family": MONO, "font-size": 9, fill: "#E9EEF5" }, g);
            return g;
        });
        const voltas = [
            { r: trilha([[40, 190], [330, 190], [330, 120], [415, 120], [415, 106]]), v: veiculo(svg, COR.azulC, "01"), off: 0 },
            { r: trilha([[40, 190], [330, 190], [330, 280], [394, 280]]), v: veiculo(svg, COR.verde, "02"), off: .5 }
        ];
        const chip = $("pChip");
        const passos = [...document.querySelectorAll("#pPassos li")];
        let t = 0;
        const DUR = 19;
        const desenhar = tt => {
            cad.setAttribute("opacity", (.25 + .75 * fase(tt, 0, 1.5)).toFixed(2));
            const e1 = fase(tt, 2, 2.4), e2 = fase(tt, 2.6, 3), e3 = fase(tt, 3, 3.8);
            pA.setAttribute("r", (5 * e1).toFixed(2)); pB.setAttribute("r", (5 * e2).toFixed(2));
            cota.setAttribute("x2", (60 + 240 * e3).toFixed(1));
            cotaT.setAttribute("opacity", fase(tt, 3.8, 4.2).toFixed(2));
            esc.setAttribute("opacity", tt > 12 ? (1 - fase(tt, 12, 13)).toFixed(2) : 1);
            rEls.forEach((e, i) => e.setAttribute("stroke-dashoffset", (rotas[i].tot * (1 - fase(tt, 5 + i * 1.2, 6.4 + i * 1.2))).toFixed(1)));
            const m = fase(tt, 10, 11.5);
            zonas.forEach(z => z.setAttribute("opacity", m.toFixed(2)));
            postos.forEach((g, i) => g.setAttribute("opacity", fase(tt, 10 + i * .25, 10.6 + i * .25).toFixed(2)));
            const anda = tt >= 12;
            voltas.forEach(o => {
                o.v.setAttribute("opacity", anda ? fase(tt, 12, 12.6) : 0);
                if (!anda) return;
                const u = ((tt - 12) / 7 + o.off) % 1;
                const k = u < .5 ? suave(u * 2) : suave((1 - u) * 2);
                o.v.pos(...o.r.em(o.r.tot * k));
            });
            const pIdx = tt < 2 ? 0 : tt < 5 ? 1 : tt < 10 ? 2 : tt < 12 ? 3 : 4;
            passos.forEach((p, i) => p.classList.toggle("agora", i === pIdx));
            const txt = ["layout_galpao.png", "escala: 12,0 m entre os pontos", "desenhando as rotas", "cruzamentos e postos", "frota rodando"][pIdx];
            if (chip.textContent !== txt) chip.textContent = txt;
            chip.classList.toggle("ativo", pIdx > 0);
        };
        desenhar(reduzir ? 15 : 0);
        if (!reduzir) registrar(svg.closest(".planta-tela"), { passo: dt => { t = (t + dt) % DUR; desenhar(t); } });
    })();

    /* laço único */
    if (reduzir || !cenas.length) return;
    let ult = performance.now();
    const quadro = agora => {
        const dt = Math.min(.1, (agora - ult) / 1000); ult = agora;
        cenas.forEach(c => { if (visivel.get(c.el) !== false) c.passo(dt); });
        requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
})();
