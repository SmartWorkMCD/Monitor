import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Thermometer, Droplets, Zap } from "lucide-react";
import StatusBadge from "./StatusBadge";
const SensorsComponent = ({
  sensorData,
}: {
  sensorData: {
    temperature: number;
    humidity: number;
    pressure: number;
    powerUsage: number;
    status: string;
  };
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="col-span-1 row-span-1 bg-white rounded-lg shadow-md p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Sensor Dashboard</h2>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {currentTime.toLocaleDateString()} |{" "}
          {currentTime.toLocaleTimeString()}
        </div>
        <StatusBadge status={sensorData.status as "Operational" | "Warning" | "Critical"} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Thermometer size={18} className="text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Temperature
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-blue-700">
              {sensorData.temperature}
            </span>
            <span className="ml-1 text-gray-500">°C</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-green-600">
            <ArrowDown size={12} />
            <span>1.2° from last hour</span>
          </div>
        </div>

        <div className="bg-teal-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Droplets size={18} className="text-teal-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Humidity</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-teal-700">
              {sensorData.humidity}
            </span>
            <span className="ml-1 text-gray-500">%</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-red-600">
            <ArrowUp size={12} />
            <span>3% from last hour</span>
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Pressure</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-purple-700">
              {sensorData.pressure}
            </span>
            <span className="ml-1 text-gray-500">mmHg</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-600">
            <span>Stable</span>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="flex items-center mb-2">
            <Zap size={18} className="text-amber-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Power</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-amber-700">
              {sensorData.powerUsage}
            </span>
            <span className="ml-1 text-gray-500">kW</span>
          </div>
          <div className="flex items-center mt-1 text-xs text-green-600">
            <ArrowDown size={12} />
            <span>0.3kW from yesterday</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <div className="font-medium">System Notes:</div>
        <p>
          All systems functioning within normal parameters. Scheduled
          maintenance in 3 days.
        </p>
      </div>
    </div>
  );
};

export default SensorsComponent;
