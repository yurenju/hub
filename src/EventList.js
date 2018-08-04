import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import { getAccounts, hub, TicketSale } from './Contracts.js';
import './EventList.css';

class EventList extends Component {
  constructor() {
    super();
    this.types = ['type', 'business', 'music'];
    this.state = {
      events: []
    };
  }

  async componentDidMount() {
    const accounts = await getAccounts();
    const countStr = await hub.methods.events().call();
    const count = Number.parseInt(countStr, 10);

    const events = [];
    for (let i = 1; i <= count; i++) {
      const addr = await hub.methods.eventList(`${i}`).call();
      const event = new TicketSale(addr);
      const title = await event.methods.name().call();
      events.push({
        id: addr,
        title,
        type: this.types[Number.parseInt(Math.random() * this.types.length)]
      });
    }

    this.setState({ events });
  }

  renderEvents() {
    return this.state.events.map((event, i) => <Event key={`${event.title}-${i}`} {...event} />);
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
