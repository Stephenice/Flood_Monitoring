import { API_URL } from "./config.js";
import { getJSON } from "./helper.js";
import Chart from "chart.js/auto";
// import "core-js/stable";
// import "regenerator-runtime/runtime.js";

const stationSelect = document.getElementById("station-select");
const showDataBtn = document.getElementById("show-data-btn");
const lineChart = document.getElementById("line-chart");
const readingsTable = document.getElementById("readings-table");
const statisticsSection = document.getElementById("statistics-section");
const contentHeadline = document.querySelector(".content_headline");

const tableWrapper = document.querySelector(".table_wrapper");
const search_box = document.querySelector(".search_box");
const spinner = document.getElementById("spinner");

// show or hide spinner
function toggleSpinner(show, elementSelected) {
  spinner.style.display = show ? "block" : "none";
  elementSelected.style.display = show ? "none" : "flex";
}

// fetch stations and populate select options
async function fetchAndPopulateStations() {
  try {
    toggleSpinner(true, search_box);

    const data = await getJSON(`${API_URL}?_view=full`);
    console.log("alphabet", data.items);

    data.items.map((station) => {
      const option = document.createElement("option");
      option.value = station.stationReference;
      option.textContent = station.label;
      stationSelect.appendChild(option);
    });

    toggleSpinner(false, search_box);
  } catch (error) {
    throw error;
  }
}

fetchAndPopulateStations();

// fetch data for selected station
async function fetchSelectedStationData() {
  try {
    const selectedStation = stationSelect.value;
    if (selectedStation === "0") return;
    // console.log("alphabet2", selectedStation);
    // const now = new Date().toISOString().split("T")[0];
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const data = await getJSON(
      `${API_URL}/${selectedStation}/readings?_sorted&since=${last24Hours}`
    );
    // const response = await fetchData(url);

    return data.items;
  } catch (error) {
    throw error;
  }
}

// Event listener for show data button click
showDataBtn.addEventListener("click", async () => {
  try {
    toggleSpinner(true, tableWrapper);
    const data = await fetchSelectedStationData();
    console.log("alphabet3", data);

    if (!data) return;

    if (window.myChart) window.myChart.destroy();

    const timestamps = [];
    const values = [];

    data.forEach((item) => {
      timestamps.push(new Date(item.dateTime).toLocaleString());
      values.push(item.value);
    });

    // Display chart
    lineChartDisplay(timestamps, values);

    // Display headline
    contentHeadline.textContent = `Readings for the Last 24 Hours`;

    // Display table of readings
    readingTableDisplay(timestamps, values);

    // Calculate statistics
    statisticsCalculationDisplay(values);

    toggleSpinner(false, tableWrapper);
  } catch (error) {
    throw error;
    // console.error("Error fetching station data:", error);
  }
});

function lineChartDisplay(timestamps, values) {
  // Create line chart
  window.myChart = new Chart(lineChart, {
    type: "line",
    data: {
      labels: timestamps,
      datasets: [
        {
          label: "Readings",
          data: values,
          fill: false,
          borderColor: "#174DFC",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Timestamp",
          },
        },
        y: {
          title: {
            display: true,
            text: "Reading Value",
          },
        },
      },
    },
  });
}

function readingTableDisplay(timestamps, values) {
  let tableHTML = "";
  readingsTable.textContent = "";

  timestamps.forEach((timestamp, index) => {
    tableHTML += `<tr><td>${timestamp}</td><td>${values[index]}</td></tr>`;
  });

  let html = `<table class="table-fill">
                <tr><th>Timestamp</th><th>Value</th></tr> 
                ${tableHTML}
                </table>`;

  readingsTable.insertAdjacentHTML("beforeend", html);
}

function statisticsCalculationDisplay(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((acc, val) => acc + val, 0) / values.length;
  statisticsSection.textContent = "";

  const html = `
              <table class="table-fill">
              <thead>
                  <tr>
                  <th class="no_border">Statistics</th>
                  <th colspan="1"></th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Min Value</td>
                      <td>${min}</td>
                  </tr>
                  <tr>
                      <td>Max Value</td>
                      <td>${max}</td>
                  </tr>
                  <tr>
                      <td>Average Value</td>
                      <td>${average.toFixed(2)}</td>
                  </tr>
              </tbody>
            </table>
  `;

  statisticsSection.insertAdjacentHTML("beforeend", html);
}
