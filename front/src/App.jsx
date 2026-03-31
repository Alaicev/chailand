import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './Components/Home/Home';
import { links } from './links';
import Header from './Components/header/Header';
import Navigation from './Components/navigation/navigation';
import Footer from './Components/Footer/Footer';
import PricePage from './Components/PricePage/PricePage';
import { useEffect } from 'react';
import Contacts from './Components/Contacts/Contacts';
import Gallery from './Components/Galery/Galery';

function App() {

  useEffect(() => {
  const handleScroll = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.2; 
    
    document.body.style.backgroundPosition = `center ${rate}px`;
  };

  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, []);

  return (
    <BrowserRouter>
      <Header/>
      <Navigation/>
      <Routes>
        <Route path={links.price} element={<PricePage/>} />
        <Route path={links.parks} element={<Gallery/>} />

        <Route path={links.home} element={<Home/>} />
        {/* <Route path={links.contact} element={<ConForm/>} /> */}
        <Route path={links.contact1} element={<Contacts/>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  )
}

export default App
