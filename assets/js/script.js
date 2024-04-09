const apiUrl = 'https://mindicador.cl/api/';
let chartInstance = null;

const fetchDataFromApi = async (url) => {
    try {
        const response = await fetch(url);
        const coinsData = await response.json();
        const coinsSelect = document.querySelector('#coinsSelect');
        coinsSelect.innerHTML = `<option value="" disabled selected>--Seleccione una moneda--</option>`;
        Object.entries(coinsData).forEach(([coinKey, coin]) => {
            if (coin.unidad_medida === 'Pesos') {
                coinsSelect.innerHTML += `<option value="${coinKey}">${coin.nombre}</option>`;
            }
        });
    } catch (error) {
        console.error('Error al obtener datos de la API:', error);
    }
}

const fetchCurrencyData = async (currencyName) => {
    try {
        const response = await fetch(`${apiUrl}${currencyName}`);
        const coinData = await response.json();
        return coinData.serie.slice(0, 10).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        // Ordenar las fechas de menor a mayor
    } catch (error) {
        console.error('Error al obtener datos de la moneda:', error);
    }
}

const fetchCurrencyPrice = async (currencyName) => {
    try {
        const response = await fetch(`${apiUrl}${currencyName}`);
        const coin = await response.json();
        return coin.serie[0].valor;
    } catch (error) {
        console.error('Error al obtener precio de la moneda:', error);
    }
}

const renderChart = async (currencyName) => {
    try {
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        const currencyDates = await fetchCurrencyData(currencyName);
        const labels = currencyDates.map(coinDate => {
            const date = new Date(coinDate.fecha);
            return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
            // Formato año, mes, día (YYYY-MM-DD)
        });
        const data = currencyDates.map(coinDate => coinDate.valor);
        const datasets = [{
            label: "Historial últimos 10 días",
            borderColor: "rgb(255, 99, 132)",
            data
        }];
        const chartData = { labels, datasets };
        const ctx = document.getElementById("currencyChart").getContext('2d');
        ctx.canvas.style.backgroundColor = 'white';
        const options = {
            type: "line",
            data: chartData
        };

        chartInstance = new Chart(ctx, options);
    } catch (error) {
        console.error('Error al renderizar el gráfico:', error);
    }
}

const calculate = async () => {
    try {
        const clpValue = document.querySelector('#clpInput').value;
        const currencyName = document.querySelector('#coinsSelect').value;
        const currencyPrice = await fetchCurrencyPrice(currencyName);
        const calculation = (clpValue / currencyPrice).toFixed(3);
        document.querySelector('#resultContainer').innerHTML = `<label>Resultado: ${calculation}</label>`;
    } catch (error) {
        console.error('Error al calcular:', error);
    }
}

document.querySelector('#calculateButton').addEventListener('click', calculate);

document.querySelector('#coinsSelect').addEventListener('change', async (event) => {
    const currency = event.target.value;
    await renderChart(currency);
});

fetchDataFromApi(apiUrl);
