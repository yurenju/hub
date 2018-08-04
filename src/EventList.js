import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './EventList.css';

class EventList extends Component {
  constructor() {
    super();
    this.events = [
      { id: '1', type: 'tech', title: 'Taipei Ethereum Meetup #1', date: '2018-08-15' },
      {
        id: '2',
        type: 'business',
        title: 'Coffee Chats in Taipei - Friday 24 August',
        date: '2018-08-20'
      },
      { id: '3', type: 'music', title: '貝登武藤堡爵士樂演奏會', date: '2018-08-25' },
      { id: '4', type: 'tech', title: 'Taipei Ethereum Meetup #2', date: '2018-08-30' }
    ];
  }

  renderEvents() {
    return this.events.map((event, i) => <Event key={`${event.title}-${i}`} {...event} />);
  }

  render() {
    return (
      <div className="container mt-4">
        <div className="row">{this.renderEvents()}</div>
      </div>
    );
  }
}

class Event extends Component {
  render() {
    const className = `col-md-3 event shadow p-3 m-2 mb-4 bg-white rounded type-${this.props.type}`;
    return (
      <div className={className}>
        <div>
          <Link to={`/events/${this.props.id}`}>{this.props.title}</Link>
        </div>
      </div>
    );
  }
}

export default EventList;
