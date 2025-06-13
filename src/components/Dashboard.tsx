import Tasks from "./Tasks";
import Warnings from "./Warnings";
import Sensors from "./Sensors";
import ConnectionStatus from "./ConnectionStatus";
import { useManagementInterface } from "../context/ManagementInterfaceContext";

const Dashboard = () => {
  const { sensorData, tasks, warnings, isConnected } = useManagementInterface();

  return (
    <div className="h-screen bg-gray-100 p-4" data-testid="dashboard-container">
      <ConnectionStatus isConnected={isConnected} />

      <div
        className="grid grid-cols-1 lg:grid-cols-3 grid-rows-1 lg:grid-rows-3 gap-4 h-full"
        data-testid="dashboard-grid"
      >
        <div className="lg:col-span-2 lg:row-span-3" data-testid="tasks-section">
          <Tasks tasks={tasks} />
        </div>

        <div className="lg:row-span-1" data-testid="sensors-section">
          <Sensors sensorData={sensorData} />
        </div>

        <div className="lg:row-span-2" data-testid="warnings-section">
          <Warnings warnings={warnings} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
