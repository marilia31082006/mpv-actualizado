const token = localStorage.getItem("token");

fetch("https://SEU_BACKEND.vercel.app/dashboard/empresa", {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  document.getElementById("passengers").innerText = data.passengers;

  new Chart(fleetChart, {
    type: "line",
    data: {
      labels: data.fleet.labels,
      datasets: [{ data: data.fleet.values }]
    }
  });

  new Chart(passengerChart, {
    type: "doughnut",
    data: {
      labels: ["Ativos", "Inativos"],
      datasets: [{ data: data.passenger_ratio }]
    }
  });

  new Chart(routesChart, {
    type: "bar",
    data: {
      labels: data.routes.labels,
      datasets: [{ data: data.routes.values }]
    }
  });

  const alerts = document.getElementById("alerts");
  data.alerts.forEach(a => {
    const li = document.createElement("li");
    li.textContent = a;
    alerts.appendChild(li);
  });
});
