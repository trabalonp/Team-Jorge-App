// URL de tu carpeta en GitHub
const repoUrl = "https://api.github.com/repos/trabalonp/Team-Jorge-App/contents/converted_json/2025/";

async function cargarEntrenos() {
  const listaDiv = document.getElementById("entrenos-list");
  listaDiv.innerHTML = "<p>Cargando entrenamientos...</p>";

  try {
    const res = await fetch(repoUrl);
    const files = await res.json();

    // Filtra solo archivos .json
    const entrenos = files.filter(f => f.name.endsWith(".json"));

    if (entrenos.length === 0) {
      listaDiv.innerHTML = "<p>No hay archivos JSON disponibles.</p>";
      return;
    }

    listaDiv.innerHTML = "<h3>Selecciona un entrenamiento:</h3>";

    entrenos.forEach(f => {
      const btn = document.createElement("button");
      btn.textContent = f.name.replace("_ACTIVITY.json", "");
      btn.onclick = () => mostrarEntreno(f.download_url);
      listaDiv.appendChild(btn);
    });
  } catch (err) {
    listaDiv.innerHTML = `<p>Error al cargar: ${err}</p>`;
  }
}

async function mostrarEntreno(url) {
  const res = await fetch(url);
  const data = await res.json();
  const df = data.records;

  document.getElementById("dashboard").style.display = "block";
  document.getElementById("entreno-titulo").innerText =
    data.activity_info?.session?.start_time || "Entrenamiento";

  // --- Estadísticas ---
  const s = data.activity_info?.session || {};
  document.getElementById("stats").innerHTML = `
    <p><strong>Deporte:</strong> ${s.sport || "Desconocido"}</p>
    <p><strong>Distancia:</strong> ${(s.total_distance / 1000).toFixed(2)} km</p>
    <p><strong>Duración:</strong> ${(s.total_elapsed_time / 60).toFixed(1)} min</p>
    <p><strong>FC Media:</strong> ${s.avg_heart_rate || "-"} ppm</p>
    <p><strong>FC Máxima:</strong> ${s.max_heart_rate || "-"} ppm</p>
    <p><strong>Calorías:</strong> ${s.total_calories || "-"} kcal</p>
  `;

  // --- Mapa ---
  const mapDiv = document.getElementById("map");
  mapDiv.innerHTML = ""; // Reset mapa
  const coords = df.filter(p => p.position_lat && p.position_long);
  if (coords.length > 0) {
    const map = L.map("map").setView([coords[0].position_lat, coords[0].position_long], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    const line = coords.map(p => [p.position_lat, p.position_long]);
    L.polyline(line, { color: "blue", weight: 4 }).addTo(map);
    L.marker(line[0]).addTo(map).bindPopup("Inicio");
    L.marker(line[line.length - 1]).addTo(map).bindPopup("Fin");
  }

  // --- Gráficas ---
  if (df.some(p => p.heart_rate)) {
    Plotly.newPlot("chart-hr", [{
      x: df.map(p => p.timestamp),
      y: df.map(p => p.heart_rate),
      type: "scatter",
      mode: "lines",
      line: { color: "red" }
    }], { title: "Frecuencia cardíaca (ppm)" });
  }

  if (df.some(p => p.altitude)) {
    Plotly.newPlot("chart-alt", [{
      x: df.map(p => p.timestamp),
      y: df.map(p => p.altitude),
      type: "scatter",
      mode: "lines",
      line: { color: "green" }
    }], { title: "Altitud (m)" });
  }

  if (df.some(p => p.speed)) {
    Plotly.newPlot("chart-speed", [{
      x: df.map(p => p.timestamp),
      y: df.map(p => p.speed),
      type: "scatter",
      mode: "lines",
      line: { color: "orange" }
    }], { title: "Velocidad (m/s)" });
  }
}

// Cargar lista al inicio
cargarEntrenos();
