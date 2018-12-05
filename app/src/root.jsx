import * as React from 'react';
import { Router, Route } from 'react-router';
import { createHashHistory } from 'history'; // use hash becouse ipfs  use path /ipfs/hash/{app}
import { MainContainer } from '@cybercongress/ui';
import HomePage from './containers/home';
import NewRegister from './containers/new/RegitryInitialization';
import RegisterPage from './containers/register';
import App from './containers/App/App';
import SchemaDefinition from "./containers/new/SchemaDefinition";

export const history = createHashHistory({ });

export function Root() {
    return (
        <Router history={ history }>
            <Route component={ App }>
                <Route component={ MainContainer }>
                    <Route path='/' component={ HomePage } />
                    <Route path='/new' component={ NewRegister } />
                    <Route path='/schema/:address' component={ SchemaDefinition } />
                </Route>
                <Route path='/registers/:address' component={ RegisterPage } />
            </Route>
        </Router>
    );
}
