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
  ToastAndroid, Keyboard
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { Overlay, Input } from 'react-native-elements';
import Logo from '../components/Logo';
import Name from '../components/LogoType';

import { db, auth } from '../config';
import firebase from 'firebase';

// Default Styles
let fontSize = 20;
let fontFamily = 'Body-Bold';

export default class TeacherLogin extends React.Component {
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
      rClasses: [],
      rSub: '',
      currentScreen: 'LoginOrRegister',
    };
  }
  login = () => {
    Keyboard.dismiss()
    let email = this.state.loginEmail;
    let password = this.state.loginPass;
    console.log(email, password);
    if (email && password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          if (auth.currentUser.displayName[0] == 's') {
            auth.signOut();
            Alert.alert('Error', 'Invalid Account.');
            this.setState({ loginEmail: '', loginPass: '' });
            return;
          }
          Notifications.requestPermissionsAsync().then(({ granted }) => {
            Notifications.getExpoPushTokenAsync().then(async ({ data }) => {
              if (data) {
                db.collection('teachersData')
                  .where('email', '==', auth.currentUser.email)
                  .get()
                  .then((snapshot) => {
                    db.collection('teachersData')
                      .doc(snapshot.docs[0].id)
                      .update({
                        expoPushToken: data,
                      });
                  });
              }
              this.props.navigation.navigate('TeachersApp');
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
    let { rCPass, rClasses, rSub, rEmail, rName, rUID, rPass } = this.state;
    if (!(rCPass && rClasses && rSub && rEmail && rName && rUID && rPass)) {
      return Alert.alert('Error', 'Please fill all the fields.');
    }
    if (rCPass != rPass)
      return Alert.alert('Error', 'Please check your password.');
    firebase
      .auth()
      .createUserWithEmailAndPassword(rEmail, rPass)
      .then((user) => {
        db.collection('teachersData')
          .add({
            email: rEmail,
            name: rName,
            classes: rClasses.split(",").map((v) => +v),
            username: rUID,
          })
          .then((user) => {
            firebase
              .auth()
              .currentUser.updateProfile({ displayName: `t${rName}` });
            Notifications.requestPermissionsAsync().then(({ granted }) => {
              Notifications.getExpoPushTokenAsync().then(async ({ data }) => {
                if (!granted) {
                  alert('Please Allow Notifications');
                  await Notifications.requestPermissionsAsync();
                }
                if (data) {
                  db.collection('teachersData')
                    .where('email', '==', auth.currentUser.email)
                    .get()
                    .then((snapshot) => {
                      db.collection('teachersData')
                        .doc(snapshot.docs[0].id)
                        .update({
                          expoPushToken: data,
                        });
                    });
                }
                this.props.navigation.navigate("TeachersApp")
                return Alert.alert('Registration Successful.');
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
            placeholder="Subject"
            label="Subject"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rSub) => this.setState({ rSub })}
            inputStyle={{ color: '#fff' }}
            value={this.state.rSub}
          />
          <Input
            label="Class"
            placeholder="Separate using commas if multiple"
            labelStyle={{
              color: '#fff',
              fontFamily: 'Body-Bold',
              fontWeight: 'normal',
            }}
            onChangeText={(rClasses) => this.setState({ rClasses })}
            inputStyle={{ color: '#fff' }}
            value={this.state.rClasses}
          // keyboardType="numeric"
          />
          <Input
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
            <Text style={styles.textSlogan}>DigiSchool for Teachers!</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.setState({ currentScreen: 'LoginScreen' });
            }}
            style={styles.loginButton}>
            <Text style={[styles.btnText, { color: '#000' }]}>LOGIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => {
              this.setState({ currentScreen: 'RegisterScreen' });
            }}>
            <Text style={[styles.btnText, { color: '#000' }]}>SIGN UP</Text>
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
              <Text style={styles.btnText}>LOGIN</Text>
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
              <Text style={styles.btnText}>Join DigiSchool!</Text>
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
    backgroundColor: 'orange',
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
    borderColor: 'orange',
    margin: 8,
  },
});
