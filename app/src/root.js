import * as React from "react";
import {Router, Route } from "react-router";

import { createHashHistory } from 'history'; //use hash becouse ipfs  use path /ipfs/hash/{app}

import App from "./containers/app/";
import HomePage from './containers/home/';
import NewRegister from './containers/new';
import RegisterPage from './containers/register/';

export const history = createHashHistory({  });

export function Root() {
  return (
    <Router  history={history}>
      <Route component={App} >
          <Route path={"/"} component={HomePage}/>
          <Route path={"/new"} component={NewRegister}/>
      </Route>
      <Route path={"/registers/:adress"} component={RegisterPage}/>
    </Router>
  );
}
