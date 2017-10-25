import React from 'react';
import PropTypes from 'prop-types';

import {
  TouchableOpacity,
  Text,
  Image,
  Alert
} from 'react-native';

export default function Controls({ styles, textStyles, label, onPressControl, element }) {

  let arrow;
  if (element === 'previous') {
    arrow = <Image source={require('./arrowLeftRound-o.png')} />;
  }
  else {
    arrow = <Image source={require('./arrowRightRound-o.png')} />;
  }

  return (
    <TouchableOpacity
      style={{ paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10 }}
      onPress={() => onPressControl()}
    >
      {arrow}
    </TouchableOpacity>
  );
}

Controls.propTypes = {
  styles: PropTypes.shape({}).isRequired,
  label: PropTypes.string.isRequired,
  onPressControl: PropTypes.func.isRequired,
};
