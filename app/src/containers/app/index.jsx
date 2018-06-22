import React, { Component } from 'react';

import { Link } from 'react-router';

import { Container } from '../../components/chaingear/'

class App extends Component {
  render() {
    return (
      <Container>
        {this.props.children}
      </Container>
    );
  }
}


export default App;
