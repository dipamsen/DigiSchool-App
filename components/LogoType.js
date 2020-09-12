import React from 'react';
import { Image, View } from 'react-native';

export default class Logotype extends React.Component {
  render() {
    return (
      <Image
        source={require('../assets/digischool.jpg')}
        style={{
          width: this.props.width || 300,
          height: this.props.height || 100,
        }}
      />
    );
  }
}
