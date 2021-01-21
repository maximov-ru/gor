import { combineReducers } from 'redux';
import screen from './screen';
import main_data from './main_data';


const reducers = {
    screen,
    main: main_data
};

const siteStore = combineReducers(reducers);

export default siteStore
