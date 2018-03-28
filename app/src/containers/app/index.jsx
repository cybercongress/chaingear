import React, { Component } from 'react';

 class App extends Component {
  render() {
    return (
      <div>
        <div>
          New Frontier of chaingear
        </div>
        {this.props.children}
      </div>
    );
  }
}


export default App;
