import React from 'react';
import Logo from "../../assets/images/logo.png"
import ButtonLink from '../buttons/ButtonLink';
import { links } from '../../links';


function Header() {
  return (
    <div className='header'>
      <ButtonLink text="связаться с нами" link={links.contact} color="#FFE300" col="#ACA214"/>
      <img className='header_logo' src={Logo} alt="" />
      <LicksURL/>
    </div>
  );
}

export const LicksURL = () => {
  return (
      <div className="text-header-block">
        <p>ТЦ ПОБЕДА ПЛАЗА</p>
        <p>+7 (987)822 14 49</p>
        <p>ТРЦ HAPPY МОЛЛ</p>
        <p>+7 (927)136 94 53</p>
      </div>
  )
}



export default Header;