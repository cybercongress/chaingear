import * as React from "react";
import * as ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {Root} from "./root";
import {configureStore} from "./configureStore";

// import "./global.less";


const store = configureStore();



ReactDOM.render(
    <Provider store={store}>
        <Root/>
    </Provider>
    , document.getElementById("root")
);


