import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import polic from "../../assets/file/pol.pdf"
import { messageAPI } from './../../services/api';

function ConForm(props) {
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    comment: '',
    center: ''
  });

  const [isAgreed, setIsAgreed] = useState(false);

  const emailToCenterMap = {
    'happy-mall@example.com': 'ТРЦ Happy Молл',
    'pobeda-plaza@example.com': 'ТЦ Победа плаза'
  };

  useEffect(() => {
    if (id && emailToCenterMap[id]) {
      setFormData(prev => ({
        ...prev,
        center: emailToCenterMap[id]
      }));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAgreed) return;
      try {
        await messageAPI.create(formData)
        setFormData({
        full_name: '',
        phone: '',
        comment: '',
        center: ''
      })
      alert("Заявка принята")
      console.log('Отправленные данные:', formData);
    } catch (error) {
      console.log(error)
    }
    
  };

  return (
    <div className="conform-wrapper">
      <form onSubmit={handleSubmit} className="conform-form">
        <div>
          <select
            className="conform-select"
            id="center"
            name="center"
            value={formData.center}
            onChange={handleChange}
            required
          >
            <option value="">Выберите центр</option>
            <option value="ТРЦ Happy Молл">ТРЦ Happy Молл</option>
            <option value="ТЦ Победа плаза">ТЦ Победа плаза</option>
          </select>
        </div>

        <br/>

        <div>
          <input
            className="conform-input"
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder='Ваше Ф.И.О'
          />
        </div>

        <br/>

        <div>
          <input
            className="conform-input"
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Телефон для связи"
          />
        </div>

        <br/>

        <div>
          <textarea
            className="conform-textarea"
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="4"
            placeholder="Дата, время, количество гостей и комментарий"
          />
        </div>

        <div className="conform-checkbox-wrapper">
          <input
            type="checkbox"
            id="agreement"
            checked={isAgreed}
            onChange={handleCheckboxChange}
            className="conform-checkbox"
          />
          <label htmlFor="agreement">
            Я даю согласие на обработку моих
            <a 
              href={polic}
              className="conform-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              персональных данных
            </a>
          </label>
        </div>

        <button 
          type="submit" 
          className="conform-submit"
          disabled={!isAgreed}
        >
          отправить запрос
        </button>
      </form>
    </div>
  );
}

export default ConForm;