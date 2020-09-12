import React from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Icon, Overlay as Modal } from 'react-native-elements';
import {
  TextInput,
  Text,
  Chip,
  Button,
  Divider,
  // Modal,
  ProgressBar,
} from 'react-native-paper';

import Head from '../components/CustomHeader';
import RadioButton from '../components/Radio';
import * as DocumentPicker from 'expo-document-picker';
import { db, storage, auth } from '../config';
import firebase from 'firebase';

const errorHandler = (err) => Alert.alert('Error', err.message);

export default class Uploader extends React.Component {
  constructor() {
    super();
    this.state = {
      user: auth.currentUser.email,
      chapter: '',
      subject: '',
      fn: '',
      type: '',
      file: {},
      class: 0,
      classes: [],
      progress: 0,
      uploading: false,
    };
  }
  componentDidMount() {
    db.collection('teachersData')
      .where('email', '==', this.state.user)
      .get()
      .then((snapshot) => {
        snapshot.forEach((user) => {
          const { classes, subject } = user.data();
          this.setState({ classes, subject });
        });
      });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Head
          navigation={this.props.navigation}
          inner
        />
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: '#fff',
            height: '80%',
            // justifyContent: 'center',
          }}>
          <Text
            style={{
              textAlign: 'center',
              fontFamily: 'Head',
              fontSize: 24,
              paddingBottom: 8,
              backgroundColor: "#fff"
            }}>
            Upload Study Resource
          </Text>
          <TextInput
            dense
            flat
            label="Subject"
            placeholder="Subject"
            value={this.state.subject}
          />
          <View
            style={{
              padding: 10,
            }}>
            <Text style={{ fontFamily: 'Body-Bold' }}>Class</Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              {this.state.classes.map((val) => (
                <Chip
                  value={val}
                  selected={val == this.state.class}
                  onPress={() => {
                    this.setState({ class: val });
                  }}
                  mode="outlined">
                  {val.toString()}
                </Chip>
              ))}
            </View>
          </View>
          <TextInput
            dense
            flat
            label="Topic"
            placeholder="Topic / Chapter Name"
            value={this.state.chapter}
            onChangeText={(chapter) => {
              this.setState({ chapter });
            }}
          />
          <Button onPress={this.getMaterial} mode="outline">
            {this.state.file.name ? `Change File` : 'Choose File'}
          </Button>
          <Text style={{ textAlign: 'center' }}>
            {this.state.file.name
              ? `File Chosen: ${this.state.file.name}`
              : 'No File Chosen'}
          </Text>
          <Divider style={{ marginVertical: 5 }} />
          <Text style={{ textAlign: 'center', fontFamily: 'Body-Bold' }}>
            Resource Type
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <RadioButton
              value="Notes"
              status={this.state.type == 'rd' ? 'checked' : 'unchecked'}
              onPress={() => {
                this.setState({ type: 'rd' });
              }}
            />
            <RadioButton
              value="Assessment"
              status={this.state.type == 'hw' ? 'checked' : 'unchecked'}
              onPress={() => {
                this.setState({ type: 'hw' });
              }}
            />
            <RadioButton
              value="Other"
              status={this.state.type == 'ot' ? 'checked' : 'unchecked'}
              onPress={() => {
                this.setState({ type: 'ot' });
              }}
            />
          </View>
          <TextInput
            dense
            flat
            label="Resource Name"
            value={this.state.fn}
            onChangeText={(fn) => {
              this.setState({ fn });
            }}
          />
          <Button
            onPress={this.save}
            mode="contained"
            style={{ marginVertical: 5 }}>
            Submit File
          </Button>
          <Modal
            overlayStyle={{ width: '80%', paddingVertical: 5 }}
            visible={this.state.uploading}>
            <Text style={{ textAlign: 'center' }}>Uploading...</Text>
            <ProgressBar progress={this.state.progress} />
          </Modal>
        </ScrollView>
      </View>
    );
  }

  getMaterial = async () => {
    DocumentPicker.getDocumentAsync().then(async (file) => {
      this.setState({ file });
    });
  };
  save = async () => {
    const { uri, name: acfname } = this.state.file;
    const { type, class: cls, subject, chapter, fn: name } = this.state;
    if (!(name && uri && type && cls && subject && chapter)) return Alert.alert("Error", "Please fill all fields.");
    this.setState({ uploading: true });
    let ref = storage.ref();
    let filePath = `/teacherUploads/${name}.${acfname.split('.').pop()}`;
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
        db.collection('studentResources').add({
          path: filePath,
          type,
          class: cls,
          subject,
          chapter,
          name,
          date: firebase.firestore.FieldValue.serverTimestamp(),
          teacher: auth.currentUser.displayName.slice(1),
        });
        await this.sendNotifs(cls, subject, chapter);
        Alert.alert('Uploaded Successfully!');
        this.props.navigation.goBack();
      }
    );
  };
  sendNotifs = async (cls, sub, ch) => {
    db.collection('studentsData')
      .where('class', '==', cls)
      .get()
      .then(async (snapshot) => {
        let pushTokens = snapshot.docs.map((doc) => doc.data().expoPushToken);
        console.log(pushTokens);
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: pushTokens,
            sound: 'default',
            title: 'New Study Material',
            body: `New Study Material for ${sub} - ${ch} has been uploaded!`,
          }),
        });
        return;
      });
  };
}

const styles = StyleSheet.create({});
