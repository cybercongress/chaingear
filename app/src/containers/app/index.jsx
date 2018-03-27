import React, { Component } from 'react';

 class App extends Component {
  render() {
    return (
      <div>
        <div>
          New Frontier of chaingear 1
        </div>
        {this.props.children}
      </div>
    );
  }
}


export default App;
