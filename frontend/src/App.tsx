import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LobbyPage from './pages/LobbyPage'
import CreateRoomPage from './pages/CreateRoomPage'
import RoomPage from './pages/RoomPage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/lobby/create" element={<CreateRoomPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/game/:roomId" element={<GamePage />} />
        <Route path="/result/:roomId" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
