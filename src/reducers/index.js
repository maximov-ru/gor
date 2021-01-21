import { combineReducers } from 'redux';
import { WorkMode } from '../constants/mode';
import screen from './screen';
import main_data from './main_data';


const reducers = {
    screen,
    main: main_data
};

const walletStore = combineReducers(reducers);

export default walletStore
