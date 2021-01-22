import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import App from './components/App';
import reducer from './reducers';
window.allData = null;
$.ajax({
    url: '/getAllData',
    dataType: 'json',
    success: (allData) => {
        window.allData = allData;
        console.log(allData);
        const store = createStore(reducer());

        render(
            <Provider store={store}>
                <App />
            </Provider>,
            document.getElementById('root')
        );
    }
});

