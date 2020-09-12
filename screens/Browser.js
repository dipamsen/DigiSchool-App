import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Header from '../components/CustomHeader'
import WebView from 'react-native-webview'

export default class Browser extends Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header navigation={this.props.navigation} />
        <WebView source={{ uri: this.props.navigation.getParam('uri') }} style={{ flex: 1 }} />
      </View>
    );
  }
}
