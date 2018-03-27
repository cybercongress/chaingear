import React, { Component } from 'react';

 class App extends Component {
  render() {
    return (
      <div>
        <div>
          header test 1
        </div>
        {this.props.children}
      </div>
    );
  }
}


export default App;
