import React from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Subheading,
  ProgressBar,
} from 'react-native-paper';
import { Icon } from 'react-native-elements';
import Head from '../components/CustomHeader';
import { db, storage, auth } from '../config';
import firebase from 'firebase';
import * as DocumentPicker from 'expo-document-picker';

const errorHandler = (error) => console.error(error.message);
export default class SubmitAssessment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resID: this.props.navigation.getParam('for'),
      file: {},
      resourceData: {},
      progress: 0,
      uploading: false,
    };
  }
  getFile = () => {
    DocumentPicker.getDocumentAsync().then(async (file) => {
      this.setState({ file });
    });
  };
  componentDidMount() {
    db.collection('studentResources')
      .doc(this.state.resID)
      .get()
      .then((doc) => {
        this.setState({ resourceData: doc.data() });
      });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Head navigation={this.props.navigation} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            style={{ textAlign: 'center', fontFamily: 'Head', fontSize: 24 }}>
            Submit Assignment
          </Text>
          <Subheading style={{ textAlign: 'center' }}>
            {this.state.resourceData.name}
          </Subheading>
          <Button onPress={this.getFile}>
            {this.state.file.name ? 'Change' : 'Choose'} File
          </Button>
          {this.state.file.name ? (
            this.state.uploading ? (
              <>
                <Text style={{ textAlign: 'center' }}>Uploading File...</Text>
                <ProgressBar progress={this.state.progress} />
              </>
            ) : (
                <>
                  <Text style={{ textAlign: 'center' }}>
                    File Chosen: {this.state.file.name}
                  </Text>
                  <Button onPress={this.submitFile} mode="contained">
                    Submit
                </Button>
                </>
              )
          ) : null}
        </View>
      </View>
    );
  }
  submitFile = async () => {
    if (this.state.file.uri) {
      const { uri, name: acfname } = this.state.file;
      let studentName = auth.currentUser.displayName.slice(1);
      let wsName = this.state.resourceData.name;
      this.setState({ uploading: true });
      let ref = storage.ref();
      let filePath = `/studentUploads/${studentName}_${wsName}.${acfname.split('.').pop()}`;
      let fileStore = ref.child(filePath);
      const file = await (await fetch(uri)).blob();
      const uploadTask = fileStore.put(file);
      uploadTask.on(
        'state_changed', // The event
        ({ bytesTransferred, totalBytes }) => {
          var progress = bytesTransferred / totalBytes;
          this.setState({ progress });
        },
        errorHandler,
        async () => {
          db.collection('submissions').add({
            student: auth.currentUser.email,
            path: filePath,
            forResource: this.state.resID,
            date: firebase.firestore.FieldValue.serverTimestamp()
          });
          await this.sendNotifs(this.state.resourceData.teacher);
          Alert.alert('Uploaded Successfully!');
          this.props.navigation.goBack();
        }
      );
    }
  };

  sendNotifs = async (email) => {
    db.collection('teachersData')
      .where('email', '==', email)
      .get()
      .then(async (snapshot) => {
        let pushTokens = snapshot.docs.map((doc) => doc.data().expoPushToken);
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: pushTokens,
            sound: 'default',
            title: 'New Submission',
            body: `${firebase
              .auth()
              .currentUser.displayName.slice(1)} submitted Assignment ${this.state.resourceData.name}.`,
          }),
        });
        return;
      });
  };
}
