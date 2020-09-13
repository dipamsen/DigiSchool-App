import React from 'react';
import { View, StyleSheet, Image, TextInput, ScrollView } from 'react-native';
import Head from '../components/CustomHeader';
import { Button, Text, ProgressBar, Dialog, Portal } from 'react-native-paper';
import { Icon } from 'react-native-elements'
import firebase from 'firebase';
import { db, auth, storage } from '../config';
import * as ImagePicker from 'expo-image-picker'

export default class Profile extends React.Component {
  constructor() {
    super();
    this.state = {
      // hello
      type: '',
      details: { classes: [] },
      editing: false,
      tContact: '',
      tAddress: '',
      uploading: 'noo',
      uploadProgress: 0,
      downloadURL: ''
    };
  }
  componentDidMount() {
    this.load()
  }
  load = () => {
    let type = '';
    if (auth.currentUser.displayName[0] == 't') {
      type = 'Teacher';
    } else {
      type = 'Student';
    }
    (() => this.setState({ type }))();
    db.collection(`${type.toLowerCase()}sData`)
      .where('email', '==', auth.currentUser.email)
      .get()
      .then((docs) => {
        let details = docs.docs[0].data();
        console.log(details);
        this.setState({ details, tContact: details.contact || '', tAddress: details.address || '', uri: auth.currentUser.photoURL });
      });
  }
  doStuffWithImage = () => {
    this.setState({ uploading: 'starting' })
    ImagePicker.requestCameraRollPermissionsAsync().then(({ granted }) => {
      if (granted) {
        ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1]
        }).then(async (fileData) => {
          const { uri, name } = fileData
          console.log(fileData);
          if (!uri) return this.setState({ uploading: "noo" })
          let fileStore = storage.ref(`/profilePics/${this.state.type.toLowerCase()}s/${this.state.details.name}.${uri.split('.').pop()}`)
          let file = await (await fetch(uri)).blob()
          let uploadManager = fileStore.put(file);
          uploadManager.on(
            'state_changed',
            (({ bytesTransferred, totalBytes }) => {
              this.setState({ uploadProgress: bytesTransferred / totalBytes })
            }),
            (error) => console.error(error),
            () => {
              uploadManager.snapshot.ref.getDownloadURL().then((downloadURL) => {
                this.setState({ downloadURL }, () => this.setState({ uploading: "done" }));
              });
            }
          )
        })
      }
    })
  }
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Head navigation={this.props.navigation} />
        <Portal>
          <Dialog dismissable={false} visible={this.state.uploading !== "noo"} style={{ width: '70%', height: '60%', alignSelf: "center", justifyContent: 'center' }}>

            <Text style={{ textAlign: 'center' }}>Uploading...</Text>
            <ProgressBar style={{ width: '90%', alignSelf: 'center' }} progress={this.state.uploadProgress} />
            {
              this.state.uploading == "done" ?
                <View style={{ alignItems: "center" }}><Image source={{ uri: this.state.downloadURL }} style={{ width: 120, height: 120, borderRadius: 60, margin: 10 }} />
                  <Button onPress={() => {
                    auth.currentUser.updateProfile({ photoURL: this.state.downloadURL }).then(() => this.setState({ uploading: "noo", uri: this.state.downloadURL }, () => {
                      this.load()
                    }))
                  }}>Save Profile Picture</Button>
                </View> :
                null
            }
          </Dialog>
        </Portal>
        <ScrollView style={{ width: "100%" }} contentContainerStyle={{ alignItems: "center" }}>
          {this.state.uri ?
            <Image source={{ uri: this.state.uri }} style={{ width: 120, height: 120, borderRadius: 60 }} /> :
            <View style={{ borderWidth: 1, borderRadius: 80, margin: 8 }}>
              <Icon
                name={this.state.type == "Teacher" ? "chalkboard-teacher" : "user"}
                reverse
                color="#fff"
                type="font-awesome-5"
                reverseColor="green"
                size={50}
              />
            </View>
          }
          <Text style={{
            fontFamily: "Head",
            fontSize: 24
          }}>
            {this.state.details.name}
          </Text>
          <Text style={{ fontSize: 18 }}>{this.state.details.username ? `@${this.state.details.username}` : ""}</Text>
          <Text style={{ fontSize: 16 }}>{this.state.type}</Text>
          <Text style={{ fontSize: 16 }}>{this.state.type[0] == "T" ? `Classes: ${this.state.details.classes.join(", ")}\nSubject: ${this.state.details.subject || ""}` : null}</Text>
          <View style={{ margin: 10, width: '100%', justifyContent: 'center', alignItems: "center", flexDirection: "row" }}>
            <View style={{ flex: 1, margin: 10 }}><Text style={{ fontFamily: 'Body-Bold', width: '94%' }}>Profile Photo</Text>
              {this.state.uri ? <Image source={{ uri: this.state.uri }} /> : <Text style={{ width: "94%" }}>No Photo Available</Text>}</View>
            {this.state.editing ?
              <>
                <Button onPress={this.doStuffWithImage} style={{ margin: 10 }} mode="contained">
                  {this.state.uri ? "Change" : "Add Picture"}
                </Button>
                {this.state.uri ?
                  <Button onPress={() => { auth.currentUser.updateProfile({ photoURL: '' }); this.setState({ uri: null }) }}>Remove</Button>
                  : null}
              </> : null}
          </View>
          <Input onChangeText={text => this.setState({ tContact: text })} keyboardType="numeric" label="Contact No." value={this.state.editing ? this.state.tContact : this.state.details.contact || ""} disabled={!this.state.editing} />
          <Input onChangeText={text => this.setState({ tAddress: text })} label="Address" value={this.state.editing ? this.state.tAddress : this.state.details.address || ""} disabled={!this.state.editing} />
        </ScrollView>
        {this.state.editing ? <View style={{ width: "100%", flexDirection: "row" }}>
          <Button onPress={() => { this.setState({ editing: false }) }} mode="outlined" style={{ flex: 1 }}>Cancel</Button>
          <Button onPress={this.save} mode="outlined" style={{ flex: 1 }}>Save Details</Button>
        </View>
          : <Button
            mode="outlined"
            style={{ width: '100%' }}
            onPress={() => {
              this.setState({ editing: true })
            }}>Edit Details</Button>
        }
      </View>
    );
  }
  save = () => {
    const { tContact, tAddress } = this.state;
    db.collection(`${this.state.type.toLowerCase()}sData`).where("email", "==", auth.currentUser.email).get().then(snapshot => {
      snapshot.forEach(doc => {
        db.collection(`${this.state.type.toLowerCase()}sData`).doc(doc.id).update({
          contact: tContact,
          address: tAddress,
          photoURL: this.state.uri
        }).then(() => {
          this.setState({ editing: false })
          this.load()
        })
      })
    })
  }
}

class Input extends React.Component {
  render() {
    return (
      <View style={{ margin: 10, width: '100%', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Body-Bold', width: '94%' }}>{this.props.label}</Text>
        <TextInput
          style={{
            fontSize: 16, width: "94%", borderWidth: 1, padding: 8, fontFamily: "Body", backgroundColor: this.props.disabled ? "#dcdcdc" : "#fff"
          }}
          {...this.props}
          value={this.props.value}
          onChangeText={this.props.onChangeText}
          editable={!this.props.disabled}
        />
      </View>
    )
  }
}
