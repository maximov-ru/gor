import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { PageActions } from '../actions/index';
import { ScreenNames } from '../reducers/screen';
import Drawer from '@material-ui/core/Drawer';
import Paper from "../../node_modules/@material-ui/core/Paper/Paper";
import Table from "../../node_modules/@material-ui/core/Table/Table";
import TableHead from "../../node_modules/@material-ui/core/TableHead/TableHead";
import TableRow from "../../node_modules/@material-ui/core/TableRow/TableRow";
import TableCell from "../../node_modules/@material-ui/core/TableCell/TableCell";
import TableBody from "../../node_modules/@material-ui/core/TableBody/TableBody";
import IconButton from '@material-ui/core/IconButton';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Checkbox from '@material-ui/core/Checkbox';

import CarProgress from "./CarProgress";
import {stream} from "../index";

const CUSTOM_ID = 'custom';

const styles = theme => ({
    tWrapper: {
        marginTop: 10,
        overflow: 'auto'
    },
    headCell: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    bodyCell: {
        fontSize: 14,
    },
    tRow: {
        height: 30,
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    }
});

class MainScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            completed: 0,
            buffer: 0,
            selectedIds: {}
        };
    }

    componentDidMount() {
        this.timer = setInterval(this.progress, 500);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    progress = () => {
        const { completed } = this.state;

        if (completed > 100) {
            this.setState({ completed: 0, buffer: 0 });
        } else {
            const diff = Math.random() * 3;
            this.setState({ completed: completed + diff, buffer: completed + diff});
        }
    };

    handleSelectId(event) {
        console.log(event, {[event.target.value]: event.target.checked});
        this.setState({selectedIds: {...this.state.selectedIds, [event.target.value]: event.target.checked}});
        console.log('seli', this.state.selectedIds, {selectedIds: {...this.state.selectedIds, [event.target.value]: event.target.checked}});
    }

    routeDetails(event) {
        console.log('click', event, this.props.pageActions);
        const ids = Object.keys(this.state.selectedIds).filter(v => v);
        // stream.subscribeToRoute(event);
        console.log('ids', this.state.selectedIds, ids);
        stream.subscribeToRouteIds(ids);
        this.props.pageActions.changeScreen(ScreenNames.ROUTE_DETAILS_SCREEN);
    }

    render() {
        const {classes, taxi} = this.props;
        const { completed, buffer, selectedIds } = this.state;
        const {routes} = taxi;

        return (
            <Grid
                container
                justify='center'>
                <Paper className={classes.tWrapper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.headCell}>Район</TableCell>
                                <TableCell className={classes.headCell}>Название мед организации</TableCell>
                                <TableCell className={classes.headCell}>количество номерков</TableCell>
                                <TableCell className={classes.headCell}>Total completed trips</TableCell>
                                <TableCell className={classes.headCell}>Trips</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow className={classes.tRow}>
                                <TableCell component="th" scope="row" className={classes.bodyCell}>
                                    {taxi.totalDrivers}
                                </TableCell>
                                <TableCell className={classes.bodyCell}>{taxi.totalClients}</TableCell>
                                <TableCell className={classes.bodyCell}>{taxi.totalProfit}</TableCell>
                                <TableCell className={classes.bodyCell}>{taxi.totalCompletedTrips}</TableCell>
                                <TableCell className={classes.bodyCell}>{taxi.tripsInProgress}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Paper>
                <Paper className={classes.tWrapper}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.headCell}>distance</TableCell>
                                <TableCell className={classes.headCell}>Passengers</TableCell>
                                <TableCell className={classes.headCell}>Route</TableCell>
                                <TableCell className={classes.headCell}>Profit</TableCell>
                                <TableCell className={classes.headCell}>chk</TableCell>
                                <TableCell className={classes.headCell}>actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                routes.length > 0
                                    ? routes.map(route => {

                                           return <TableRow className={classes.tRow} key={route.id}>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {route.distance}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {route.passengers}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   <CarProgress value={Math.round(route.progress*100)} />
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {route.profit}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   <Checkbox
                                                       checked={selectedIds[route.id]}
                                                       onChange={this.handleSelectId.bind(this)}
                                                       value={route.id.toString()}
                                                   ></Checkbox>
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {route.id} <IconButton aria-label="View" className={classes.margin}
                                                    onClick={e => this.routeDetails(route.id)}>
                                                       <VisibilityIcon fontSize="small" />
                                                   </IconButton>
                                               </TableCell>
                                           </TableRow>
                                        })
                                    : null
                            }
                        </TableBody>
                    </Table>
                </Paper>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
MainScreen.propTypes = {
    screen: PropTypes.object.isRequired,
    taxi: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
    return {
        screen: state.screen,
        taxi: state.taxi
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

export default withStyles(styles)(connect(
    mapStateToProps,
    mapDispatchToProps
)(MainScreen));
