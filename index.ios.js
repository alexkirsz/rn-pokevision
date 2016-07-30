import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  MapView,
  Alert,
  Image,
} from 'react-native';
import moment from 'moment';
import { keyBy } from 'lodash';

import pokemonData from './pokemon.js';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

function getCoordinates(lat, lng) {
  return fetch(`https://pokevision.com/map/data/${lat}/${lng}`)
    .then(res => res.json());
}

class Pokevision extends Component {
  constructor() {
    super();

    this.state = {
      latitude: 0,
      longitude: 0,
      pokemons: [],
      pokemonsById: {},
    };

    this.fetchPokemons = this.fetchPokemons.bind(this);
    this.updatePokemons = this.updatePokemons.bind(this);
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(position => {
      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      this.fetchPokemons();
    });

    navigator.geolocation.watchPosition(position => {
      this.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });

    this.updatePokemons();
  }

  componentWillUnmount() {
    clearTimeout(this.updateTimeout);
    clearTimeout(this.fetchTimeout);
  }

  setPokemons(nextPokemons) {
    this.setState({
      pokemons: nextPokemons,
      pokemonsById: keyBy(nextPokemons, 'id'),
    });
  }

  updatePokemons() {
    const nextPokemons = this.state.pokemons.filter(pokemon =>
      pokemon.expiration_time * 1000 > Date.now()
    );

    if (nextPokemons.length < this.state.pokemons.length) {
      this.setPokemons(nextPokemons);
    }

    this.updateTimeout = setTimeout(this.updatePokemons, 1000);
  }

  fetchPokemons() {
    getCoordinates(this.state.latitude, this.state.longitude)
      .then(res => {
        const nextPokemons = this.state.pokemons.concat(
          res.pokemon.filter(pokemon => !this.state.pokemonsById[pokemon.id])
        );

        if (nextPokemons.length > this.state.pokemons.length) {
          this.setPokemons(nextPokemons);
        }

        this.fetchTimeout = setTimeout(this.fetchPokemons, 10000);
      });
  }

  render() {
    return (
      <MapView
        style={styles.map}
        region={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        annotations={this.state.pokemons.map(pokemon => ({
          latitude: pokemon.latitude,
          longitude: pokemon.longitude,
          title: pokemonData[pokemon.pokemonId].name,
          subtitle: moment(pokemon.expiration_time * 1000).format('HH:mm:ss'),
          view:
            <Image
              style={{
                width: 30,
                height: 30,
              }}
              resizeMode="contain"
              source={pokemonData[pokemon.pokemonId].image}
            />
        }))}
        showsUserLocation
      />
    );
  }
}


AppRegistry.registerComponent('Pokevision', () => Pokevision);
