import React from 'react';
import { Link } from 'react-router-dom';

function ButtonLink(props) {
  return (
    <>
    
      <Link to={props.links}className='buttonLinks' style={{backgroundColor:`${props.color}`, color: `${props.col}`}}>{props.text}<img src={props.img} alt="" className='footer-ico'/></Link>
    </>
  );
}

export default ButtonLink;