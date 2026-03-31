import React, { useState } from 'react';
import f1 from "../../assets/images/Frame 1.png"
import f2 from "../../assets/images/Frame 2.png"
import f3 from "../../assets/images/Frame 3.png"
import f4 from "../../assets/images/Frame 4.png"
import f5 from "../../assets/images/Frame 5.png"
import { links } from '../../links';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

function Navigation(props) {
  const [activeItem, setActiveItem] = useState(null);
  const items = [
    {id: 1, img: f1, text: "ДЕНЬ РОЖДЕНИЯ", link: links.contact},
    {id: 2, img: f2, text: "О НАС", link: links.home},
    {id: 3, img: f3, text: "ПАРКИ", link: links.parks},
    {id: 4, img: f4, text: "ЦЕНЫ" , link: links.price},
    {id: 5, img: f5, text: "КОНТАКТЫ" , link: links.contact},
  ]

    const handleItemClick = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <div  className='navigation'>
      {items.map((item) => (
        <NavItems
          key={item.id}
          id={item.id}
          img={item.img}
          text={item.text}
          to = {item.link}
          isActive={activeItem === item.id}
          onClick={handleItemClick}
        />
      ))}

    </div>
  );
}

const NavItems = ({ id, img, text, to, isActive, onClick }) => {
  const handleClick = () => {
    onClick(id);
  };

  return (
    <NavLink to={to}
      className={`nav-item ${({isActive}) => isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <img src={img} alt={text} />
      <p className='title nav-item-text'>{text}</p>
    </NavLink>
  );
};


export default Navigation;