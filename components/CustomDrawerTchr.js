import React from 'react';

import { ScrollView, View, Text, ImageBackground } from 'react-native';

import { Icon } from 'react-native-elements';
import { DrawerItems } from 'react-navigation-drawer';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import SafeAreaView from 'react-native-safe-area-view';
import { Button } from 'react-native-paper'

import Logo from '../components/Logo';
import Name from '../components/LogoType';

import firebase from 'firebase';
import { db, auth } from '../config';

const drawerbg = require('../assets/drawerbg.png')

export default class CustomDrawerContentComponent extends React.Component {
  constructor() {
    //***sjjsiskskjksjkjs */
    super();
    this.state = {
      name: 'Teacher',
      uid: null,
    };
  }
  componentDidMount() {
    if (!auth.currentUser) {
      this.props.navigation.navigate('Welcome');
    }
    db.collection('teachersData')
      .where('email', '==', auth.currentUser.email)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState({
            name: doc.data().name,
            uid: doc.data().username,
          });
        });
      });
    // this.props.items.push({key: "LogOut", routeName: "Welcome"})
  }
  render() {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1 }}
          forceInset={{ top: 'always', horizontal: 'never' }}>
          <ImageBackground
            source={drawerbg}
            style={{ width: '100%' }}>
            <View
              style={{
                padding: 10,
                paddingTop: '15%',
              }}>
              <Icon
                name="chalkboard-teacher"
                reverse={true}
                reverseColor="#000"
                type="font-awesome-5"
                color="#fff"
                size={34}
              />
              <Text style={{ fontSize: 24, fontFamily: 'Head' }}>
                {this.state.name}
              </Text>
              <Text style={{ fontSize: 18, fontFamily: 'Body' }}>
                @{this.state.uid}
              </Text>
            </View>
          </ImageBackground>
          <DrawerItems {...this.props} />
          <Button
            mode="outlined"
            onPress={() => {
              firebase
                .auth()
                .signOut()
                .then(() => {
                  this.props.navigation.navigate('Welcome');
                });
            }}>
            Sign Out
        </Button>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}
