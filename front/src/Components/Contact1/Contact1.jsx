import React from 'react';
import img1 from "../../assets/images/IMG_1029 1.png"
import img2 from "../../assets/images/IMG_1019.png"
import ConForm from './../ConForm/ConForm';

function Contact1(props) {
  return (
    <div className='contact1'>
        <img src={img1} alt="" className="con-img1" />
        <div className="con-container">
          <h2 className="title title-block">Рассчитать стоимость вашего праздника</h2>
          <div className="con-flex">
            <ConForm/> 
            <img src={img2} alt="" className='con-img2'/>
          </div>
        </div>
    </div>
  );
}

export default Contact1;