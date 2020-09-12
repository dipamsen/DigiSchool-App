import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';

import { Header, Icon } from 'react-native-elements';

export default class CustomHeader extends React.Component {
  render() {
    return (
      <Header
        backgroundColor="green"
        leftComponent={
          <Icon
            name={this.props.inner ? 'arrow-left' : 'menu'}
            type={this.props.inner ? 'font-awesome-5' : null}
            color="#fff"
            onPress={this.props.inner ? (() => {
              this.props.navigation.goBack();
            }) : (() => {
              this.props.navigation.openDrawer();
            })}
          />
        }
        centerComponent={{
          text: 'DigiSchool',
          style: {
            color: '#fff',
            fontSize: 28,
            fontFamily: "Head"
          },
        }}
      />
    );
  }
}
