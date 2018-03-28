import React, { Component } from 'react';

import { Link } from 'react-router';

class App extends Component {
  render() {
    return (
      <div>
        <div>
          <Link to='/'>Chaingear 2.0</Link>
        </div>
        {this.props.children}
      </div>
    );
  }
}


export default App;
