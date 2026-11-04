import { Route, Switch } from 'wouter'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { TablesPage } from './pages/TablesPage'

function App() {
  return (
    <AuthProvider>
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>
      <main className="mx-auto max-w-xl px-4 py-12">
        <Switch>
          <Route path="/entrar" component={LoginPage} />
          <Route path="/mesas">
            <RequireAuth>
              <TablesPage />
            </RequireAuth>
          </Route>
          <Route component={HomePage} />
        </Switch>
      </main>
    </AuthProvider>
  )
}

export default App
