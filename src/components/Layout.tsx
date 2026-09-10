import { Link, NavLink } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ScenarioId } from '../types'
import { FloatingActionMenu } from './FloatingActionMenu'

export function Layout({
  children,
  savedCount,
  activeScenario,
  onScenarioChange,
}: {
  children: ReactNode
  savedCount: number
  activeScenario: ScenarioId
  onScenarioChange: (scenario: ScenarioId) => void
}) {
  return (
    <div className="app-shell">
      <header className="global-nav">
        <div className="global-nav-inner">
          <Link to="/" className="logo">
            <Sparkles size={14} />
          </Link>
          <nav className="global-nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/console">Console</NavLink>
            <NavLink to="/saved">Saved Work</NavLink>
          </nav>
          <span className="meta">{savedCount} saved</span>
        </div>
      </header>

      <div className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="product-title">
            Intent OS
          </Link>
          <nav className="page-nav-links">
            <NavLink to="/" end>
              Overview
            </NavLink>
            <NavLink to="/console">AI Console</NavLink>
            <NavLink to="/saved">Saved Work</NavLink>
          </nav>
        </div>
      </div>

      <main>{children}</main>
      <FloatingActionMenu
        activeScenario={activeScenario}
        onScenarioChange={onScenarioChange}
      />
    </div>
  )
}
