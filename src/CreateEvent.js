import React, { Component } from 'react';

class CreateEvent extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="container mt-4">
        <form>
          <div className="form-group">
            <label htmlFor="event-title">Title</label>
            <input
              type="text"
              className="form-control"
              id="event-title"
              placeholder="Enter title"
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-price">Price</label>
            <input
              type="number"
              className="form-control"
              id="event-price"
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="event-due-date">Due date</label>
            <input
              type="date"
              className="form-control"
              id="event-due-date"
              placeholder="Due date"
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
