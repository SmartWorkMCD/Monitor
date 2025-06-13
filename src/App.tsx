import Dashboard from "./components/Dashboard";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import { ManagementInterfaceProvider } from "./context/ManagementInterfaceContext";

// Configure dayjs plugins once at app initialization
dayjs.extend(calendar);
dayjs.extend(relativeTime);

function App() {
	return (
			<ManagementInterfaceProvider>
					<Dashboard />
			</ManagementInterfaceProvider>
	);
}

export default App;
