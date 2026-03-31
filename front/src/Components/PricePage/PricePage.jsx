import React, { useEffect, useState } from 'react';
import { packetAPI, prizeAPI } from '../../services/api';
import ButtonLink from '../buttons/ButtonLink';
import { links } from '../../links';
import img2 from "../../assets/images/IMG_1020.png"
import img3 from "../../assets/images/IMG_1024 4.png"
import img from "../../assets/images/IMG_1029 1.png"


  const emailToCenterMap = {
    'happy-mall@example.com': 'ТРЦ Happy Молл',
    'pobeda-plaza@example.com': 'ТЦ Победа плаза'
  };



function PricePage(props) {

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
    <div className='price-page'>
      <h2 className="title title-block">ЦЕНЫ</h2>
      <p className="prices-sub-text">Стоимость безлимитного посещения парка</p>
      <div className="prices-items2">
           {price.length === 0 ? (
                      <p className="no-data">Нет доступных пакетов</p>
                    ) : (
                      price.map((packet, i) => (
                        <PriseItem key={packet.id} props = {packet} title={packet.name} email={packet.email} points={packet.points} id={i}/>
                      ))
                    )}
      </div>

      <div className="all-pakkets">
        <h2 className="title title-block">Праздничные пакетные предложения</h2>
        {packets.map((a, i) => (
                    <PacketsList key={i} title={a.name} points={a.points} prices={a.prices}/>
                  ))}
      <Dosp/>

      </div>
            <div style={{margin: "4vw auto", width: "50vw"}}>
                <ButtonLink links={links.contact1} text={"напишите нам для рассчета стоимости вашего праздника"} color="#FFE300" col="#ACA214"/>
            </div>
            <Jaba/>
    </div>
  );
}

export const PriseItem = (props) => {
  const poitn = props.points
  return (
    <div className="price-item2">
      {props.id == 0? <img src={img2} alt="" className='spice-img1'/> : null}
      {props.id == 1? <img src={img3} alt="" className='spice-img2' /> : null}
      {props.id == 1? <img src={img3} alt="" className='spice-img3' /> : null}

      <p className="ptice-title">{emailToCenterMap[props.email]}</p>
        <div className="prise-poites2">

      {poitn.map((a, i) => (
            <p className='price-point' key={i}>{a.text}</p>

      ))}
        </div>

    </div>
  )
}

export const PacketsList = (props) => {
  console.log(props)
  return(
    <div className="new-Bloc">
        <p className="title packet-title">{props.title}</p>
        <div className="allBlocksPac">
        <div className="pac-lock1">
        {props.points.map((a, i) => (
          <p className='packet-point' key={i}>• {a.text}</p>
        ))}
      </div>
      <div className="pac-lock2">
        {props.prices.map((a, i) => (
          <p className='packet-point' key={i}>{a.value}</p>
        ))}
        
        </div>
        <div className="pac-lock3">
          <p>Доплата за 1 ребенка свыше указанного колличества:</p>
          <p>• 700 ₽ - будние дни;</p>
          <p>• 900 ₽ - выходные и праздничные дни;</p>
        </div>
      </div>
      
    </div>
  )
}

export const Dosp = () => {
  return (
    <>
      <div className="dops-item">
        <p className="prices-sub-text">Дополнительная аренда “чайного домика” на 60 минут</p>
        <p className="prices-sub-sub-text">(при условии, что домик не занят на следующий праздник)</p>
        <div className="dops-item-fl">
          <div className="drop-center">
            <p className="prices-sub-sub-text">Будние дни: </p>
            <p className="prices-sub-sub-text">1000 </p>
          </div>
          <div className="drop-center"><p className="prices-sub-sub-text">Выходные и праздничные дни: </p>
            <p className="prices-sub-sub-text">1200 </p></div>
        </div>
      </div>
      <div className="dops-2item">
         <div className="dops-item">
        <p className="prices-sub-text">“Поздравление Аниматора от заказчика”</p>
        <p className="prices-sub-sub-text">(игры, конкурсы) доплата парку 60 минут:</p>
          <div className="drop-center">
            <p className="prices-sub-sub-text">1000 ₽</p>
          </div>
      </div>
       <div className="dops-item">
        <p className="prices-sub-text">Анимационная программа с 1 аниматором</p>
        <p className="prices-sub-sub-text">(на выбор по портфолио) 60 минут</p>
          <div className="drop-center">
            <p className="prices-sub-sub-text">2800 ₽</p>
          </div>
      </div>
      </div>
    </>
  )
}

export const Jaba = () => {
  return (
    <div className='jaba'>
      <div className="wrapper">
        <img src={img} alt="" />
        <div className="jaba-text">
          <p>орогие гости! Обращаем Ваше внимание - еду, напитки, одноразовую посуду и столовые  приборы вы можете принести  с собой. Предупреждайте ваших гостей о том что наш парк посещается только в носочках (без бахил или сменной обуви).</p>
        </div>
      </div>
    </div>
  )
}

export default PricePage;