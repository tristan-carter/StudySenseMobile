import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import LottieView from 'lottie-react-native';

import { useDispatch, useSelector } from 'react-redux';
import { saveUser } from '../../../firebase/userSlice';

import styles from './styles';
import colours from '../../config/colours'

const generateID = () => {
  const randomString = Math.random().toString(36).substr(2, 10); // Generate a random alphanumeric string
  const timestamp = Date.now().toString(36); // Convert the current timestamp to base36
  const ID = randomString + timestamp; // Concatenate the random string and timestamp
  return ID;
};

function StudySessionsPage({ navigation }) {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.user);
  const user = state.data;
  const currentSession = user.currentSession;
  return (
    <View style={[styles.container, {
      gap: 0,
    }]}>
      <View style={styles.rewardAnimationContainer}>
        <LottieView
          source={require('../../assets/CatWritingAnimation.json')}
          autoPlay
          loop
          style={{
              width: '150%',
              height: '140%',
              position: 'absolute',
          }}
        />
      </View>

      <View style={styles.claimButtonGroupContainer}>
        <View style={styles.claimFrame}>
          <Text style={styles.claimTitleText}>Brain break done. Study time!</Text>
          <TouchableOpacity style={styles.claimButtonContainer} onPress={()=>{
            const newPastSessions = [...user.pastStudySessions];
            const updatedCurrentSession = {
              ...currentSession,
              hasClaimedBreak: true,
            };
            newPastSessions.push(updatedCurrentSession);
            const newUserData = {
              ...user,
              pastStudySessions: newPastSessions,
              currentSession: {
                id: generateID(),
                length: user.currentSessionPreset.length,
                breakLength: user.currentSessionPreset.breakLength,
                focusMode: user.currentSessionPreset.focusMode,
                startTime: Date.now(),
                breakStartTime: null,
  
                hasClaimedSession: false,
                hasClaimedBreak: false,
              },
            };
            dispatch(saveUser(newUserData));
          }}>
            <Text style={styles.claimButtonText} numberOfLines={1}>
              Repeat Session
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.claimSkipContainer}>
          <TouchableOpacity style={styles.duringSessionCancelSessionButton} onPress={() => {
            Alert.alert(
              "Take a Well-Deserved Rest?",
              "You can always come back and continue later.",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                },
                { text: "Finish", onPress: () => {
                  const newPastSessions = [...user.pastStudySessions];
                  const updatedCurrentSession = {
                    ...currentSession,
                    hasClaimedBreak: true,
                  };
                  newPastSessions.push(updatedCurrentSession);
                  const newUserData = {
                    ...user,
                    pastStudySessions: newPastSessions,
                    currentSession: null,
                  };
                  dispatch(saveUser(newUserData));
                } }
              ]
            );
          }}>
            <Text style={styles.duringSessionCancelSessionText}>Finish Studying</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default StudySessionsPage;