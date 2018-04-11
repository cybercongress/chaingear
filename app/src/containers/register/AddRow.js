import React, { Component } from 'react';

class AddRow extends Component {
  state = {

  }
  
  add = () => {
    const {
      fields
    } = this.props;

    const newItem = {
      // id: guid()
    }
    const args = [];
    for(let key in this.refs) {
      if (this.refs[key]) {
        const field = fields.find(x => x.name === key);
        if (field.type === 'bool') {
          args.push(this.refs[key].checked);
        } else {
          args.push(this.state[key]);
        }
        newItem[key] = +this.refs[key].value          
      }
    }

    if (args.some(x => x === "" || x === undefined)) return ;

    this.props.onAdd(args);
  }

  change = (e, name, type) => {
    console.log(type)
    if (type === 'int256' && isNaN(e.target.value)) return;

    if (type === 'uint256' && (isNaN(e.target.value) || +e.target.value < 0)) return;

    this.setState({
      [name]: e.target.value
    });
  }
 
  render() {
    const {
      fields
    } = this.props;

    const bottom = fields.map(field => {
      let content = (
        <input 
          ref={field.name} 
          onChange={e => this.change(e, field.name, field.type)}
          value={this.state[field.name]}
        />
      );
      if (field.type === 'bool') {
        content = <input ref={field.name}  type='checkbox' />
      }
      return (
        <td key={field.name}>
          {content}
        </td>
      )
    })

    return (
      <tr key='add-row'>
        {bottom}
        <td key='button-cell'>
          <button onClick={this.add}>add</button>
        </td>
      </tr>
    );
  }
}

export default AddRow;
