import React, { Component } from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
} from 'react-native';
import { makeStyles } from './makeStyles';
import { Utils } from './Utils';
import HeaderControls from './HeaderControls';
import Weekdays from './Weekdays';
import DaysGridView from './DaysGridView';
import Swiper from './Swiper';

const SWIPE_LEFT = 'SWIPE_LEFT';
const SWIPE_RIGHT = 'SWIPE_RIGHT';

const swipeConfig = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
};

export default class CalendarPicker extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            currentMonth: null,
            currentYear: null,
            selectedStartDate: null,
            selectedEndDate: null,
            styles: {},
        };
        
        this.updateScaledStyles = this.updateScaledStyles.bind(this);
        this.updateMonthYear = this.updateMonthYear.bind(this);
        this.handleOnPressPrevious = this.handleOnPressPrevious.bind(this);
        this.handleOnPressNext = this.handleOnPressNext.bind(this);
        this.handleOnPressDay = this.handleOnPressDay.bind(this);
        this.onSwipe = this.onSwipe.bind(this);
    }
    
    static defaultProps = {
        initialDate: new Date(),
        scaleFactor: 375,
    }
    
    componentWillMount() {
        const date = this.props.initialDate;
        if (this.props.allowRangeSelection) {
            const originalDayPostion = date.getDay();
            const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (originalDayPostion == 0?-6:1)-originalDayPostion);
            const sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (originalDayPostion == 0?0:7)-originalDayPostion);
            
            this.setState({
                ...this.state,
                selectedStartDate: monday,
                selectedEndDate: sunday,
            });
        } else {
            this.setState({
                selectedStartDate: date,
                selectedEndDate: null,
            });
        }
        this.setState({...this.updateScaledStyles(this.props), ...this.updateMonthYear(this.props)});
    }
    
    componentWillReceiveProps(nextProps) {
        let newStyles = {};
        if (nextProps.width !== this.props.width ||
            nextProps.height !== this.props.height)
            {
                newStyles = this.updateScaledStyles(nextProps);
            }
            
            let newMonthYear = {}
            if (nextProps.initialDate.getTime() !== this.props.initialDate.getTime()) {
                this.updateMonthYear(nextProps, {});
            }
            
            this.setState({...newStyles, ...newMonthYear});
        }
        
        updateScaledStyles(props) {
            const {
                scaleFactor,
                selectedDayColor,
                selectedDayTextColor,
                todayBackgroundColor,
                width, height,
            } = props;
            
            // The styles in makeStyles are intially scaled to this width
            const containerWidth = width ? width : Dimensions.get('window').width;
            const containerHeight = height ? height : Dimensions.get('window').height;
            const initialScale = Math.min(containerWidth, containerHeight) / scaleFactor;
            return {styles: makeStyles(initialScale, selectedDayColor, selectedDayTextColor, todayBackgroundColor)};
        }
        
        updateMonthYear(props) {
            return {
                currentMonth: parseInt(props.initialDate.getMonth()),
                currentYear: parseInt(props.initialDate.getFullYear()),
            };
        }
        
        handleOnPressDay(day, type) {
            const {
                currentYear,
                currentMonth,
                selectedStartDate,
                selectedEndDate,
            } = this.state;
            
            const {
                allowRangeSelection,
                onDateChange,
                startFromMonday
            } = this.props;
            
            const date = new Date(currentYear, currentMonth, day);
            
            if (allowRangeSelection) {
                const originalDayPostion = date.getDay();
                
                // get week day (starts at 0 for sunday)
                const weekDay = date.getDay();
                const daysOffset = (startFromMonday) ? ((weekDay == 0) ? -6 : weekDay - 1) : weekDay;
                
                const rangeStartDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysOffset);
                const rangeEndDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysOffset + 6);
                
                this.setState({
                    selectedStartDate: rangeStartDate,
                    selectedEndDate: rangeEndDate,
                });
                
                // propagate to parent date has changed
                onDateChange(rangeStartDate, Utils.START_DATE);
                
                // propagate to parent date has changed
                onDateChange(rangeEndDate, Utils.END_DATE);
            } else {
                this.setState({
                    selectedStartDate: date,
                    selectedEndDate: null,
                });
                onDateChange(date, Utils.START_DATE);
            }
        }
        
        handleOnPressPrevious() {
            const { currentMonth, currentYear } = this.state;
            const previousMonth = currentMonth - 1;
            // if previousMonth is negative it means the current month is January,
            // so we have to go back to previous year and set the current month to December
            if (previousMonth < 0) {
                this.setState({
                    currentMonth: parseInt(11), // setting month to December
                    currentYear: parseInt(currentYear) - 1, // decrement year
                });
            } else {
                this.setState({
                    currentMonth: parseInt(previousMonth),
                    currentYear: parseInt(currentYear),
                });
            }
        }
        
        handleOnPressNext() {
            const { currentMonth, currentYear } = this.state;
            const nextMonth = currentMonth + 1;
            // if nextMonth is greater than 11 it means the current month is December,
            // so we have to go forward to the next year and set the current month to January
            if (nextMonth > 11) {
                this.setState({
                    currentMonth: parseInt(0), // setting month to January
                    currentYear: parseInt(currentYear) + 1, // increment year
                });
            } else {
                this.setState({
                    currentMonth: parseInt(nextMonth),
                    currentYear: parseInt(currentYear),
                });
            }
        }
        
        onSwipe(gestureName) {
            switch (gestureName) {
                case SWIPE_LEFT:
                this.handleOnPressNext();
                break;
                case SWIPE_RIGHT:
                this.handleOnPressPrevious();
                break;
            }
        }
        
        render() {
            const {
                currentMonth,
                currentYear,
                selectedStartDate,
                selectedEndDate,
                styles,
            } = this.state;
            
            const {
                allowRangeSelection,
                startFromMonday,
                initialDate,
                minDate,
                maxDate,
                weekdays,
                months,
                previousTitle,
                nextTitle,
                textStyle,
            } = this.props;
            
            return (
                <Swiper
                    onSwipe={(direction) => this.onSwipe(direction)}
                    config={swipeConfig} >
                    <View syles={ styles.calendar } >
                        <HeaderControls
                            styles={styles}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            initialDate={initialDate}
                            onPressPrevious={this.handleOnPressPrevious}
                            onPressNext={this.handleOnPressNext}
                            months={months}
                            previousTitle={previousTitle}
                            nextTitle={nextTitle}
                            textStyle={textStyle} />
                        
                        <Weekdays
                            styles={ styles }
                            startFromMonday={ startFromMonday }
                            weekdays={ weekdays }
                            textStyle={ textStyle } />
                        
                        <DaysGridView
                            month={currentMonth}
                            year={currentYear}
                            styles={styles}
                            onPressDay={this.handleOnPressDay}
                            startFromMonday={startFromMonday}
                            allowRangeSelection={allowRangeSelection}
                            selectedStartDate={selectedStartDate}
                            selectedEndDate={selectedEndDate}
                            minDate={minDate && minDate.setHours(0,0,0,0)}
                            maxDate={maxDate && maxDate.setHours(0,0,0,0)}
                            textStyle={textStyle} />
                    </View>
                </Swiper>
            );
        }
    }
