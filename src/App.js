import React, { Component } from 'react';
import './App.css';
import entityData from './json/entityData.json';
import entityMeta from './json/entityMeta.json';

const formatDate= (date) => { //yyyy-mm-dd
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

const Field = (props) =>{
  const {
    name,
    label,
    dataType,
    lookup,
    preFilledValues
  } = props;
  let inputType = "text";
  switch (dataType) {
    case "String":
      inputType = "text";
      break;
    case "Integer":
    case "Decimal":
      inputType = "number";
      break;
    case "Date":
      inputType = "date";
      break;
    case "lookup":
      inputType = "lookup";
      break;
    default:
      break;
  }
  return(
    <React.Fragment>
      <label>{label}: </label>
      <input type={inputType} name={name} step={dataType === "Decimal" ? "0.01" : "1"} list={name} onChange={props.handleOnChange} defaultValue={dataType === "Date"? formatDate(preFilledValues[name]) : preFilledValues[name]}/>
      {
        dataType === "lookup" ? 
        <datalist id={name}>
            {
              lookup.link.map((option,index)=>(
                <option value={option.href} key={index}></option>
                ))
              }
          </datalist>
        : null
      }
    </React.Fragment>
  )
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      fields: [],
      exisitingFieldValues: {},
      modifiedFieldValues: {}
    };
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.renderFormContainer = this.renderFormContainer.bind(this);
    this.renderComparsionTable = this.renderComparsionTable.bind(this);
  }
  componentDidMount(){
    this.setState({fields: entityMeta.field, exisitingFieldValues: entityData});
    let stateObj = {};
    for (let index = 0; index < entityMeta.field.length; index++) {
      if(!entityMeta.field[index].system){
        const name = entityMeta.field[index].name;
        stateObj[name] = null;
      }
    }
    this.setState(stateObj);
  }
  handleOnChange = (e) => {
    const { value, name } = e.target;
    this.setState({ [name] : value });
  }
  handleOnSubmit = (e) => {
    e.preventDefault();
    let {fields, exisitingFieldValues, ...formData} = this.state;
    let result = {};
    result.$original = {};
    Object.keys(formData).forEach((key)=> {
      result[key] = formData[key] || this.state.exisitingFieldValues[key] || null;
      result.$original[key] = this.state.exisitingFieldValues[key] || null;
    });
    console.log("Below is the expected output format");
    console.log(result);
    this.setState({modifiedFieldValues: result, showComparsion: true})
  }
  renderFormContainer(){
    return(
      <form className="form-multilpe-fields" onSubmit={this.handleOnSubmit}>
        <div className="row submit-btn-container">
          <button className="btn btn-primary" type="submit">Save Data</button>
        </div>
        <div className="all-fields-container">
          {
            this.state.fields.map((field,index)=>{
              if(field.system) return null;
              return (
                <div key={index} className="single-field-container">
                  <Field handleOnChange={this.handleOnChange} preFilledValues={this.state.exisitingFieldValues} {...field}/>
                </div>
              )
            })
          }
        </div>
      </form>
    )
  }
  renderComparsionTable(){
    return(
      <div className="comparison-container">
        <table className="table">
          <thead className="thead-light">
            <tr>
              <td></td>
              <td>Original Data</td>
              <td>Saved Data</td>
            </tr>
          </thead>
          <tbody>
            {
              this.state.fields.map((field,index)=>{
                if(field.system) return null;
                return (
                  <tr key={index}>
                    <td>{field.label}</td>
                    <td>{field.dataType === "Date"? formatDate(this.state.modifiedFieldValues[field.name]) : this.state.modifiedFieldValues[field.name]}</td>
                    <td>{field.dataType === "Date"? formatDate(this.state.exisitingFieldValues[field.name]) : this.state.exisitingFieldValues[field.name]}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <span>Note: &nbsp;<h5>Press F12 to look at the required output</h5></span>
        <button className="btn btn-default" type="submit" onClick={()=>{this.setState({showComparsion: false})}}>Close comparison</button>
      </div>
    )
  }
  render() {
    return (
      <div className="App">
        {this.renderFormContainer()}
        {this.state.showComparsion ? this.renderComparsionTable() : null}
      </div>
    );
  }
}

export default App;
