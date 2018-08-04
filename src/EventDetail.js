import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faCalendarPlus, faCalendarMinus } from '@fortawesome/free-regular-svg-icons';

import imgTech from './type-tech.jpg';
import imgBusiness from './type-business.jpg';
import imgMusic from './type-music.jpg';
import './EventDetail.css';

class EventDetail extends Component {
  constructor() {
    super();
    this.event = { id: '1', type: 'tech', title: 'Taipei Ethereum Meetup #1', date: '2018-08-15' };
  }

  renderCover() {
    if (this.event.type === 'tech') {
      return <img src={imgTech} />;
    } else if (this.event.type === 'business') {
      return <img src={imgBusiness} />;
    } else if (this.event.type === 'music') {
      return <img src={imgMusic} />;
    }
  }

  render() {
    return (
      <div className="event-detail px-2">
        {this.renderCover()}
        <h1>{this.event.title}</h1>
        <div className="information mx-3">
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faCalendarPlus} />
            </div>
            <div className="col-11">
              <strong>Start Time</strong>
            </div>
          </div>
          <div className="row">
            <div className="col-11 offset-1">aaa</div>
          </div>
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faCalendarMinus} />
            </div>
            <div className="col-11">
              <strong>Due Time</strong>
            </div>
          </div>
          <div className="row">
            <div className="col-11 offset-1">aaa</div>
          </div>
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faDollarSign} />
            </div>
            <div className="col-11">
              <strong>Price</strong>
            </div>
          </div>
          <div className="row">
            <div className="col-11 offset-1">aaa</div>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-lg btn-block my-3">
          Register
        </button>
      </div>
    );
  }
}

export default EventDetail;
