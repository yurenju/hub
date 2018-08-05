import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faCalendarPlus, faCalendarMinus } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment';

import { getAccounts, TicketSale, toWei, fromWei } from './ethereum';
import imgTech from './type-tech.jpg';
import imgBusiness from './type-business.jpg';
import imgMusic from './type-music.jpg';
import './EventDetail.css';

class EventDetail extends Component {
  constructor() {
    super();
    this.state = {
      event: { price: 0 }
    };
  }

  async componentDidMount() {
    const { eventId } = this.props.match.params;
    const ticketSale = TicketSale(eventId);
    const title = await ticketSale.methods.name().call();
    const startDate = await ticketSale.methods.startTime().call();
    const dueDate = await ticketSale.methods.dueTime().call();
    const price = await ticketSale.methods.price().call();
    this.ticketSale = ticketSale;
    this.setState({
      event: {
        title,
        startDate: Number.parseInt(startDate, 10) * 1000,
        dueDate: Number.parseInt(dueDate, 10) * 1000,
        price,
        type: 'tech'
      }
    });
  }

  onRegister = async () => {
    const accounts = await getAccounts();
    this.ticketSale.methods.register('1').send({
      from: accounts[0],
      value: this.state.event.price
    });
  };

  renderCover() {
    if (this.state.event.type === 'tech') {
      return <img src={imgTech} />;
    } else if (this.state.event.type === 'business') {
      return <img src={imgBusiness} />;
    } else if (this.state.event.type === 'music') {
      return <img src={imgMusic} />;
    }
  }

  render() {
    return (
      <div className="event-detail px-2">
        {this.renderCover()}
        <h1>{this.state.event.title}</h1>
        <div className="information mx-3">
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faCalendarPlus} />
            </div>
            <div className="col-11">
              <strong>Start Time</strong>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-11 offset-1">{moment(this.state.event.startDate).format('LL')}</div>
          </div>
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faCalendarMinus} />
            </div>
            <div className="col-11">
              <strong>Due Time</strong>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-11 offset-1">{moment(this.state.event.dueDate).format('LL')}</div>
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
            <div className="col-11 offset-1">
              {fromWei(`${this.state.event.price}`, 'ether')} ETH
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={this.onRegister}
          className="btn btn-primary btn-lg btn-block my-3"
        >
          Register
        </button>
      </div>
    );
  }
}

export default EventDetail;
