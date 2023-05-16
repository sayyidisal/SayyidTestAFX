import React, { useEffect, useCallback, useState, useRef } from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
import styles from "./styles";
import MapView, { Marker } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useDispatch, useSelector } from "react-redux";
import * as AutocompleteAction from "../../store/action/autocomplete";
import * as MapMarkerAction from "../../store/action/mapMarker";
import * as MyLocationAction from "../../store/action/myLocation";
import * as CurrentLocationAction from "../../store/action/currentLocation";
import { COLOR, Icon } from "react-native-material-ui";
import * as Location from "expo-location";
import Config from "react-native-config";

const HomeScreen = () => {
  const searchRef = useRef();
  const mapRef = useRef();

  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const dispatch = useDispatch();
  const history = useSelector((state) => state.historyLocation.historyLocation);

  const [clicked, setClicked] = useState(false);
  console.log(history, "history", clicked);

  const coordinate = useSelector((state) => state.autocomplete.autocomplete);
  const mapMarker = useSelector((state) => state.mapMarker.mapMarker);
  const myLocation = useSelector((state) => state.myLocation.myLocation);

  const loadAutocomplete = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({});

    dispatch(
      AutocompleteAction.fetchAutocomplete({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })
    );

    dispatch(
      MyLocationAction.fetchMyLocation({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    loadAutocomplete();
  }, [loadAutocomplete]);

  const clearSearchHandler = () => {
    searchRef.current.clear();
    setSearch("");
  };

  const onPress = (data, details) => {
    const result = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    dispatch(MapMarkerAction.fetchMapMaker(result));
    setSearch(details.geometry.location.lat);
    dispatch(AutocompleteAction.fetchAutocomplete(result));
    fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        result.latitude +
        "," +
        result.longitude +
        "&key=" +
        Config.GEO_CODER
        // "AIzaSyDBd4RX2q260UVhSqCpe8vhV9kS8ofMqAM"
    )
      .then((response) => response.json())
      .then((responseJson) => {
        searchRef.current?.setAddressText(
          responseJson.results[0].formatted_address
        );
        let res = responseJson.results[0].formatted_address;
        if (res != history) {
          dispatch(
            CurrentLocationAction.addToHistory({
              historyLocation: {hisloc : res, longitude: result.longitude, latitude: result.latitude},
            //   longitudelocation: result.longitude,
            //   latitudelocation: result.latitude,
            })
          );
        }
        console.log("reseultt", JSON.stringify(responseJson), "endresult");
        console.log(
          "reseultt1",
          JSON.stringify(responseJson.results[0].address_components),
          "endresult1"
        );
        let temp = responseJson.results[0].address_components;
        let temps = responseJson.results[5].address_components;
        const prov = temp.filter(
          (val) => val.types[0] === "administrative_area_level_1"
        );
        const city = temp.filter(
          (val) => val.types[0] === "administrative_area_level_2"
        );
        console.log("restsat", JSON.stringify(prov) + JSON.stringify(city));

        console.log(
          "ADDRESS GEOCODE is BACK!! => " +
            JSON.stringify(responseJson.results[0].formatted_address)
        );
        console.log(
          JSON.stringify(responseJson.results[0].address_components),
          "Provinsi Kota!! => "
        );
      });
  };

  const myCurrentLocationHandler = () => {
    mapRef.current.animateToRegion(myLocation);
  };

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", height: "100%" }}>
        {mapReady && (
          <View style={styles.autocompleteContainer}>
            <GooglePlacesAutocomplete
              ref={searchRef}
              placeholder="Search Place.."
              onFail={(error) => console.error(error)}
              onPress={onPress}
              styles={{ textInputContainer: { width: "100%" } }}
              fetchDetails
              query={{
                key: Config.GOOGLE_MAPS_API_KEY,
                language: "id",
              }}
              renderRightButton={() =>
                search !== "" && (
                  <TouchableOpacity
                    style={styles.closeButtonContainer}
                    onPress={() => clearSearchHandler()}
                  >
                    <Icon name="close" size={23} />
                  </TouchableOpacity>
                )
              }
              keepResultsAfterBlur={true}
              enablePoweredByContainer={false}
              textInputProps={{
                onChangeText: (text) => {
                  setSearch(text);
                  setClicked(false);
                },
                onFocus: () => {
                  setClicked(true);
                },
                onBlur: () => {
                    // setClicked(false)
                }
              }}
            />
          </View>
        )}

        {coordinate.length !== 0 && (
          <MapView
            ref={mapRef}
            style={{ alignSelf: "stretch", height: "100%" }}
            onMapReady={() => setMapReady(true)}
            region={coordinate}
            showsUserLocation
            showsMyLocationButton={false}
            userInterfaceStyle={"dark"}
            loadingEnabled
          >
            {mapMarker.length !== 0 && (
              <Marker
                coordinate={{
                  latitude: parseFloat(mapMarker.latitude),
                  longitude: parseFloat(mapMarker.longitude),
                }}
              />
            )}
          </MapView>
        )}
        {clicked && (
          <View style={styles.recentcontainer}>
            <View style={{ backgroundColor: COLOR.white }}>
              <FlatList
                data={history}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      style={{
                        padding: 10,
                        borderColor: COLOR.black,
                        borderRadius: 2,
                        borderWidth: 0.4,
                      }}
                      onPress={() => {
                        console.log("nonthing", item.historyLocation);
                        const result = {
                          latitude: item.historyLocation.latitude,
                          longitude: item.historyLocation.longitude,
                          latitudeDelta: 0.05,
                          longitudeDelta: 0.05,
                        };
                        dispatch(MapMarkerAction.fetchMapMaker(result));
                        setSearch(item.historyLocation.hisloc);
                        dispatch(AutocompleteAction.fetchAutocomplete(result));
                      }}
                    >
                      <Text>{item.historyLocation.hisloc}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        )}
        {mapReady && (
          <TouchableOpacity
            style={styles.searchButtonContainer}
            onPress={() => myCurrentLocationHandler()}
          >
            <Icon name="circle" size={23} color="#0D80D8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;
