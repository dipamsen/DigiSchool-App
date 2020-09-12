import React from 'react';
import { View, FlatList, TextInput } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from 'react-native-paper'
import Header from '../components/CustomHeader'
import { auth, db } from '../config';
import firebase from 'firebase'

export default class Chatter extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      writing: '',
      lastVisible: null
    }
  }

  componentDidMount() {
    db.collection(`${auth.currentUser.displayName[0] == "s" ? "student" : "teacher"}sData`).where("email", "==", auth.currentUser.email).get().then(snapshot => {
      snapshot.docs.forEach(doc => this.setState({ user: doc.data() }))
    })
    this.subscriber = db.collection('messages').orderBy("timestamp", "desc").limit(20).onSnapshot(snapshot => {
      this.setState({ messages: snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id })), lastVisible: snapshot[snapshot.docs.length - 1] })
    })
  }
  fetchMore = () => {
    if (this.lastVisible)
      db.collection('messages').orderBy("timestamp", "desc").startAfter(this.state.lastVisible).limit(20).get().then(snapshot => {
        snapshot.forEach(doc => {
          this.setState({ messages: [...this.state.messages, doc.data()], lastVisible: doc })
        })
      })
  }
  componentWillUnmount() {
    this.subscriber && this.subscriber()
  }
  showMessage = ({ item, index }) => {
    return (
      <View style={{
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: `flex-${item.from.email == auth.currentUser.email ? "end" : "start"}`,
        marginVertical: 8,
        paddingVertical: 5,
        paddingHorizontal: 8,
        maxWidth: "70%"
      }}>
        <Text style={{ fontFamily: "Body-Bold" }}>{item.from.name} {item.from.subject ? "(T)" : null}</Text>
        <Text style={{ fontSize: 16 }}>{item.message}</Text>
      </View>
    )
  }
  sendMessage = () => {
    this.setState({ writing: '' })
    if (this.state.writing.trim()) {
      db.collection("messages").add({
        from: this.state.user,
        message: this.state.writing.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
    }
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header navigation={this.props.navigation} />
        <Text style={{ fontFamily: "Head", textAlign: "center", fontSize: 28 }}>
          Discussion Wall
        </Text>
        <FlatList
          style={{ margin: 10, padding: 10 }}
          data={this.state.messages}
          renderItem={this.showMessage}
          keyExtractor={item => item._id}
          inverted
          onEndReached={this.fetchMore}
        />
        <View style={{ flexDirection: 'row', margin: 10 }}>
          <TextInput
            dataDetectorTypes='all'
            multiline
            clearButtonMode="while-editing"
            placeholder="Type a message..."
            scrollEnabled
            value={this.state.writing}
            onChangeText={text => this.setState({ writing: text })}
            style={{
              flex: 1,
              fontFamily: "Body",
              borderWidth: 1,
              margin: 6,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              fontSize: 20,
              maxHeight: 120
            }} />
          <Icon name="send" type="font-awesome" color="green" onPress={this.sendMessage} reverse />
        </View>
      </View>
    )
  }
}