import React from 'react';
import i1 from "../../assets/images/image 6.png"
import i2 from "../../assets/images/image 6.png"
import i3 from "../../assets/images/IMG_1028 1.png"
import i4 from "../../assets/images/footer-parks.svg"
import ButtonLink from '../buttons/ButtonLink';
import { links } from '../../links';

function Parks(props) {

  const items = [
    {id: 1, img: i1, name: "ТРЦ Happy Молл", text: "Вольский тракт, 2, Саратов"},
    {id: 2, img: i2, name: "ТЦ Победа плаза", text: "ул. имени Василия Люкшина, 5, Саратов"},
  ]

    const emailToCenterMap = 
    ['happy-mall@example.com',
    'pobeda-plaza@example.com']
  return (
    <div className='parks'>
      <div className="wrapper">
        <h2 className="title title-block">ПАРКИ</h2>
        <div className="parks-items">
          {items.map((a, i) => (<Item img={a.img} key={a.id} text={a.text} email={emailToCenterMap[i]} name={a.name}/>))}
        </div>
      </div>
      <img src={i4} alt="" className='footer-parks'/>
    </div>
  );
}

const Item = ({img, name, text, email}) => {

  return (
    <div className="park-item">
      <div className="park-item-back">
        <div className="parh-text-container">
          <h2>{name}</h2>
          <p>{text}</p>
        </div>
        <img src={img} alt="" />
        <div className="park-about">
          <p className='park-about-title'>РАБОТАЕМ БЕЗ ВЫХОДНЫХ с 10:00 до 21:30</p>
          <div className="park-about-items">
            <p>батуты</p>
            <p>горки</p>
            <p>бассейн с шарами</p>
            <p>карусели</p>
            <p>лабиринт</p>
            <p>игровые автоматы</p>
            <p>фотозоны</p>
          </div>
        </div>
      </div>
      <div className="park-item-middle">
        <div className="park__item-button-over">
          <ButtonLink links={links.contact + "/" + email} text={"связаться с нами"} color="#FFE300" col="#ACA214"/>
          
        </div>
      </div>
      <div className="park-item-front"></div>
    </div>
  )
}

export default Parks;