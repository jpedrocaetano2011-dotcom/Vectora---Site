(() => {
    /* ============================================================
       MOTOR 3D EM CSS: piso, caixas, AGV, kit, rótulos que olham
       para a câmera. A câmera é um rotateX/rotateZ fixo; o mundo
       anda por baixo dela.
       ============================================================ */
    const TILT = 57, GIRO = -34;
    const el = (tag, cls, pai, estilo) => {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (estilo) Object.assign(e.style, estilo);
        if (pai) pai.appendChild(e);
        return e;
    };
    const px = n => n + "px";

    function caixa3d(pai, x, y, w, d, h, cores, z = 0) {
        const g = el("div", "obj", pai, { width: px(w), height: px(d), transform: `translate3d(${x}px,${y}px,${z}px)` });
        el("div", "face", g, { width: px(w), height: px(h), background: cores.n || cores.lado, transform: "rotateX(90deg)" });
        el("div", "face", g, { width: px(h), height: px(d), background: cores.o || cores.lado, transform: "rotateY(-90deg)" });
        el("div", "face", g, { width: px(w), height: px(h), background: cores.s || cores.lado, transform: `translate3d(0,${d}px,0) rotateX(90deg)` });
        el("div", "face", g, { width: px(h), height: px(d), background: cores.l || cores.lado, transform: `translate3d(${w}px,0,0) rotateY(-90deg)` });
        const topo = el("div", "face", g, { width: px(w), height: px(d), background: cores.topo, transform: `translateZ(${h}px)` });
        return { g, topo };
    }
    const rotulo = (pai, texto, x, y, z, cls = "") => {
        const r = el("div", "rotulo3d " + cls, pai);
        r.textContent = texto;
        r.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateZ(${-GIRO}deg) rotateX(${-TILT}deg) translate(-50%,-100%)`;
        return r;
    };

    // AGV: chassi grafite, borda prata, sinalização nas laterais, garra em cima
    function criarAGV(pai, nome) {
        const raiz = el("div", "agv3d", pai);
        const giro = el("div", "giro", raiz);
        const W = 70, D = 52, H = 16;
        const corpo = caixa3d(giro, -W / 2, -D / 2, W, D, H, { topo: "linear-gradient(135deg,#3a4552,#1b232c)", lado: "#121920", s: "#1a222b", l: "#202a35" }, 4);
        // rodas
        [[-W / 2 + 4, -D / 2 - 5], [W / 2 - 22, -D / 2 - 5], [-W / 2 + 4, D / 2 - 3], [W / 2 - 22, D / 2 - 3]].forEach(([x, y]) =>
            caixa3d(giro, x, y, 18, 8, 12, { topo: "repeating-linear-gradient(45deg,#4b5560 0 3px,#2a3138 3px 6px)", lado: "#20262c" }, 0));
        // sinalização (duas laterais)
        const leds = [
            el("div", "led3d corre", corpo.topo, { position: "absolute", left: "8px", right: "8px", top: "3px", height: "4px", borderRadius: "2px" }),
            el("div", "led3d corre", corpo.topo, { position: "absolute", left: "8px", right: "8px", bottom: "3px", height: "4px", borderRadius: "2px" })
        ];
        // borda prata e frente (seta)
        el("div", "", corpo.topo, { position: "absolute", inset: "0", border: "1.5px solid rgba(201,209,218,.45)", borderRadius: "3px" });
        el("div", "", corpo.topo, { position: "absolute", right: "4px", top: "50%", width: "0", height: "0", marginTop: "-6px", borderLeft: "9px solid #63AEFF", borderTop: "6px solid transparent", borderBottom: "6px solid transparent", filter: "drop-shadow(0 0 4px #1E7BFF)" });
        // garra (plataforma que sobe)
        const garra = el("div", "obj", giro, {});
        caixa3d(garra, -16, -20, 32, 4, 8, { topo: "#9aa6b2", lado: "#5b6672" }, H + 4);
        caixa3d(garra, -16, 16, 32, 4, 8, { topo: "#9aa6b2", lado: "#5b6672" }, H + 4);
        return { raiz, giro, leds, garra, x: 0, y: 0, ang: 0, nome };
    }
    // AGV E4M (o protótipo real): base com 4 aberturas de status, painel de
    // operação na frente (+x), compartimento de acrílico aceso pelas fitas do
    // tampo e plataforma de elevação. Fitas da base e do tampo: mesma cor, mesmo efeito.
    function criarAGVE4M(pai, nome) {
        const raiz = el("div", "agv3d", pai);
        const giro = el("div", "giro", raiz);
        const L = 56, h0 = 2, hb = 12, hs = 16, hb0 = h0 + hb, ht = hb0 + hs;
        const leds = [];
        // As luzes ficam em planos 3D próprios (caixinhas rentes às faces): elemento animado
        // dentro de uma face lateral some atrás dela no navegador.
        const virarLed = (face, base) => { face.style.background = ""; face.className = "face " + base + " corre"; face.dataset.base = "face " + base; leds.push(face); };
        // base
        const base = caixa3d(giro, -L / 2, -L / 2, L, L, hb, { topo: "#101216", lado: "#0d0f12", s: "#121418", l: "#16191e" }, h0);
        const fl = base.g.children[3];
        // as 4 aberturas de status: uma em cada lado (frente = +x, onde fica o painel)
        const zf = h0 + (hb - 4) / 2, escuro = { topo: "#020304", lado: "#020304" };
        virarLed(caixa3d(giro, -14, -L / 2 - 1, 28, 1, 4, escuro, zf).g.children[0], "led3d");
        virarLed(caixa3d(giro, -14, L / 2, 28, 1, 4, escuro, zf).g.children[2], "led3d");
        virarLed(caixa3d(giro, -L / 2 - 1, -14, 1, 28, 4, escuro, zf).g.children[1], "led3d v");
        virarLed(caixa3d(giro, L / 2, -14, 1, 28, 4, escuro, zf).g.children[3], "led3d v");
        // janelas dos sensores de distância (frente)
        [-20, 16].forEach(y => caixa3d(giro, L / 2, y, 0.6, 4, 3, escuro, h0 + 7));
        // compartimento superior: 3 lados de acrílico (acesos pelas fitas do tampo) + painel preto na frente
        const sup = caixa3d(giro, -L / 2 + 1, -L / 2 + 1, L - 2, L - 2, hs, { topo: "transparent", lado: "transparent", l: "#0f1114" }, hb0);
        [...sup.g.children].slice(0, 3).forEach(f => virarLed(f, "acrilico aquario"));
        // luz das fitas do tampo no piso do compartimento
        const piso = el("div", "aquario corre", base.topo, { position: "absolute", inset: "3px", borderRadius: "3px", background: "radial-gradient(circle, var(--c), transparent 70%)" });
        piso.dataset.base = "aquario"; leds.push(piso);
        // colunas, bateria, bornes, fuso
        [[-L / 2 + 1, -L / 2 + 1], [L / 2 - 4, -L / 2 + 1], [-L / 2 + 1, L / 2 - 4], [L / 2 - 4, L / 2 - 4]].forEach(([x, y]) => caixa3d(giro, x, y, 3, 3, hs, { topo: "#0b0c0e", lado: "#14161a" }, hb0));
        caixa3d(giro, -18, -22, 24, 8, 7, { topo: "linear-gradient(135deg,#3f7fe6,#1d4fb8)", lado: "#1a46a3", s: "#2257c4" }, hb0);
        caixa3d(giro, -24, -8, 4, 22, 8, { topo: "repeating-linear-gradient(0deg,#9aa1a8 0 2px,#6c737a 2px 3px)", lado: "#7c838a" }, hb0);
        caixa3d(giro, 6, 10, 12, 8, 3, { topo: "repeating-linear-gradient(90deg,#2a5fd0 0 3px,#a8282e 3px 4px)", lado: "#8f2328" }, hb0);
        caixa3d(giro, -1, -1, 2, 2, hs, { topo: "#d6d9de", lado: "#b9bec6" }, hb0);
        // painel de operação (face l do compartimento): botoeira, seletora, emergência
        const painel = sup.g.children[3];
        const comp = (estilo) => el("div", "", painel, Object.assign({ position: "absolute", borderRadius: "50%" }, estilo));
        const P = L - 2;   // largura do painel (eixo "top" desta face, espelhado)
        el("div", "", painel, { position: "absolute", left: "3px", top: P - 8 - 5 + "px", width: "10px", height: "5px", borderRadius: "3px", background: "linear-gradient(90deg,#18a64c 0 42%,#eeeeee 42% 58%,#e0262b 58%)" });
        comp({ left: "6px", top: P - 19 - 5 + "px", width: "5px", height: "5px", background: "#050506", border: "1px solid #2c2f35" });
        comp({ left: "3px", top: P - 33 - 11 + "px", width: "11px", height: "11px", background: "radial-gradient(circle,#e3262c 0 38%,#f2c90c 40% 100%)" });
        comp({ left: "2px", top: P - 15 - 2.5 + "px", width: "2.5px", height: "2.5px", background: "#d6d9de", boxShadow: "0 0 3px #9fd4ff" });
        comp({ left: "2px", top: P - 26 - 2.5 + "px", width: "2.5px", height: "2.5px", background: "#d6d9de", boxShadow: "0 0 3px #9fd4ff" });
        // tampo e plataforma de elevação (a "garra")
        caixa3d(giro, -L / 2 - 1, -L / 2 - 1, L + 2, L + 2, 2, { topo: "linear-gradient(135deg,#1c1f24,#0d0e11)", lado: "#090a0c" }, ht);
        const garra = el("div", "obj", giro, {});
        caixa3d(garra, -20, -20, 40, 40, 3, { topo: "linear-gradient(135deg,#22262c,#101215)", lado: "#0b0c0e" }, ht + 2);
        return { raiz, giro, leds, garra, x: 0, y: 0, ang: 0, nome };
    }
    const posicionarAGV = (a, x, y, ang) => {
        a.x = x; a.y = y; a.ang = ang;
        a.raiz.style.transform = `translate3d(${x}px,${y}px,0)`;
        a.giro.style.transform = `rotateZ(${ang}deg)`;
    };
    const sinalAGV = (a, cor, efeito) => a.leds.forEach(l => { l.style.setProperty("--c", cor); l.className = (l.dataset.base || "led3d") + " " + (efeito || ""); });

    function criarKit(pai) {
        const raiz = el("div", "obj", pai);
        const giro = el("div", "giro", raiz);
        caixa3d(giro, -15, -12, 30, 24, 16, { topo: "linear-gradient(135deg,#ffb347,#f0851a)", lado: "#b65f12", s: "#cf6d16", l: "#de7a1a" });
        el("div", "", giro.lastChild.lastChild, {});
        return { raiz, giro };
    }
    const posicionarKit = (k, x, y, z, ang) => {
        k.raiz.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
        k.giro.style.transform = `rotateZ(${ang}deg)`;
    };
    function fita(pai, x1, y1, x2, y2) {
        const L = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        el("div", "fita", pai, { width: px(L + 8), height: "8px", transform: `translate3d(${x1}px,${y1}px,0.5px) rotateZ(${ang}deg) translate(-4px,-4px)` });
    }
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // anima só o que está na tela
    const naTelaMapa = new WeakMap();
    const observar = alvo => {
        naTelaMapa.set(alvo, true);
        if (!("IntersectionObserver" in window)) return;
        new IntersectionObserver(es => es.forEach(e => naTelaMapa.set(e.target, e.isIntersecting)), { rootMargin: "120px" }).observe(alvo);
    };
    const naTela = alvo => naTelaMapa.get(alvo) !== false;
    // o motor também é usado pela página do Eciton (cena dos turnos)
    window.Motor3D = { TILT, GIRO, el, px, caixa3d, rotulo, criarAGVE4M, posicionarAGV, sinalAGV, criarKit, posicionarKit, fita };

    /* ============================================================
       VITRINE (topo): o AGV girando devagar sobre a fita
       ============================================================ */
    (() => {
        const cam = document.getElementById("cameraVitrine");
        if (!cam) return;
        const mundo = el("div", "obj", cam);
        el("div", "piso", mundo, { width: "520px", height: "520px", transform: "translate3d(-260px,-260px,0)", borderRadius: "50%", background: "radial-gradient(circle,#12223a 0%,#0b1119 55%,transparent 72%)" });
        fita(mundo, -230, 0, 230, 0);
        el("div", "tag-chao", mundo, { left: "0", top: "0", transform: "translate3d(120px,0,1px)" });
        const agv = criarAGVE4M(mundo, "AGV");
        const estados = [["#2BD46A", "corre", "Em missão"], ["#2BD46A", "", "Pronto"], ["#3A6DFF", "", "Manual"], ["#A57BFF", "respira", "Turno encerrado, no berço"], ["#FF8A3D", "respira", "Obstáculo à frente"]];
        const chip = document.getElementById("statusVitrine");
        let estadoAtual = -1;
        const aplicarEstado = i => {
            if (i === estadoAtual) return; estadoAtual = i;
            const [cor, efeito, texto] = estados[i];
            sinalAGV(agv, cor, efeito || "fixo");
            if (chip) { chip.style.setProperty("--c", cor); chip.lastChild.textContent = texto; }
        };
        aplicarEstado(0);
        const kit = criarKit(mundo);
        let t0 = performance.now();
        const vitrineEl = document.getElementById("vitrine");
        observar(vitrineEl);
        const largura = () => vitrineEl.clientWidth;
        const quadro = agora => {
            if (!reduzir && !naTela(vitrineEl)) { requestAnimationFrame(quadro); return; }
            const t = (agora - t0) / 1000;
            const ang = reduzir ? -24 : -24 + t * 14;
            const escala = Math.min(2.3, largura() / 250);
            cam.style.transform = `scale(${escala}) rotateX(${TILT}deg) rotateZ(${GIRO + ang}deg)`;
            posicionarAGV(agv, 0, 0, 0);
            const sobe = reduzir ? 0 : (Math.sin(t * 1.4) + 1) * 3;
            posicionarKit(kit, 0, 0, 35 + sobe, 0);
            if (!reduzir) aplicarEstado(Math.floor(Math.max(0, t) / 4) % estados.length);
            agv.garra.style.transform = `translateZ(${sobe}px)`;
            if (!reduzir) requestAnimationFrame(quadro);
        };
        requestAnimationFrame(quadro);
    })();

    /* ============================================================
       MISSÃO (rolagem): planta, AGV 01 com o kit, AGV 02 cruzando
       ============================================================ */
    (() => {
    const cam = document.getElementById("cameraMissao");
    if (!cam) return;
    const palco = document.getElementById("palco");
    const mundo = el("div", "obj", cam);
    el("div", "piso", mundo, { width: "1760px", height: "1140px", transform: "translate3d(-80px,-80px,0)" });

    // fitas: corredor principal, ramais das estações e do berço, linha do AGV 02
    fita(mundo, 180, 560, 1500, 560);
    fita(mundo, 460, 560, 460, 300);
    fita(mundo, 1350, 560, 1350, 315);
    fita(mundo, 180, 560, 180, 830);
    fita(mundo, 900, 240, 900, 960);
    [[460, 300], [1350, 315], [180, 830], [180, 560], [460, 560], [1350, 560], [900, 560]].forEach(([x, y]) =>
        el("div", "tag-chao", mundo, { transform: `translate3d(${x}px,${y}px,1px)` }));
    const zona = el("div", "zona-chao", mundo, { width: "96px", height: "96px", transform: "translate3d(852px,512px,0.8px)" });
    el("div", "marcacao", mundo, { width: "110px", height: "120px", transform: "translate3d(125px,780px,0.6px)" });

    // almoxarifado: prateleiras com caixas + mesa do kit
    const cinzaLado = { topo: "linear-gradient(135deg,#2b3542,#1a222c)", lado: "#121922", s: "#18212b", l: "#1d2733" };
    caixa3d(mundo, 300, 110, 330, 60, 90, cinzaLado);
    for (let i = 0; i < 6; i++) caixa3d(mundo, 312 + i * 52, 118, 40, 40, 22, { topo: i % 2 ? "#4c7dbf" : "#d9822b", lado: i % 2 ? "#2e5288" : "#9a5718" }, 90);
    const mesaKit = caixa3d(mundo, 420, 205, 80, 50, 26, { topo: "#3a4654", lado: "#202933", s: "#27313c" }).g;
    // montagem: bancada, operador, máquina
    const bancadaKit = caixa3d(mundo, 1280, 205, 140, 58, 30, { topo: "#3a4654", lado: "#202933", s: "#27313c" }).g;
    caixa3d(mundo, 1440, 120, 150, 110, 70, cinzaLado);
    const corpoOp = caixa3d(mundo, 1300, 160, 22, 16, 44, { topo: "#63AEFF", lado: "#2a5c9c" });
    const cabeca = el("div", "rotulo3d", mundo, { width: "18px", height: "18px", padding: "0", borderRadius: "50%", background: "#d9b38c", border: "0" });
    cabeca.style.transform = `translate3d(1311px,168px,62px) rotateZ(${-GIRO}deg) rotateX(${-TILT}deg) translate(-50%,-100%)`;
    // outras máquinas e o berço (carregador)
    caixa3d(mundo, 640, 120, 170, 100, 64, cinzaLado);
    caixa3d(mundo, 1000, 690, 260, 120, 52, cinzaLado);
    caixa3d(mundo, 560, 700, 200, 90, 40, cinzaLado);
    caixa3d(mundo, 140, 880, 80, 20, 34, { topo: "#2b3542", lado: "#121922", n: "linear-gradient(#1E7BFF,#0b3a80)" });

    rotulo(mundo, "Almoxarifado", 465, 110, 110);
    rotulo(mundo, "Montagem 2", 1350, 150, 90);
    rotulo(mundo, "Berço", 180, 900, 60);
    rotulo(mundo, "Cruzamento", 900, 500, 20);

    // um Atta por módulo (só o da missão escolhida aparece) e a carga de cada um
    const rolosFundo = "repeating-linear-gradient(90deg,#5b6672 0 5px,#252c34 5px 10px)";
    const ATTAS = { E: criarAGVE4M(mundo, "AGV 01"), G: criarAGV(mundo, "AGV 01"), R: criarAGV(mundo, "AGV 01"), T: criarAGV(mundo, "AGV 01") };
    ATTAS.R.garra.style.display = "none";
    caixa3d(ATTAS.R.giro, -33, -24, 66, 48, 4, { topo: rolosFundo, lado: "#2a3138" }, 20);
    ATTAS.T.garra.style.display = "none";
    caixa3d(ATTAS.T.giro, -44, -5, 10, 10, 10, { topo: "#9aa6b2", lado: "#5b6672" }, 8);      // engate atrás
    let agv = ATTAS.E;
    const agv2 = criarAGVE4M(mundo, "AGV 02");
    const kit = criarKit(mundo);
    // Atta E: o carrinho de peças (pernas por fora do Atta, ele entra por baixo)
    function criarCarrinho(pai, w = 84, d = 80, alt = 38, cheio = true) {
        const raiz = el("div", "obj", pai), giro = el("div", "giro", raiz);
        [[-w / 2, -d / 2], [w / 2 - 4, -d / 2], [-w / 2, d / 2 - 4], [w / 2 - 4, d / 2 - 4]].forEach(([x, y]) => caixa3d(giro, x, y, 4, 4, alt, { topo: "#9aa6b2", lado: "#6b7682" }));
        caixa3d(giro, -w / 2, -d / 2, w, d, 3, { topo: "linear-gradient(135deg,#3a6db5,#24487d)", lado: "#1c3a66" }, alt);
        const carga = el("div", "obj", giro);
        if (cheio) {
            caixa3d(carga, -w / 2 + 6, -d / 2 + 6, w / 2 - 9, d / 2 - 8, 16, { topo: "#d9822b", lado: "#9a5718" }, alt + 3);
            caixa3d(carga, 3, -d / 2 + 6, w / 2 - 9, d / 2 - 8, 16, { topo: "#4c7dbf", lado: "#2e5288" }, alt + 3);
            caixa3d(carga, -w / 4, 4, w / 2, d / 2 - 10, 13, { topo: "#d9822b", lado: "#9a5718" }, alt + 3);
        }
        return { raiz, giro, carga };
    }
    const carrinhoE = criarCarrinho(mundo);
    // Atta R: esteiras na estação e na montagem
    const esteirasR = el("div", "obj", mundo);
    caixa3d(esteirasR, 428, 196, 64, 66, 24, { topo: rolosFundo, lado: "#1d2733", s: "#18212b", l: "#202a35" });
    caixa3d(esteirasR, 1318, 198, 64, 66, 24, { topo: rolosFundo, lado: "#1d2733", s: "#18212b", l: "#202a35" });
    // Atta T: o comboio de dois carrinhos
    const vagoes = [criarCarrinho(mundo, 62, 46, 14, true), criarCarrinho(mundo, 62, 46, 14, true)];
    const nome1 = rotulo(mundo, "AGV 01", 0, 0, 0, "agv");
    const nome2 = rotulo(mundo, "AGV 02", 0, 0, 0, "agv");

    // caminhos (pontos da planta) e linha do tempo da missão, uma unidade por passo
    const rota = pts => {
        const seg = [];
        let total = 0;
        for (let i = 1; i < pts.length; i++) {
            const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
            const L = Math.hypot(x2 - x1, y2 - y1);
            seg.push({ x1, y1, x2, y2, L, ini: total, ang: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI });
            total += L;
        }
        return { seg, total, em(u) {
            const d = Math.max(0, Math.min(1, u)) * total;
            const s = seg.find(q => d <= q.ini + q.L) || seg[seg.length - 1];
            const f = s.L ? (d - s.ini) / s.L : 0;
            return { x: s.x1 + (s.x2 - s.x1) * f, y: s.y1 + (s.y2 - s.y1) * f, ang: s.ang };
        } };
    };
    const ida = rota([[180, 830], [180, 560], [460, 560], [460, 300]]);
    const ateCruz = rota([[460, 300], [460, 560], [836, 560]]);
    const aposCruz = rota([[836, 560], [1350, 560], [1350, 315]]);
    const volta = rota([[1350, 315], [1350, 560], [180, 560], [180, 830]]);
    const linha2 = rota([[900, 250], [900, 950]]);
    // rebocador: só para a frente, pelo corredor (o comboio vem atrás pela mesma trilha)
    const trilhoT = rota([[180, 1010], [180, 560], [1660, 560]]);
    const sDe = (x, y) => y > 560 ? 1010 - y : 450 + (x - 180);
    const suave = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    const entre = (t, a, b) => suave((t - a) / (b - a));

    const SINAIS = [
        ["#2BD46A", "", "Pronto no berço"],
        ["#2BD46A", "corre", "Em missão, andando"],
        ["#2BD46A", "respira", "Parado numa etapa: indexando"],
        ["#2BD46A", "respira", "Esperando passagem"],
        ["#2BD46A", "corre", "Em missão, andando"],
        ["#2CE0FF", "pisca", "Esperando confirmação do operador"],
        ["#A57BFF", "corre", "Indo para o berço"]
    ];

    let modo = "E";
    function cenaT(t) {
        const s0 = sDe(180, 830), sAlmox = sDe(460, 560), sCruz = sDe(836, 560), sPosto = sDe(1500, 560), sFim = sDe(1640, 560);
        let s, zonaEstado = "livre";
        if (t < 1) s = s0;
        else if (t < 2) s = s0 + (sAlmox - s0) * entre(t, 1, 1.95);
        else if (t < 3) s = sAlmox;
        else if (t < 4) {
            s = sAlmox + (sCruz - sAlmox) * entre(t, 3, 3.45);
            if (t > 3.95) s = sCruz + (t - 3.95) * 300;
            zonaEstado = t > 3.2 && t < 3.92 ? "outro" : t >= 3.92 ? "meu" : "pedida";
        }
        else if (t < 5) { s = sCruz + 15 + (sPosto - sCruz - 15) * entre(t, 4, 4.95); zonaEstado = s - 150 < 948 ? "meu" : "livre"; }
        else if (t < 6) s = sPosto;
        else s = sPosto + (sFim - sPosto) * entre(t, 6.02, 6.98);
        const p = trilhoT.em(s / trilhoT.total);
        posicionarAGV(agv, p.x, p.y, p.ang);
        agv.raiz.style.opacity = t > 6.6 ? String(1 - entre(t, 6.6, 6.98)) : "1";
        const solto = t >= 5.45;
        vagoes.forEach((v, i) => {
            const fixo = i === 1 && solto;
            const sv = fixo ? sPosto - 150 : s - 75 * (i + 1);
            const q = trilhoT.em(sv / trilhoT.total);
            v.raiz.style.transform = `translate3d(${q.x}px,${q.y}px,0)`;
            v.giro.style.transform = `rotateZ(${q.ang}deg)`;
            v.carga.style.opacity = String(entre(t, 2.05, 2.5));
            v.raiz.style.opacity = !fixo && t > 6.6 ? String(1 - entre(t, 6.6, 6.98)) : "1";
        });
        return { p, ang: p.ang, zonaEstado };
    }
    function cena(t) {
        // AGV 01
        let p, ang, kitEstado, zonaEstado = "livre";
        if (modo === "T") ({ p, ang, zonaEstado } = cenaT(t));
        else {
        if (t < 1) { p = ida.em(0); ang = -90; }
        else if (t < 2) { p = ida.em(entre(t, 1, 1.95)); ang = p.ang; }
        else if (t < 3) { p = ida.em(1); ang = -90; }
        else if (t < 4) {
            const u = entre(t, 3, 3.45);
            p = ateCruz.em(u); ang = u < 0.99 ? p.ang : 0;
            if (u > 0.98) p = { x: 836, y: 560 };
            if (t > 3.95) p = { x: 836 + (t - 3.95) * 300, y: 560 };
            zonaEstado = t > 3.2 && t < 3.92 ? "outro" : t >= 3.92 ? "meu" : "pedida";
        }
        else if (t < 5) { p = aposCruz.em(entre(t, 3.98, 4.95)); ang = p.ang; zonaEstado = t < 4.15 ? "meu" : "livre"; }
        else if (t < 6) { p = aposCruz.em(1); ang = -90; }
        else { p = volta.em(entre(t, 6.02, 6.98)); ang = p.ang; }
        if (t >= 4 && t < 5 && Math.abs(p.x - 1350) < 1 && p.y < 560) ang = -90;
        // giro suave: AGV de rodas omnidirecionais vira no ponto
        posicionarAGV(agv, p.x, p.y, ang);
        agv.raiz.style.opacity = "1";
        }

        if (modo === "E") {
            // entra embaixo do carrinho, ergue pelo fuso, leva e abaixa na montagem
            const sobe = t < 2.25 ? 0 : t < 2.85 ? 8 * entre(t, 2.25, 2.8) : t < 5.2 ? 8 : t < 5.75 ? 8 * (1 - entre(t, 5.2, 5.7)) : 0;
            agv.garra.style.transform = `translateZ(${sobe}px)`;
            const z = Math.max(0, sobe - 3);
            const leva = t >= 2.25 && t < 5.75;
            const c = t < 2.25 ? { x: 460, y: 300, a: -90 } : leva ? { x: p.x, y: p.y, a: ang } : { x: 1350, y: 315, a: -90 };
            carrinhoE.raiz.style.transform = `translate3d(${c.x}px,${c.y}px,${z}px)`;
            carrinhoE.giro.style.transform = `rotateZ(${c.a}deg)`;
        } else if (modo === "G" || modo === "R") {
            // G: a garra pega o kit da mesa; R: a caixa passa da esteira para os rolos
            const arco = modo === "G" ? 18 : 0;
            const mesa = modo === "G" ? { x: 460, y: 230, z: 26 } : { x: 460, y: 229, z: 24 }, bancada = modo === "G" ? { x: 1350, y: 232, z: 30 } : { x: 1350, y: 231, z: 24 };
            const topo = modo === "G" ? 36 : 24;
            let kx, ky, kz, ka = 0, sobeGarra = 0;
            if (t < 2.25) { kx = mesa.x; ky = mesa.y; kz = mesa.z; }
            else if (t < 2.85) {
                const u = entre(t, 2.25, 2.8);
                kx = mesa.x; ky = mesa.y + (p.y - mesa.y) * u; kz = mesa.z + (topo - mesa.z) * u + Math.sin(u * Math.PI) * arco;
                sobeGarra = Math.sin(u * Math.PI) * 6;
            }
            else if (t < 5.2) { kx = p.x; ky = p.y; kz = topo; ka = ang; }
            else if (t < 5.75) {
                const u = entre(t, 5.2, 5.7);
                kx = bancada.x; ky = p.y + (bancada.y - p.y) * u; kz = topo + (bancada.z - topo) * u + Math.sin(u * Math.PI) * arco;
                sobeGarra = Math.sin(u * Math.PI) * 6;
            }
            else { kx = bancada.x; ky = bancada.y; kz = bancada.z; }
            posicionarKit(kit, kx, ky, kz, ka);
            if (modo === "G") agv.garra.style.transform = `translateZ(${sobeGarra}px)`;
        }

        // AGV 02 cruza durante o passo 4
        const u2 = entre(t, 3.15, 3.95);
        const p2 = linha2.em(t < 3 ? 0 : u2);
        posicionarAGV(agv2, p2.x, p2.y, 90);
        sinalAGV(agv2, "#2BD46A", t > 3.1 && t < 3.95 ? "corre" : "");
        agv2.raiz.style.opacity = t > 2.6 && t < 4.6 ? 1 : 0.0;
        nome2.style.opacity = agv2.raiz.style.opacity;

        // zona do cruzamento
        const corZona = zonaEstado === "outro" || zonaEstado === "meu" ? "rgba(30,123,255,.22)" : zonaEstado === "pedida" ? "rgba(255,138,61,.18)" : "transparent";
        zona.style.background = corZona;
        zona.style.borderColor = zonaEstado === "livre" ? "rgba(142,155,174,.6)" : zonaEstado === "pedida" ? "#FF8A3D" : "#63AEFF";

        // rótulos acompanham os AGVs
        nome1.style.opacity = agv.raiz.style.opacity;
        nome1.style.transform = `translate3d(${p.x}px,${p.y}px,${70}px) rotateZ(${-GIRO}deg) rotateX(${-TILT}deg) translate(-50%,-100%)`;
        nome2.style.transform = `translate3d(${p2.x}px,${p2.y}px,${70}px) rotateZ(${-GIRO}deg) rotateX(${-TILT}deg) translate(-50%,-100%)`;

        // sinalização + painel
        const passo = Math.max(0, Math.min(6, Math.floor(t)));
        const M = MISSOES[modo];
        const [cor, efeito, texto] = t >= 5.75 && t < 6 ? ["#2BD46A", "", M.entregue] : passo === 2 || passo === 5 ? ["#2BD46A", "respira", M.sinais[passo === 2 ? 0 : 1]] : SINAIS[passo];
        sinalAGV(agv, cor, efeito);
        const tira = document.getElementById("hudTira");
        tira.style.setProperty("--c", cor);
        tira.className = "tira " + efeito;
        document.getElementById("hudSinal").textContent = texto;
        document.querySelectorAll("#hudEtapas li").forEach((li, i) => {
            li.classList.toggle("feita", i < passo || (passo === 6 && t > 6.9));
            li.classList.toggle("agora", i === passo && !(passo === 6 && t > 6.9));
        });
        return p;
    }

    // as quatro missões: textos dos passos, etapas do painel e o que aparece
    const MISSOES = {
        E: { selo: ["disp", "Protótipo · pronto para piloto"], missao: "Missão C-118", rota: "Almoxarifado → Montagem 2", entregue: "Carrinho entregue",
             aria: "Planta 3D com o Atta E levando um carrinho do almoxarifado à montagem", sinais: ["Parado numa etapa: erguendo o carrinho", "Parado numa etapa: abaixando o carrinho"],
             etapas: ["Pedido recebido", "Saindo do berço", "Erguendo o carrinho", "Aguardando passagem", "Indo para a montagem", "Abaixando o carrinho", "Concluída"],
             passos: [["01 · Pedido", "A montagem precisa do carrinho de peças.", "O pedido sai de um botão no posto, ou sai sozinho, programado pelo consumo, e vai para o Atta livre no berço. Quem escolhe é o Eciton."],
                      ["02 · Saída", "O Atta sai do berço e segue a linha.", "A sinalização muda de cor: quem está por perto vê que ele está em missão."],
                      ["03 · Coleta", "No almoxarifado, entra embaixo do carrinho e ergue.", "Ele confere o lugar pela tag no chão, para embaixo do carrinho e ergue por um fuso. Carregado, continua girando no lugar e andando de lado."],
                      ["04 · Tráfego", "No cruzamento, ele pede passagem.", "Outro Atta está cruzando. O Eciton segura este fora do cruzamento e libera logo depois. Sem colisão e sem engarrafamento."],
                      ["05 · Entrega", "Chega à montagem com o carrinho.", "Pela rota mais curta, parando na posição exata do posto."],
                      ["06 · Carrinho no posto", "Abaixa o carrinho e sai de baixo.", "O carrinho fica no lugar certo, pronto para usar. O operador confirma o recebimento com um toque."],
                      ["07 · Próxima", "Missão concluída.", "O Atta segue para a próxima missão da fila ou volta para o berço para carregar."]] },
        G: { selo: ["prev", "Como vai funcionar · sob encomenda"], missao: "Missão K-204", rota: "Almoxarifado → Montagem 2", entregue: "Kit entregue",
             aria: "Planta 3D mostrando como o Atta G vai levar um kit na garra", sinais: ["Parado numa etapa: a garra pega o kit", "Parado numa etapa: a garra solta o kit"],
             etapas: ["Pedido recebido", "Saindo do berço", "Pegando o kit", "Aguardando passagem", "Indo para a montagem", "Soltando o kit", "Concluída"],
             passos: [["01 · Pedido", "A montagem precisa de um kit.", "O pedido sai do botão no posto e vai para o Atta G livre. A garra dele foi desenhada para esse kit."],
                      ["02 · Saída", "O Atta sai do berço e segue a linha.", "A sinalização muda de cor: quem está por perto vê que ele está em missão."],
                      ["03 · Coleta", "No almoxarifado, a garra pega o kit.", "Ele confere o lugar pela tag no chão, a garra tira o kit da mesa e prende para o transporte."],
                      ["04 · Tráfego", "No cruzamento, ele pede passagem.", "Outro Atta está cruzando. O Eciton segura este fora do cruzamento e libera logo depois."],
                      ["05 · Entrega", "Chega ao posto de montagem.", "Pela rota mais curta, parando na posição exata do posto."],
                      ["06 · Kit pronto", "A garra solta o kit na bancada.", "O kit fica pronto para montar, sem ninguém pegar a carga. O operador confirma com um toque."],
                      ["07 · Próxima", "Missão concluída.", "O Atta segue para a próxima missão da fila ou volta para o berço."]] },
        R: { selo: ["prev", "Como vai funcionar · sob encomenda"], missao: "Missão R-031", rota: "Esteira do almoxarifado → Montagem 2", entregue: "Caixa entregue",
             aria: "Planta 3D mostrando como o Atta R vai trocar uma caixa entre esteiras", sinais: ["Parado numa etapa: recebendo pelos rolos", "Parado numa etapa: passando pelos rolos"],
             etapas: ["Pedido recebido", "Saindo do berço", "Recebendo a caixa", "Aguardando passagem", "Indo para a montagem", "Passando a caixa", "Concluída"],
             passos: [["01 · Pedido", "A caixa ficou pronta na esteira.", "A própria esteira (ou a máquina) pede o transporte. O Eciton manda o Atta R livre."],
                      ["02 · Saída", "O Atta sai do berço e segue a linha.", "A sinalização muda de cor: quem está por perto vê que ele está em missão."],
                      ["03 · Coleta", "Encosta na esteira e a caixa passa para os rolos.", "Ele para alinhado com a esteira pela tag no chão; os rolos dos dois giram juntos e a caixa vem sozinha."],
                      ["04 · Tráfego", "No cruzamento, ele pede passagem.", "Outro Atta está cruzando. O Eciton segura este fora do cruzamento e libera logo depois."],
                      ["05 · Entrega", "Chega à esteira da montagem.", "Para alinhado com a esteira do posto, com a precisão que a troca pede."],
                      ["06 · Caixa no posto", "Os rolos passam a caixa para a esteira.", "Sem ninguém pegar a carga. A esteira da montagem confirma que recebeu."],
                      ["07 · Próxima", "Missão concluída.", "O Atta segue para a próxima missão da fila ou volta para o berço."]] },
        T: { selo: ["prev", "Como vai funcionar · em desenvolvimento"], missao: "Milk-run 10:00", rota: "Supermercado → Montagem 2 → anel", entregue: "Carrinho deixado no posto",
             aria: "Planta 3D mostrando como o Atta T vai fazer o milk-run puxando dois carrinhos", sinais: ["Parado no corredor: abastecendo o comboio", "Parado no corredor: trocando o carrinho"],
             etapas: ["Hora do milk-run", "Saindo com o comboio", "Abastecendo", "Aguardando passagem", "Indo para a montagem", "Trocando o carrinho", "Seguindo o anel"],
             passos: [["01 · Programado", "10:00: hora do milk-run.", "É uma programação: o rebocador sai sozinho na hora marcada, sem ninguém pedir."],
                      ["02 · Saída", "O Atta T sai do berço puxando o comboio.", "Engatado, ele anda como um rebocador: só para a frente e em curvas abertas."],
                      ["03 · Supermercado", "Para no corredor e os carrinhos são abastecidos.", "Ele não entra no ramal: com o comboio não dá para dar ré. Para ao lado do supermercado e espera o abastecimento."],
                      ["04 · Tráfego", "No cruzamento, espera com o comboio inteiro.", "O Eciton só solta o cruzamento depois que o último carrinho passou."],
                      ["05 · Entrega", "Para no corredor, ao lado da montagem.", "Na parada do comboio, com o carrinho certo de frente para o posto."],
                      ["06 · Troca", "Solta o carrinho cheio no posto.", "O operador desengata o carrinho; o vazio volta na próxima passada."],
                      ["07 · Próxima", "Segue o anel.", "Continua para as próximas paradas e volta ao supermercado. Na próxima hora, sai de novo."]] }
    };
    const passos = [...document.querySelectorAll(".passo")];
    function escolherMissao(m) {
        modo = m;
        const M = MISSOES[m];
        Object.entries(ATTAS).forEach(([k, a]) => { a.raiz.style.display = k === m ? "" : "none"; });
        agv = ATTAS[m];
        kit.raiz.style.display = m === "G" || m === "R" ? "" : "none";
        carrinhoE.raiz.style.display = m === "E" ? "" : "none";
        esteirasR.style.display = m === "R" ? "" : "none";
        mesaKit.style.display = bancadaKit.style.display = m === "R" ? "none" : "";
        vagoes.forEach(v => { v.raiz.style.display = m === "T" ? "" : "none"; });
        passos.forEach((s, i) => {
            const [num, h, txt] = M.passos[i];
            s.querySelector(".num").textContent = num; s.querySelector("h3").textContent = h; s.querySelector("p").textContent = txt;
        });
        document.querySelectorAll("#hudEtapas li").forEach((li, i) => { li.textContent = M.etapas[i]; });
        document.getElementById("hudMissao").textContent = M.missao;
        document.getElementById("hudRota").textContent = M.rota;
        const selo = document.getElementById("seloMissao");
        selo.className = "st " + M.selo[0] + " selo-missao"; selo.textContent = M.selo[1];
        palco.setAttribute("aria-label", M.aria);
        document.querySelectorAll("#missaoTipos [data-missao]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.missao === m)));
    }
    document.querySelectorAll("#missaoTipos [data-missao]").forEach(b => b.addEventListener("click", () => escolherMissao(b.dataset.missao)));
    escolherMissao("E");

    // rolagem → tempo da missão (contínuo dentro de cada passo)
    const tempoAlvo = () => {
        const meio = innerHeight * (innerWidth <= 980 ? 0.86 : 0.5);
        const topos = passos.map(s => s.getBoundingClientRect().top);
        if (meio < topos[0]) return 0;
        for (let i = 0; i < passos.length; i++) {
            const fim = i + 1 < passos.length ? topos[i + 1] : topos[i] + passos[i].offsetHeight + innerHeight * 0.3;
            if (meio < fim || i === passos.length - 1) {
                const f = (meio - topos[i]) / Math.max(1, fim - topos[i]);
                return Math.min(passos.length - 0.001, i + Math.max(0, Math.min(0.999, f)));
            }
        }
        return 0;
    };
    let tAtual = 0, camX = 180, camY = 830, zoom = 1;
    observar(palco);
    const quadro = () => {
        if (!naTela(palco)) { requestAnimationFrame(quadro); return; }
        const alvo = tempoAlvo();
        tAtual = reduzir ? alvo : tAtual + (alvo - tAtual) * 0.12;
        if (Math.abs(alvo - tAtual) < 0.0005) tAtual = alvo;
        const p = cena(tAtual);
        passos.forEach((s, i) => s.classList.toggle("ativo", Math.floor(alvo) === i));
        // câmera acompanha o AGV, mais perto nas estações
        const perto = [0, 2, 5].includes(Math.floor(tAtual)) ? 1.35 : 1.0;
        const base = Math.min(1.15, Math.max(0.55, palco.clientWidth / 900));
        const k = reduzir ? 1 : 0.1;
        camX += (p.x - camX) * k; camY += (p.y - camY) * k; zoom += (perto * base - zoom) * (reduzir ? 1 : 0.06);
        cam.style.transform = `scale(${zoom}) rotateX(${TILT}deg) rotateZ(${GIRO}deg) translate3d(${-camX}px,${-camY}px,0)`;
        requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
    })();

    /* ============================================================
       TIPOS DE AGV: uma cena 3D por tipo, montada ao escolher.
       Só anima quando a cena está na tela.
       ============================================================ */
    (() => {
        const palcoT = document.getElementById("cena");
        const camT = document.getElementById("cameraTipos");
        if (!camT) return;
        if (!palcoT || !camT) return;
        observar(palcoT);

        const caminhoDe = (pts, fechado) => {
            const p = fechado ? [...pts, pts[0]] : pts;
            const seg = [];
            let total = 0;
            for (let i = 1; i < p.length; i++) {
                const [x1, y1] = p[i - 1], [x2, y2] = p[i];
                const L = Math.hypot(x2 - x1, y2 - y1);
                if (L < 0.01) continue;
                seg.push({ x1, y1, x2, y2, L, ini: total, ang: Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI });
                total += L;
            }
            return { seg, total, pts: p, em(d) {
                d = fechado ? ((d % total) + total) % total : Math.max(0, Math.min(total, d));
                const s = seg.find(q => d <= q.ini + q.L) || seg[seg.length - 1];
                const f = s.L ? (d - s.ini) / s.L : 0;
                return { x: s.x1 + (s.x2 - s.x1) * f, y: s.y1 + (s.y2 - s.y1) * f, ang: s.ang };
            } };
        };
        const arredondado = (x0, y0, x1, y1, r, n = 6) => {
            const pts = [];
            [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]].forEach(([cx, cy, a0]) => {
                for (let i = 0; i <= n; i++) {
                    const a = (a0 + 90 * i / n) * Math.PI / 180;
                    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
                }
            });
            return pts;
        };
        const tracar = (m, c, cls) => {
            for (let i = 1; i < c.pts.length; i++) {
                const [x1, y1] = c.pts[i - 1], [x2, y2] = c.pts[i];
                if (!cls) { fita(m, x1, y1, x2, y2); continue; }
                const L = Math.hypot(x2 - x1, y2 - y1), a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                el("div", cls, m, { width: px(L + 2), transform: `translate3d(${x1}px,${y1}px,0.5px) rotateZ(${a}deg) translate(-1px,-1.5px)` });
            }
        };
        const suaveT = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
        const fase = (t, a, b) => suaveT((t - a) / (b - a));
        const piso = m => el("div", "piso", m, { width: "780px", height: "520px", transform: "translate3d(-390px,-260px,0)" });
        const cinza = { topo: "linear-gradient(135deg,#2b3542,#1a222c)", lado: "#121922", s: "#18212b", l: "#1d2733" };
        const laranja = { topo: "linear-gradient(135deg,#ffb347,#f0851a)", lado: "#b65f12", s: "#cf6d16", l: "#de7a1a" };
        const rolosFundo = "repeating-linear-gradient(90deg,#5b6672 0 5px,#252c34 5px 10px)";
        const objeto = pai => { const raiz = el("div", "obj", pai); const giro = el("div", "giro", raiz); return { raiz, giro }; };
        const pos = (o, x, y, z = 0, ang = 0) => { o.raiz.style.transform = `translate3d(${x}px,${y}px,${z}px)`; o.giro.style.transform = `rotateZ(${ang}deg)`; };

        const CENAS = {
            otica: {
                titulo: "Linha óptica · -O", st: ["disp", "Pronto para piloto"],
                texto: "Um sensor embaixo do AGV enxerga a faixa no chão e corrige a direção o tempo todo. Marcadores no piso confirmam onde ele está e onde parar.",
                pontos: ["Rota visível para todos na área", "Instalação rápida", "Mudar a rota é mudar a fita"],
                montar(m) {
                    piso(m);
                    const c = caminhoDe(arredondado(-230, -130, 230, 130, 70), true);
                    tracar(m, c);
                    const tags = [0.1, 0.35, 0.6, 0.85].map(f => {
                        const p = c.em(f * c.total);
                        el("div", "tag-chao", m, { transform: `translate3d(${p.x}px,${p.y}px,1px)` });
                        return { p, anel: el("div", "anel-tag", m) };
                    });
                    const agv = criarAGV(m);
                    sinalAGV(agv, "#2BD46A", "corre");
                    const sensor = el("div", "sensor-otico", agv.giro, { transform: "translate3d(34px,-23px,1px)" });
                    for (let i = 0; i < 7; i++) el("i", "", sensor);
                    rotulo(m, "Fita no chão", 0, 160, 4);
                    return t => {
                        const p = c.em(t * 95);
                        posicionarAGV(agv, p.x, p.y, p.ang);
                        tags.forEach(tg => {
                            const d = Math.hypot(tg.p.x - p.x, tg.p.y - p.y), k = d < 45 ? 1 - d / 45 : 0;
                            tg.anel.style.opacity = k;
                            tg.anel.style.transform = `translate3d(${tg.p.x}px,${tg.p.y}px,1.2px) scale(${1 + k * 1.6})`;
                        });
                    };
                }
            },
            magnetica: {
                titulo: "Fita magnética · -M", st: ["proj", "Sob encomenda"],
                texto: "A faixa é magnética e pode ficar embutida no piso, protegida de sujeira e do tráfego. O sensor lê o campo magnético em vez da cor, com a mesma lógica de missões e tráfego.",
                pontos: ["Resiste a sujeira, óleo e desgaste", "Rota invisível no piso", "Mesmo sistema de supervisão"],
                montar(m) {
                    piso(m);
                    const c = caminhoDe(arredondado(-230, -130, 230, 130, 70), true);
                    tracar(m, c, "fita-oculta");
                    const revela = el("div", "fita-revelada", m);
                    const ondas = [0, 1, 2].map(() => el("div", "onda-mag", m));
                    const agv = criarAGV(m);
                    sinalAGV(agv, "#2BD46A", "corre");
                    rotulo(m, "Fita sob o piso", 0, 160, 4);
                    return t => {
                        const p = c.em(t * 85);
                        posicionarAGV(agv, p.x, p.y, p.ang);
                        revela.style.transform = `translate3d(${p.x}px,${p.y}px,0.6px) rotateZ(${p.ang}deg) translate(-95px,-4px)`;
                        ondas.forEach((o, i) => {
                            const f = (t * 0.9 + i / 3) % 1;
                            o.style.opacity = (1 - f) * 0.85;
                            o.style.transform = `translate3d(${p.x}px,${p.y}px,${1 + f * 16}px) rotateZ(${p.ang}deg) scale(${0.6 + f * 1.3})`;
                        });
                    };
                }
            },
            laser: {
                titulo: "Laser com refletores", st: ["proj", "Sob encomenda"],
                texto: "Um scanner a laser gira em cima do AGV e mede a distância até refletores nas paredes e colunas. Com três ou mais deles, o AGV calcula a própria posição e segue rotas virtuais, sem nada no chão.",
                pontos: ["Nada no piso", "Rotas mudam pelo software", "Precisa de refletores visíveis"],
                montar(m) {
                    piso(m);
                    const c = caminhoDe(arredondado(-200, -110, 200, 110, 60), true);
                    tracar(m, c, "rota-virtual");
                    const refl = [[-300, -190], [300, -190], [310, 180], [-310, 180], [0, -215], [0, 210]].map(([x, y]) => {
                        const b = caixa3d(m, x - 7, y - 7, 14, 14, 64, { topo: "#E9EEF5", lado: "#2a3542", n: "linear-gradient(#E9EEF5 0 30%, #2a3542 30%)", o: "linear-gradient(90deg,#2a3542 70%,#E9EEF5 70%)" });
                        return { x, y, b, ultimo: -9 };
                    });
                    const agv = criarAGV(m);
                    sinalAGV(agv, "#2BD46A", "corre");
                    caixa3d(agv.giro, -8, -8, 16, 16, 10, { topo: "radial-gradient(circle,#2CE0FF 0 3px,#0b1119 4px)", lado: "#1b232c" }, 20);
                    const feixe = el("div", "feixe", m);
                    const linhas = refl.map(() => el("div", "linha-tri", m));
                    rotulo(m, "Refletor", -300, -190, 80);
                    return t => {
                        const p = c.em(t * 70);
                        posicionarAGV(agv, p.x, p.y, p.ang);
                        const a = (t * 320) % 360;
                        feixe.style.transform = `translate3d(${p.x}px,${p.y}px,30px) rotateZ(${a}deg)`;
                        refl.forEach((r, i) => {
                            const ang = (Math.atan2(r.y - p.y, r.x - p.x) * 180 / Math.PI + 360) % 360;
                            let dif = Math.abs(ang - a); dif = Math.min(dif, 360 - dif);
                            if (dif < 7) r.ultimo = t;
                            const idade = t - r.ultimo, k = idade < 1.1 ? 1 - idade / 1.1 : 0;
                            r.b.topo.style.boxShadow = k > 0 ? `0 0 ${20 * k}px ${7 * k}px rgba(44,224,255,${k})` : "none";
                            const L = Math.hypot(r.x - p.x, r.y - p.y), la = Math.atan2(r.y - p.y, r.x - p.x) * 180 / Math.PI;
                            linhas[i].style.width = px(L);
                            linhas[i].style.opacity = k * 0.85;
                            linhas[i].style.transform = `translate3d(${p.x}px,${p.y}px,30px) rotateZ(${la}deg)`;
                        });
                    };
                }
            },
            amr: {
                titulo: "LiDAR · -L, AMR", st: ["dev", "Em desenvolvimento"],
                texto: "O AMR enxerga o ambiente com um LiDAR, um sensor a laser que mede tudo ao redor dezenas de vezes por segundo. Ele monta o mapa, planeja o próprio caminho e desvia de pessoas e obstáculos. É o próximo passo da E4M, como versão de qualquer módulo do Atta.",
                pontos: ["Sem fita e sem refletores", "Desvia sozinho do que aparece", "Rota definida pelo destino"],
                cta: true,
                montar(m) {
                    piso(m);
                    const caixas = [[-70, -45, 90, 70], [80, -40, 70, 60], [-260, -200, 70, 50], [195, 115, 80, 50]];
                    caixas.forEach(([x, y, w, d]) => caixa3d(m, x, y, w, d, 40, cinza));
                    const pessoa = objeto(m);
                    caixa3d(pessoa.giro, -9, -6, 18, 12, 42, { topo: "#63AEFF", lado: "#2a5c9c" });
                    caixa3d(pessoa.giro, -6, -6, 12, 12, 11, { topo: "#d9b38c", lado: "#b8916c" }, 42);
                    const pts = [];
                    for (let i = 0; i < 60; i++) {
                        const a = i / 60 * Math.PI * 2, k = 1 + 0.1 * Math.sin(3 * a + 0.6);
                        pts.push([Math.cos(a) * 235 * k, Math.sin(a) * 140 * k]);
                    }
                    const c = caminhoDe(pts, true);
                    tracar(m, c, "rota-plan");
                    const agv = criarAGV(m);
                    sinalAGV(agv, "#2BD46A", "corre");
                    caixa3d(agv.giro, -8, -8, 16, 16, 9, { topo: "radial-gradient(circle,#A57BFF 0 3px,#0b1119 4px)", lado: "#1b232c" }, 20);
                    const N = 96, pontos = [...Array(N)].map(() => el("div", "ponto-lidar", m));
                    rotulo(m, "Caminho planejado", 0, -175, 4);
                    let d = 0, tAnt = 0;
                    const raio = (ox, oy, dx, dy, bx) => {
                        const [x0, y0, w, h] = bx;
                        const ix = Math.abs(dx) < 1e-9 ? 1e9 : 1 / dx, iy = Math.abs(dy) < 1e-9 ? 1e9 : 1 / dy;
                        const t1 = (x0 - ox) * ix, t2 = (x0 + w - ox) * ix, t3 = (y0 - oy) * iy, t4 = (y0 + h - oy) * iy;
                        const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4)), tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
                        return tmax >= Math.max(tmin, 0) && tmin > 0 ? tmin : Infinity;
                    };
                    return t => {
                        const dt = Math.min(0.1, Math.max(0, t - tAnt)); tAnt = t;
                        const px_ = 30, py_ = 250 * Math.sin(t * 0.42);
                        pos(pessoa, px_, py_);
                        const p0 = c.em(d), fr = c.em(d + 70);
                        const perto = Math.hypot(fr.x - px_, fr.y - py_) < 70;
                        d += (perto ? 0 : 80) * dt;
                        const p = c.em(d);
                        posicionarAGV(agv, p.x, p.y, p.ang);
                        const obst = [...caixas, [px_ - 10, py_ - 7, 20, 14], [-390, -262, 780, 4], [-390, 258, 780, 4], [-392, -260, 4, 520], [388, -260, 4, 520]];
                        for (let k = 0; k < N; k++) {
                            const a = k / N * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
                            let melhor = 300;
                            obst.forEach(b => { const h = raio(p.x, p.y, dx, dy, b); if (h < melhor) melhor = h; });
                            const ponto = pontos[k];
                            if (melhor < 300) {
                                ponto.style.opacity = 1;
                                ponto.style.transform = `translate3d(${p.x + dx * melhor}px,${p.y + dy * melhor}px,12px)`;
                            } else ponto.style.opacity = 0;
                        }
                        sinalAGV(agv, perto ? "#FF8A3D" : "#2BD46A", perto ? "respira" : "corre");
                        return p0;
                    };
                }
            },
            garra: {
                titulo: "Atta G · garras sob medida", st: ["proj", "Sob encomenda"],
                texto: "Uma família de garras: cada uma é feita para a carga do cliente (caixa, KLT, kit de montagem). A garra pega a carga na estação, prende durante o trajeto e solta no posto. Ninguém precisa pegar a carga.",
                pontos: ["Garra desenhada para a sua carga", "Pega e entrega sozinho", "Ideal para kits e caixas"],
                montar(m) {
                    piso(m);
                    fita(m, -260, 50, 260, 50); fita(m, -170, 50, -170, -20); fita(m, 170, 50, 170, -20);
                    [[-170, -20], [170, -20]].forEach(([x, y]) => el("div", "tag-chao", m, { transform: `translate3d(${x}px,${y}px,1px)` }));
                    caixa3d(m, -205, -112, 70, 44, 26, cinza);
                    caixa3d(m, 135, -112, 70, 44, 30, cinza);
                    rotulo(m, "Estação", -170, -112, 40);
                    rotulo(m, "Posto de montagem", 170, -112, 44);
                    const agv = criarAGV(m);
                    const kit = criarKit(m);
                    const ida = caminhoDe([[-170, -20], [-170, 50], [170, 50], [170, -20]]);
                    const volta = caminhoDe([[170, -20], [170, 50], [-170, 50], [-170, -20]]);
                    const T = 14, mesa = { x: -170, y: -90, z: 26 }, banc = { x: 170, y: -90, z: 30 }, topo = 36;
                    return tt => {
                        const t = tt % T;
                        // rodas omnidirecionais: anda de lado e de ré sem virar, sempre de frente para as estações
                        let p;
                        if (t < 1.4) p = ida.em(0);
                        else if (t < 6) p = ida.em(fase(t, 1.4, 6) * ida.total);
                        else if (t < 7.6) p = ida.em(ida.total);
                        else if (t < 12.4) p = volta.em(fase(t, 7.6, 12.4) * volta.total);
                        else p = volta.em(volta.total);
                        posicionarAGV(agv, p.x, p.y, -90);
                        let k = { x: mesa.x, y: mesa.y, z: mesa.z }, sobe = 0, op = 1;
                        if (t < 0.4) op = fase(t, 0, 0.4);
                        else if (t < 1.3) { const u = fase(t, 0.4, 1.3); k = { x: mesa.x, y: mesa.y + (p.y - mesa.y) * u, z: mesa.z + (topo - mesa.z) * u + Math.sin(u * Math.PI) * 16 }; sobe = Math.sin(u * Math.PI) * 6; }
                        else if (t < 6.2) k = { x: p.x, y: p.y, z: topo };
                        else if (t < 7.2) { const u = fase(t, 6.2, 7.2); k = { x: banc.x, y: p.y + (banc.y - p.y) * u, z: topo + (banc.z - topo) * u + Math.sin(u * Math.PI) * 16 }; sobe = Math.sin(u * Math.PI) * 6; }
                        else { k = { x: banc.x, y: banc.y, z: banc.z }; op = t > 12.6 ? 1 - fase(t, 12.6, 13.4) : 1; }
                        if (t >= 13.4) { k = { x: mesa.x, y: mesa.y, z: mesa.z }; op = fase(t, 13.4, 14); }
                        posicionarKit(kit, k.x, k.y, k.z, 0);
                        kit.raiz.style.opacity = op;
                        agv.garra.style.transform = `translateZ(${sobe}px)`;
                        const andando = (t > 1.4 && t < 6) || (t > 7.6 && t < 12.4);
                        sinalAGV(agv, "#2BD46A", andando ? "corre" : "respira");
                    };
                }
            },
            rebocador: {
                titulo: "Atta T · rebocador", st: ["dev", "Em desenvolvimento"],
                texto: "O AGV engata um trem de carrinhos e puxa vários de uma vez, como um trem de abastecimento que passa pelos postos. Engatado, ele anda como um rebocador: só para a frente e em curvas abertas. As rodas omnidirecionais ajudam na hora de encaixar no carrinho.",
                pontos: ["Vários destinos numa viagem", "Usa os carrinhos que você já tem", "Para no corredor, ao lado dos postos"],
                montar(m) {
                    piso(m);
                    const c = caminhoDe(arredondado(-250, -125, 250, 125, 100, 8), true);
                    tracar(m, c);
                    caixa3d(m, -70, -205, 140, 40, 30, cinza);
                    rotulo(m, "Linha de montagem", 0, -205, 50);
                    const agv = criarAGV(m);
                    const pino = el("div", "obj", agv.giro);
                    caixa3d(pino, -42, -4, 8, 8, 6, { topo: "#2CE0FF", lado: "#147a99" }, 6);
                    const carros = [0, 1, 2].map(() => {
                        const o = objeto(m);
                        [[-24, -20], [18, -20], [-24, 14], [18, 14]].forEach(([x, y]) => caixa3d(o.giro, x, y, 6, 6, 9, { topo: "#3a4552", lado: "#1b232c" }));
                        caixa3d(o.giro, -27, -21, 54, 42, 5, { topo: "#5b6672", lado: "#2b333c" }, 9);
                        caixa3d(o.giro, -22, -16, 20, 32, 14, laranja, 14);
                        caixa3d(o.giro, 2, -16, 20, 32, 14, laranja, 14);
                        return o;
                    });
                    const engates = [0, 1, 2].map(() => el("div", "engate", m));
                    const L = c.total, sEst = L - 150, ESP = 80;
                    const d0 = ((sEst + ESP * 2 - L / 2) % L + L) % L;
                    const T = 20;
                    return tt => {
                        const t = tt % T;
                        let dA, ligado = false, pinoZ = 0;
                        if (t < 2.5) dA = d0 + 130 * (1 - fase(t, 0, 2.5));
                        else if (t < 3.2) { dA = d0; pinoZ = 8 * fase(t, 2.5, 3.2); ligado = true; }
                        else if (t < 16.8) {
                            ligado = true; pinoZ = 8;
                            const meia = L / 2;
                            dA = d0 + (t < 9 ? meia * fase(t, 3.2, 9) : t < 11 ? meia : meia + meia * fase(t, 11, 16.8));
                        }
                        else if (t < 17.5) { dA = d0 + L; pinoZ = 8 * (1 - fase(t, 16.8, 17.5)); ligado = true; }
                        else dA = d0 + L + 130 * fase(t, 17.5, 20);
                        const pA = c.em(dA);
                        posicionarAGV(agv, pA.x, pA.y, pA.ang);
                        pino.style.transform = `translateZ(${pinoZ}px)`;
                        const base = ligado ? dA : d0;
                        let ant = pA;
                        carros.forEach((o, k) => {
                            const p = c.em(base - ESP * (k + 1));
                            pos(o, p.x, p.y, 0, p.ang);
                            const e = engates[k], fx = ant.x - Math.cos(ant.ang * Math.PI / 180) * (k ? 27 : 40), fy = ant.y - Math.sin(ant.ang * Math.PI / 180) * (k ? 27 : 40);
                            const bx = p.x + Math.cos(p.ang * Math.PI / 180) * 27, by = p.y + Math.sin(p.ang * Math.PI / 180) * 27;
                            const vis = k > 0 || ligado;
                            e.style.opacity = vis ? 1 : 0;
                            e.style.width = px(Math.hypot(fx - bx, fy - by));
                            e.style.transform = `translate3d(${bx}px,${by}px,12px) rotateZ(${Math.atan2(fy - by, fx - bx) * 180 / Math.PI}deg)`;
                            ant = p;
                        });
                        const parado = t >= 9 && t < 11;
                        sinalAGV(agv, parado ? "#2CE0FF" : "#2BD46A", parado ? "pisca" : (t < 2.5 || t > 17.5 || (t > 3.2 && t < 16.8)) ? "corre" : "respira");
                    };
                }
            },
            elevacao: {
                titulo: "Atta E · elevação sob carrinho", st: ["disp", "Pronto para piloto"],
                texto: "É o nosso protótipo: o Atta entra por baixo do carrinho ou rack, ergue alguns centímetros por um fuso e leva junto. Na chegada, abaixa e sai, deixando o carrinho no lugar. Carregado, ele continua girando no lugar e andando de lado.",
                pontos: ["Carrinho inteiro de uma vez", "Usa os carrinhos que você já tem", "Troca carrinho cheio por vazio"],
                montar(m) {
                    piso(m);
                    fita(m, -290, 0, 290, 0);
                    [-130, 130].forEach(x => {
                        el("div", "tag-chao", m, { transform: `translate3d(${x}px,0,1px)` });
                        el("div", "marcacao", m, { width: "112px", height: "100px", transform: `translate3d(${x - 56}px,-50px,0.6px)` });
                    });
                    rotulo(m, "Origem", -130, -60, 60);
                    rotulo(m, "Destino", 130, -60, 60);
                    const agv = criarAGV(m);
                    agv.garra.style.display = "none";
                    const placa = el("div", "obj", agv.giro);
                    caixa3d(placa, -24, -18, 48, 36, 16, { topo: "repeating-linear-gradient(45deg,#2CE0FF 0 4px,#147a99 4px 8px)", lado: "#147a99" }, 20);
                    const rack = objeto(m);
                    [[-46, -40], [40, -40], [-46, 34], [40, 34]].forEach(([x, y]) => caixa3d(rack.giro, x, y, 6, 6, 36, { topo: "#9aa6b2", lado: "#5b6672" }));
                    caixa3d(rack.giro, -48, -42, 96, 84, 5, { topo: "#3a4654", lado: "#202933" }, 36);
                    caixa3d(rack.giro, -30, -26, 60, 52, 24, laranja, 41);
                    const T = 16;
                    return tt => {
                        const t = tt % T;
                        let x, xr, z = 0;
                        if (t < 3) { x = -290 + 160 * fase(t, 0, 3); xr = -130; }
                        else if (t < 3.8) { x = -130; xr = -130; z = 8 * fase(t, 3, 3.8); }
                        else if (t < 7.5) { x = -130 + 260 * fase(t, 3.8, 7.5); xr = x; z = 8; }
                        else if (t < 8.3) { x = 130; xr = 130; z = 8 * (1 - fase(t, 7.5, 8.3)); }
                        else if (t < 9.5) { x = 130; xr = 130; }
                        else if (t < 10.3) { x = 130; xr = 130; z = 8 * fase(t, 9.5, 10.3); }
                        else if (t < 14) { x = 130 - 260 * fase(t, 10.3, 14); xr = x; z = 8; }
                        else if (t < 14.8) { x = -130; xr = -130; z = 8 * (1 - fase(t, 14, 14.8)); }
                        else { x = -130 - 160 * fase(t, 14.8, 16); xr = -130; }
                        posicionarAGV(agv, x, 0, 0);
                        placa.style.transform = `translateZ(${z}px)`;
                        pos(rack, xr, 0, z);
                        const andando = (t < 3) || (t > 3.8 && t < 7.5) || (t > 10.3 && t < 14) || t > 14.8;
                        sinalAGV(agv, "#2BD46A", andando ? "corre" : "respira");
                    };
                }
            },
            rolos: {
                titulo: "Atta R · esteira de rolos", st: ["proj", "Sob encomenda"],
                texto: "O AGV tem uma esteira de rolos em cima. Ele encosta na esteira da estação e a carga passa sozinha de uma para a outra, sem ninguém pegar.",
                pontos: ["Transferência sem pessoas", "Integra com esteiras e máquinas", "Bom para caixas e totes"],
                montar(m) {
                    piso(m);
                    fita(m, -110, 0, 110, 0);
                    const est = [-260, 120].map(x => { const b = caixa3d(m, x, -32, 140, 64, 26, { topo: rolosFundo, lado: "#1d2733", s: "#18212b", l: "#202a35" }); return b.topo; });
                    rotulo(m, "Esteira de entrada", -190, -32, 46);
                    rotulo(m, "Esteira de saída", 190, -32, 46);
                    const agv = criarAGV(m);
                    agv.garra.style.display = "none";
                    const deck = caixa3d(agv.giro, -33, -24, 66, 48, 4, { topo: rolosFundo, lado: "#2a3138" }, 20).topo;
                    const caixa = objeto(m);
                    caixa3d(caixa.giro, -18, -16, 36, 32, 24, { topo: "linear-gradient(135deg,#63AEFF,#1E7BFF)", lado: "#0D4FB5", s: "#1259C9", l: "#1663D8" });
                    const T = 14;
                    let oE = 0, oD = 0, oA = 0, tAnt = 0;
                    return tt => {
                        const t = tt % T, dt = Math.min(0.1, Math.max(0, tt - tAnt)); tAnt = tt;
                        let xa, xc, zc = 26, op = 1, rE = false, rD = false, rA = false;
                        if (t < 2.6) { xa = -85; xc = -230 + 145 * fase(t, 0.2, 2.6); rE = true; rA = xc > -125; }
                        else if (t < 5.6) { xa = -85 + 170 * fase(t, 2.6, 5.6); xc = xa; }
                        else if (t < 8.2) { xa = 85; xc = 85 + 145 * fase(t, 5.6, 8.2); rD = true; rA = xc < 125; }
                        else if (t < 11.6) { xa = 85 - 170 * fase(t, 8.2, 11.6); xc = 230; op = 1 - fase(t, 8.2, 9); }
                        else { xa = -85; xc = -230; op = fase(t, 12.4, 13.4); }
                        zc = xc < -120 || xc > 120 ? 26 : 24;
                        posicionarAGV(agv, xa, 0, 0);
                        pos(caixa, xc, 0, zc);
                        caixa.raiz.style.opacity = op;
                        if (rE) oE += 60 * dt; if (rD) oD += 60 * dt; if (rA) oA += 60 * dt;
                        est[0].style.backgroundPosition = `${oE}px 0`;
                        est[1].style.backgroundPosition = `${oD}px 0`;
                        deck.style.backgroundPosition = `${oA}px 0`;
                        const andando = (t > 2.6 && t < 5.6) || (t > 8.2 && t < 11.6);
                        sinalAGV(agv, "#2BD46A", andando ? "corre" : "respira");
                    };
                }
            }
        };

        const botoes = [...document.querySelectorAll(".opcao[data-cena]")];
        const selo = document.getElementById("seloCena");
        let quadroCena = null, t0 = performance.now();
        function escolher(id) {
            const cena = CENAS[id];
            if (!cena) return;
            botoes.forEach(b => b.setAttribute("aria-pressed", b.dataset.cena === id ? "true" : "false"));
            camT.textContent = "";
            const mundo = el("div", "obj", camT);
            quadroCena = cena.montar(mundo);
            t0 = performance.now();
            quadroCena(reduzir ? 2 : 0);
            selo.className = "st " + cena.st[0];
            selo.textContent = cena.st[1];
            palcoT.setAttribute("aria-label", "Animação: " + cena.titulo);
            document.getElementById("cenaTitulo").textContent = cena.titulo;
            document.getElementById("cenaTexto").textContent = cena.texto;
            const ul = document.getElementById("cenaPontos");
            ul.textContent = "";
            cena.pontos.forEach(txt => { const li = document.createElement("li"); li.textContent = txt; ul.appendChild(li); });
            document.getElementById("cenaCta").hidden = !cena.cta;
        }
        botoes.forEach(b => b.addEventListener("click", () => escolher(b.dataset.cena)));
        escolher("otica");
        const quadro = agora => {
            const s = Math.min(1.2, Math.max(0.5, palcoT.clientWidth / 680));
            camT.style.transform = `scale(${s}) rotateX(${TILT}deg) rotateZ(${GIRO}deg)`;
            if (!reduzir && naTela(palcoT) && quadroCena) quadroCena((agora - t0) / 1000);
            requestAnimationFrame(quadro);
        };
        requestAnimationFrame(quadro);
    })();

    /* ============================================================
       MONTE O SEU CENÁRIO (4.1: o configurador e a conta de ganhos juntos)
       Estimativa com valores típicos de mercado (não é a ficha do Atta):
       0,8 m/s com pessoas, 1,2 m/s em corredor só da frota, 0,4 m/s²,
       +15% no trajeto (cruzamentos e curvas), frota a 75% no pico.
       Hoje: média do turno = 70% do pico, pessoa a 0,9 m/s parando nas
       duas pontas, 75% do turno transportando; a frota assume 80%.
       Retorno: só as pessoas liberadas contra o investimento (preço de
       referência de mercado + 20% de implantação) e o custo por mês
       (assinatura e manutenção). Mesmas regras do estudo de frota
       (cenário provável, sem os ganhos potenciais).
       ============================================================ */
    if (document.getElementById("config")) {
    const form = document.getElementById("config");
    const MODULOS = {
        garra:    { letra: "G", nome: "garra", limite: 250,  preco: 220000, st: ["proj", "Sob encomenda"], porque: "A garra é feita para a sua carga: o Atta pega a caixa ou o kit na estação, prende no trajeto e solta no posto, sem ninguém pegar a carga." },
        carrinho: { letra: "E", nome: "elevação", limite: 1000, preco: 280000, st: ["disp", "Pronto para piloto"], porque: "O Atta entra embaixo do carrinho que vocês já usam, levanta e leva junto. É o módulo do nosso protótipo." },
        esteira:  { letra: "R", nome: "rolos", limite: 1000, preco: 300000, st: ["proj", "Sob encomenda"], porque: "A carga passa da esteira da estação para os rolos do Atta, e dele para a próxima esteira." },
        comboio:  { letra: "T", nome: "rebocador", limite: 3000, preco: 350000, st: ["dev", "Em desenvolvimento"], porque: "" }
    };
    const num = (id, min) => Math.max(min, Number(String(document.getElementById(id).value).replace(",", ".")) || 0);
    const fmt = (v, casas = 1) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
    const moeda = v => (v >= 1e6 ? `R$ ${fmt(v / 1e6, 2)} mi` : v >= 1e4 ? `R$ ${fmt(v / 1e3, 0)} mil` : `R$ ${fmt(v, 0)}`);
    const VEL = { sim: 0.8, nao: 1.2 }, ACEL = 0.4, TRAFEGO = 1.15, OCUPACAO = 0.75;
    const HORAS_TURNO = 8, MEDIA_DO_PICO = 0.7, VEL_PESSOA = 0.9, TRANSPORTA = 0.75, COBRE = 0.8;
    const IMPLANTACAO = 0.2, ASSINATURA = 1800, MANUTENCAO = 0.10;
    // false: esconde a linha do retorno (fica o custo de hoje e as pessoas liberadas)
    const MOSTRAR_RETORNO = true;
    if (!MOSTRAR_RETORNO) document.querySelector(".cf-retorno")?.remove();

    function calcular() {
        let manuseio = form.querySelector('input[name="manuseio"]:checked')?.value || "garra";
        const pessoas = form.querySelector('input[name="pessoas"]:checked')?.value || "sim";
        const peso = num("cfPeso", 1), dist = num("cfDist", 1), viagens = num("cfViagens", 1), ponta = num("cfPonta", 0);
        const turnos = Math.min(3, Math.max(1, Math.round(num("cfTurnos", 1)))), dias = Math.min(31, num("cfDias", 1));
        const gente = num("cfGente", 0), custoPessoa = num("cfCusto", 0);
        let aviso = "";
        if (manuseio === "garra" && peso > MODULOS.garra.limite) {
            aviso = `Acima de ${MODULOS.garra.limite} kg acaba a referência de mercado para garra. Nesse peso, o caminho costuma ser levar a carga num carrinho, com o Atta E embaixo.`;
            manuseio = "carrinho";
        }
        if (manuseio !== "comboio" && peso > MODULOS[manuseio].limite) manuseio = "comboio";
        const m = MODULOS[manuseio];
        const v = VEL[pessoas];
        const trajeto = (2 * dist / v) * TRAFEGO + 2 * v / ACEL;   // ida e volta, com aceleração e frenagem
        const ciclo = trajeto + 2 * ponta * 60;                     // segundos
        const frota = Math.max(1, Math.ceil(viagens * ciclo / 3600 / OCUPACAO));
        const rebocador = manuseio === "comboio";
        // hoje: o tempo de gente que esse transporte toma
        const porTurno = viagens * HORAS_TURNO * MEDIA_DO_PICO;
        const horasTurno = porTurno * (2 * dist / VEL_PESSOA + 2 * ponta * 60) / 3600;
        const horasMes = horasTurno * turnos * dias;
        const equivalentes = horasTurno / (HORAS_TURNO * TRANSPORTA);
        const libera = Math.max(0, Math.round(Math.min(gente || equivalentes, equivalentes * 2) * COBRE));
        // o retorno (com o preço de referência de ±15%)
        const hw = frota * m.preco, investimento = hw * (1 + IMPLANTACAO);
        const custoMes = frota * ASSINATURA + hw * MANUTENCAO / 12;
        const ganhoMes = libera * turnos * custoPessoa;
        const meses = fator => { const liq = ganhoMes - (frota * ASSINATURA + hw * fator * MANUTENCAO / 12); return liq > 0 ? investimento * fator / liq + 1.5 : Infinity; };   // +1,5: piloto e meia frota
        const [pbA, pbB] = [meses(0.85), meses(1.15)];

        document.getElementById("cfModelo").textContent = rebocador ? "Atta T · rebocador" : `Atta ${m.letra}-O`;
        const selo = document.getElementById("cfSelo");
        selo.className = "st " + m.st[0];
        selo.textContent = m.st[1];
        document.getElementById("cfPorque").textContent = rebocador
            ? "Para muita carga de uma vez, ou vários carrinhos numa rota, o caminho é o rebocador."
            : m.porque + (pessoas === "sim" ? " Na conta, ele anda a 0,8 m/s, uma velocidade segura perto de pessoas." : " Na conta, ele anda a 1,2 m/s, num corredor só da frota.");
        document.getElementById("cfNumeros").hidden = rebocador;
        const caixaAviso = document.getElementById("cfAviso");
        if (rebocador) aviso = (peso > MODULOS.esteira.limite ? `Com ${peso.toLocaleString("pt-BR")} kg por viagem, ` : "") +
            "o rebocador ainda está em desenvolvimento. Com comboio, as curvas, as paradas no corredor e o tamanho do trem pedem um estudo próprio da sua planta. Conte o seu caso e a gente estuda junto.";
        else if (!libera) aviso = "Com estes números, o transporte ainda não ocupa uma pessoa inteira por turno: o ganho vem da linha que não para, da rastreabilidade e da segurança. O estudo completo mede esses ganhos também.";
        else if (MOSTRAR_RETORNO && (!Number.isFinite(pbA) || pbA > 60)) aviso = "Com estes números, só as pessoas liberadas não pagam a frota em 5 anos. O estudo completo procura o que faz fechar: pré-abastecer antes da troca de turno, juntar fluxos, a mensalidade, os ganhos de linha sem parar e de segurança.";
        caixaAviso.hidden = !aviso;
        caixaAviso.textContent = aviso;
        const icones = document.getElementById("cfIcones");
        icones.textContent = "";
        if (!rebocador) {
            document.getElementById("cfCiclo").textContent = fmt(ciclo / 60) + " min";
            document.getElementById("cfFrota").textContent = frota.toLocaleString("pt-BR");
            document.getElementById("cfHoras").textContent = Math.round(horasMes).toLocaleString("pt-BR") + " h";
            document.getElementById("cfHorasSub").textContent = gente ? `por mês; ${gente.toLocaleString("pt-BR")} pessoa(s) por turno custam ${moeda(gente * turnos * custoPessoa * 12)} por ano` : `por mês, cerca de ${moeda(horasMes * custoPessoa / 176 * 12)} por ano`;
            document.getElementById("cfLibera").textContent = libera.toLocaleString("pt-BR");
            document.getElementById("cfLiberaSub").textContent = `pessoa(s) por turno, ${moeda(ganhoMes * 12)} por ano`;
            const ret = document.getElementById("cfRetorno");
            if (ret) ret.textContent = !libera || !Number.isFinite(pbA) || pbA > 60 ? "acima de 5 anos" : pbB <= 60 ? `${Math.round(pbA)} a ${Math.round(pbB)} meses` : `a partir de ${Math.round(pbA)} meses`;
            if (ret) document.getElementById("cfRetornoSub").textContent = `investimento de ${moeda(investimento * 0.85)} a ${moeda(investimento * 1.15)}, só com as pessoas liberadas`;
            const mostrar = Math.min(frota, 12);
            for (let i = 0; i < mostrar; i++) icones.appendChild(document.createElement("i"));
            if (frota > mostrar) { const mais = document.createElement("span"); mais.textContent = "+" + (frota - mostrar); icones.appendChild(mais); }
        }
        // leva o cenário para o formulário de contato
        const q = new URLSearchParams({ interesse: "atta", origem: "cenario", modulo: m.letra, peso: Math.round(peso), dist: Math.round(dist),
            viagens: Math.round(viagens), ponta: ponta, pessoas, turnos, dias, gente, custo: Math.round(custoPessoa),
            ciclo: rebocador ? 0 : Math.round(ciclo), frota: rebocador ? 0 : frota, horas: Math.round(horasMes), libera, retorno: Number.isFinite(pbA) && pbA <= 60 ? Math.round(pbA) + "-" + (pbB <= 60 ? Math.round(pbB) : "60+") : "" });
        document.getElementById("cfContato").href = "contato.html?" + q;
    }
    form.addEventListener("input", calcular);
    form.addEventListener("change", calcular);
    form.addEventListener("submit", e => e.preventDefault());
    calcular();
    }
})();

/* Menu: página atual marcada, Soluções abre no clique/teclado,
   menu de celular, e o botão flutuante do WhatsApp some quando a
   chamada final (que já tem o botão) está na tela. */
(() => {
    const pagina = document.body.dataset.pagina;
    document.querySelectorAll("[data-pag]").forEach(a => {
        if (a.dataset.pag === pagina) { a.classList.add("atual"); a.setAttribute("aria-current", "page"); }
    });
    if (pagina === "atta" || pagina === "eciton") document.querySelector(".menu-abre")?.classList.add("atual");

    const grupo = document.querySelector(".menu-grupo");
    const abre = document.querySelector(".menu-abre");
    abre?.addEventListener("click", () => {
        const aberto = grupo.classList.toggle("aberto");
        abre.setAttribute("aria-expanded", aberto);
    });
    document.addEventListener("click", e => {
        if (grupo && !grupo.contains(e.target)) { grupo.classList.remove("aberto"); abre.setAttribute("aria-expanded", "false"); }
    });

    const menu = document.getElementById("menu");
    const ham = document.getElementById("hamburguer");
    const fechar = () => { menu.classList.remove("aberto"); ham.setAttribute("aria-expanded", "false"); ham.setAttribute("aria-label", "Abrir menu"); };
    ham?.addEventListener("click", () => {
        const aberto = menu.classList.toggle("aberto");
        ham.setAttribute("aria-expanded", aberto);
        ham.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });
    menu?.querySelectorAll("a").forEach(a => a.addEventListener("click", fechar));
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") { fechar(); grupo?.classList.remove("aberto"); abre?.setAttribute("aria-expanded", "false"); }
    });

    const zap = document.querySelector(".zap-flutuante");
    const chamada = document.getElementById("chamada");
    if (zap && chamada && "IntersectionObserver" in window) {
        new IntersectionObserver(es => es.forEach(e => zap.classList.toggle("some", e.isIntersecting))).observe(chamada);
    }
})();
