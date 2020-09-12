import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from 'react-native';
import { auth } from '../config'
import firebase from 'firebase';

import Logo from '../components/Logo';
import Name from '../components/LogoType';

export default class WelcomeScreen extends React.Component {
  // comdponentDidMount() {
  //   if (auth.currentUser) {
  //     if (auth.currentUser.displayName[0] == 's')
  //       this.props.navigation.navigate('MainApp');
  //     if (auth.currentUser.displayName[0] == 't')
  //       this.props.navigation.navigate('TeachersApp');
  //   }
  //   auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       if (user.displayName[0] == 's')
  //         this.props.navigation.navigate('MainApp');
  //       if (user.displayName[0] == 't')
  //         this.props.navigation.navigate('TeachersApp');
  //     }
  //   });
  // }
  render() {
    return (
      <View style={styles.container}>
        <Logo size={150} />
        <Name />
        <Text style={{ fontSize: 24, fontFamily: "Head" }}>Welcome!</Text>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('StudentLogin');
          }}
          style={[styles.button, { backgroundColor: 'blue' }]}
          activeOpacity={0.8}>
          <Text style={[styles.text, { color: '#fff' }]}>I AM A STUDENT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('TeacherLogin');
          }}
          style={styles.button}
          activeOpacity={0.8}>
          <Text style={styles.text}>I AM A TEACHER</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: 10,
    borderWidth: 1,
    borderColor: 'blue',
    width: '90%',
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    elevation: 3
  },
  text: {
    fontFamily: "Body-Bold",
    fontSize: 20,
    color: 'blue',
    // fontWeight: "bold",
    textAlign: 'center',
    // color: '#fff',
  },
});
