import {Store} from "react-redux";
import {createEpicMiddleware} from "redux-observable";
import {createLogger} from "redux-logger";
import {createStore, applyMiddleware, GenericStoreEnhancer} from "redux";
import thunk from 'redux-thunk';
import {combineReducers} from "redux";
import {combineEpics} from "redux-observable";

import { reducer as formReducer } from "redux-form";

// import { reducer as cybernode } from './modules/cybernode';
// import { reducer as chaingear, epic as chaingearEpic } from './modules/chaingear';
// import { reducer as tokens } from './containers/Tokens/module';
// import { reducer as searchReducer, epic as searchEpic  } from './modules/search';

// import { reducer as tokensDetails, epic as tokensDetailsEpic } from './containers/TokensDetails/module';
// import { reducer as test } from './containers/Test/module';

export const combinedReducers = combineReducers({
  form: formReducer,
  // cybernode,
  // chaingear,
  // search: searchReducer,
  // tokens,
  // tokensDetails,
  // test
});

const rootEpic = combineEpics(
  // chaingearEpic,
  // searchEpic,
  // tokensDetailsEpic,
);

export function configureStore() {
  return createStore(
    combinedReducers,
    getMiddlewares()
  );
}

function getMiddlewares() {
  const logger = createLogger({
    collapsed: true
  });

  /**
   * Split middlewares which we using in development and in production.
   */
  if (process.env.NODE_ENV === "production") {
    return applyMiddleware(createEpicMiddleware(rootEpic), thunk);
  } else {
    return applyMiddleware(createEpicMiddleware(rootEpic), thunk);
  }
}
