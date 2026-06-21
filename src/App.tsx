import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Finance from './pages/Finance'
import Squad from './pages/Squad'
import TransferMarket from './pages/TransferMarket'
import ManagerOffice from './pages/ManagerOffice'
import League from './pages/League'
import News from './pages/News'
import AGM from './pages/AGM'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="finance" element={<Finance />} />
          <Route path="squad" element={<Squad />} />
          <Route path="transfers" element={<TransferMarket />} />
          <Route path="manager" element={<ManagerOffice />} />
          <Route path="league" element={<League />} />
          <Route path="news" element={<News />} />
          <Route path="agm" element={<AGM />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
