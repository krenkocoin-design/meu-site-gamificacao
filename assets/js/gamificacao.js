// Aqui você pode evoluir pontos, badges etc.
// Por exemplo:
let pontos = Number(localStorage.getItem("userScore")) || 0;

function adicionarPontos(qtd) {
  pontos += qtd;
  localStorage.setItem("userScore", pontos);
  console.log("🏆 Pontos:", pontos);
}
