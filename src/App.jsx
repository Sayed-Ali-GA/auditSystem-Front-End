import { Routes, Route } from 'react-router-dom'

import Sidebar from './components/Admin/Sidebar/Sidebar'
import Brands from './components/Admin/Brands/Brands'
import Criteria from './components/Admin/Criteria/Criteria'
import Location from './components/Admin/Location/Location'
import OpsManager from './components/Admin/OpsManager/OpsManager'

import './App.css'


function App() {

  return (
    <div className="app">

      <Sidebar />

      <main className="content">

        <Routes>

          <Route 
            path="/brands" 
            element={<Brands />}
          />

          <Route 
            path="/criteria" 
            element={<Criteria />}
          />

          <Route 
            path="/location" 
            element={<Location />}
          />  

          <Route 
            path="/opsmanagers" 
            element={<OpsManager />}
          />  


          <Route
            path="*"
            element={<h1>404 Not Found</h1>}
          />  
        </Routes>

      </main>

    </div>
  )
}

export default App