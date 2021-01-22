import { MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import { ScreenNames } from '../reducers/screen';
import MainScreen from './MainScreen';

class App extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const {currentScreen} = this.props.screen;

        let screenComponent = null;
        switch (currentScreen) {
            case ScreenNames.MAIN_SCREEN:
                screenComponent = <MainScreen/>;
                break;
            default:
                screenComponent = <MainScreen/>;
        }
        return (
            <div>
                {screenComponent}
            </div>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
App.propTypes = {
    screen: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        screen: state.screen
    }
}

/**
 * Binding actions
 * @param  {function}
 */
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(PageActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)
