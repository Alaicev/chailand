import React, { useEffect, useState } from 'react';
import { packetAPI, prizeAPI } from '../../services/api';
import ButtonLink from '../buttons/ButtonLink';
import { links } from '../../links';
import img1 from "../../assets/images/IMG_1030 1.png"
import img2 from "../../assets/images/IMG_1020.png"
import img3 from "../../assets/images/IMG_1024 4.png"


  const emailToCenterMap = {
    'happy-mall@example.com': 'ТРЦ Happy Молл',
    'pobeda-plaza@example.com': 'ТЦ Победа плаза'
  };


function Prises(props) {
  const [packets, setPackets] = useState([]);
  const [price, setPrice] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackets();
  }, []);

 
  const fetchPackets = async () => {
    try {
      setLoading(true);
      const response = await packetAPI.getAll();
      const response2 = await prizeAPI.getAll();
      setPackets(response.data.packets || []);
      setPrice(response2.data.prizes || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching packets:', error);
      setError('Не удалось загрузить информацию о пакетах');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className='prices'>
      <div className="wrapper">
        <h2 className="title title-block">Цены</h2>
        <p className="prices-sub-text">Стоимость безлимитного посещения парка</p>
          <div className="prices-items">
          {price.length === 0 ? (
            <p className="no-data">Нет доступных пакетов</p>
          ) : (
            price.map((packet, i) => (
              <PriseItem key={packet.id} props = {packet} title={packet.name} email={packet.email} points={packet.points} id={i}/>
            ))
          )}
            <div className="price-item">
              <p className="ptice-title">Заказать праздник</p>
              <ButtonLink links={links.contact} text={"напишите нам для рассчета"} color="#FFE300" col="#ACA214"/>
              <p className="price-annot">*стоимость рассчитывается исходя из колличества гостей и времени посещения</p>
              <img src={img1} alt="" className='spice-img4' />
            </div>
        </div>
        <p className="prices-sub-text">Праздничные пакетные предложения</p>
        <div className="prices-items">
          {packets.map((a, i) => (
            <PacketsList key={i} title={a.name} points={a.points} prices={a.prices}/>
          ))}
        </div> 
      </div>
      <div className="button-con">
        <ButtonLink  links={links.price} text={"СМОТРЕТЬ ВСЕ ПРЕДЛОЖЕНИЯ"} color="#F56F36" col="#FFF7D2"/>
      </div>
      <p className="prices-sub-text">Вы можете посещать наш парк со своей едой и напитками, для этого у нас отведена специальная зона.</p>
    </div>
  );
}

export const PriseItem = (props) => {
  const poitn = props.points
  return (
    <div className="price-item">
      {props.id == 0? <img src={img2} alt="" className='spice-img1'/> : null}
      {props.id == 1? <img src={img3} alt="" className='spice-img2' /> : null}
      {props.id == 1? <img src={img3} alt="" className='spice-img3' /> : null}
        <div className="price-points">

      <p className="ptice-title">{emailToCenterMap[props.email]}</p>
      {poitn.map((a, i) => (
          <p className='price-point' key={i}>{a.text}</p>
      ))}
        </div>

      <ButtonLink links={links.contact + "/" + props.email} text={"связаться с нами"} color="#FFE300" col="#ACA214"/>
      
    </div>
  )
}


export const PacketsList = (props) => {
  console.log(props)
  return(
    <div className="packet">
      <div className="pac-block1">
        <p className="title packet-title">{props.title}</p>
        {props.points.map((a, i) => (
          <p className='packet-point' key={i}>• {a.text}</p>
        ))}
      </div>
      <div className="pac-block2">
        {props.prices.map((a, i) => (
          <p className='packet-point' key={i}>{a.value}</p>
          
        ))}
        <ButtonLink links={links.contact} text={"связаться с нами"} color="#FFE300" col="#ACA214"/>
      </div>
    </div>
  )
}


export default Prises;