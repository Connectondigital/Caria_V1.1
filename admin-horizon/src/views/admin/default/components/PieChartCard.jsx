import PieChart from "components/charts/PieChart";
import { pieChartData, pieChartOptions } from "variables/charts";
import Card from "components/card";

const PieChartCard = (props) => {
  const { data } = props;

  const pieChartOptions = {
    labels: ["Villa", "Daire", "Arsa", "Ticari"],
    colors: ["#21BFBF", "#6AD2FF", "#EFF4FB", "#707E94"],
    chart: {
      width: "50px",
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: ["#21BFBF", "#6AD2FF", "#EFF4FB", "#707E94"],
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
  };

  const pieChartData = data || [0, 0, 0, 0];

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Portföy Dağılımı
          </h4>
        </div>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        <PieChart options={pieChartOptions} series={pieChartData} />
      </div>
      <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-brand-500" />
            <p className="ml-1 text-sm font-normal text-gray-600">Villa</p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700  dark:text-white">
            {pieChartData[0]}
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#6AD2FF]" />
            <p className="ml-1 text-sm font-normal text-gray-600">Daire</p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
            {pieChartData[1]}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PieChartCard;
