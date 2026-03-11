import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import GameScreen from './components/GameScreen'
import Insights from './components/Insights'
import AnimalGame from './components/AnimalGame'
import MathGame from './components/MathGame'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/game/animals" element={<AnimalGame />} />
        <Route path="/game/math" element={<MathGame />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </BrowserRouter>
  )
}
