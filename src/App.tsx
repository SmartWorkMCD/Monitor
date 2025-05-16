import './App.css'

import Dashboard from './components/Dashboard'

import dayjs from "dayjs";
import calendar from 'dayjs/plugin/calendar'
 import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(calendar);
dayjs.extend(relativeTime);

function App() {
  return (
    <Dashboard />
  )
}

export default App
