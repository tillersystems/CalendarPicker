import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Text,
} from 'react-native';
import { Utils } from './Utils';

export default function Weekdays(props) {
    const { styles, startFromMonday, weekdays, textStyle } = props;
    let wd = Utils.shiftStartOfWeek((!weekdays) ? Utils.WEEKDAYS : weekdays, startFromMonday);
    
    return (
        <View style={styles.dayLabelsWrapper}>
        { wd.map((day, key) => {
            return (
                <Text key={key} style={[styles.dayLabels, textStyle]}>
                {day}
                </Text>
            );
        })
    }
    </View>
);
}

Weekdays.propTypes = {};
