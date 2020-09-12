import React, { Component } from 'react'
import { View } from 'react-native'
import { Text, Card, List } from 'react-native-paper'
import { createStackNavigator } from 'react-navigation-stack'
import Header from '../components/CustomHeader'
import Browser from './Browser'

const activities = [
  {
    title: "The Tower of Hanoi",
    description: "A mathematical disk-stack game",
    uri: "https://editor.p5js.org/dipam2006/present/QmuowMm_L"
  },
  {
    title: "Explore the Elements!",
    description: "Periodic Table based web app",
    uri: "https://editor.p5js.org/dipam2006/present/DdjmwEMcm"
  }
]

class BrainGames extends Component {
  render() {
    return (
      <View>
        <Header navigation={this.props.navigation} />
        <Card style={{ margin: 10 }}>
          <Card.Title
            title="Fun Activities"
            titleStyle={{ fontFamily: "Head", textAlign: 'center' }}
          />
          <Card.Content>
            <List.Section>
              {activities.map(act => (
                <List.Item
                  title={act.title}
                  description={act.description}
                  onPress={() => { this.props.navigation.navigate("Browser", { uri: act.uri }) }}
                />
              ))}
            </List.Section>
          </Card.Content>
        </Card>
      </View>
    )
  }
}


export default createStackNavigator({
  BrainGames: { screen: BrainGames },
  Browser: { screen: Browser }
}, {
  defaultNavigationOptions: {
    headerShown: false
  }
})