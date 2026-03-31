import React from 'react';
import i1 from "./../../assets/images/Group 1.svg"
import i2 from "./../../assets/images/Group 2.svg"
import i3 from "./../../assets/images/Group 3.svg"
import i4 from "./../../assets/images/Group 4.svg"

function About(props) {

  const items = [
    {id: 1, text: "Идеальная площадка для грандиозного дня рождения или яркого праздника с красочными банкетными зонами.", img: i1},
    {id: 2, text: "Мы обеспечили полную прозрачность игровых зон, видеонаблюдение, а также наши сотрудники постоянно дежурят для обеспечения безопасности.", img: i2},
    {id: 3, text: "Современные механические аттракционы и многое другое в любую, даже самую ненастную погоду.", img: i3},
    {id: 4, text: "2 парка спроектированных и оборудованных для того, чтобы дети выплеснули эмоции и зарядились энергией на всю неделю.", img: i4},
  ]
  return (
    <div className='about'>
      <div className="wrapper">
        <h2 className="title title-block">О нас</h2>
        <p className="about-text text">
          Мечтаете об идеальном дне для всей семьи? Добро пожаловать в Чайлэнд - два огромных волшебных мира, созданных для радости и смеха! Ваши дети отправятся в незабываемое приключение среди гигантского количества аттракционов: от невероятных батутов и вихревых каруселей до весёлых тюбингов и игровых автоматов. А главное -вы можете быть спокойны: на территории  находятся  наши внимательные сотрудники, чтобы безопасность вашего ребёнка была на первом месте. Подарите своей семье море радости
        </p>
        <div className="about-items">
          {items.map((a) => (<Item key={a.id} text={a.text} img={a.img}/>))}
        </div>
      </div>
    </div>
  );
}

const Item = ({text, img}) => {
  return(
    <div className="about-item">
      <img src={img} alt="" />
      <p className="text">{text}</p>
    </div>
  )
}

export default About;