import { AlertTriangle } from 'lucide-react';
import dayjs from "dayjs";

const WarningsComponent = ({warnings}: {
    warnings: { id: number, severity: string, message: string, timestamp: number }[]
}) => {
    return (
        <div className=" bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Warning Journal</h2>

          <div className="overflow-y-auto">
            {warnings.map(warning => (
              <div
                key={warning.id}
                className={`mb-3 p-3 rounded-lg border-l-4 ${
                  warning.severity === 'high' ? 'border-red-500 bg-red-50' :
                  warning.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start">
                  <AlertTriangle
                    size={18}
                    className={`mr-2 mt-0.5 ${
                      warning.severity === 'high' ? 'text-red-500' :
                      warning.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`}
                  />
                  <div>
                    <div className="font-medium text-gray-800">{warning.message}</div>
                    <div className="text-xs text-gray-500 mt-1 text-left">{dayjs(warning.timestamp).calendar(null)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100">
            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors">
              View All Alerts
            </button>
          </div>
        </div>
    )
}

export default WarningsComponent
