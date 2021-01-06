import React from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import Head from '../components/CustomHeader';
import { db, storage, auth } from '../config';
import firebase from 'firebase';
import { createStackNavigator } from 'react-navigation-stack';
import Submit from './Submit Assessment';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';

class StudyMaterials extends React.Component {
  constructor() {
    super();
    this.state = {
      refreshing: false,
      allResources: [],
      class: 0,
      iHaveSubmitted: [],
    };
  }
  reload = () => {
    console.log(this.state.iHaveSubmitted)

    this.setState({ refreshing: true, allResources: [] });
    db.collection('studentResources')
      .where('class', '==', this.state.class)
      .get()
      .then((snapshot) => {
        this.setState(
          {
            allResources: snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            })).sort((a, b) => b.date.toDate() - a.date.toDate()),
          },
          () => {
            db.collection('submissions')
              .where('student', '==', auth.currentUser.email)
              .get()
              .then((snapshot) => {
                this.setState(
                  {
                    iHaveSubmitted: snapshot.docs.map(
                      (doc) => doc.data()
                    ),
                  },
                  () => this.setState({ refreshing: false })
                );
              });
          }
        );
      });
  };
  submitAssessment = (id) => {
    this.props.navigation.navigate('Submittor', { for: id });
  };
  openResource = (path) => {
    storage
      .ref(path)
      .getDownloadURL()
      .then((url) => {
        Linking.openURL(url);
      });
  };
  componentDidMount() {
    this.setState({ refreshing: true, allResources: [] });
    db.collection('studentsData')
      .where('email', '==', auth.currentUser.email)
      .get()
      .then((snapshot) => {
        let cls;
        snapshot.forEach((doc) => (cls = doc.data().class));
        this.setState({ class: cls }, () => {
          this.snapevent = db
            .collection('studentResources')
            .where('class', '==', this.state.class)
            .onSnapshot((snapshot) => {
              this.setState({
                allResources: snapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
                })).sort((a, b) => b.date.toDate() - a.date.toDate()),
              },
                () => {
                  this.setState({ refreshing: false })
                });
            });
        });
      });
    db.collection('submissions')
      .where('student', '==', auth.currentUser.email)
      .get()
      .then((snapshot) => {
        this.setState({
          iHaveSubmitted: snapshot.docs.map((doc) => doc.data()),
        });
      });
  }
  componentWillUnmount() {
    this.snapevent && this.snapevent();
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Head navigation={this.props.navigation} />
        <Text style={{ fontFamily: "Head", fontSize: 24, textAlign: "center" }}>Study Materials</Text>
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
                  left={() => <Icon name={v.type == 'hw' && !this.state.iHaveSubmitted.map(q => q.forResource).includes(v.id) ? "assignment-late" : this.state.iHaveSubmitted.map(q => q.forResource).includes(v.id) ? "assignment-turned-in" : "assignment"} />}
                  title={v.name}
                  titleStyle={{ fontFamily: 'Head' }}
                  subtitle={v.teacher}
                />
                <Card.Content>
                  <Text>{`Grade ${v.class}: ${v.subject} - ${v.chapter}`}</Text>
                  <Text>
                    {v.type == 'hw'
                      ? 'Assignment'
                      : v.type == 'rd'
                        ? 'Notes'
                        : null}
                  </Text>
                </Card.Content>
                <Card.Actions style={{ flexDirection: 'column' }}>
                  <Button
                    onPress={() => {
                      this.openResource(v.path);
                    }}>
                    Open {v.type == 'hw' ? "Assignment" : null}
                  </Button>
                  {v.type == 'hw' ? (
                    this.state.iHaveSubmitted.map(q => q.forResource).includes(v.id) ? (
                      <>
                        <Button
                          onPress={() => {
                            db.collection('submissions')
                              .where('forResource', '==', v.id)
                              .where(
                                'student',
                                '==',
                                auth.currentUser.email
                              )
                              .get()
                              .then((snapshot) => {
                                this.openResource(snapshot.docs.map(doc => doc.data())[0].path);
                              });
                          }}>
                          Preview your Submission
                      </Button>
                        <Divider />
                        <Button
                          onPress={() => {
                            let ind = this.state.iHaveSubmitted.map(w => w.forResource).indexOf(v.id)
                            const fdbc = this.state.iHaveSubmitted[ind].feedback
                            fdbc ? Alert.alert("Teacher's Feedback", fdbc) : Alert.alert("No Feedback Available.")
                          }}>
                          Teacher's Feedback
                      </Button>
                      </>
                    ) : (
                        <Button
                          onPress={() => {
                            this.submitAssessment(v.id);
                          }}>
                          Submit Assignment
                        </Button>
                      )
                  ) : null}
                </Card.Actions>
              </LinearGradient>
            </Card>
          ))}
        </ScrollView>
      </View>
    );
  }
}

export default createStackNavigator(
  {
    MainScreen: { screen: StudyMaterials },
    Submittor: { screen: Submit },
  },
  {
    defaultNavigationOptions: {
      headerShown: false,
    },
  }
);
