// Etapa 1 → Etapa 2
document.getElementById('btn-etapa1')?.addEventListener('click', () => {
  document.getElementById('etapa1').classList.add('hidden');
  document.getElementById('etapa2').classList.remove('hidden');
});

// Mostra simulador ao clicar numa opção da Etapa 2
function mostrarSimulador() {
  document.getElementById('etapa2').classList.add('hidden');
  document.getElementById('etapa-simulador').classList.remove('hidden');

  // Espera o navegador renderizar antes de iniciar o gráfico
  setTimeout(() => {
    iniciarGrafico();
  }, 50);
}

document.querySelectorAll('.proxima').forEach(btn => {
  btn.addEventListener('click', mostrarSimulador);
});

// Carregamento antes da Etapa 3
function iniciarLoading() {
  document.getElementById('etapa-simulador').classList.add('hidden');
  document.getElementById('etapa-loading').classList.remove('hidden');

  let barra = document.getElementById('barra-loading');
  let percent = document.getElementById('percent-loading');
  let progresso = 0;

  let intervalo = setInterval(() => {
    progresso += 5;
    barra.style.width = progresso + "%";
    percent.textContent = progresso + "%";

    if (progresso >= 100) {
      clearInterval(intervalo);
      setTimeout(() => {
        document.getElementById('etapa-loading').classList.add('hidden');
        document.getElementById('etapa3').classList.remove('hidden');
      }, 500);
    }
  }, 200);
}
