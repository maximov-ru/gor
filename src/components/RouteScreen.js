import Backdrop from '@material-ui/core/Backdrop/Backdrop';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fade from '@material-ui/core/Fade/Fade';
import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PageActions } from '../actions/index';
import { networks } from '../constants/networks';
import InputFieldInState from '../models/InputFieldInState';
import { ScreenNames } from '../reducers/screen';
import Table from "../../node_modules/@material-ui/core/Table/Table";
import TableHead from "../../node_modules/@material-ui/core/TableHead/TableHead";
import TableRow from "../../node_modules/@material-ui/core/TableRow/TableRow";
import TableCell from "../../node_modules/@material-ui/core/TableCell/TableCell";
import TableBody from "../../node_modules/@material-ui/core/TableBody/TableBody";
import CarProgress from "./CarProgress";
import VisibilityIcon from "../../node_modules/@material-ui/icons/Visibility";
import Paper from "../../node_modules/@material-ui/core/Paper/Paper";
import {stream} from "../index";

const styles = theme => ({
    ctWrapper: {
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
    },
    yMap: {
        width: 600,
        height: 600
    }
});

const lineColors = [
    {
        colors: ["#000000","#FFF","#F00"],
        strokeWidth: [9, 8, 1],
        strokeStyle: [0,0,'dash']
    },
    {
        colors: ["#000000","#0a3"],
        strokeWidth: [9, 6],
        strokeStyle: [0,0]
    },
    {
        colors: ["#000000","#FFF","#36b"],
        strokeWidth: [9, 8, 1],
        strokeStyle: [0,0,'dash']
    },
    {
        colors: ["#000000","#822"],
        strokeWidth: [9, 8],
        strokeStyle: [0,0]
    },
    {
        colors: ["#000000","#33f"],
        strokeWidth: [9, 1],
        strokeStyle: [0,'dash']
    },
    {
        colors: ["#000000","#FFF"],
        strokeWidth: [9, 8],
        strokeStyle: [0,'dash']
    }
];

class RouteScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            address: {value: '', error: ''},
            amount: {value: '', error: ''},
            password: {value: '', error: ''},
            showPassword: false,
            sendInProgress: false,
            openDialogue: false,
            dialogueTitle: '',
            dialogueMessage: null,
            completedSuccessful: false,
            commission: '-'
        };

        //TODO: subscribe to route details
        this.mapRef = React.createRef();
        this.yMap = null;

        this.lastRoutes = [];

    }

    componentDidMount() {
        ymaps.ready(() => {
            this.initMaps();
        });
    }

    initMaps() {
        console.log('ymaps', ymaps, ymaps.Map);
        this.yMap = new ymaps.Map(this.mapRef.current, {
            center: [59.9342802, 30.3350986],
            zoom: 13
        }, {
            searchControlProvider: 'yandex#search'
        });
    }

    initMap() {

    }

    updateData(currentRoutes) {
        if (this.lastRoutes.length) {
            this.lastRoutes.map((rt) => {this.yMap.geoObjects
                .remove(rt)});
        }
        if(currentRoutes.length) {
            currentRoutes.map( (currentRoute, ind) => {
                const myPath = Object.keys(currentRoute.path).map(key => {
                    const point = currentRoute.path[key].point;
                    return [point.latitude, point.longitude];
                });
                const cInd = ind % lineColors.length;
                const lastRoute = new ymaps.Polyline(myPath, {
                    // Описываем свойства геообъекта.
                    // Содержимое балуна.
                    balloonContent: "Route"
                }, {
                    // Задаем опции геообъекта.
                    // Отключаем кнопку закрытия балуна.
                    balloonCloseButton: false,
                    // Цвет линии - черная, белая и красная
                    strokeColor: lineColors[cInd].colors,
                    // Ширина линии.
                    strokeWidth: lineColors[cInd].strokeWidth,
                    // Для третьей обводки задаем стиль
                    strokeStyle: lineColors[cInd].strokeStyle
                });
                console.log('myPath', myPath, lastRoute);
                this.yMap.geoObjects
                    .add(lastRoute);
                this.lastRoutes.push(lastRoute);
            });
        } else {
            console.log('empty');
        }
    }

    goBack() {
        stream.unsubscribeFromAll();
        this.props.pageActions.changeScreen(ScreenNames.ROUTE_DETAILS_SCREEN);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {taxi} = nextProps;
        const {currentRoutes} = taxi;
        console.log('nextProps', nextProps);
        this.updateData(currentRoutes);
        return false;
    }

    componentWillUnmount() {

        //TODO: unsubscribe from route details
        //clearInterval(this.timer);
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid
                container
                justify='center'>
                <Paper className={classes.tWrapper}>
                    <Button variant="contained" color="primary" onClick={this.goBack.bind(this)}>
                        back
                    </Button>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.headCell}>distance</TableCell>
                                <TableCell className={classes.headCell}>Passengers</TableCell>
                                <TableCell className={classes.headCell}>Route</TableCell>
                                <TableCell className={classes.headCell}>Profit</TableCell>
                                <TableCell className={classes.headCell}>actions</TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </Paper>
                <Grid
                    container
                    justify='center'>
                    <div ref={this.mapRef} className={classes.yMap}>

                    </div>
                </Grid>
            </Grid>
        )
    }
};
/**
 * Set data types for App
 * @type {Object}
 */
RouteScreen.propTypes = {
    taxi: PropTypes.object.isRequired,
    screen: PropTypes.object.isRequired,
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
)(RouteScreen))
