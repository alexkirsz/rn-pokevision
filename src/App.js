import React, { Component } from 'react';
import { StyleSheet, View, MapView } from 'react-native';
import moment from 'moment';
import { keyBy } from 'lodash';

import pokemonData from './pokemon.js';
import { getData } from './api';

import Overlay from './Overlay';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

const ignoreList = [
  'rattata',
  'pidgey',
  'spearow',
  'krabby',
  'weedle',
  'zubat',
];

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      pokemon: [],
      annotations: [],
      pokemonById: {},
      located: false,
      follow: true,
      scanInProgress: false,
      scanThrottled: false,
    };

    this.updateTimeout = null;
    this.fetchTimeout = null;
    this.scanTimeout = null;
  }

  componentWillUnmount() {
    clearTimeout(this.updateTimeout);
    clearTimeout(this.fetchTimeout);
    clearTimeout(this.scanTimeout);
  }

  onRegionChangeComplete = region => {
    this.latitude = region.latitude;
    this.longitude = region.longitude;
    this.latitudeDelta = region.latitudeDelta;
    this.longitudeDelta = region.longitudeDelta;

    if (!this.state.located) {
      this.setState({
        located: true,
      });
      this.updatePokemon();
    }

    this.fetchPokemon();
  };

  onRegionChange = region => {
    this.latitude = region.latitude;
    this.longitude = region.longitude;
    this.latitudeDelta = region.latitudeDelta;
    this.longitudeDelta = region.longitudeDelta;
  };

  onToggleFollow = () => {
    this.setState({ follow: !this.state.follow });
  };

  setPokemon = nextPokemon => ({
    pokemon: nextPokemon,
    annotations: nextPokemon.map(poke => ({
      id: poke.uniqueId.toString(),
      latitude: poke.latitude,
      longitude: poke.longitude,
      title: pokemonData[poke.id].name,
      subtitle: moment(poke.expires).format('HH:mm:ss'),
      // Can't use view here. There's a bug in react-native where annotations
      // views are incorrectly reconciled.
      image: pokemonData[poke.id].image,
    })),
    pokemonById: keyBy(nextPokemon, 'uniqueId'),
  });

  updatePokemon = () => {
    clearTimeout(this.updateTimeout);
    const nextPokemon = this.state.pokemon.filter(pokemon =>
      pokemon.expires > Date.now()
    );

    if (nextPokemon.length < this.state.pokemon.length) {
      this.setState(this.setPokemon(nextPokemon));
    }

    this.updateTimeout = setTimeout(this.updatePokemon, 1000);
  };

  addPokemon = pokemon => {
    const nextPokemon = this.state.pokemon.concat(
      pokemon
        .filter(poke =>
          !this.state.pokemonById[poke.uniqueId] &&
          !ignoreList.includes(
            pokemonData[poke.id].name.toLowerCase()
          )
        )
    );

    if (nextPokemon.length > this.state.pokemon.length) {
      return this.setPokemon(nextPokemon);
    }
    return {};
  };

  fetchPokemon = () => {
    clearTimeout(this.fetchTimeout);
    const swLat = this.latitude - this.latitudeDelta / 2;
    const swLng = this.longitude - this.longitudeDelta / 2;
    const neLat = this.latitude + this.latitudeDelta / 2;
    const neLng = this.longitude + this.longitudeDelta / 2;
    getData(swLat, swLng, neLat, neLng)
      .then(res => {
        if (res.pokemons) {
          this.setState(this.addPokemon(
            res.pokemons.map(poke => ({
              id: poke.pokemon_id,
              uniqueId: poke.encounter_id,
              expires: poke.disappear_time,
              latitude: poke.latitude,
              longitude: poke.longitude,
            }))
          ));
        }

        this.fetchTimeout = setTimeout(this.fetchPokemon, 10000);
      })
      .catch(e => {
        this.fetchTimeout = setTimeout(this.fetchPokemon, 10000);
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete}
          annotations={this.state.annotations}
          showsUserLocation
          followUserLocation={this.state.follow}
          zoomEnabled
        />
        <Overlay
          onToggleFollow={this.onToggleFollow}
          follow={this.state.follow}
        />
      </View>
    );
  }
}
