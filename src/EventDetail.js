import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faCalendarPlus, faCalendarMinus } from '@fortawesome/free-regular-svg-icons';
import * as moment from 'moment';
import QRCode from 'qrcode';

import { getAccounts, TicketSale, toWei, fromWei, sign } from './ethereum';
import imgTech from './type-tech.jpg';
import imgBusiness from './type-business.jpg';
import imgMusic from './type-music.jpg';
import './EventDetail.css';

class EventDetail extends Component {
  constructor() {
    super();
    this.state = {
      registered: 0,
      maxAttendees: 0,
      event: { price: 0 },
      tickets: [],
      tradings: [],
      showQRCode: false
    };
  }

  async componentDidMount() {
    const { eventId } = this.props.match.params;
    const ticketSale = TicketSale(eventId);
    const accounts = await getAccounts();
    const title = await ticketSale.methods.name().call();
    const startDate = await ticketSale.methods.startTime().call();
    const dueDate = await ticketSale.methods.dueTime().call();
    const price = await ticketSale.methods.price().call();
    const registered = Number.parseInt(await ticketSale.methods.tickets().call(), 10);
    const maxAttendees = Number.parseInt(await ticketSale.methods.maxAttendees().call(), 10);
    const balance = Number.parseInt(await ticketSale.methods.balanceOf(accounts[0]).call(), 10);
    const tickets = [];
    for (let i = 0; i < balance; i++) {
      const ticketId = await ticketSale.methods.tokenOfOwnerByIndex(accounts[0], i).call();
      tickets.push(ticketId);
    }

    const tradingCount = Number.parseInt(await ticketSale.methods.tradings().call(), 10);
    const tradings = [];
    for (let i = 0; i < tradingCount; i++) {
      const trade = await ticketSale.methods.tradingList(i + 1).call();
      const { owner, ticketId, value } = trade;
      tradings.push({ owner, ticketId, value });
    }

    this.ticketSale = ticketSale;
    this.canvasRef = React.createRef();
    this.setState({
      tickets,
      tradings,
      registered,
      maxAttendees,
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

  onQRCode = async () => {
    if (!this.state.showQRCode) {
      const accounts = await getAccounts();
      const message = `${this.state.tickets[0]}`;
      const signature = await sign(message, accounts[0]);
      QRCode.toCanvas(this.canvasRef.current, signature, { scale: 4 });
    }

    this.setState({ showQRCode: !this.state.showQRCode });
  };

  onTrade = async () => {
    const accounts = await getAccounts();
    const price = Number.parseFloat(fromWei(this.state.event.price, 'ether')) * 1.2;
    const wei = toWei(`${price}`, 'ether');
    await this.ticketSale.methods
      .requestTrading(this.state.tickets[0], wei)
      .send({ from: accounts[0] });
  };

  onBuy = async tradeId => {
    const accounts = await getAccounts();
    const price = this.state.tradings[tradeId - 1].value;
    await this.ticketSale.methods.trade(`${tradeId}`).send({ from: accounts[0], value: price });
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

  renderButtons() {
    if (this.state.tickets.length > 0) {
      return (
        <div className="text-center mt-3">
          <button type="button" className="btn btn-primary btn-lg" onClick={this.onQRCode}>
            QR Code
          </button>&nbsp;
          <button type="button" className="btn btn-warning btn-lg" onClick={this.onTrade}>
            Trade
          </button>
        </div>
      );
    } else {
      return (
        <button
          type="button"
          onClick={this.onRegister}
          className="btn btn-primary btn-lg btn-block my-3"
        >
          Register
        </button>
      );
    }
  }

  renderCanvas() {
    const display = this.state.showQRCode ? 'inline' : 'none';
    return (
      <div className="text-center">
        <canvas width="500" height="500" style={{ display }} ref={this.canvasRef} />
      </div>
    );
  }

  renderTradings() {
    if (this.state.tradings.length > 0) {
      const tradings = this.state.tradings.map((t, i) => {
        return (
          <div key={t.ticketId} className="row">
            <div className="col-4">Ticket #{t.ticketId}</div>
            <div className="col-4">{fromWei(t.value, 'ether')} ETH</div>
            <div className="col-4">
              <button onClick={this.onBuy.bind(this, i + 1)} className="btn btn-primary">
                buy
              </button>
            </div>
          </div>
        );
      });
      return (
        <div>
          <hr />
          <h1>Ticket on sale</h1>
          <div>{tradings}</div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="event-detail px-2 pb-3">
        {this.renderCover()}
        <h1>{this.state.event.title}</h1>
        <div className="information mx-3">
          <div className="row">
            <div className="col-1">
              <FontAwesomeIcon icon={faCalendarPlus} />
            </div>
            <div className="col-11">
              <strong>Ticket amount</strong>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-11 offset-1">{`${this.state.registered} / ${
              this.state.maxAttendees
            }`}</div>
          </div>
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
        {this.renderCanvas()}
        {this.renderButtons()}
        {this.renderTradings()}
      </div>
    );
  }
}

export default EventDetail;
