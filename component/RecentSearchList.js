import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { COLOR } from "react-native-material-ui";

const RecentSearchList = ({ recentSearches, onPress }) => {
  console.log(JSON.stringify(recentSearches));
  return (
    <View style={{ backgroundColor: COLOR.white }}>
      <FlatList
        data={recentSearches}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={onPress}
            style={{padding: 10, borderColor: COLOR.black, borderRadius: 2, borderWidth: 0.4}}
          >
            <Text>{item.historyLocation}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default RecentSearchList;
