// Etapa 1 → Etapa 2
document.getElementById('btn-etapa1').addEventListener('click', () => {
  document.getElementById('etapa1').classList.add('hidden');
  document.getElementById('etapa2').classList.remove('hidden');
});

let animacao;

// Config do canvas
const WIDTH = 400;
const HEIGHT = 150;
const PADDING = 8;
const GAP = 8;
const CANDLE_WIDTH = 18;
const FIXOS = 6;

// Estado do gráfico
let tendenciaAlta, preco;
let tempoUltimaTroca = 0, ultimoUpdate = 0;
let candles = [];
let live;

// Estado da operação
let operacaoAtiva = false;
let tipoOperacao = null;
let precoEntrada = 0;
let lucroPrejuizo = 0;
let saldoAcumulado = 0;
let operacoesZeradas = 0;

// Som de ordem executada
const somOrdem = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');

// Função de escala Y
function yFor(price, minP, maxP) {
  if (maxP - minP < 0.001) maxP = minP + 0.001;
  const usableH = HEIGHT - 2 * PADDING;
  const t = (price - minP) / (maxP - minP);
  return HEIGHT - PADDING - t * usableH;
}

// Inicia gráfico
function iniciarGrafico() {
  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d');

  ctx.canvas.width = WIDTH;
  ctx.canvas.height = HEIGHT;

  tendenciaAlta = Math.random() > 0.5;
  preco = 5500;
  candles = [];
  tempoUltimaTroca = Date.now();
  ultimoUpdate = Date.now();

  for (let i = 0; i < FIXOS; i++) {
    candles.push({ open: preco, high: preco, low: preco, close: preco, inicio: Date.now() });
  }
  live = { open: preco, high: preco, low: preco, close: preco, inicio: Date.now() };

  function atualizar() {
    const agora = Date.now();
    if (agora - ultimoUpdate >= 250) {
      ultimoUpdate = agora;

      if (agora - tempoUltimaTroca > 5000) {
        tendenciaAlta = !tendenciaAlta;
        tempoUltimaTroca = agora;
      }

      let variacao = (Math.random() - 0.5) * 0.6;
      variacao += tendenciaAlta ? 0.08 : -0.08;
      const ruido = Math.sin(agora / 500) * 0.12;
      let novo = live.close + variacao + ruido;

      const faixa = 18;
      if (novo > preco + faixa) novo = preco + faixa;
      if (novo < preco - faixa) novo = preco - faixa;
      novo = Math.round(novo * 2) / 2;

      live.close = novo;
      if (novo > live.high) live.high = novo;
      if (novo < live.low) live.low = novo;

      if (agora - live.inicio >= 5000) {
        candles.push({ ...live });
        if (candles.length > FIXOS) candles.shift();
        live = { open: novo, high: novo, low: novo, close: novo, inicio: agora };
      }

      preco = novo;
      document.getElementById('preco-atual').textContent = "Preço: " + preco.toFixed(2);

      if (operacaoAtiva) {
        lucroPrejuizo = tipoOperacao === 'comprar'
          ? (preco - precoEntrada) * 10
          : (precoEntrada - preco) * 10;

        document.getElementById('lucro-prejuizo').textContent =
          "Resultado: R$ " + (saldoAcumulado + lucroPrejuizo).toFixed(2);
      }
    }
  }

  function desenhar() {
    atualizar();

    const todos = [...candles, live];
    let minP = todos.reduce((m, c) => Math.min(m, c.low), Infinity);
    let maxP = todos.reduce((m, c) => Math.max(m, c.high), -Infinity);
    minP -= 0.8;
    maxP += 0.8;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Fundo
    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, "#0b0b11");
    bg.addColorStop(1, "#141422");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Linhas horizontais
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      const y = PADDING + (i * (HEIGHT - 2 * PADDING)) / 4;
      ctx.moveTo(PADDING, y);
      ctx.lineTo(WIDTH - PADDING, y);
    }
    ctx.stroke();

    // Candles
    let x = PADDING;
    const passo = CANDLE_WIDTH + GAP;

    function drawCandle(c) {
      const openY = yFor(c.open, minP, maxP);
      const closeY = yFor(c.close, minP, maxP);
      const highY = yFor(c.high, minP, maxP);
      const lowY = yFor(c.low, minP, maxP);
      const up = c.close >= c.open;
      const cor = up ? "#00ff88" : "#ff4444";

      ctx.strokeStyle = cor;
      ctx.beginPath();
      ctx.moveTo(x + CANDLE_WIDTH / 2, highY);
      ctx.lineTo(x + CANDLE_WIDTH / 2, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(closeY - openY));
      const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyH);
      grad.addColorStop(0, up ? "#16ffa1" : "#ff6a6a");
      grad.addColorStop(1, up ? "#067a58" : "#7a1e1e");
      ctx.fillStyle = grad;
      ctx.fillRect(x, bodyTop, CANDLE_WIDTH, bodyH);
    }

    candles.forEach(c => { drawCandle(c); x += passo; });
    drawCandle(live);

    // Linha e box de preço
    const yAtual = yFor(live.close, minP, maxP);
    const boxW = 70, boxH = 18;
    const boxX = WIDTH - PADDING - boxW;
    const boxY = yAtual - boxH / 2;

    ctx.strokeStyle = "rgba(255, 204, 0, 0.7)";
    ctx.beginPath();
    ctx.moveTo(x + CANDLE_WIDTH + 2, yAtual);
    ctx.lineTo(WIDTH - PADDING - boxW - 6, yAtual);
    ctx.stroke();

    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(WIDTH - PADDING - boxW - 10, yAtual, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1f1f2e";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#ffcc00";
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(live.close.toFixed(2), boxX + 8, boxY + boxH / 2);

    // Botão Zerar abaixo do box do preço
    const btnZerar = document.getElementById('btn-zerar');
    if (operacaoAtiva) {
      btnZerar.textContent = `Zerar (R$${lucroPrejuizo.toFixed(2)})`;
      btnZerar.style.position = 'absolute';
      btnZerar.style.left = `${boxX + boxW / 2}px`; // centralizado
      btnZerar.style.top = `${boxY + boxH + 25}px`; // abaixo do box
      btnZerar.style.transform = 'translateX(-50%)';
      btnZerar.style.display = 'block';
      btnZerar.style.backgroundColor = lucroPrejuizo >= 0 ? '#00cc66' : '#cc3333';
    } else {
      btnZerar.style.display = 'none';
    }

    animacao = requestAnimationFrame(desenhar);
  }

  desenhar();
}

// Entrar / zerar operação
function entrarOuSairOperacao(acao) {
  if (!operacaoAtiva && (acao === 'comprar' || acao === 'vender')) {
    operacaoAtiva = true;
    tipoOperacao = acao;
    precoEntrada = preco;

    document.getElementById('btn-comprar').style.display = 'none';
    document.getElementById('btn-vender').style.display = 'none';
    document.getElementById('btn-zerar-extra')?.classList.remove('hidden');

    somOrdem.currentTime = 0;
    somOrdem.play();
  } else if (acao === 'zerar' && operacaoAtiva) {
    operacaoAtiva = false;

    // Feedback visual flutuante
const grafico = document.getElementById('grafico');
const rect = grafico.getBoundingClientRect();
const float = document.createElement('div');
float.className = 'float-feedback';
float.textContent = (lucroPrejuizo >= 0 ? '+ R$ ' : '– R$ ') + Math.abs(lucroPrejuizo).toFixed(2);
float.style.backgroundColor = lucroPrejuizo >= 0 ? '#00cc66' : '#cc3333';
float.style.left = `${rect.left + rect.width - 90}px`;
float.style.top = `${rect.top + rect.height / 2}px`;
document.body.appendChild(float);
setTimeout(() => float.remove(), 1600);


    // Atualiza saldo e limpa operação
    saldoAcumulado += lucroPrejuizo;
    lucroPrejuizo = 0;

    document.getElementById('btn-comprar').style.display = 'inline-block';
    document.getElementById('btn-vender').style.display = 'inline-block';
    document.getElementById('btn-zerar').style.display = 'none';
    document.getElementById('btn-zerar-extra')?.classList.add('hidden');

    document.getElementById('lucro-prejuizo').textContent =
      "Resultado: R$ " + saldoAcumulado.toFixed(2);

    // Fluxo para etapa de loading após 3 operações
    operacoesZeradas++;
    if (operacoesZeradas >= 3) {
      iniciarLoading(); // vem do fluxo.js
    }
  }
}

// Mostra simulador
function mostrarSimulador() {
  document.getElementById('etapa2').classList.add('hidden');
  document.getElementById('etapa-simulador').classList.remove('hidden');
  setTimeout(() => iniciarGrafico(), 50);
}

// Eventos
document.querySelectorAll('.proxima').forEach(btn => {
  btn.addEventListener('click', mostrarSimulador);
});
document.getElementById('btn-comprar')?.addEventListener('click', () => entrarOuSairOperacao('comprar'));
document.getElementById('btn-vender')?.addEventListener('click', () => entrarOuSairOperacao('vender'));
document.getElementById('btn-zerar')?.addEventListener('click', () => entrarOuSairOperacao('zerar'));
document.getElementById('btn-zerar-extra')?.addEventListener('click', () => entrarOuSairOperacao('zerar'));
