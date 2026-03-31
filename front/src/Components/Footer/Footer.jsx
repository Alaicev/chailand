import React from 'react';
import ButtonLink from './../buttons/ButtonLink';
import { links } from '../../links';
import tel from "../../assets/images/Vector.png"
import inst from "../../assets/images/Group 62.png"
import { LicksURL } from '../header/Header';

function Footer(props) {
  return (
    <div className='footer'>
      <div className="wrapper">
        <div className="footer-container">
          <div className="footer-left-column">
        <div className="footer-items">
            <p className="footer-title">Парки “ЧайЛэнд”</p>
            <ButtonLink links={links.parks} color="#FFE300" col="#ACA214" text={"ТРЦ Happy Молл"}/>
            <ButtonLink links={links.parks} color="#FFE300" col="#ACA214" text={"ТЦ Победа плаза"}/>
          </div>
          <div className="footer-items">
            <p className="footer-title">Наши соцсети</p>
            <ButtonLink links={links.telegramm} color="#FFE300" col="#ACA214" text={"Telegram"} img={tel}/>
            <ButtonLink links={links.instagramm} color="#FFE300" col="#ACA214" text={"Instagram"} img={inst}/>
          </div>
          </div>
         
          <div className="footer-items">
            <p className="footer-title">Контакты</p>
            <LicksURL/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;