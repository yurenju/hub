import React, { Component } from 'react';
import * as moment from 'moment';

import { getAccounts, hub, toWei } from './ethereum';

class CreateEvent extends Component {
  constructor() {
    super();

    this.state = {
      title: '',
      startDate: moment().format('YYYY-MM-DD'),
      dueDate: moment().format('YYYY-MM-DD'),
      price: 0.1
    };
  }

  onSubmit = async e => {
    e.preventDefault();
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      return;
    }

    const price = toWei(`${this.state.price}`, 'ether');
    const startDate = moment(this.state.startDate).format('X');
    const dueDate = moment(this.state.dueDate).format('X');
    await hub.methods.createEvent(this.state.title, startDate, dueDate, price).send({
      from: accounts[0]
    });
  };

  onStartDateChange = event => {
    this.setState({ startDate: event.target.value });
  };

  onDueDateChange = event => {
    this.setState({ dueDate: event.target.value });
  };

  onPriceChange = event => {
    this.setState({ price: event.target.value });
  };

  onTitleChange = event => {
    this.setState({ title: event.target.value });
  };

  render() {
    return (
      <div className="container mt-4">
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label htmlFor="event-title">Title</label>
            <input
              type="text"
              className="form-control"
              id="event-title"
              placeholder="Enter title"
              value={this.state.title}
              onChange={this.onTitleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-price">Price</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="event-price"
              value={this.state.price}
              onChange={this.onPriceChange}
              placeholder="Enter ETH price"
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-start-date">Start Date</label>
            <input
              type="date"
              className="form-control"
              id="event-start-date"
              placeholder="start date"
              value={this.state.startDate}
              onChange={this.onStartDateChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-due-date">Due date</label>
            <input
              type="date"
              className="form-control"
              id="event-due-date"
              placeholder="Due date"
              value={this.state.dueDate}
              onChange={this.onDueDateChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

export default CreateEvent;
