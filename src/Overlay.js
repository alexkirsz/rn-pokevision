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
  buttonScan: {
    backgroundColor: 'green',
  },
  buttonScanLoading: {
    backgroundColor: 'orange',
  },
  buttonScanThrottled: {
    backgroundColor: 'blue',
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
  const { follow, loading, throttled, onToggleFollow, onScan } = props;

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
        <TouchableWithoutFeedback
          onPress={(throttled || loading) ? null : onScan}
        >
          <View
            style={[
              styles.button,
              styles.buttonScan,
              loading && styles.buttonScanLoading,
              throttled && styles.buttonScanThrottled,
            ]}
          />
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

Overlay.propTypes = {
  follow: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  throttled: PropTypes.bool.isRequired,

  onToggleFollow: PropTypes.func.isRequired,
  onScan: PropTypes.func.isRequired,
};

export default Overlay;
