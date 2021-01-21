import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import AirportShuttle from '@material-ui/icons/AirportShuttle';

const styles = theme => ({
    wrapperClass: {
        width: '100%',
        height: 40,
        position: 'relative'
    },
    progressClass: {
        width: '100%',
        position: 'absolute',
        top: '20px',
    },
    carIcon: {
        fill: '#35b',
        marginLeft: '-12px'

    },
    iconWrap: {
        position: 'absolute',
        width: 24,
        height: 24,
        transition: '.4s linear'
    }
});

class CarProgress extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const {classes, value} = this.props;

        const carStyles = {
            left: value + '%'
        };
        return (
            <Grid
                container
            className={classes.wrapperClass}>
                <LinearProgress color="primary" variant="determinate" value={value}
                                className={classes.progressClass}/>
                <div className={classes.iconWrap} style={carStyles}>
                    <AirportShuttle className={classes.carIcon} />
                </div>
            </Grid>
        )
    }
}

/**
 * Set data types for App
 * @type {Object}
 */
CarProgress.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired
};

/**
 * Binding actions
 * @param  {function}
 */
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(PageActions, dispatch)
    }
}

export default withStyles(styles)(connect(
    null,
    mapDispatchToProps
)(CarProgress))