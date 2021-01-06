import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Card, Text, Button, Avatar } from 'react-native-paper';

import { createStackNavigator } from 'react-navigation-stack';
import UploadContent from './UploadContent';
import Submissions from './Submissions';

import Head from '../components/CustomHeader';
import { db, auth, storage } from '../config';
import firebase from 'firebase';
import * as Linking from 'expo-linking'
import { LinearGradient } from 'expo-linear-gradient';

const lol = {
  rd: 'Notes',
  hw: 'Assessment',
  ot: 'Other',
};

class StudyMaterials extends React.Component {
  constructor() {
    super();
    this.state = {
      refreshing: false,
      allResources: [],
    };
  }
  reload = () => {
    this.setState({ refreshing: true, allResources: [] });
    db.collection('studentResources')
      .where('teacher', '==', auth.currentUser.displayName.slice(1))
      .get().then((snapshot) => {
        this.setState(
          {
            allResources: snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })).sort((a, b) => b.date.toDate() - a.date.toDate()),
          },
          () => this.setState({ refreshing: false })
        );
      });
  };
  componentDidMount() {
    this.snapevent = db
      .collection('studentResources')
      .where('teacher', '==', auth.currentUser.displayName.slice(1))
      .onSnapshot((snapshot) => {
        this.setState(
          {
            allResources: snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })).sort((a, b) => b.date.toDate() - a.date.toDate()),
          },
          () => this.setState({ refreshing: false })
        );
      });
  }
  openResource = (path) => {
    storage
      .ref(path)
      .getDownloadURL()
      .then((url) => {
        Linking.openURL(url);
      });
  };
  componentWillUnmount() {
    this.snapevent();
  }
  render() {
    const navigate = this.props.navigation.navigate;
    return (
      <View style={{ flex: 1 }}>
        <Head navigation={this.props.navigation} />
        <Text style={{
          fontSize: 26, fontFamily: "Head", textAlign: "center"
        }}>Your Resources</Text>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.reload}
            />
          }>

          {this.state.allResources.map((v, i) => (
            <Card key={i} style={{ margin: 16, elevation: 10 }}>
              <LinearGradient
                // Background Linear Gradient
                colors={['#58FA66', '#92f590']}
              // start={[0, 0]}
              // end={[0.9, 0.9]}
              >
                <Card.Title
                  left={() => <Icon name="assignment" color="green" />}
                  title={v.name}
                  titleStyle={{ fontFamily: 'Head' }}
                  subtitle={`Grade ${v.class} - ${v.subject} - ${v.chapter}`}
                />
                <Card.Content>
                  <Text>Type: {lol[v.type]}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={() => {
                    this.openResource(v.path)
                  }}>Open</Button>
                  {v.type == "hw" ?
                    <Button
                      onPress={() => {
                        navigate('Submissions', {
                          docID: v.id,
                        });
                      }}
                    >
                      Check Submissions
                </Button> : null}
                </Card.Actions>
              </LinearGradient>
            </Card>
          ))}
        </ScrollView>
        <Icon
          containerStyle={styles.floating}
          reverse
          name="plus"
          type="font-awesome-5"
          onPress={() => {
            this.props.navigation.navigate('Uploader');
          }}
          color="green"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  floating: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});

export default createStackNavigator(
  {
    Main: { screen: StudyMaterials },
    Uploader: { screen: UploadContent },
    Submissions: { screen: Submissions },
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
    },
  }
);
