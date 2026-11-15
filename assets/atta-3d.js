/* E4M · Atta em 3D (v4.3)
   Palco 3D só com o lado de fora do Atta E e do Atta T.
   - Mostra a imagem parada até a seção aparecer; no celular espera o toque em "Ver em 3D".
   - three.js r128 (cdnjs) e OrbitControls 0.128.0 (jsdelivr), carregados só quando precisa.
   - Arrastar gira; zoom só com Ctrl/⌘ + rolagem ou com dois dedos (a rolagem da página continua livre). */
(function () {
    "use strict";
    const raiz = document.querySelector("[data-v3d]");
    if (!raiz) return;

    const VER = "202611151900";
    const THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    const ORBIT_URL = "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js";
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const toque = matchMedia("(pointer: coarse)").matches || innerWidth < 720;

    // As mesmas situações e efeitos do firmware do Atta e da Sinalização do Eciton (cores ajustadas para a tela).
    // A cor diz a situação; o efeito diz o que ele está fazendo.
    const LUZES = [
        ["#2BD46A", "corre", "Em missão, andando", "Verde correndo"],
        ["#2BD46A", "estrobo", "Vai partir", "Verde piscando rápido"],
        ["#2CE0FF", "pisca", "Esperando o operador", "Ciano piscando"],
        ["#FF8A3D", "respira-rapida", "Obstáculo à frente", "Laranja respirando rápido"],
        ["#A57BFF", "respira", "Turno encerrado, no berço", "Roxo respirando"],
        ["#FF2A2A", "estrobo", "Emergência", "Vermelho piscando rápido"],
        ["#FFB000", "pisca", "Emergência solta: falta rearmar", "Âmbar piscando"]
    ];

    const MODELOS = {
        e: {
            arquivo: "assets/atta-e.json", poster: "assets/atta-e.webp", alt: "Atta E, piloto de 500 kg, com a mesa de elevação em cima",
            alvo: [450, 300, 120], dist: 2150, dir: [0.78, -1, 0.62],
            ficha: [["Situação", "Pronto para piloto"], ["Carga", "500 kg no piloto"], ["Tamanho", "900 × 600 × 280 mm"], ["Guiamento", "Linha óptica (-O)"], ["Recarga", "Automática, no berço"]],
            acoes: [["mesa", "Levantar a mesa", "Baixar a mesa"], ["luz"]],
            pontos: [
                [[872, 28, 150], [1, -1, 0], "Dois scanners de segurança em cantos opostos: juntos, veem os 360° em volta do Atta."],
                [[450, -8, 236], [0, -1, 0], "A faixa de luz em volta diz a quem está perto o que o Atta vai fazer."],
                [[330, -32, 150], [0, -1, 0], "Botão de emergência dos dois lados, na altura da mão. Nada de botão no tampo."],
                [[620, 300, 282], [0, 0, 1], "A mesa ocupa o tampo inteiro: o Atta entra embaixo do carrinho e levanta."]
            ]
        },
        t: {
            arquivo: "assets/atta-t.json", poster: "assets/atta-t.webp", alt: "Atta T, rebocador, com um carrinho de milk run engatado",
            alvo: [-430, 300, 230], dist: 4300, dir: [0.62, -1, 0.6],
            ficha: [["Situação", "Em desenvolvimento"], ["Trabalho", "Puxa carrinhos em comboio"], ["Tamanho", "1.000 × 600 × 365 mm"], ["Engate", "Manual, com sensor do pino"], ["Pista e berço", "Os mesmos do Atta E"]],
            acoes: [["trem", "Soltar o trem", "Engatar o trem"], ["luz"]],
            pontos: [
                [[-62, 300, 262], [-1, 0, 0.3], "Engate manual: o operador põe o pino em segundos e um sensor confirma antes de o Atta sair."],
                [[972, 28, 150], [1, -1, 0], "Os mesmos scanners, sensor de linha e berço do Atta E: a pista serve para os dois."],
                [[500, -8, 320], [0, -1, 0], "A mesma faixa de luz, com as mesmas cores do Atta E."],
                [[560, 300, 367], [0, 0, 1], "Pesado de propósito: o peso sobre as rodas é o que segura o trem numa frenagem."]
            ]
        }
    };

    const $ = (s, el) => (el || raiz).querySelector(s);
    const palco = $(".v3d-palco"), poster = $(".v3d-poster"), canvas = $("canvas", palco);
    const info = $(".v3d-info"), btnVer = $(".v3d-ver"), dica = $(".v3d-dica"), estado = $(".v3d-estado"), acoesEl = $(".v3d-acoes"), fichaEl = $(".v3d-ficha"), pontosEl = $(".v3d-pontos");
    const abas = [...raiz.querySelectorAll("[data-m]")];

    let atual = "e", T = null, cena, cam, ren, ctl, grupo, dados = {}, obj = {}, ativo = false, visivel = false, iniciado = false, carregando = false;
    let luz = 0, relogio = 0;

    // ---------- textos (funcionam sem 3D) ----------
    function montarTextos() {
        const M = MODELOS[atual];
        fichaEl.innerHTML = M.ficha.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
        acoesEl.innerHTML = M.acoes.map(([id, txt]) => id === "luz"
            ? `<div class="v3d-luzes" role="group" aria-label="Luzes do Atta"><span class="v3d-luzes-tit">Luzes: a cor diz a situação, o efeito diz o que ele está fazendo</span>${LUZES.map((l, i) =>
                `<button type="button" class="v3d-luz${i === luz ? " ativa" : ""}" data-luz="${i}" style="--c:${l[0]}" ${iniciado ? "" : "disabled"} aria-pressed="${i === luz}"><i class="${l[1]}"></i><b>${l[2]}</b><small>${l[3]}</small></button>`).join("")}</div>`
            : `<button type="button" class="botao v3d-acao" data-acao="${id}" ${iniciado ? "" : "disabled"}>${txt}</button>`).join("");
        acoesEl.querySelectorAll(".v3d-luz").forEach(b => b.addEventListener("click", () => { luz = +b.dataset.luz; aplicarLuz(); }));
        pontosEl.innerHTML = M.pontos.map((p, i) => `<button type="button" class="v3d-ponto" data-i="${i}" aria-label="Ponto ${i + 1}: ${p[2]}"><span>${i + 1}</span><em>${p[2]}</em></button>`).join("");
        poster.src = M.poster; poster.alt = M.alt;
        acoesEl.querySelectorAll(".v3d-acao").forEach(b => b.addEventListener("click", () => acao(b)));
        pontosEl.querySelectorAll(".v3d-ponto").forEach(b => b.addEventListener("click", (e) => {
            e.stopPropagation();
            const aberto = b.classList.contains("aberto");
            pontosEl.querySelectorAll(".aberto").forEach(x => x.classList.remove("aberto"));
            if (!aberto) b.classList.add("aberto");
        }));
    }
    abas.forEach(a => a.addEventListener("click", () => trocar(a.dataset.m)));
    document.addEventListener("click", () => pontosEl.querySelectorAll(".aberto").forEach(x => x.classList.remove("aberto")));

    function trocar(m) {
        if (m === atual) return;
        atual = m;
        abas.forEach(a => a.setAttribute("aria-selected", a.dataset.m === m ? "true" : "false"));
        montarTextos();
        if (iniciado) carregarModelo(m);
    }

    // ---------- carregar three.js sob demanda ----------
    const script = (src) => new Promise((ok, erro) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s); });

    async function iniciar() {
        if (iniciado || carregando) return;
        carregando = true;
        raiz.classList.add("carregando");
        try {
            if (!window.THREE) await script(THREE_URL);
            if (!THREE.OrbitControls) await script(ORBIT_URL);
            T = THREE;
            montarCena();
            iniciado = true;
            await carregarModelo(atual);
            raiz.classList.add("pronto");
            montarTextos();
            if (toque) dica.textContent = "Arraste para girar · dois dedos para aproximar";
        } catch (e) {
            raiz.classList.add("falhou");
        } finally {
            carregando = false;
            raiz.classList.remove("carregando");
        }
    }

    function montarCena() {
        ren = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
        ren.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
        ren.outputEncoding = T.sRGBEncoding;
        cena = new T.Scene();
        cam = new T.PerspectiveCamera(30, 1, 10, 30000);
        cam.up.set(0, 0, 1);
        cena.add(new T.HemisphereLight(0xDCE8FF, 0x0A0F17, 0.85));
        const sol = new T.DirectionalLight(0xFFFFFF, 0.85); sol.position.set(1500, -2200, 3000); cena.add(sol);
        const contra = new T.DirectionalLight(0x63AEFF, 0.35); contra.position.set(-2500, 1800, 900); cena.add(contra);
        // piso: um disco que some nas bordas + a fita da pista
        const tx = document.createElement("canvas"); tx.width = tx.height = 256;
        const g = tx.getContext("2d"), rg = g.createRadialGradient(128, 128, 10, 128, 128, 128);
        rg.addColorStop(0, "rgba(40,60,90,.55)"); rg.addColorStop(.55, "rgba(20,32,50,.35)"); rg.addColorStop(1, "rgba(10,15,23,0)");
        g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
        const piso = new T.Mesh(new T.CircleGeometry(2600, 64), new T.MeshBasicMaterial({ map: new T.CanvasTexture(tx), transparent: true, depthWrite: false }));
        piso.position.z = -1; cena.add(piso); obj.piso = piso;
        const fita = new T.Mesh(new T.PlaneGeometry(6000, 25), new T.MeshBasicMaterial({ color: new T.Color(0x1E7BFF).convertSRGBToLinear(), transparent: true, opacity: .6 }));
        fita.position.z = 0; cena.add(fita); obj.fita = fita;
        const sombra = document.createElement("canvas"); sombra.width = sombra.height = 128;
        const s2 = sombra.getContext("2d"), sg = s2.createRadialGradient(64, 64, 4, 64, 64, 64);
        sg.addColorStop(0, "rgba(0,0,0,.65)"); sg.addColorStop(1, "rgba(0,0,0,0)"); s2.fillStyle = sg; s2.fillRect(0, 0, 128, 128);
        obj.sombraTex = new T.CanvasTexture(sombra);

        ctl = new T.OrbitControls(cam, canvas);
        ctl.enablePan = false; ctl.enableDamping = true; ctl.dampingFactor = .08;
        ctl.minPolarAngle = .15; ctl.maxPolarAngle = Math.PI / 2 - .04;
        ctl.autoRotate = !reduzir; ctl.autoRotateSpeed = .7;
        ctl.addEventListener("start", () => { ctl.autoRotate = false; palco.classList.add("mexeu"); });
        // rolagem sem Ctrl/⌘ passa direto para a página
        palco.addEventListener("wheel", (e) => {
            if (!e.ctrlKey && !e.metaKey) { e.stopPropagation(); palco.classList.add("avisa"); clearTimeout(palco._t); palco._t = setTimeout(() => palco.classList.remove("avisa"), 1400); }
        }, { capture: true });
        new ResizeObserver(redimensionar).observe(palco);
        redimensionar();
        requestAnimationFrame(quadro);
    }

    function redimensionar() {
        if (!ren) return;
        const w = palco.clientWidth, h = palco.clientHeight;
        ren.setSize(w, h, false);
        cam.aspect = w / h; cam.updateProjectionMatrix();
    }

    function decodificar(p) {
        const b = atob(p.pos), u = new Uint8Array(b.length);
        for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
        const bi = atob(p.idx), ui = new Uint8Array(bi.length);
        for (let i = 0; i < bi.length; i++) ui[i] = bi.charCodeAt(i);
        return [new Int16Array(u.buffer), p.i32 ? new Uint32Array(ui.buffer) : new Uint16Array(ui.buffer)];
    }

    async function carregarModelo(m) {
        if (!dados[m]) {
            const r = await fetch(MODELOS[m].arquivo + "?v=" + VER);
            if (!r.ok) throw new Error("modelo");
            const d = await r.json();
            const g = new T.Group(), partes = { mesa: [], luz: [], logo: [], trem: [], pino: [] };
            d.pecas.forEach(p => {
                const [pos, idx] = decodificar(p);
                const geo = new T.BufferGeometry();
                const f = new Float32Array(pos.length);
                for (let i = 0; i < pos.length; i++) f[i] = pos[i] / d.esc;
                geo.setAttribute("position", new T.BufferAttribute(f, 3));
                geo.setIndex(new T.BufferAttribute(idx, 1));
                geo.computeVertexNormals();
                const luzP = p.papel === "luz", logo = p.papel === "logo";
                const mat = new T.MeshStandardMaterial({
                    color: new T.Color(p.cor).convertSRGBToLinear(), roughness: p.id === "170" || p.id === "330" ? .38 : .62, metalness: p.id === "170" || p.id === "330" ? .45 : .12,
                    emissive: new T.Color(luzP ? 0x2BD46A : logo ? 0xFFFFFF : 0x000000).convertSRGBToLinear(), emissiveIntensity: luzP ? .8 : logo ? .9 : 0,
                    transparent: luzP, opacity: luzP ? .92 : 1
                });
                const mesh = new T.Mesh(geo, mat);
                g.add(mesh);
                if (partes[p.papel]) partes[p.papel].push(mesh);
            });
            const sombra = new T.Mesh(new T.PlaneGeometry(d.comp * 1.35, d.larg * 1.5), new T.MeshBasicMaterial({ map: obj.sombraTex, transparent: true, depthWrite: false }));
            sombra.position.set(d.comp / 2, d.larg / 2, 0.5); g.add(sombra);
            dados[m] = { g, partes, d, mesa: 0, mesaAlvo: 0, trem: 1, tremAlvo: 1 };
        }
        if (grupo) cena.remove(grupo);
        grupo = dados[m].g; cena.add(grupo);
        obj.fita.position.set(MODELOS[m] === MODELOS.t ? -500 : 450, 300, 0.2);
        enquadrar(m);
        aplicarLuz();
        posicionar();
        ativo = true;
    }

    function enquadrar(m) {
        const M = MODELOS[m];
        const alvo = new T.Vector3(...M.alvo), dir = new T.Vector3(...M.dir).normalize();
        const k = cam.aspect < 1 ? 1.45 : 1;
        cam.position.copy(alvo).addScaledVector(dir, M.dist * k);
        ctl.target.copy(alvo);
        ctl.minDistance = M.dist * .45; ctl.maxDistance = M.dist * 1.8;
        ctl.update();
    }

    // ---------- ações ----------
    function acao(b) {
        const D = dados[atual]; if (!D) return;
        const id = b.dataset.acao, def = MODELOS[atual].acoes.find(a => a[0] === id);
        if (id === "mesa") { D.mesaAlvo = D.mesaAlvo ? 0 : 1; b.textContent = D.mesaAlvo ? def[2] : def[1]; }
        if (id === "trem") { D.tremAlvo = D.tremAlvo ? 0 : 1; b.textContent = D.tremAlvo ? def[1] : def[2]; }
        if (reduzir) { D.mesa = D.mesaAlvo; D.trem = D.tremAlvo; posicionar(); }
    }

    function aplicarLuz() {
        const [cor, , txt] = LUZES[luz];
        estado.querySelector("span").textContent = txt;
        estado.style.setProperty("--c", cor);
        acoesEl.querySelectorAll(".v3d-luz").forEach((b, i) => { b.classList.toggle("ativa", i === luz); b.setAttribute("aria-pressed", i === luz); });
        const D = dados[atual]; if (!D) return;
        const c = new T.Color(cor).convertSRGBToLinear();
        D.partes.luz.forEach(m => { m.material.color.copy(c); m.material.emissive.copy(c); });
    }

    function posicionar() {
        const D = dados[atual]; if (!D) return;
        const curso = D.d.curso || 0;
        D.partes.mesa.forEach(m => (m.position.z = curso * D.mesa));
        D.partes.luz.forEach(m => (m.position.z = atual === "e" ? curso * D.mesa : 0));
        // trem: o carrinho chega por trás (0 = solto, 1 = engatado) e o pino desce no fim
        const u = Math.min(1, D.trem / .8), pin = Math.max(0, (D.trem - .8) / .2);
        D.partes.trem.forEach(m => (m.position.x = -520 * (1 - u)));
        D.partes.pino.forEach(m => (m.position.z = 110 * (1 - pin)));
        info.textContent = atual === "e" ? `Altura ${Math.round((D.d.alto || 280) + curso * D.mesa)} mm` : D.trem > .999 ? "Trem engatado" : D.trem < .001 ? "Trem solto" : "Engatando…";
    }

    const ir = (a, b, v) => (Math.abs(b - a) < v ? b : a + Math.sign(b - a) * v);

    function quadro(t) {
        requestAnimationFrame(quadro);
        if (!ativo || !visivel || document.hidden) return;
        const dt = Math.min(.05, (t - (relogio || t)) / 1000); relogio = t;
        const D = dados[atual];
        if (D) {
            D.mesa = ir(D.mesa, D.mesaAlvo, dt / 1.2);
            D.trem = ir(D.trem, D.tremAlvo, dt / 1.8);
            posicionar();
            const [, efeito] = LUZES[luz], s = t / 1000;
            const k = efeito === "corre" ? .75 + .25 * Math.sin(s * 9)
                : efeito === "respira" ? .1 + .85 * (0.5 + 0.5 * Math.sin(s * 2.4))
                : efeito === "respira-rapida" ? .1 + .85 * (0.5 + 0.5 * Math.sin(s * 7))
                : efeito === "pisca" ? (Math.floor(s * 2) % 2 ? .08 : 1)
                : efeito === "estrobo" ? (Math.floor(s * 8) % 2 ? .05 : 1.2) : .9;
            D.partes.luz.forEach(m => (m.material.emissiveIntensity = k));
        }
        ctl.update();
        ren.render(cena, cam);
        pontosNaTela();
        if (!raiz.classList.contains("desenhou")) { raiz.classList.add("desenhou"); }
    }

    const vTmp = { p: null, n: null, c: null };
    function pontosNaTela() {
        if (!vTmp.p) { vTmp.p = new T.Vector3(); vTmp.n = new T.Vector3(); vTmp.c = new T.Vector3(); }
        const M = MODELOS[atual], D = dados[atual];
        const w = palco.clientWidth, h = palco.clientHeight;
        pontosEl.querySelectorAll(".v3d-ponto").forEach((el, i) => {
            const [p, n] = M.pontos[i];
            vTmp.p.set(p[0], p[1], p[2] + (atual === "e" && i === 3 ? (D.d.curso || 0) * D.mesa : 0));
            vTmp.n.set(n[0], n[1], n[2]).normalize();
            vTmp.c.copy(cam.position).sub(vTmp.p).normalize();
            const de_frente = vTmp.c.dot(vTmp.n) > .12;
            vTmp.p.project(cam);
            el.style.transform = `translate(${(vTmp.p.x + 1) / 2 * w}px, ${(1 - vTmp.p.y) / 2 * h}px)`;
            el.classList.toggle("escondido", !de_frente);
        });
    }

    // ---------- quando começar ----------
    montarTextos();
    const io = new IntersectionObserver((es) => {
        es.forEach(e => {
            visivel = e.isIntersecting;
            if (visivel && !toque) iniciar();
        });
    }, { rootMargin: "200px 0px" });
    io.observe(palco);
    btnVer.addEventListener("click", iniciar);
})();
