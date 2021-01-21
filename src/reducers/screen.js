import { ActionsList } from '../actions';

export const ScreenNames = {
    'MAIN_SCREEN': 'MAIN_SCREEN'
};

const initialState = {
    currentScreen: ScreenNames.MAIN_SCREEN,
    screenHistory: [],
    currentScreenData: {}
};

const MAX_HISTORY_LENGTH = 3;

const storageKey = 'screen';

const screen = (state = initialState, action) => {
    switch (action.type) {
        case ActionsList.SAVE_CURRENT_SCREEN_STATE: {
            return Object.assign(
                    {},
                    state,
                    {currentScreenData: {screenName: state.currentScreen, data: action.payload}}
                );
        }
        case ActionsList.CHANGE_SCREEN: {
                console.log('action', action);
                const screenHistory = state.screenHistory.concat([state.currentScreen]);
                if (screenHistory.length > MAX_HISTORY_LENGTH) {
                    screenHistory.shift();
                }
                const currentScreenData = null;
                return Object.assign({}, state, {currentScreen: action.payload, screenHistory, currentScreenData});
            }
        case ActionsList.GO_BACK_SCREEN: {
                if (state.screenHistory) {
                    const currentScreenData = null;
                    const screenHistory = state.screenHistory.concat();
                    const currentScreen = screenHistory.pop();
                    return Object.assign({}, state, {currentScreen, screenHistory, currentScreenData});
                }
                return state;
            }
        case ActionsList.SIGN_UP:
        case ActionsList.SIGN_IN:
            const screenName = ScreenNames.MAIN_SCREEN;

            return Object.assign({}, state, {screenHistory: [], currentScreen: screenName});
        case ActionsList.LOG_OUT:
            return Object.assign({}, state, {screenHistory: [], currentScreen: ScreenNames.SIGN_IN_SCREEN});
        default:
            return state
    }
};

export default screen;
