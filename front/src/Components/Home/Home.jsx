import React from 'react';
import Header from './../header/Header';
import Navigation from './../navigation/navigation';
import Carousel from './../carusel/Carusel';
import About from '../About/About';
import Parks from '../Parks/Parks';
import Prises from '../prices/Prises';
import Contact1 from './../Contact1/Contact1';


function Home() {
  return (
    <>
      <Carousel/>
      <About/>
      <Parks/>
      <Prises/>
      <Contact1/>
    </> 
  );
}

export default Home;