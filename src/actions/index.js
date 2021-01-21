import { store } from '../index';

export const ActionsList = {
    'SIGN_UP': 'SIGN_UP',
    'LOG_OUT': 'LOG_OUT',
    'SIGN_IN': 'SIGN_IN',
    'CHANGE_SCREEN': 'CHANGE_SCREEN',
    'GO_BACK_SCREEN': 'GO_BACK_SCREEN',
    'SAVE_CURRENT_SCREEN_STATE': 'SAVE_CURRENT_SCREEN_STATE',
    'ADD_REQUEST': 'ADD_REQUEST',
    'DECLINE_REQUEST': 'DECLINE_REQUEST'
};

export const PageActions = {
    changeScreen: (screenName) => ({
        type: ActionsList.CHANGE_SCREEN,
        payload: screenName
    }),

    goBackScreen: () => ({
        type: ActionsList.GO_BACK_SCREEN
    }),
    saveCurrentScreenState: (payload) => ({
        type: ActionsList.SAVE_CURRENT_SCREEN_STATE,
        payload
    }),
    signUp: (payload) => ({
        type: ActionsList.SIGN_UP,
        payload
    }),
    logOut: () => ({
        type: ActionsList.LOG_OUT
    }),
    signIn: (payload) => ({
        type: ActionsList.SIGN_IN,
        payload
    })
};
