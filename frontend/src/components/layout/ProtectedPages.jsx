import NavBar from './NavBar'
import FooterSection from '../FooterSection'
import ScrollToTop from '../../util/ScrollToTop';

export const ProtectedPages = ({ children }) => {

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
        <NavBar scrollToSection={(elementRef) => scrollToSection(elementRef)}/>
          <ScrollToTop />
        {children}
        <FooterSection scrollToSection={(data) => scrollToSection(data)} />
    </div>
  )
}