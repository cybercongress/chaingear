
import React, { Component } from 'react';

class AddField extends Component {
  state = {
    name: ''
  }
  add = () => {
    const {
      name
    } = this.state;
    const type = this.refs.type.value;
    this.props.onAdd(name, type);
    this.setState({
      name: ''
    })
  }
  changeName = (e) => {
    this.setState({ name: e.target.value })
  }

  render() {
    const {
      fields
    } = this.props;
    const {
      name
    } = this.state;
    const exist = !!fields.find(x => x.name === name);
    const canAdd = name.length > 0 && !exist;

    return (
      <tr >
          <td>
            <input value={name} onChange={this.changeName}/>
          </td>
          <td>
            <select ref='type'>
              <option value='string'>string</option>
              <option value='bool'>bool</option>
              <option value='int256'>int</option>
              <option value='uint256'>uint</option>
            </select>
          </td>
          <td>
            <button 
              style={{ fontSize: '70%' }} 
              className="pure-button"
              onClick={this.add}
              disabled={!canAdd}
            >add</button>                   
          </td>
        </tr>
    );
  }
}

export default AddField;
