import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Country Data Table</h1>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Count is {count}
        </button>
        <p className="mt-4 text-gray-600">
          Dependencies installed: Apollo GraphQL, Tailwind CSS, Formik, Recoil
        </p>
      </div>
    </div>
  )
}

export default App