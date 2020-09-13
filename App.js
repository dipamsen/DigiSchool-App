import * as React from 'react';
import { Text, View, StyleSheet, ScrollView, LogBox } from 'react-native';
import { Icon } from 'react-native-elements';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { Provider } from 'react-native-paper';
import theme from './components/theme';

import Welcome from './screens/WelcomeScreen';
import StudentLogin from './screens/StudentLogin';
import TeacherLogin from './screens/TeacherLogin';
import StudyMaterials from './screens/StudyMaterials';
import Profile from './screens/Profile';
import StudyMaterialsTchr from './screens/StudyMaterialsTchr';
import Splash from './screens/Splash';
import CustomDrawer from './components/CustomDrawer';
import CustomDrawerTchr from './components/CustomDrawerTchr';
import Chatter from './screens/Chatter';
import BrainGames from './screens/BrainGames'

console.disableYellowBox = true;
const MainApp = createAppContainer(
  createDrawerNavigator(
    {
      'Study Materials': {
        screen: StudyMaterials,
        navigationOptions: {
          drawerIcon: <Icon name="book" type="font-awesome" />,
        },
      },
      "Discussion Wall": {
        screen: Chatter,
        navigationOptions: {
          drawerIcon: <Icon name="message" />
        }
      },
      "Recreation": {
        screen: BrainGames,
        navigationOptions: {
          drawerIcon: <Icon name="extension" />
        }
      },
      Profile: {
        screen: Profile,
        navigationOptions: {
          drawerIcon: <Icon name="user" type="font-awesome" />,
        },
      },
    },
    {
      contentComponent: CustomDrawer,
      contentOptions: {
        activeTintColor: 'red',
        inactiveTintColor: 'grey',
        labelStyle: {
          fontSize: 16,
          fontFamily: 'Body-Bold',
          fontWeight: 'normal',
        },
      },
    }
  )
);

const TeachersApp = createAppContainer(
  createDrawerNavigator(
    {
      'Your Resources': {
        screen: StudyMaterialsTchr,
        navigationOptions: {
          drawerIcon: <Icon name="book" type="font-awesome" />,
        },
      },
      "Discussion Wall": {
        screen: Chatter,
        navigationOptions: {
          drawerIcon: <Icon name="message" />
        }
      },
      Profile: {
        screen: Profile,
        navigationOptions: {
          drawerIcon: <Icon name="user" type="font-awesome" />,
        },
      },
    },
    {
      contentComponent: CustomDrawerTchr,
      contentOptions: {
        activeTintColor: 'red',
        inactiveTintColor: 'grey',
        labelStyle: {
          fontSize: 16,
          fontFamily: 'Body-Bold',
          fontWeight: 'normal',
        },
      },
    }
  )
);

// Orange #FD7F26

const AppNav = createAppContainer(
  createSwitchNavigator({
    Splash,
    Welcome,
    StudentLogin,
    TeacherLogin,
    MainApp,
    TeachersApp,
  }, {
    backBehavior: "history"
  })
);

export default class App extends React.Component {
  render() {
    return (
      <Provider theme={theme}>
        <AppNav />
      </Provider>
    );
  }
}
