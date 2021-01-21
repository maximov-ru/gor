import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { PageActions } from '../actions/index';
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

    render() {
        const {classes, main} = this.props;
        const { completed, buffer, selectedIds } = this.state;
        const {lpu} = main;

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
                                <TableCell className={classes.headCell}>Ближайшая запись</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                lpu.length > 0
                                    ? lpu.map(item => {

                                           return <TableRow className={classes.tRow} key={item.id}>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {item.description}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {item.description}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {item.description}
                                               </TableCell>
                                               <TableCell scope="row" className={classes.bodyCell}>
                                                   {item.description}
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
    main: PropTypes.object.isRequired,
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
        main: state.main
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
