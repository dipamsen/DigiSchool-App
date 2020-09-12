import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';

export default class Radio extends React.Component {
  render() {
    return (
      <View style={{ flexDirection: 'row', alignItems: "center" }}>
        <RadioButton ref={(l) => (this.coo = l)} {...this.props} />
        <Text>{this.props.value}</Text>
      </View>
    );
  }
}
