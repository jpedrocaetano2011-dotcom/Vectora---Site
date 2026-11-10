/* Formulário de contato: grava a mensagem no Supabase (a tabela só
   aceita inserir; ninguém lê pelo site). A chave usada é a publicável,
   feita para ficar em sites públicos. */
(() => {
    const form = document.getElementById("formContato");
    if (!form) return;
    const cfg = window.E4M_CONTATO || {};
    const BIBLIOTECA = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js";
    const aviso = document.getElementById("fAviso");
    const enviar = document.getElementById("fEnviar");
    const q = new URLSearchParams(location.search);

    // interesse vindo do botão que trouxe a pessoa até aqui
    const interesse = q.get("interesse");
    if (interesse) { const r = form.querySelector(`input[name="interesse"][value="${CSS.escape(interesse)}"]`); if (r) r.checked = true; }

    // números da calculadora da página do Atta
    let origem = q.get("origem") || "";
    if (origem === "calculadora") {
        const n = k => Math.max(0, Number(q.get(k)) || 0);
        const moeda = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
        const resumo = `Conta da calculadora: ${n("viagens")} viagens por turno de ${n("minutos")} min, ${n("turnos")} turno(s) por dia, ${n("dias")} dias por mês, hora do operador ${moeda(n("custo"))}. São ${n("horas").toLocaleString("pt-BR")} h por mês em transporte, cerca de ${moeda(n("mes"))} por mês e ${moeda(n("mes") * 12)} por ano.`;
        const caixa = document.getElementById("calcRecebida");
        caixa.hidden = false;
        caixa.innerHTML = `<span class="rot">Vai junto com a mensagem</span><p></p>`;
        caixa.querySelector("p").textContent = resumo;
        origem = resumo;
    }
    // vindo das páginas do Estudo de frota e do Eciton I/O
    const PEDIDOS = { estudo: "Quero um estudo de frota (quantos Atta a operação precisa).", "eciton-io": "Quero falar sobre o Eciton I/O (portas, semáforos, alarme de incêndio).", elevador: "Tenho um projeto com elevador (Eciton I/O)." };
    if (PEDIDOS[origem]) {
        const caixa = document.getElementById("calcRecebida");
        caixa.hidden = false;
        caixa.innerHTML = `<span class="rot">Vai junto com a mensagem</span><p></p>`;
        caixa.querySelector("p").textContent = PEDIDOS[origem];
        origem = PEDIDOS[origem];
    }
    if (origem === "configurador") {
        const n = k => Math.max(0, Number(q.get(k)) || 0);
        const NOMES = { G: "garra", E: "elevação", R: "rolos", T: "rebocador" };
        const mod = NOMES[q.get("modulo")] ? q.get("modulo") : "G";
        const base = `Configurador: ${n("peso").toLocaleString("pt-BR")} kg por viagem, ${n("dist")} m da coleta até a entrega, ${n("viagens")} viagens por hora no pico, ` +
            `${n("ponta").toLocaleString("pt-BR")} min em cada ponta, corredor ${q.get("pessoas") === "nao" ? "só da frota" : "com pessoas"}.`;
        const resumo = mod === "T"
            ? `${base} Indicação: rebocador (Atta T, em desenvolvimento), para estudar o caso.`
            : `${base} Estimativa: Atta ${mod}-O (${NOMES[mod]}), ${(n("ciclo") / 60).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} min por viagem, ${n("frota")} Atta na frota.`;
        const caixa = document.getElementById("calcRecebida");
        caixa.hidden = false;
        caixa.innerHTML = `<span class="rot">Vai junto com a mensagem</span><p></p>`;
        caixa.querySelector("p").textContent = resumo;
        origem = resumo;
    }
    const pagina = document.referrer && document.referrer.startsWith(location.origin) ? new URL(document.referrer).pathname : "";
    if (!origem && pagina) origem = "veio de " + pagina;

    let cliente = null;
    const carregar = () => new Promise((ok, falha) => {
        if (window.supabase?.createClient) return ok();
        const s = document.createElement("script");
        s.src = BIBLIOTECA; s.onload = ok; s.onerror = () => falha(new Error("biblioteca"));
        document.head.appendChild(s);
    });
    const mostrar = (txt, tipo) => { aviso.textContent = txt; aviso.className = "form-aviso " + (tipo || ""); };
    const campo = n => (form.elements[n]?.value || "").trim();

    form.addEventListener("submit", async e => {
        e.preventDefault();
        if (campo("site")) { mostrar("Mensagem enviada. Obrigado!", "ok"); form.reset(); return; } // robô
        const dados = { nome: campo("nome"), empresa: campo("empresa"), contato: campo("contato"),
            interesse: form.querySelector('input[name="interesse"]:checked')?.value || "nao-sei",
            mensagem: campo("mensagem") || null, origem: origem ? origem.slice(0, 300) : null };
        const falta = [];
        if (dados.nome.length < 2) falta.push(form.elements.nome);
        if (!dados.empresa) falta.push(form.elements.empresa);
        if (dados.contato.length < 5) falta.push(form.elements.contato);
        form.querySelectorAll(".erro").forEach(el => el.classList.remove("erro"));
        if (falta.length) {
            falta.forEach(el => el.classList.add("erro"));
            falta[0].focus();
            mostrar("Preencha nome, empresa e um e-mail ou telefone.", "erro");
            return;
        }
        if (!cfg.url || !cfg.chave) { mostrar("O formulário ainda não está configurado. Fale com a gente pelo WhatsApp.", "erro"); return; }
        enviar.disabled = true; mostrar("Enviando…");
        try {
            await carregar();
            cliente = cliente || window.supabase.createClient(cfg.url, cfg.chave, { auth: { persistSession: false, autoRefreshToken: false } });
            const { error } = await cliente.from("contatos").insert(dados);
            if (error) throw error;
            form.reset();
            document.getElementById("calcRecebida").hidden = true;
            origem = "";
            mostrar("Mensagem enviada. Obrigado! A gente responde em até 1 dia útil.", "ok");
        } catch (erro) {
            console.warn("contato", erro);
            mostrar(/Muitas mensagens/.test(erro?.message || "") ? "Recebemos muitas mensagens agora. Tente de novo mais tarde ou fale pelo WhatsApp." : "Não deu para enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.", "erro");
        } finally {
            enviar.disabled = false;
        }
    });
})();
