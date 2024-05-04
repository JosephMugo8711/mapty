
import './App.css'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router-dom'



function App() {

  return (
    <>
      <Routes>
          <Route path="/" element={<Layout />}>
          </Route>
      </Routes>
   
    </>
  )
}

export default App
