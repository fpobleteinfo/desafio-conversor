const resultadoValor = document.getElementById("valorDia");
const resultadoConversion = document.getElementById("valorConvesion");

const obtenerFecha = () => {
  const fechaHoy = new Date();
  const yyyy = fechaHoy.getFullYear();
  let mm = fechaHoy.getMonth() + 1;
  let dd = fechaHoy.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const fechaFormateada = dd + "-" + mm + "-" + yyyy;
  return fechaFormateada;
};

const mostrarTipo = () => {
  const tipoMoneda = document.getElementById("select").value;

  if (tipoMoneda === "0") {
    alert('Ingrese tipo de moneda válido');
    return;
  }  

  return tipoMoneda;
};

const ObtengoValorMonedaDelDia = async () => {
  const fechaHoy = obtenerFecha();
  const tipoMoneda = mostrarTipo();

    if(!tipoMoneda){
        return;
    }

  const urlValores = "https://mindicador.cl/api/" + tipoMoneda + "/" + fechaHoy;
  //const urlValores = 'https://mindicador.cl/api/dolar/'+fechaHoy;
  //console.log(urlValores)

  try {
    const response = await fetch(urlValores);
    if (!response.ok) throw new Error("Ocurrio un error");
    const data = await response.json();
    //return data;
    //console.log(data)

    const valorMoneda = data.serie[0].valor;
    let resultado = ``;
    //console.log(valorMoneda);
    resultado += `<h5 id="valorMonedaDia">Valor moneda al dia: $${valorMoneda}</h5>`;
    resultadoValor.innerHTML = resultado;
    resultadoConversion.innerHTML = ``; //reseteo la conversion en caso de cambiar valor del select
    return valorMoneda;
  } catch (error) {
    let resultado = ``;
    resultado += `<h4>${error}</h4>`;
    resultadoValor.innerHTML = resultado;
    resultadoConversion.innerHTML = ``;
  }
};

const convertirClp = async () => {

  const montoConvertir = document.getElementById("monto-clp").value;

  if (isNaN(montoConvertir) || montoConvertir<=0){
    alert('Ingrese valor posible');
    return;
  }

  const resultadoValor = await ObtengoValorMonedaDelDia();
  const tipoMoneda = mostrarTipo();  

  const valorConvertido = Number(montoConvertir) / Number(resultadoValor);

  if (tipoMoneda == "euro") {
    //seguramente existe una mejor manera de hacer esto...

    let resultado = ``;
    resultado += `<h3>Resultado: EU $${valorConvertido.toFixed(2)}</h3>`;
    resultadoConversion.innerHTML = resultado;
    mostrarGrafico(tipoMoneda);
  }

  if (tipoMoneda == "dolar") {
    let resultado = ``;
    resultado += `<h3>Resultado: US $${valorConvertido.toFixed(2)}</h3>`;
    resultadoConversion.innerHTML = resultado;
    mostrarGrafico(tipoMoneda);
  }
};

const crearGrafico = async (tipoMoneda) => {
  const resultado = await fetch("https://mindicador.cl/api/"+tipoMoneda);
  const valores = await resultado.json();

  const valores10 = valores.serie.slice(0, 10); //para mostrar los ultimos 10


  const labels = valores10.map((serie) => {
    const fecha = serie.fecha;
    return fecha.slice(0, 10); //para mostrar solo formato de fecha
  });

  const data = valores10.map((serie) => {
    return serie.valor;
  });

  const datasets = [
    {
      label: "Movimiento ultimos 10 dias "+tipoMoneda,
      borderColor: "rgb(165, 190, 0)",
      data,
    },
  ];
  return { labels, datasets };
};


async function mostrarGrafico(tipoMoneda) {
  const data = await crearGrafico(tipoMoneda);

  const config = {
    type: "line",
    data,
  };
  const myChart = document.getElementById("myChart");

  if (myChart) {
    const chartInstance = Chart.getChart(myChart);
    if (chartInstance) {
      chartInstance.destroy();
    }
  }    

  myChart.style.backgroundColor = "white";
  new Chart(myChart, config);
}
