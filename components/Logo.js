import React from 'react';
import { Image, View } from 'react-native';

export default class Logo extends React.Component {
  render() {
    if (!this.props.fullCircle) {
      return (
        <Image
          style={{
            width: this.props.size || 100,
            height: this.props.size || 100,
          }}
          source={require('../assets/logo.png')}
        />
      );
    } else {
      return (
        <View
          style={{
            backgroundColor: '#fff',
            padding: 8,
            borderRadius: 80,
            alignItems: 'center'
          }}>
          <Image
            style={{
              width: this.props.size || 100,
              height: this.props.size || 100,
            }}
            source={require('../assets/logo.png')}
          />
        </View>
      );
    }
  }
}
