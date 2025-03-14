import Tasks from './Tasks';
import Warnings from './Warnings';
import Sensors from './Sensors';

import sensorData from "../mocks/sensorData.json";
// Mock warnings
import warnings from "../mocks/warnings.json";
// Mock tasks
import tasks from "../mocks/tasks.json";


const IndustrialDashboard = () => {

  return (
    <div className="h-screen bg-gray-100 p-4">
      <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full">
        <div className="col-span-2 row-span-3">
          <Tasks tasks={tasks} />
        </div>
        <Sensors sensorData={sensorData} />
        <div className="row-span-2">
          <Warnings warnings={warnings} />
        </div>
      </div>
    </div>
  );
};

export default IndustrialDashboard;
