import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Chart from "chart.js/auto";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThermometerHalf, faTint } from "@fortawesome/free-solid-svg-icons";

const GraficoFirestore = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    temperaturaData: [],
    humedadData: [],
  });

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const prevDataRef = useRef(chartData);

  useEffect(() => {
    const sensorCollectionRef = collection(db, "datalogger", "2025-2-7", "Sensor_y_GPS");

    const unsubscribe = onSnapshot(sensorCollectionRef, (snapshot) => {
      const rawData = snapshot.docs.map((doc) => doc.data());

      // Ordenar por hora
      const sortedData = [...rawData].sort((a, b) => a.hora.localeCompare(b.hora));

      // Extraer datos ordenados
      const newLabels = sortedData.map((item) => item.hora.trim());
      const newTemperatura = sortedData.map((item) => item.temperatura);
      const newHumedad = sortedData.map((item) => item.humedad);

      // Actualizar estado solo si hay cambios
      if (
        JSON.stringify(newLabels) !== JSON.stringify(prevDataRef.current.labels) ||
        JSON.stringify(newTemperatura) !== JSON.stringify(prevDataRef.current.temperaturaData) ||
        JSON.stringify(newHumedad) !== JSON.stringify(prevDataRef.current.humedadData)
      ) {
        setChartData({
          labels: newLabels,
          temperaturaData: newTemperatura,
          humedadData: newHumedad,
        });
        prevDataRef.current = {
          labels: newLabels,
          temperaturaData: newTemperatura,
          humedadData: newHumedad,
        };
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destruir gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Crear nuevo gráfico
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "Temperatura (°C)",
            data: chartData.temperaturaData,
            borderColor: "rgba(239, 68, 68, 1)", // rojo tailwind-500
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            tension: 0.4,
          },
          {
            label: "Humedad (%)",
            data: chartData.humedadData,
            borderColor: "rgba(59, 130, 246, 1)", // azul tailwind-500
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          
          tooltip: {
            backgroundColor: "white",
            bodyColor: "#1a202c",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            titleColor: "#2d3748",
            padding: 12,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            callbacks: {
              title: (context) => `Hora: ${context[0].label}`,
            },
          },
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#4a5568",
              font: {
                size: 14,
                weight: "600",
              },
              usePointStyle: true,
              padding: 20,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#e2e8f0",
            },
            ticks: {
              color: "#4a5568",
              font: {
                size: 14,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#4a5568",
              font: {
                size: 14,
              },
            },
          },
        },
        elements: {
          line: {
            borderWidth: 2,
          },
          point: {
            radius: 3,
            hoverRadius: 6,
          },
        },
      },
    });
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-xl mx-auto max-w-7xl w-full">

      {/* Gráfico */}
      <div className="relative mx-auto w-full" style={{ height: '500px' }}>
        <canvas
          ref={chartRef}
          className="rounded-lg border border-gray-200"
        ></canvas>
      </div>
    </div>
  );
};

export default GraficoFirestore;
