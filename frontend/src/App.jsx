import NavBar from './components/layout/NavBar'
import Hero from './components/Hero'
import StatsSection from './components/StateSection'
import FeaturesSection from './components/FeatureSection'
import ProblemStatement from './components/ProblemStatement'
import FeaturesGrid from './components/FeaturesGrid'
import CustomerReviews from './components/CustomerReviews'

function App() {
  return (
    <div>
      <NavBar />
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <ProblemStatement />
      <FeaturesGrid />
      <CustomerReviews />
    </div>
  )
}

export default App
