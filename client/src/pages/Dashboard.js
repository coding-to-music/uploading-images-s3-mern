import React, { Component } from "react";
import { Link } from "react-router-dom";
import setAuthToken from "../utils/setAuthtoken";
import axios from "axios";

export class Dashboard extends Component {
  state = {
    user: {},
    // description: "",
    selectedFile: null
  };
  componentWillMount() {
    const token = localStorage.getItem("example-app");

    if (token) {
      setAuthToken(token);
    }

    axios
      .get("api/user")
      .then((response) => {
        this.setState({
          user: response.data,
        });
      })
      .catch((err) => console.log(err.response));
  }
  handleLogout = () => {
    localStorage.removeItem("example-app");
    this.setState({
      redirect: true,
    });
  };
  handleSelectedFile = e => {
    e.preventDefault();
    this.setState({
      // description: e.target.value,
      selectedFile: e.target.files[0]
    });
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleUpload = event => {
    event.preventDefault();
    const data = new FormData(event.target);
    data.append("file", this.state.selectedFile);
console.log(data)
    axios
      .post('/api/upload', data)
      .then(() => {
        this.props.history.push("/");
      })
      .catch(error => {
        alert("Oops some error happened, please try again");
      });
  };
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

        <form method="post" enctype="multipart/form-data" action="/upload">
    <p>
        <input type="text" name="title" placeholder="optional title"/>
    </p>

    <p>
        <input type="file" name="upl"/>
    </p>

    <p>
        <input type="submit"/>
    </p>
</form>
      </div>
    );
  }
}

export default Dashboard;
