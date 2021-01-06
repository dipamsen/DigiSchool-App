import React from 'react';
import { View, ScrollView, RefreshControl, TextInput, ToastAndroid } from 'react-native';
import { Text, Title, Subheading, List, Button, Divider, Dialog, Portal, Paragraph } from 'react-native-paper';
import { db, storage } from '../config';
import Header from '../components/CustomHeader';
import firebase from 'firebase'
import * as Linking from 'expo-linking'

export default class Submissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.navigation.getParam('docID'),
      submissions: [],
      Allstudents: [],
      data: {},
      refreshing: false,
      writing: false,
      curr: '',
      currFeedback: '',
      currSub: {}
    };
  }
  componentDidMount() {
    db.collection('submissions')
      .where("forResource", "==", this.state.id)
      .get().then(snapshot => {
        this.setState({
          submissions: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a, b) => b.date - a.date)
        })
      })
    db.collection("studentResources").doc(this.state.id).get().then(doc => this.setState({ data: doc.data() }))
    db.collection("studentsData").get().then(snapshot => {
      this.setState({ Allstudents: snapshot.docs.map(doc => doc.data()) })
    })
  }
  reload = () => {
    this.setState({ refreshing: true })
    db.collection('submissions')
      .where("forResource", "==", this.state.id)
      .get().then(snapshot => {
        this.setState({
          submissions: snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a, b) => b.date - a.date)
        })
      })
    db.collection("studentResources").doc(this.state.id).get().then(doc => this.setState({ data: doc.data() }))
    db.collection("studentsData").get().then(snapshot => {
      this.setState({ Allstudents: snapshot.docs.map(doc => doc.data()), refreshing: false })
    })
  }
  openResource = (path) => {
    storage
      .ref(path)
      .getDownloadURL()
      .then((url) => {
        Linking.openURL(url);
      });
  };
  render() {
    return (
      <View>
        <Portal>
          <Dialog visible={this.state.writing} onDismiss={() => { this.setState({ writing: false }) }}>
            <Dialog.Title>Feedback for {this.state.curr}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                style={{ borderWidth: 1, padding: 8, borderColor: "#ababab", fontFamily: "Body" }}
                multiline
                onChangeText={text => this.setState({ currFeedback: text })}
                value={this.state.currFeedback}
                placeholder="Enter Feedback"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => { this.setState({ writing: false }) }}>Cancel</Button>
              <Button onPress={() => {
                db.collection("submissions").doc(this.state.currSub.id).update({
                  feedback: this.state.currFeedback,
                  fdDate: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                  this.setState({ writing: false, curr: '', currFeedback: '', currSub: {} })
                  ToastAndroid.show('Feedback Comment Saved.', ToastAndroid.SHORT)
                  this.reload()
                })
              }}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Header inner navigation={this.props.navigation} />
        <Text style={{ fontFamily: 'Head', textAlign: 'center', fontSize: 24 }}>
          Assessment Submissions
        </Text>
        <Subheading style={{ textAlign: 'center', fontFamily: "Body-Bold" }}>
          {this.state.data.name}
        </Subheading>
        <Text style={{ textAlign: "center" }}>
          Click on Student's name to open submission.
        </Text>
        <List.Section>
          <ScrollView refreshControl={
            <RefreshControl onRefresh={this.reload} refreshing={this.state.refreshing} />
          }>
            <List.Subheader>{`Total Submissions: ${this.state.submissions.length}`}</List.Subheader>
            <Divider />
            {this.state.submissions.map((v, i) => (
              <>
                <List.Item
                  key={i}
                  onPress={() => {
                    this.openResource(this.state.submissions[this.state.submissions.map(x => x.student).indexOf(v.student)].path)
                  }}
                  title={this.state.Allstudents[this.state.Allstudents.map(s => s.email).indexOf(v.student)] && this.state.Allstudents[this.state.Allstudents.map(s => s.email).indexOf(v.student)].name || null}
                  right={() =>
                    <Button
                      onPress={() => this.setState({ writing: true, currSub: v, curr: this.state.Allstudents[this.state.Allstudents.map(s => s.email).indexOf(v.student)] && this.state.Allstudents[this.state.Allstudents.map(s => s.email).indexOf(v.student)].name || null })}
                      disabled={v.feedback}
                      mode="outlined">feedback</Button>
                  }
                />
                <Divider />
              </>
            ))}
          </ScrollView>
        </List.Section>
      </View>
    );
  }
}