import Dashboard from "./components/Dashboard";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";

// Configure dayjs plugins once at app initialization
dayjs.extend(calendar);
dayjs.extend(relativeTime);

function App() {
	return <Dashboard />;
}

export default App;
