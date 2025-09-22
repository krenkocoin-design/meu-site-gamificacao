function rastrearEvento(nome, dados = {}) {
  console.log("📊 Evento:", nome, dados);

  if (window.gtag) gtag('event', nome, dados);
  if (window.fbq) fbq('trackCustom', nome, dados);

  let historico = JSON.parse(localStorage.getItem("historicoEventos")) || [];
  historico.push({ nome, dados, ts: Date.now() });
  localStorage.setItem("historicoEventos", JSON.stringify(historico));
}

document.addEventListener("click", (e) => {
  let alvo = e.target.tagName + (e.target.id ? `#${e.target.id}` : "");
  rastrearEvento("clique", { alvo });
});
