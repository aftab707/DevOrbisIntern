import { useState, useEffect } from 'react'

function App() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data from FastAPI backend
    fetch('http://localhost:8000/api/appointments')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(error => {
        console.error("Error fetching appointments:", error)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">AI Receptionist</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dashboard Stats / Info */}
            <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 md:col-span-1">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Voice Agent Status
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Vapi Agent is ready to take calls.</p>
                </div>
                <div className="mt-5">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Test Call (Vapi Web Widget)
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white overflow-hidden shadow rounded-lg col-span-1 md:col-span-2">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Appointments
                </h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {loading ? (
                  <li className="px-4 py-4 sm:px-6 text-gray-500">Loading appointments...</li>
                ) : appointments.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-gray-500">No upcoming appointments.</li>
                ) : (
                  appointments.map((apt) => (
                    <li key={apt.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {apt.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {apt.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {apt.date} at {apt.time}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default App
