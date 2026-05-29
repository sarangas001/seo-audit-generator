import NavBar from './components/layout/NavBar'
import Hero from './components/Hero'
import StatsSection from './components/StateSection'
import FeaturesSection from './components/FeatureSection'
import ProblemStatement from './components/ProblemStatement'
import FeaturesGrid from './components/FeaturesGrid'

function App() {
  return (
    <div>
      <NavBar />
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <ProblemStatement />
      <FeaturesGrid />
    </div>
  )
}

export default App
