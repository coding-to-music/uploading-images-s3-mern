import React, { Component } from "react";
import { Link } from "react-router-dom";
import setAuthToken from "../utils/setAuthtoken";
import axios from "axios";

export class Dashboard extends Component {
  state = {
    user: {},
    // description: "",
    selectedFile: null,
  };
  componentWillMount() {
    const token = localStorage.getItem("example-app");

    if (token) {
      setAuthToken(token);
    }

    // axios
    //   .get("api/user")
    //   .then((response) => {
    //     this.setState({
    //       user: response.data,
    //     });
    //   })
    //   .catch((err) => console.log(err.response));
  }
  handleLogout = () => {
    localStorage.removeItem("example-app");
    this.setState({
      redirect: true,
    });
  };
  handleSelectedFile = (e) => {
    e.preventDefault();
    this.setState({
      // description: e.target.value,
      selectedFile: e.target.files[0],
    });
  };

  onSubmit = e =>{
    e.preventDefault()
    console.log(e.target)
    const data = new FormData(e.target);
    data.append("file", this.state.selectedFile);
    axios
    .post('/upload', data)
    .then(res =>{
      console.log(res.data)
    })
    .catch((err) => console.log(data, err.response));
  }
 
  render() {
    const { description, selectedFile } = this.state;
    return (
      <div>
        {/* <i className="material-icons account-icon">account_circle</i> */}
        <Link to="/">
          <button className="logout-button" onClick={this.handleLogout}>
            Log Out
          </button>
        </Link>
        <h1>Dashboard</h1>

        <form method="post" encType="multipart/form-data" onSubmit={this.onSubmit}>
          <p>
            {/* <input type="text" name="title"   placeholder="optional title" /> */}
          </p>

          <p>
            <input type="file" accept="image/*" name="file" onChange={this.handleSelectedFile}/>
          </p>

          <p>
            <input type="submit" />
          </p>
        </form>
      </div>
    );
  }
}

export default Dashboard;
