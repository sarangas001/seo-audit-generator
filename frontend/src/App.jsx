import NavBar from './components/layout/NavBar'
import Hero from './components/Hero'
import StatsSection from './components/StateSection'
import FeaturesSection from './components/FeatureSection'
import ProblemStatement from './components/ProblemStatement'
import FeaturesGrid from './components/FeaturesGrid'
import CustomerReviews from './components/CustomerReviews'
import FooterSection from './components/FooterSection'

function App() {


  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 60, // -60 accounts for the fixed nav bar height
        behavior: 'smooth',
      });
    }
  };

  return (
    <div>
      <Hero />
      <StatsSection scrollToSection={(data) => scrollToSection(data)} />
      <FeaturesSection scrollToSection={(data) => scrollToSection(data)} />
      <ProblemStatement scrollToSection={(data) => scrollToSection(data)} />
      <FeaturesGrid />
      <CustomerReviews  />
    </div>
  )
}

export default App
