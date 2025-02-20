  import React, { useEffect, useState, useRef } from "react";
  import { db } from "../firebase";
  import { collection, onSnapshot } from "firebase/firestore";
  import Chart from "chart.js/auto";

  const GraficoFirestore = ({
    selectedDate,
    setSelectedMarker,
    setSelectedPoint,
    selectedMarker,
    selectedPointIndex,
    setSelectedPointIndex,
  }) => {

    const [chartData, setChartData] = useState({
      labels: [],
      temperaturaData: [],
      humedadData: [],
    });

    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const prevDataRef = useRef(chartData);
    

    useEffect(() => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      const formattedDate = `${year}-${month}-${day}`;

      const sensorCollectionRef = collection(db, "datalogger", formattedDate, "Sensor_y_GPS");

      const unsubscribe = onSnapshot(sensorCollectionRef, (snapshot) => {
        const rawData = snapshot.docs
    .map((doc) => doc.data())
    .filter((item) => item.latitud !== 0 && item.longitud !== 0);

        const formatTime = (time) => {
          const [hours, minutes, seconds] = time.split(":").map((unit) => parseInt(unit, 10));
          const pad = (num) => String(num).padStart(2, "0");
          return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      };
      
      // Convertir la hora a segundos para ordenar correctamente
      const convertTimeToSeconds = (time) => {
          const [hours, minutes, seconds] = time.split(":").map((unit) => parseInt(unit, 10));
          return hours * 3600 + minutes * 60 + seconds;
      };
      
      // Ordenar los datos basados en el tiempo en segundos
      const sortedData = rawData.sort((a, b) => convertTimeToSeconds(a.hora.trim()) - convertTimeToSeconds(b.hora.trim()));
      
      // Formatear las horas después de ordenar
      const newLabels = sortedData.map((item) => formatTime(item.hora.trim()));
      


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
    }, [selectedDate]);

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
              label: "T°",
              data: chartData.temperaturaData,
              borderColor: "rgba(239, 68, 68, 1)", // rojo tailwind-500
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              tension: 0.4,
              pointBackgroundColor: chartData.temperaturaData.map((_, index) =>
                index === selectedPointIndex ? "rgba(168, 85, 247, 0.2)" : "rgba(239, 68, 68, 0.2)"
              ),
              pointBorderColor: chartData.temperaturaData.map((_, index) =>
                index === selectedPointIndex ? "rgba(168, 85, 247, 1)" : "rgba(239, 68, 68, 1)"
              ),
              pointBorderWidth: chartData.temperaturaData.map((_, index) =>
                index === selectedPointIndex ? 4 : 1
              ),
            },
            {
              label: "Humedad (%)",
              data: chartData.humedadData,
              borderColor: "rgba(59, 130, 246, 1)", // azul tailwind-500
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.4,
              pointBackgroundColor: chartData.humedadData.map((_, index) =>
                index === selectedPointIndex ? "rgba(168, 85, 247, 0.2)" : "rgba(59, 130, 246, 0.2)"
              ),
              pointBorderColor: chartData.humedadData.map((_, index) =>
                index === selectedPointIndex ? "rgba(168, 85, 247, 1)" : "rgba(59, 130, 246, 1)"
              ),
              pointBorderWidth: chartData.humedadData.map((_, index) =>
                index === selectedPointIndex ? 4 : 1
              ),
            },
          ],
      
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          onClick: (_, elements) => {
            if (elements.length > 0 && setSelectedMarker) {
              const index = elements[0].index;
              const time = chartData.labels[index];       
              setSelectedPointIndex(index);
              const chosen = {
                hora: time,
                temperatura: chartData.temperaturaData[index],
                humedad: chartData.humedadData[index],
              };
              setSelectedPoint(null);  // Aquí se llama incorrectamente la función
              setSelectedMarker(chosen);  // Aquí se llama correctamente la función
            }
          },
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
              hoverRadius: 10,
            },
          },
        },
      });
    }, [chartData, selectedPointIndex, setSelectedMarker, setSelectedPoint, setSelectedPointIndex]);

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
