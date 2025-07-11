import React, { useEffect, useState, useRef } from 'react';

// external packages
import firestore from '@react-native-firebase/firestore';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';

import { TouchableOpacity, View, Text, ActivityIndicator, AppState, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { getCountry } from "react-native-localize";
import { saveUser, fetchSharedSetData, setBottomNavShown, setCreatingNewSetFromNoSets } from './firebase/userSlice';
import { addFolder } from './firebase/foldersSlice';
//import { Configuration, OpenAIApi } from "openai";

import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from "react-native-svg"

header: ({ navigation, route, options }) => {
  const title = getHeaderTitle(options, route.name);
  
  return <MyHeader title={title} style={options.headerStyle}/>;
};

import Ionicons from 'react-native-vector-icons/Ionicons';
import colours from './app/config/colours';

// screens
import { LoginScreen, RegistrationScreen, HomeScreen, InstaSetsScreen, ProfileScreen, StudySessionsScreen } from './app/screens';
import { CreateFileModal } from './app/screens/HomeScreen/Modals/CreateFileModal';
import { useAuthentication } from './firebase/useAuthentication';
import { SmartSetModal } from './app/screens/HomeScreen/Modals/SmartSetModal';
import { SetImportModal } from './app/screens/HomeScreen/Modals/SetImportModal';
import { SheetManager } from 'react-native-actions-sheet';

import {PermissionsAndroid} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
// checks if on android and requests permission
if (Platform.OS === 'android') {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
}

GoogleSignin.configure({
  webClientId: '351626845911-17f4gp97b0kihnfu0hlpth0t19uk6t8v.apps.googleusercontent.com',
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ButtonScreen = () => null;

const AddFileIconButton = ({ onPress }) => {
  return(
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <TouchableOpacity onPress={onPress}>
        <Ionicons name={"add-circle-outline"} size={35} color={'darkgrey'} />
      </TouchableOpacity>
    </View>
  )
}

/*try {
  const configuration = new Configuration({
      organization: "org-DEyeUsEnMQ91vprnQhfTC3CN",
      apiKey: BAD_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.listEngines();
  const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "string" }],
      model: "gpt-3.5-turbo",
  });
} catch (error) {
  console.error("An error occurred:", error);
}*/

async function handleImport (setCode, newName, dispatch, importingSet) {
  if (setCode != "") {
    let set = await dispatch(fetchSharedSetData(setCode));
    set = set.payload.payload;
    set = set.cards.map((card, index) => {
      const newCard = {...card};
      if (index==0) {return card}
      newCard.levelLearned = 0;
      newCard.correct = 0;
      newCard.incorrect = 0;
      newCard.totalCorrect = 0;
      newCard.totalIncorrect = 0;
      return newCard;
    });

    if (set == null) {
      alert("Set not found");
    } else {
      importingSet.current = set;
    }
  } else {
    alert("Please enter a set code");
  }
}

function HomeTabs(props) {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const importingSet = useRef(["null"]);
  const setOrFolderText = creatingFolder ? "Folder" : "Set";
  const navigation = useNavigation();
  const newName = useRef("");
  const newDescription = useRef("null");
  const newIcon = useRef("null");
  const [answerWithTerm, setAnswerWithTerm] = useState(false);
  const [answerWithDefinition, setAnswerWithDefinition] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const inputRef = useRef(null);

  const [showSmartSetModal, setShowSmartSetModal] = useState(false);
  const generatedCards = useRef(["null"]);

  const generateID = () => {
      const randomString = Math.random().toString(36).substr(2, 10);
      const timestamp = Date.now().toString(36);
      const ID = randomString + timestamp;
      return ID;
  };

  const handleCreate = () => {
    if (newName.current != "" ) {
      const newid = generateID();
      if (creatingFolder) {
        setShowModal(false);
        dispatch(addFolder({
          folderId: newid,
          name: newName.current,
          icon: newIcon.current,
      }));
      } else {
            if (!answerWithDefinition && !answerWithTerm) {
              alert("Please select at least one of 'Answer with term' or 'Answer with definition'");
            } else {
              setShowModal(false);
              navigation.push('CreateCardsPage', {set: { setId: newid, name: newName.current, cards: importingSet.current, icon: newIcon.current, description: newDescription.current, isPrivate: isPrivate, answerWithTerm: answerWithTerm, answerWithDefinition: answerWithDefinition }, editOrCreate: "Create"});
            }
          }
    } else {
      alert("Please enter a name for your " + setOrFolderText.toLowerCase());
      inputRef.current.focus();
    }
  };
  
  const handleGenerateSmartSet = () => {
      setShowModal(false);
      setShowSmartSetModal(true);
  };

  const handleOpenModal = () => {
    newName.current="";
    newDescription.current="null";
    newIcon.current="null";
    importingSet.current=["null"];
    setIsPrivate(false);
    setAnswerWithTerm(false);
    setAnswerWithDefinition(true);
    setShowModal(true);
  }
  const showActionSheet = async () => {
    chosenOption = await SheetManager.show("NewFileActionSheet");
    switch (chosenOption) {
      case "NewSet":
        handleOpenModal();
        setCreatingFolder(false);
        break;
      case "NewFolder":
        handleOpenModal();
        setCreatingFolder(true);
        break;
    }
      /*const options = ['New Set', 'New Folder', 'Cancel'];
      const cancelButtonIndex = 2;

      showActionSheetWithOptions({
          options,
          cancelButtonIndex,
      }, (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            handleOpenModal();
            setCreatingFolder(false);
            break;
          case 1:
            handleOpenModal();
            setCreatingFolder(true);
            break;
      }});*/
  }

  const dispatch = useDispatch();
  const state = useSelector((state) => state.user);
  const data = state.data;
  const isBottomNavShown = state.bottomNavShown;
  const lastSavedTimestamp = useRef(Date.now());

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  useEffect(() => {
    if (state.creatingNewSetFromNoSets) {
      dispatch(setCreatingNewSetFromNoSets(false));
      handleOpenModal();
      setCreatingFolder(false);
    }
  }, [state.creatingNewSetFromNoSets]);

  const startTime = useRef(Date.now());
  useEffect(() => {
    let userCountry = "Initial";
    try {
      userCountry = getCountry();
    } catch (error) {
      userCountry = "Unavailable";
    }
    if ( data.country == "Unavailable"
    || data.country == "Initial"
    || data.country == null
    || (data.country != userCountry && userCountry != "Unavailable" && userCountry != "Initial") ) {
      try {
        userCountry = getCountry();
        dispatch(saveUser({
          ...data,
          country: userCountry

        }));
      } catch (error) {
        data.country = "Unavailable";
      }
    }
    const subscription = AppState.addEventListener('change', nextAppState => {
      const currentTimeStamp = Date.now();
      const timeSpent = Math.floor((currentTimeStamp - startTime.current) / 1000 );
      const userId = data.id;
      /*if (data && (nextAppState === 'background')) {
        updateTotalTimeSpent(userId, timeSpent);
        if (currentTimeStamp - lastSavedTimestamp.current >= 5000) {
          dispatch(saveUser("current"));
          lastSavedTimestamp.current = currentTimeStamp;
        }
      }*/

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, update session start time
        startTime.current = Date.now();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to the background, update total time spent and save user data
        updateTotalTimeSpent(userId, timeSpent);
        if (currentTimeStamp - lastSavedTimestamp.current >= 5000) {
          dispatch(saveUser("current"));
          lastSavedTimestamp.current = currentTimeStamp;
        }
      }
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const updateTotalTimeSpent = (userId, timeSpent) => {
    firestore().collection('timeRecords').doc(userId).set({
      timeSpent: firestore.FieldValue.increment(timeSpent)
    }, { merge: true })
    .then(() => {
        console.log("Time spent updated successfully!");
    })
    .catch((error) => {
        console.error("Error updating time spent: ", error);
    });
    /*firebase.database().ref(`timeRecords/${userId}`).transaction((totalTime) => {
      if (totalTime == null) {
        return timeSpent;
      }
      return (totalTime || 0) + timeSpent;
    });*/
  };

  return(
    <>
      <CreateFileModal
        newName={newName} 
        showModal={showModal} 
        setShowModal={setShowModal} 
        creatingFolder={creatingFolder} 
        handleCreate={handleCreate} 
        handleGenerateSmartSet={handleGenerateSmartSet} 
        setOrFolderText={setOrFolderText} 
        showGenerateSmartSet={true}
        inputRef={inputRef}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        setShowImportModal={setShowImportModal}
        importingSet={importingSet}
        answerWithTerm={answerWithTerm}
        setAnswerWithTerm={setAnswerWithTerm}
        answerWithDefinition={answerWithDefinition}
        setAnswerWithDefinition={setAnswerWithDefinition}
      />
      <SetImportModal
        visible={showImportModal}
        setVisible={setShowImportModal}
        setShowModal={setShowModal}
        onImport={handleImport}
        setCreateModalVisible={setShowModal}
        newName={newName}
        dispatch={dispatch}
        importingSet={importingSet}
      />
      <SmartSetModal
        newName={newName} 
        showModal={showSmartSetModal}
        setShowModal={setShowSmartSetModal}
        generatedCards={generatedCards}
        handleCreate={handleCreate} 
        handleGenerateSmartSet={handleGenerateSmartSet} 
        setOrFolderText={setOrFolderText} 
      />
      <Tab.Navigator
      backBehavior='history'
      headerShown={false}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          size = 33;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'InstaSets') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'ProfileScreen') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'StudySessions') {
            //iconName = focused ? 'timer' : 'timer-outline';
            iconName = focused ? 'school' : 'school-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: 'darkgray',
      })}
      >
        { isBottomNavShown ? (<Tab.Screen name="Home" options={{tabBarShowLabel: false}} component={HomeScreen}/>) : (<Tab.Screen name="Home" options={{tabBarShowLabel: false, tabBarStyle: { display: 'none' }}} component={HomeScreen}/>)}
        <Tab.Screen name="InstaSets" options={{tabBarShowLabel: false}} component={InstaSetsScreen} />
        <Tab.Screen name="AddFile"
          component={ButtonScreen}
          options={({navigation})=> ({
            tabBarButton:props => <AddFileIconButton onPress={showActionSheet}/>
          })}
        />
        <Tab.Screen name="StudySessions" options={{tabBarShowLabel: false}} component={StudySessionsScreen} />
        <Tab.Screen name="ProfileScreen" options={{tabBarShowLabel: false}} component={ProfileScreen} />
      </Tab.Navigator>
    </>
  )
}

const SVGBackButton = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={44}
    height={44}
    left={8}
    top={8}
    fill="none"
    stroke={colours.primaryAccent}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={3}
    className="feather feather-arrow-left"
    {...props}
  >
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
)

export default function WrappedApp() {
  const { isLoggedIn } = useAuthentication();
  const stateLoggedIn = useSelector((state) => state.user.loggedIn);
  
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(loadingTimeout);
    };
  }, []);

  const state = useSelector((state) => state.user);
  
  if (isLoading || state.loading || state.loading === undefined || (state.data == null && stateLoggedIn)) {	
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F5' }}>
        <Image source={require('./app/assets/StudySenseLogoTransparent.png')} style={{ width: '80%', aspectRatio: 1/1, height: undefined }}/>
        <ActivityIndicator size="large" color={colours.primary} />
      </View>
    )
  }
  return (
    <NavigationContainer>
      <Stack.Navigator>
        { stateLoggedIn ? (
          <Stack.Screen name="Main" component={HomeTabs} options={{headerShown: false}}/>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={({route}) => ({headerBackImage:()=>(<SVGBackButton/>), headerBackTitleVisible:false})}/>
            <Stack.Screen name="Registration" component={RegistrationScreen} options={({route}) => ({headerBackImage:()=>(<SVGBackButton/>), headerBackTitleVisible:false})}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};