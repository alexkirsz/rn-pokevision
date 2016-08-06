import React, { PropTypes } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  footer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    margin: 20,
    flexDirection: 'row',
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    opacity: 0.6,
  },
  buttonFollow: {
    backgroundColor: 'blue',
  },
  buttonFollowActive: {
    backgroundColor: 'green',
  },
  cursorContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cursor: {
    width: 5,
    height: 5,
    backgroundColor: 'black',
    opacity: 0.2,
    borderRadius: 5,
  },
});

function Overlay(props) {
  const { follow, onToggleFollow } = props;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {!follow &&
        <View style={styles.cursorContainer} pointerEvents="none">
          <View style={styles.cursor} />
        </View>
      }
      <View style={styles.footer} pointerEvents="box-none">
        <TouchableWithoutFeedback
          onPress={onToggleFollow}
        >
          <View
            style={[
              styles.button,
              styles.buttonFollow,
              follow && styles.buttonFollowActive,
            ]}
          />
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

Overlay.propTypes = {
  follow: PropTypes.bool.isRequired,

  onToggleFollow: PropTypes.func.isRequired,
};

export default Overlay;
