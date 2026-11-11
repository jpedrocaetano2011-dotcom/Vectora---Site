/* Página do Eciton I/O: a cena da porta (o Atta, visto por trás, passa pela
   porta automática). A mesma cena da página do Eciton. Gerado a partir do eciton.js. */
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
       6) ECITON I/O: o Atta, visto por trás, passa pela porta
       --------------------------------------------------------- */
    (() => {
        const svg = $("ioSvg"); if (!svg) return;
        const chip = $("ioChip"), passos = [...document.querySelectorAll("#ioPassos li")];
        const VX = 300, VY = 112, F = 330, CAM = 1.4;       // ponto de fuga, foco, altura da câmera (m)
        const ZA = 2.7;                                      // o Atta, à frente da câmera
        const P = (X, Y, Z) => [VX + F * X / Z, VY + F * (CAM - Y) / Z];
        const pts = l => l.map(([X, Y, Z]) => P(X, Y, Z).map(v => v.toFixed(1)).join(",")).join(" ");
        const defs = S("defs", {}, svg);
        const gChao = S("linearGradient", { id: "ioChao", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        S("stop", { offset: 0, "stop-color": "#0B111B" }, gChao); S("stop", { offset: 1, "stop-color": "#121B28" }, gChao);
        const gLuz = S("linearGradient", { id: "ioLuz", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        S("stop", { offset: 0, "stop-color": "#0E1826" }, gLuz); S("stop", { offset: 1, "stop-color": "#1A2A40" }, gLuz);
        const gVidro = S("linearGradient", { id: "ioVidro", x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
        S("stop", { offset: 0, "stop-color": "rgba(99,174,255,.30)" }, gVidro); S("stop", { offset: 1, "stop-color": "rgba(30,123,255,.12)" }, gVidro);

        S("rect", { width: 600, height: 340, fill: "#070B11" }, svg);
        const teto = S("polygon", { fill: "#0A0F17" }, svg);
        const fundo = S("polygon", { fill: "#111C2B" }, svg);
        const alem = S("polygon", { fill: "url(#ioLuz)" }, svg);            // o galpão do outro lado da porta
        const chao = S("polygon", { fill: "url(#ioChao)" }, svg);
        const marcas = S("g", { stroke: "rgba(99,174,255,.07)", "stroke-width": 1 }, svg);
        const fita = S("polygon", { fill: "#C9D1DA", opacity: .55 }, svg);
        const tags = S("g", {}, svg);
        const paredeE = S("polygon", { fill: "#0C131D", stroke: "#1B2533" }, svg);
        const paredeD = S("polygon", { fill: "#0C131D", stroke: "#1B2533" }, svg);
        const frente = S("g", {}, svg);                                      // parede da porta (desenhada atrás ou na frente do Atta)
        const folhaE = S("polygon", { fill: "url(#ioVidro)", stroke: "#63AEFF", "stroke-width": 1.2 }, frente);
        const folhaD = S("polygon", { fill: "url(#ioVidro)", stroke: "#63AEFF", "stroke-width": 1.2 }, frente);
        const pE = S("polygon", { fill: "#101824", stroke: "#1B2533" }, frente);
        const pD = S("polygon", { fill: "#101824", stroke: "#1B2533" }, frente);
        const pT = S("polygon", { fill: "#101824", stroke: "#1B2533" }, frente);
        const batente = S("polyline", { fill: "none", stroke: COR.prata, "stroke-width": 3, "stroke-linejoin": "round" }, frente);
        const caixaMotor = S("polygon", { fill: "#1B2533" }, frente);
        const io = S("g", {}, frente);
        const ioCaixa = S("polygon", { fill: "#0F1621", stroke: COR.azulC, "stroke-width": 1.3 }, io);
        const ioLed = S("circle", { r: 3, fill: COR.vermelho }, io);
        const ioRot = T("Eciton I/O", { "font-family": MONO, "font-size": 9, fill: COR.azulC, "text-anchor": "middle" }, io);
        const radio = S("g", { fill: "none", stroke: COR.ciano, "stroke-width": 1.5 }, svg);
        const ondas = [0, 1, 2].map(() => S("circle", { r: 0 }, radio));
        const sinal = S("line", { stroke: COR.ciano, "stroke-width": 1.2, "stroke-dasharray": "3 5", opacity: 0 }, svg);

        // o Atta, por trás: caixa escura, tampo, rodas e a fita de LED na base
        const atta = S("g", {}, svg);
        const sombra = S("ellipse", { fill: "rgba(0,0,0,.45)" }, atta);
        const rodaE = S("rect", { rx: 4, fill: "#05070B" }, atta);
        const rodaD = S("rect", { rx: 4, fill: "#05070B" }, atta);
        const corpo = S("rect", { rx: 7, fill: "#0D141F", stroke: COR.azul, "stroke-width": 2 }, atta);
        const tampo = S("polygon", { fill: "#1B2A3D" }, atta);
        const carga = S("rect", { rx: 3, fill: COR.laranja, opacity: .9 }, atta);
        const led = S("rect", { rx: 2 }, atta);
        const nome = T("ATTA E-O", { "font-family": MONO, "font-size": 9, fill: COR.texto2, "text-anchor": "middle", "letter-spacing": ".12em" }, atta);
        const antena = S("circle", { r: 2.5, fill: COR.ciano }, atta);

        // quadro de estado (o que o tráfego está dizendo)
        const quadro = S("g", { transform: "translate(14 14)" }, svg);
        S("rect", { width: 262, height: 46, rx: 9, fill: "rgba(5,7,11,.82)", stroke: "#1B2533" }, quadro);
        const qL1 = T("", { x: 12, y: 19, "font-family": MONO, "font-size": 10, fill: COR.texto2 }, quadro);
        const qL2 = T("", { x: 12, y: 35, "font-family": MONO, "font-size": 10.5, fill: COR.prata, "font-weight": 600 }, quadro);

        const DUR = 11;
        const zPorta = t => {
            if (t < 2.9) return 13 - 8.6 * suave(t / 2.9);                   // chega e para a 1,8 m da porta
            if (t < 3.9) return 4.4;                                         // espera o sensor
            return 4.4 - 5.2 * Math.min(1, (t - 3.9) / 4.2) ** 1.25;         // passa
        };
        const abertura = t => t < 1.4 ? 0 : t < 3.5 ? suave((t - 1.4) / 2.1) : 1;

        function desenhar(t) {
            const zd = zPorta(t), a = abertura(t);
            const mover = t < 2.9 || t > 3.9;
            // galpão além da porta, chão, fita, paredes
            const ZL = 60, Z0 = 0.35, W = 2.4, H = 3.2, LP = 1.05, HP = 2.5;
            teto.setAttribute("points", pts([[-W, H, Z0], [W, H, Z0], [W, H, ZL], [-W, H, ZL]]));
            fundo.setAttribute("points", pts([[-W, 0, ZL], [W, 0, ZL], [W, H, ZL], [-W, H, ZL]]));
            alem.setAttribute("points", pts([[-W, 0, Math.max(zd, Z0)], [W, 0, Math.max(zd, Z0)], [W, 0, ZL], [-W, 0, ZL]]));
            chao.setAttribute("points", pts([[-W, 0, Z0], [W, 0, Z0], [W, 0, Math.max(zd, Z0 + .01)], [-W, 0, Math.max(zd, Z0 + .01)]]));
            fita.setAttribute("points", pts([[-.04, 0, Z0], [.04, 0, Z0], [.04, 0, ZL], [-.04, 0, ZL]]));
            // marcas no chão andando (sensação de movimento)
            const desl = (13 - zd) % 1.5;
            while (marcas.firstChild) marcas.firstChild.remove();
            for (let z = 1.5 - desl; z < 40; z += 1.5) {
                if (z < Z0) continue;
                const [x1, y] = P(-W, 0, z), [x2] = P(W, 0, z);
                S("line", { x1: x1.toFixed(1), y1: y.toFixed(1), x2: x2.toFixed(1), y2: y.toFixed(1) }, marcas);
            }
            while (tags.firstChild) tags.firstChild.remove();
            [zd - 1.5, zd + 1.5].forEach(z => { if (z > Z0) S("polygon", { points: pts([[-.06, 0, z - .06], [.06, 0, z - .06], [.06, 0, z + .06], [-.06, 0, z + .06]]), fill: COR.verde, opacity: .8 }, tags); });
            paredeE.setAttribute("points", pts([[-W, 0, Z0], [-W, H, Z0], [-W, H, ZL], [-W, 0, ZL]]));
            paredeD.setAttribute("points", pts([[W, 0, Z0], [W, H, Z0], [W, H, ZL], [W, 0, ZL]]));
            // parede da porta, folhas, batente, controlador
            const visivelPorta = zd > Z0 + .05;
            frente.setAttribute("opacity", visivelPorta ? 1 : 0);
            if (visivelPorta) {
                pE.setAttribute("points", pts([[-W, 0, zd], [-LP, 0, zd], [-LP, HP, zd], [-W, HP, zd]]));
                pD.setAttribute("points", pts([[LP, 0, zd], [W, 0, zd], [W, HP, zd], [LP, HP, zd]]));
                pT.setAttribute("points", pts([[-W, HP, zd], [W, HP, zd], [W, H, zd], [-W, H, zd]]));
                const c = a * (LP - .08);
                folhaE.setAttribute("points", pts([[-LP - c, 0, zd + .03], [-c, 0, zd + .03], [-c, HP - .05, zd + .03], [-LP - c, HP - .05, zd + .03]]));
                folhaD.setAttribute("points", pts([[c, 0, zd + .03], [LP + c, 0, zd + .03], [LP + c, HP - .05, zd + .03], [c, HP - .05, zd + .03]]));
                batente.setAttribute("points", pts([[-LP, 0, zd - .03], [-LP, HP, zd - .03], [LP, HP, zd - .03], [LP, 0, zd - .03]]));
                caixaMotor.setAttribute("points", pts([[-LP - .1, HP, zd - .05], [LP + .1, HP, zd - .05], [LP + .1, HP + .25, zd - .05], [-LP - .1, HP + .25, zd - .05]]));
                ioCaixa.setAttribute("points", pts([[1.45, 1.25, zd - .03], [1.75, 1.25, zd - .03], [1.75, 1.65, zd - .03], [1.45, 1.65, zd - .03]]));
                const [lx, ly] = P(1.6, 1.53, zd - .04), [rx, ry] = P(1.6, 1.78, zd - .04);
                ioLed.setAttribute("cx", lx.toFixed(1)); ioLed.setAttribute("cy", ly.toFixed(1));
                ioLed.setAttribute("r", Math.max(1.5, 0.035 * F / zd).toFixed(1));
                ioRot.setAttribute("x", rx.toFixed(1)); ioRot.setAttribute("y", ry.toFixed(1));
                ioRot.setAttribute("opacity", zd < 9 ? 1 : 0);
            }
            // a parede passa na frente do Atta depois que ele atravessa
            if (zd < ZA) svg.insertBefore(frente, quadro); else svg.insertBefore(frente, radio);
            // LED do controlador: vermelho (zona ocupada), âmbar piscando (abrindo), verde (liberada)
            const ledCor = a >= 1 && t < 9 ? COR.verde : t >= 1.1 && t < 3.5 ? ((t * 4 | 0) % 2 ? COR.laranja : "#5a3a12") : COR.vermelho;
            ioLed.setAttribute("fill", ledCor);

            // o Atta
            const balanco = mover ? Math.sin(t * 18) * .004 : 0;
            const q = (X, Y) => P(X, Y + balanco, ZA);
            const [x0, yb] = q(-.32, .06), [x1, yt] = q(.32, .5);
            corpo.setAttribute("x", x0.toFixed(1)); corpo.setAttribute("y", yt.toFixed(1));
            corpo.setAttribute("width", (x1 - x0).toFixed(1)); corpo.setAttribute("height", (yb - yt).toFixed(1));
            const [tx0, ty0] = q(-.3, .5), [tx1] = q(.3, .5);
            const [ux0, uy] = P(-.26, .5, ZA + .5), [ux1] = P(.26, .5, ZA + .5);
            tampo.setAttribute("points", `${tx0.toFixed(1)},${ty0.toFixed(1)} ${tx1.toFixed(1)},${ty0.toFixed(1)} ${ux1.toFixed(1)},${uy.toFixed(1)} ${ux0.toFixed(1)},${uy.toFixed(1)}`);
            const [cx0, cy0] = P(-.17, .74, ZA + .12), [cx1, cy1] = P(.17, .5, ZA + .12);
            carga.setAttribute("x", cx0.toFixed(1)); carga.setAttribute("y", cy0.toFixed(1));
            carga.setAttribute("width", (cx1 - cx0).toFixed(1)); carga.setAttribute("height", (cy1 - cy0).toFixed(1));
            [[rodaE, -.36], [rodaD, .26]].forEach(([r, X]) => {
                const [rx0, ry0] = q(X, .14), [rx1, ry1] = q(X + .1, 0);
                r.setAttribute("x", rx0.toFixed(1)); r.setAttribute("y", ry0.toFixed(1));
                r.setAttribute("width", (rx1 - rx0).toFixed(1)); r.setAttribute("height", (ry1 - ry0).toFixed(1));
            });
            const [sx, sy] = P(0, 0, ZA + .15);
            sombra.setAttribute("cx", sx.toFixed(1)); sombra.setAttribute("cy", sy.toFixed(1));
            sombra.setAttribute("rx", ((x1 - x0) * .62).toFixed(1)); sombra.setAttribute("ry", 7);
            const [lx0, ly0] = q(-.27, .12), [lx1, ly1] = q(.27, .085);
            led.setAttribute("x", lx0.toFixed(1)); led.setAttribute("y", ly0.toFixed(1));
            led.setAttribute("width", (lx1 - lx0).toFixed(1)); led.setAttribute("height", Math.max(3, ly1 - ly0).toFixed(1));
            // LED do Atta: verde correndo andando; verde "respirando" parado esperando a passagem
            const esperando = t >= 2.9 && t < 3.9;
            led.setAttribute("fill", COR.verde);
            led.setAttribute("opacity", esperando ? (.45 + .55 * (0.5 + 0.5 * Math.sin(t * 6))).toFixed(2) : (.75 + .25 * Math.sin(t * 20)).toFixed(2));
            const [nx, ny] = q(0, .3);
            nome.setAttribute("x", nx.toFixed(1)); nome.setAttribute("y", ny.toFixed(1));
            const [ax, ay] = q(.22, .55);
            antena.setAttribute("cx", ax.toFixed(1)); antena.setAttribute("cy", ay.toFixed(1));

            // o pedido pelo rádio (MQTT): do Atta até o controlador
            const pedindo = t >= .9 && t < 3.6;
            const [mx, my] = P(1.6, 1.45, Math.max(zd, Z0 + .1));
            sinal.setAttribute("x1", ax.toFixed(1)); sinal.setAttribute("y1", ay.toFixed(1));
            sinal.setAttribute("x2", mx.toFixed(1)); sinal.setAttribute("y2", my.toFixed(1));
            sinal.setAttribute("opacity", pedindo ? .8 : 0);
            sinal.setAttribute("stroke-dashoffset", (-t * 40).toFixed(1));
            ondas.forEach((o, i) => {
                const u = ((t * 1.4 + i / 3) % 1);
                o.setAttribute("cx", mx.toFixed(1)); o.setAttribute("cy", my.toFixed(1));
                o.setAttribute("r", (4 + u * 26).toFixed(1));
                o.setAttribute("opacity", pedindo ? (1 - u).toFixed(2) : 0);
            });

            // quadro e passos
            let l1, l2, cor, passo, chipTxt;
            if (t < .9) { l1 = "porta 1 · zona PL01"; l2 = "ocupada pelo Eciton I/O"; cor = COR.vermelho; passo = -1; chipTxt = "porta 1 · fechada"; }
            else if (t < 1.4) { l1 = "Atta V1 pede"; l2 = "a zona PL01"; cor = COR.ciano; passo = 0; chipTxt = "porta 1 · pedida por V1"; }
            else if (t < 3.5) { l1 = "Eciton I/O · saída 1 ligada"; l2 = "abrindo… o Atta espera"; cor = COR.laranja; passo = 1; chipTxt = "porta 1 · abrindo"; }
            else if (t < 4.4) { l1 = "sensor “aberta” ✓"; l2 = "zona liberada para V1"; cor = COR.verde; passo = 2; chipTxt = "porta 1 · aberta"; }
            else if (t < 9) { l1 = "V1 dentro da zona PL01"; l2 = "passando pela porta"; cor = COR.azulC; passo = 3; chipTxt = "porta 1 · aberta"; }
            else { l1 = "V1 passou"; l2 = "a porta fecha em 5 s"; cor = COR.texto2; passo = 3; chipTxt = "porta 1 · fecha em 5 s"; }
            qL1.textContent = l1; qL2.textContent = l2; qL2.setAttribute("fill", cor);
            if (chip.textContent !== chipTxt) { chip.textContent = chipTxt; chip.classList.toggle("ativo", passo >= 2); }
            passos.forEach((li, i) => li.classList.toggle("agora", i === passo));
            svg.setAttribute("opacity", t > DUR - .5 ? ((DUR - t) / .5).toFixed(2) : t < .3 ? (t / .3).toFixed(2) : 1);
        }
        let t = 0;
        desenhar(reduzir ? 3.7 : 0);
        if (!reduzir) registrar(svg, { passo: dt => { t = (t + dt) % DUR; desenhar(t); } });
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
