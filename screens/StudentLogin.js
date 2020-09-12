import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ImageBackground,
  ToastAndroid,
  Keyboard,
} from 'react-native';
import * as Notifications from 'expo-notifications';

import { Input, Overlay } from 'react-native-elements';

import Logo from '../components/Logo';
import Name from '../components/LogoType';

import { db, auth } from '../config';
import firebase from 'firebase';

// Default Styles
let fontSize = 20;
let fontFamily = 'Body-Bold';

export default class StudentLogin extends React.Component {
  constructor() {
    super();
    this.state = {
      modalVisible: false,
      loginEmail: '',
      loginPass: '',
      rEmail: '',
      rPass: '',
      rUID: '',
      rCPass: '',
      rName: '',
      rClass: 0,
      currentScreen: 'LoginOrRegister',
    };
  }
  login = async () => {
    Keyboard.dismiss()
    let email = this.state.loginEmail;
    let password = this.state.loginPass;
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          if (auth.currentUser.displayName[0] == 't') {
            auth.signOut();
            Alert.alert('Error', 'Invalid Student Account');
            this.setState({ loginEmail: '', loginPass: '' });
            return;
          }
          Notifications.requestPermissionsAsync().then(({ granted }) => {
            Notifications.getExpoPushTokenAsync().then(async ({ data }) => {
              if (!granted) {
                alert('Please Allow Notifications');
                await Notifications.requestPermissionsAsync();
              }
              if (data) {
                db.collection('studentsData')
                  .where('email', '==', auth.currentUser.email)
                  .get()
                  .then((snapshot) => {
                    db.collection('studentsData')
                      .doc(snapshot.docs[0].id)
                      .update({
                        expoPushToken: data,
                      });
                  });
              }
              this.props.navigation.navigate('MainApp');
              ToastAndroid.show('Login Successful.', ToastAndroid.SHORT);
              this.setState({ loginEmail: '', loginPass: '' });
            });
          });
        })
        .catch((err) => {
          Alert.alert('Error', err.message);
          this.setState({ loginEmail: '', loginPass: '' });
        });
    }
  };
  register = () => {
    Keyboard.dismiss()
    let { rCPass, rClass, rEmail, rName, rUID, rPass } = this.state;
    if (!(rCPass && rClass && rEmail && rName && rUID && rPass)) {
      return Alert.alert('Error', 'Please fill all the fields.');
    }
    if (rCPass != rPass)
      return Alert.alert('Error', 'Please check your password.');
    firebase
      .auth()
      .createUserWithEmailAndPassword(rEmail, rPass)
      .then((user) => {
        db.collection('studentsData')
          .add({
            email: rEmail,
            name: rName,
            class: +rClass,
            username: rUID,
          })
          .then(() => {
            firebase
              .auth()
              .currentUser.updateProfile({ displayName: `s${rName}` });
            Notifications.requestPermissionsAsync().then(({ granted }) => {
              Notifications.getExpoPushTokenAsync().then(async ({ data }) => {
                if (!granted) {
                  alert('Please Allow Notifications');
                  await Notifications.requestPermissionsAsync();
                }
                if (data) {
                  db.collection('studentsData')
                    .where('email', '==', auth.currentUser.email)
                    .get()
                    .then((snapshot) => {
                      db.collection('studentsData')
                        .doc(snapshot.docs[0].id)
                        .update({
                          expoPushToken: data,
                        });
                    });
                }
                Alert.alert('Registration Successful.');
                this.props.navigation.navigate('MainApp');
              });
            });
          });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };
  showModal = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          width: '90%',
          height: '80%',
        }}>
        <Text style={{ fontSize: 28, fontFamily: 'Head', color: '#fff' }}>
          Register
        </Text>
        <ScrollView style={{ width: '100%' }}>
          <Input
            autoCompleteType="off"
            placeholder="Name"
            label="Name"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            inputStyle={{ color: '#fff' }}
            onChangeText={(rName) => this.setState({ rName })}
            value={this.state.rName}
          />
          <Input
            placeholder="Class"
            label="Class"
            autoCompleteType="off"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rClass) => this.setState({ rClass })}
            inputStyle={{ color: '#fff' }}
            value={this.state.rClass}
            keyboardType="numeric"
          />
          <Input
            autoCompleteType="off"
            placeholder="Username"
            label="User ID"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rUID) => this.setState({ rUID })}
            inputStyle={{ color: '#fff' }}
            value={this.state.rUID}
          />
          <Input
            autoCompleteType="off"
            placeholder="Email ID"
            label="Email ID"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rEmail) => this.setState({ rEmail })}
            value={this.state.rEmail}
            inputStyle={{ color: '#fff' }}
            keyboardType="email-address"
          />
          <Input
            placeholder="Password"
            autoCompleteType="off"
            label="Password"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rPass) => this.setState({ rPass })}
            value={this.state.rPass}
            inputStyle={{ color: '#fff' }}
            secureTextEntry
          />
          <Input
            autoCompleteType="off"
            placeholder="Password"
            label="Confirm Password"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rCPass) => this.setState({ rCPass })}
            value={this.state.rCPass}
            inputStyle={{ color: '#fff' }}
            secureTextEntry
          />
        </ScrollView>
      </View>
    );
  };
  loginUI = () => {
    return (
      <>
        <Text
          style={{
            fontSize: 24,
            marginBottom: 10,
            fontFamily: 'Head',
            color: '#fff',
          }}>
          Login to Continue.
        </Text>
        <Input
          autoCompleteType="off"
          placeholder="Email ID"
          placeholderStyle={{ fontFamily: 'Body' }}
          inputStyle={{ color: '#fff' }}
          label="Email ID"
          labelStyle={{
            color: '#fff',
            fontFamily: 'Body-Bold',
            fontWeight: 'normal',
          }}
          onChangeText={(loginEmail) => this.setState({ loginEmail })}
          value={this.state.loginEmail}
          leftIcon={{ name: 'envelope', type: 'font-awesome', color: '#fff' }}
          keyboardType="email-address"
        />
        <Input
          autoCompleteType="off"
          placeholder="Password"
          placeholderStyle={{ fontFamily: 'Body' }}
          inputStyle={{ color: '#fff' }}
          label="Password"
          labelStyle={{
            color: '#fff',
            fontFamily: 'Body-Bold',
            fontWeight: 'normal',
          }}
          leftIcon={{ name: 'key', type: 'font-awesome-5', color: '#fff' }}
          onChangeText={(loginPass) => this.setState({ loginPass })}
          value={this.state.loginPass}
          secureTextEntry
        />
      </>
    );
  };
  render() {
    if (this.state.currentScreen == 'LoginOrRegister') {
      return (
        <View style={styles.container}>
          <View
            style={{
              marginVertical: '35%',
            }}>
            <View style={{ flexDirection: 'row', width: '90%' }}>
              <Logo size={80} />
              <Name width={240} height={80} />
            </View>
            <Text style={styles.textSlogan}>Learning with Fun</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.setState({ currentScreen: 'LoginScreen' });
            }}
            style={styles.loginButton}>
            <Text style={[styles.btnText, { color: '#fff' }]}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => {
              this.setState({ currentScreen: 'RegisterScreen' });
            }}>
            <Text style={[styles.btnText, { color: 'green' }]}>SIGN UP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('Welcome');
            }}
            style={{ marginTop: 8 }}>
            <Text style={{ fontFamily: 'Body' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (this.state.currentScreen == 'LoginScreen') {
      return (
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={require('../assets/background.png')}
            style={styles.container}>
            <Logo fullCircle />
            {this.loginUI()}
            <TouchableOpacity onPress={this.login} style={styles.loginButton}>
              <Text style={[styles.btnText, { color: '#fff' }]}>LOGIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({ currentScreen: 'LoginOrRegister' });
              }}
              style={{ marginTop: 8 }}>
              <Text style={{ fontFamily: 'Body', color: '#fff' }}>Go Back</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      );
    } else if (this.state.currentScreen == 'RegisterScreen') {
      return (
        <View style={{ flex: 1 }}>
          <ImageBackground
            source={require('../assets/background.png')}
            style={styles.container}>
            {this.showModal()}
            <TouchableOpacity
              onPress={this.register}
              style={styles.loginButton}>
              <Text style={[styles.btnText, { color: '#fff' }]}>
                Join DigiSchool!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({ currentScreen: 'LoginOrRegister' });
              }}
              style={{ marginTop: 8 }}>
              <Text style={{ fontFamily: 'Body', color: '#fff' }}>Go Back</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      );
    } else {
      return (
        <View>
          <Text>undefined</Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSlogan: {
    fontSize,
    fontFamily: 'Body',
    textAlign: 'center',
  },
  btnText: {
    fontSize,
    fontFamily: 'Body-Bold',
    textAlign: 'center',
  },
  loginButton: {
    padding: 10,
    borderRadius: 2,
    backgroundColor: 'green',
    elevation: 4,
    width: '90%',
    margin: 8,
  },
  signupButton: {
    padding: 10,
    fontSize,
    borderRadius: 2,
    backgroundColor: '#fff',
    elevation: 4,
    width: '90%',
    borderWidth: 1,
    borderColor: 'green',
    margin: 8,
  },
});
