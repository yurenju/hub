import React, { Component } from 'react';
import QrReader from 'react-qr-scanner';

import { TicketSale, recover } from './ethereum';

class QRCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delay: 100,
      success: false
    };
  }

  handleScan = async data => {
    if (this.state.success || !data) {
      return;
    }
    const { contract, signature, ticketId } = JSON.parse(data);
    const account = await recover(ticketId, signature);
    const ticketSale = TicketSale(contract);
    const actual = await ticketSale.methods.ownerOf(ticketId).call();

    this.setState({ success: account.toLowerCase() === actual.toLowerCase() });
  };

  handleError = err => {
    console.error(err);
  };

  render() {
    const previewStyle = {
      height: 240,
      width: 320
    };

    return (
      <div>
        <QrReader
          delay={this.state.delay}
          style={previewStyle}
          onError={this.handleError}
          onScan={this.handleScan}
        />
        <p>{this.state.success ? 'Verified' : 'Scanning'}</p>
      </div>
    );
  }
}

export default QRCode;
