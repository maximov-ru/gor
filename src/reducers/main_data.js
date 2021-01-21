import { ActionsList } from '../actions';
import { streamConfig } from '../index';

const initialState = {
    struct: []
};

const main_data = (state = initialState, action) => {
    switch (action.type) {
        case 'UpdateRoutes':
            return Object.assign({}, state, {routes: action.payload});
        case 'UpdateTotalInfo':
            return Object.assign({}, state, action.payload);
        case 'UpdateCurrentRoute':
            return Object.assign({}, state, {currentRoutes: action.payload});
        default:
            return state
    }
};

export default main_data
