
import './App.css'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router-dom'
import Form from './components/Form'


function App() {

  return (
    <>
      <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="form" element={<Form />} />
          </Route>
      </Routes>
   
    </>
  )
}

export default App
