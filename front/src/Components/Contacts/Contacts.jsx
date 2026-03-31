import React from 'react';
import ConForm from '../ConForm/ConForm';

function Contacts(props) {
  return (
    <div className='contacts'>
      <h2 className="title title-block">Свяжитесь со мной </h2>
      <div className="con-form-container">
        <div className="con-fosr">
            <ConForm/>

        </div>
      </div>
    </div>
  );
}

export default Contacts;