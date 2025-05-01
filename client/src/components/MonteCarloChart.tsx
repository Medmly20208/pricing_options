import Chart from "react-apexcharts";

interface MonteCarloChartProps {
  data: number[][]; // [simulations][steps]
  maxPaths?: number;
}

export default function MonteCarloChart({
  data,
  maxPaths = 50,
}: MonteCarloChartProps) {
  const sliced = data.slice(0, maxPaths);

  const series = sliced.map((sim, index) => ({
    name: `Path ${index + 1}`,
    data: sim.map((value, step) => [step, value]),
  }));

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 1,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    xaxis: {
      title: { text: "Step" },
      type: "numeric",
    },
    yaxis: {
      title: { text: "Spot Price" },
      decimalsInFloat: 2,
    },
    legend: {
      show: false, // too many series clutters the legend
    },
  };

  return (
    <div style={{ maxWidth: "100%", marginTop: "2rem" }}>
      <h3>Monte Carlo Spot Price Simulations</h3>
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  );
}
