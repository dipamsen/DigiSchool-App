import React from 'react';
import { View, Text, Image } from 'react-native';
import firebase from 'firebase';
import { db, auth } from '../config';
import * as Font from 'expo-font';

export default class Splash extends React.Component {
  async componentDidMount() {
    await Font.loadAsync({
      Head: require('../assets/fonts/Pacifico-Regular.ttf'),
      Body: require('../assets/fonts/Montserrat-Regular.ttf'),
      'Body-Bold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
    });
    if (auth.currentUser) {
      if (auth.currentUser.displayName[0] == 's')
        this.props.navigation.navigate('MainApp');
      if (auth.currentUser.displayName[0] == 't')
        this.props.navigation.navigate('TeachersApp');
    }
    this.observer = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.displayName[0] == 's')
          this.props.navigation.navigate('MainApp');
        if (user.displayName[0] == 't')
          this.props.navigation.navigate('TeachersApp');
      } else {
        this.props.navigation.navigate('Welcome');
      }
    });
  }
  componentWillUnmount() {
    this.observer && this.observer();
    this.componentDidMount = undefined;
  }
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Image
          style={{ resizeMode: 'contain', width: '100%' }}
          source={require('../assets/loader.gif')}
        />
      </View>
    );
  }
}
