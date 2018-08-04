import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import EventList from './EventList';
import EventDetail from './EventDetail';
import CreateEvent from './CreateEvent';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <nav className="navbar navbar-dark bg-primary">
              <Link to="/" className="navbar-brand">
                Event Hub
              </Link>
              <Link to="/new" className="btn btn-outline-light">
                Create Event
              </Link>
            </nav>
            <Route exact path="/" component={EventList} />
            <Route path="/new" component={CreateEvent} />
            <Route path="/events/:eventId" component={EventDetail} />
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
