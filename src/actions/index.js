import { store } from '../index';

export const ActionsList = {
    'CONNECT_TO_NETWORK': 'CONNECT_TO_NETWORK',
    'DISCONNECT': 'DISCONNECT',
    'GET_BALANCE': 'GET_BALANCE',
    'UPDATE_BALANCE_CALLBACK': 'UPDATE_BALANCE_CALLBACK',
    'UPDATE_NETWORK_ITEMS': 'UPDATE_NETWORK_ITEMS',
    'CHANGE_NETWORK': 'CHANGE_NETWORK',
    'CHANGE_ACCOUNT': 'CHANGE_ACCOUNT',
    'CHANGE_REQUEST': 'CHANGE_REQUEST',
    'SEND_TRANSACTION': 'SEND_TRANSACTION',
    'GET_HISTORY': 'GET_HISTORY',
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
    connectToNetwork: (payload) => ({
        type: ActionsList.CONNECT_TO_NETWORK,
        payload
    }),
    updateNetworkItems: (payload) => ({
        type: ActionsList.UPDATE_NETWORK_ITEMS,
        payload
    }),
    addRequest: (payload) => ({
        type: ActionsList.ADD_REQUEST,
        payload
    }),
    declineRequest: () => ({
        type: ActionsList.DECLINE_REQUEST
    }),
    saveCurrentScreenState: (payload) => ({
        type: ActionsList.SAVE_CURRENT_SCREEN_STATE,
        payload
    }),
    changeNetwork: (payload) => ({
        type: ActionsList.CHANGE_NETWORK,
        payload
    }),
    changeAccount: (payload) => ({
        type: ActionsList.CHANGE_ACCOUNT,
        payload
    }),
    changeRequest: (payload) => ({
        type: ActionsList.CHANGE_REQUEST,
        payload
    }),
    disconnect: () => ({
        type: ActionsList.DISCONNECT
    }),
    updateBalanceCallback: (payload) => ({
        type: ActionsList.UPDATE_BALANCE_CALLBACK,
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
