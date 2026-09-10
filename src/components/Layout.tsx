import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { CustomProfile, ScenarioId } from '../types'
import { FloatingActionMenu } from './FloatingActionMenu'

export function Layout({
  children,
  activeScenario,
  customProfile,
  onScenarioChange,
  onSaveCustomProfile,
  onRunDemo,
}: {
  children: ReactNode
  activeScenario: ScenarioId
  customProfile: CustomProfile
  onScenarioChange: (scenario: ScenarioId) => void
  onSaveCustomProfile: (profile: CustomProfile) => void
  onRunDemo: () => void
}) {
  return (
    <div className={`app-shell theme-${activeScenario}`}>
      <div className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="product-title">
            Intent OS
          </Link>
          <nav className="page-nav-links">
            <NavLink to="/" end>
              AI Console
            </NavLink>
            <NavLink to="/workspace">Workspace</NavLink>
            <NavLink to="/library">Library</NavLink>
          </nav>
        </div>
      </div>

      <main>{children}</main>

      <FloatingActionMenu
        activeScenario={activeScenario}
        customProfile={customProfile}
        onScenarioChange={onScenarioChange}
        onSaveCustomProfile={onSaveCustomProfile}
        onRunDemo={onRunDemo}
      />
    </div>
  )
}
