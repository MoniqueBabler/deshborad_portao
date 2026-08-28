const DATA_URL = "dados.csv";

async function carregarDados() {
  const resposta = await fetch(DATA_URL);

  if (!resposta.ok) {
    throw new Error("Não foi possível carregar o arquivo dados.csv.");
  }

  const csv = await resposta.text();
  return csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map(linha => {
      const [data, hora, semana] = linha.split(";");
      return {
        data,
        hora,
        semana: Number(semana)
      };
    });
}

function agruparPorData(registros) {
  const agrupado = {};

  registros.forEach(registro => {
    agrupado[registro.data] = (agrupado[registro.data] || 0) + 1;
  });

  return agrupado;
}

function agruparPorSemana(registros) {
  const agrupado = {};

  registros.forEach(registro => {
    agrupado[registro.semana] = (agrupado[registro.semana] || 0) + 1;
  });

  return agrupado;
}

function criarGraficoDiario(dados) {
  const ctx = document.getElementById("graficoDiario");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(dados),
      datasets: [{
        label: "Aberturas",
        data: Object.values(dados),
        backgroundColor: "#dc4e89",
        borderRadius: 3,
        maxBarThickness: 20
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: contexto => `${contexto.raw} aberturas`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: true,
            maxTicksLimit: 16,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 55,
          ticks: {
            stepSize: 10
          },
          grid: {
            color: "#dfe4e8"
          },
          title: {
            display: true,
            text: "Aberturas"
          }
        }
      }
    }
  });
}

function criarGraficoSemanal(dados) {
  const ctx = document.getElementById("graficoSemanal");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(dados).map(semana => `Semana ${semana}`),
      datasets: [{
        label: "Aberturas",
        data: Object.values(dados),
        backgroundColor: "#dc4e89",
        borderRadius: 3,
        maxBarThickness: 55
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: contexto => `${contexto.raw} aberturas`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 190,
          ticks: {
            stepSize: 20
          },
          grid: {
            color: "#dfe4e8"
          },
          title: {
            display: true,
            text: "Aberturas"
          }
        }
      }
    }
  });
}

function preencherTabela(registros) {
  const tbody = document.getElementById("tabelaRegistros");


    .slice(-20)
    .reverse()
    .forEach(registro => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${registro.data}</td>
        <td>${registro.hora}</td>
        <td>${registro.semana}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function iniciarDashboard() {
  try {
    const registros = await carregarDados();

    const diario = agruparPorData(registros);
    const semanal = agruparPorSemana(registros);

    document.getElementById("totalMes").textContent = registros.length;

    criarGraficoDiario(diario);
    criarGraficoSemanal(semanal);
    preencherTabela(registros);
  } catch (erro) {
    console.error(erro);
    document.querySelector(".dashboard").innerHTML = `
      <section class="chart-card">
        <h2>Erro ao carregar o dashboard</h2>
        <p>Verifique se o arquivo <strong>dados.csv</strong> está na mesma pasta e abra o projeto por um servidor local.</p>
      </section>
    `;
  }
}

iniciarDashboard();