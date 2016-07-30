import React, { Component } from 'react';
import { StyleSheet, View, MapView } from 'react-native';
import moment from 'moment';
import { keyBy } from 'lodash';

import pokemonData from './pokemon.js';
import { getData, getScanData, runScan } from './api';

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
  };

  onScan = () => {
    const { latitude, longitude } = this;
    this.setState({
      scanInProgress: true,
    });
    runScan(latitude, longitude)
      .then(res => {
        this.scanId = res.jobId;
        this.scanLatitude = latitude;
        this.scanLongitude = longitude;
        this.scanTimeout = setTimeout(this.retrieveScanResults, 1000);
      });
  };

  onToggleFollow = () => {
    this.setState({ follow: !this.state.follow });
  };

  setPokemon = nextPokemon => ({
    pokemon: nextPokemon,
    annotations: nextPokemon.map(poke => ({
      id: poke.id.toString(),
      latitude: poke.latitude,
      longitude: poke.longitude,
      title: pokemonData[poke.pokemonId].name,
      subtitle: moment(poke.expiration_time * 1000).format('HH:mm:ss'),
      // Can't use view here. There's a bug in react-native where annotations
      // views are incorrectly reconciled.
      image: pokemonData[poke.pokemonId].image,
    })),
    pokemonById: keyBy(nextPokemon, 'id'),
  });

  updatePokemon = () => {
    clearTimeout(this.updateTimeout);
    const nextPokemon = this.state.pokemon.filter(pokemon =>
      pokemon.expiration_time * 1000 > Date.now()
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
          !this.state.pokemonById[poke.id] &&
          !ignoreList.includes(
            pokemonData[poke.pokemonId].name.toLowerCase()
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
    getData(this.latitude, this.longitude)
      .then(res => {
        this.setState(this.addPokemon(res.pokemon));

        this.fetchTimeout = setTimeout(this.fetchPokemon, 10000);
      });
  };

  retrieveScanResults = () => {
    getScanData(this.scanLatitude, this.scanLongitude, this.scanId)
      .then(res => {
        if (res.pokemon) {
          this.setState({
            ...this.addPokemon(res.pokemon),
            scanInProgress: false,
            scanThrottled: true,
          });
          this.scanTimeout = setTimeout(this.unthrottleScan, 30000);
        } else {
          this.scanTimeout = setTimeout(this.retrieveScanResults, 1000);
        }
      });
  };

  unthrottleScan = () => {
    this.setState({
      scanThrottled: false,
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
          onScan={this.onScan}
          onToggleFollow={this.onToggleFollow}
          loading={this.state.scanInProgress}
          throttled={this.state.scanThrottled}
          follow={this.state.follow}
        />
      </View>
    );
  }
}
