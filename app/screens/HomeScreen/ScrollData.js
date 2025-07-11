import 'react-native-gesture-handler';
import React, { useState, useRef, useEffect } from 'react';

import { SwipeListView } from 'react-native-swipe-list-view';
import { Text, View, TouchableOpacity, Image, TouchableWithoutFeedback, Alert } from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';

import styles from './styles.js';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colours from '../../config/colours.js';

import { useDispatch, useSelector } from 'react-redux';

import { deleteFolder, editFolder } from '../../../firebase/foldersSlice.js';
import { deleteSet } from '../../../firebase/setsSlice.js';
import { setCurrentFolder, setCurrentSet, setCreatingNewSetFromNoSets } from '../../../firebase/userSlice.js';

import { CreateFileModal } from './Modals/CreateFileModal.js';

const CreateFirstSetIcon = require('../../assets/CreateFirstSetIcon.png')

export default function ScrollData(props) {
    const dispatch = useDispatch();
    const state = useSelector((state) => state.user);
    const isFolder = props.isFolder;

    const [showModal, setShowModal] = useState(false);

    const [editingFolder, setEditingFolder] = useState(false);
    const setOrFolderText = editingFolder ? "Folder" : "Set";

    const newName = useRef("");
    const newDescription = useRef("null");
    const newIcon = useRef("null");
    const [answerWithTerm, setAnswerWithTerm] = useState(false);
    const [answerWithDefinition, setAnswerWithDefinition] = useState(false);
    const inputRef = useRef(null);
    const [isPrivate, setIsPrivate] = useState(false);

    const editingId = useRef("");
    const editingCards = useRef(["null"]);
    const editingSet = useRef({});
    const currentRowMap = useRef({});

    const handleEdit = () => {
      if (newName.current != "" ) {
        if (editingFolder) {
          setShowModal(false);
          dispatch(editFolder({
              folderId: editingId.current,
              editedValues: {name : newName.current},
          }));
        } else {
              if (!answerWithDefinition && !answerWithTerm) {
                alert("Please select at least one of 'Answer with term' or 'Answer with definition'");
              } else {
                setShowModal(false);
                navigation.push('CreateCardsPage', {set: { setId: editingId.current, name: newName.current, cards: editingCards.current, icon: newIcon.current, description: newDescription.current, isPrivate: isPrivate, answerWithTerm: answerWithTerm, answerWithDefinition: answerWithDefinition }, editOrCreate: "Edit"});
              }
            }
      } else {
        alert("Please enter a name for your " + setOrFolderText.toLowerCase());
        inputRef.current.focus();
      }
    };

    const currentFolder = state.currentFolder;

    const user = state.data
    const data = useRef("not set yet");

    //if (currentFolder == null) {
    if (!isFolder) {
      const folders = [...user.folders]
      folders.shift()
      const sets = [...user.sets]
      sets.shift()
      data.current = [
        { title: "Folders", data: folders},
        { title: "Sets", data: sets}
      ]
    } else if (currentFolder != null) {
      const sets = [...user.folders.find((folder) => folder.id === currentFolder).sets]
      sets.shift()
      data.current = [{title: "Sets", data: sets}];
    }

    const navigation = props.navigation;
    const deletingRowInfo = useRef({});
  
    const confirmDeleteRow = (rowMap, rowId, rowname, isRowFolder) =>{
      let rowFileType = isRowFolder ? 'Folder' : 'Set';
      deletingRowInfo.current = { FileType: rowFileType, name: rowname, Id: rowId, rowMap: rowMap };
      Alert.alert("Delete " + rowFileType, "Are you sure you would like to delete this " + rowFileType + " permanently?", [
        {
            text: "Cancel",
            onPress: () => {},
            style: "cancel"
        },
        {
          style: 'destructive',
          text: "Confirm",
          onPress: () => {
            deleteRow();
          }
        }
      ], "plain-text");
    }
  
    const deleteRow = () => {
      if (deletingRowInfo.current.rowMap[deletingRowInfo.current.Id]) {
        deletingRowInfo.current.rowMap[deletingRowInfo.current.Id].closeRow();
      }
      if (deletingRowInfo.current.FileType === 'Folder') {
        dispatch(deleteFolder(deletingRowInfo.current.Id));
      } else {
        dispatch(deleteSet(deletingRowInfo.current.Id));
      }
    };

    const keyExtractor = (item) => item.id;
  
    const renderItem = ({
      item,
      index
    }) => {
      const imagePath = item.isFolder
    ? require('../../assets/DefaultFolderIcon.png')
    : require('../../assets/DefaultSetIcon.png');
    const [isFocus, setIsFocus] = useState(false);
      return(
        <TouchableWithoutFeedback
          onPress={() => {
            item.isFolder
              ? dispatch(setCurrentFolder(item.id))
              : dispatch(setCurrentSet(item.id));
            item.isFolder
              ? navigation.push('FolderPage', { Item: item })
              : navigation.push('RevisionOptions', { Item: item });
          }}
        >
          <View
            style={styles.scrollDataItemButton}
          >
            <Image style={{ width: 40, height: 40 }} source={imagePath} />
            <View style={{flexDirection: 'column', gap: 4}}>
              <Text numberOfLines={1} style={{
                paddingRight: 50,
                 fontWeight: 'normal',
                        fontFamily: 'Lato',
fontSize: 19,
                color: colours.black,
                overflow: 'hidden',
              }}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={{
                  
                          fontFamily: 'Lato',
fontSize: 13,
                  color: colours.secondarytext,
                  overflow: 'hidden',
              }}>
                {item.isFolder ? item.sets.length - 1 + ' sets' : item.cards.length - 1 + ' cards'}
              </Text>
            </View>
            <Dropdown
              style={[styles.dropdown, { paddingHorizontal: 5 }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              itemTextStyle={styles.dropdownLabel}
              iconStyle={styles.dropdownIcon}
              data={[
                { label: 'Edit', value: 'edit'},
                { label: 'Delete', value: 'delete' },
              ]}
              maxHeight={150}
              labelField="label"
              valueField="value"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={value => {
                setIsFocus(false);
                if (value.value == 'edit') {
                  editingSet.current = item;
                  editingId.current = item.id;
                  editingCards.current = item.cards;
                  newName.current = item.name;
                  if (item.testOptions) {
                    setAnswerWithTerm(item.testOptions.answerWithTerm);
                    setAnswerWithDefinition(item.testOptions.answerWithDefinition);
                  } else {
                    setAnswerWithTerm(false);
                    setAnswerWithDefinition(true);
                  }
                  setIsPrivate(item.isPrivate);
                  setEditingFolder(item.isFolder);
                  setShowModal(true);
                } else if (value.value == 'delete') {
                  confirmDeleteRow(currentRowMap.current, item.id, item.name, item.isFolder);
                }
              }}
            />
          </View>
        </TouchableWithoutFeedback>  
      )
    }
  
  const renderHiddenItem = (data, rowMap) => {
    currentRowMap.current = rowMap;
    return(
      <View style={styles.scrollDataButtonContainer}>
        <View style={{flex: 1}}/>
        <TouchableOpacity
          style={[styles.scrollDataButton, { backgroundColor: colours.primaryAccent, marginRight: 0.5 }]}
          onPress={() => {
            editingSet.current = data.item;
            editingId.current = data.item.id; 
            editingCards.current = data.item.cards;
            newName.current = data.item.name;
            if (data.item.testOptions) {
              setAnswerWithTerm(data.item.testOptions.answerWithTerm);
              setAnswerWithDefinition(data.item.testOptions.answerWithDefinition);
            } else {
              setAnswerWithTerm(false);
              setAnswerWithDefinition(true);
            }
            setIsPrivate(data.item.isPrivate); 
            setEditingFolder(data.item.isFolder); 
            setShowModal(true);
          }}
        >
          <View style={styles.scrollDataIconContainer}>
            <Ionicons name="create-outline" color={colours.text} size={20} />
          </View>
          <Text style={styles.scrollDataButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scrollDataButton, { backgroundColor: '#FF4242', marginRight: 2 }]}
          onPress={()=>confirmDeleteRow(rowMap, data.item.id, data.item.name, data.item.isFolder)}
        >
          <View style={styles.scrollDataIconContainer}>
            <Ionicons name="close" color={colours.text} size={20} />
          </View>
          <Text style={styles.scrollDataButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    ) 
  };

  const NoSetsComponent = () => (
    <View style={styles.noSetsFrame}>
      <View style={styles.noSetsFeature}>
        <Text style={styles.noSetsFeatureTitleText}>
          InstaSets
        </Text>
        <Text style={styles.noSetsFeatureSubText}>
          The study shortcut you've been wishing for.
        </Text>
        <TouchableOpacity
        style={styles.noSetsFeatureButton}
        onPress={() => {
          // navigates to the InstaSets page
          navigation.navigate('InstaSets');
        }}
        >
          <Text style={styles.noSetsFeatureButtonText}>
            Discover InstaSets
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.noSetsFeature}>
        <Text style={styles.noSetsFeatureTitleText}>
          StudySessions
        </Text>
        <Text style={styles.noSetsFeatureSubText}>
          Beat distractions and track your progress.
        </Text>
        <TouchableOpacity
        style={styles.noSetsFeatureButton}
        onPress={() => {
          // navigates to the StudySessions page
          navigation.navigate('StudySessions');
        }}
        >
          <Text style={styles.noSetsFeatureButtonText}>
            Upgrade Your Focus
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSectionHeader=({ section }) => (
    (section.data.length > 0 &&
      <Text style={{ paddingVertical: 5,  fontWeight: '600', color: colours.subtitletext,         fontFamily: 'Lato',
fontSize: 20}}>{section.title}</Text>
      )
    );
  return(
    <View style={{ backgroundColor: colours.backgroundColour, flex: 1, justifyContent: "center", paddingHorizontal: 13}}>
        <View style={{paddingHorizontal: 3}}>
          <CreateFileModal
            newName={newName} 
            showModal={showModal} 
            setShowModal={setShowModal} 
            creatingFolder={editingFolder} 
            handleCreate={handleEdit} 
            showGenerateSmartSet={false} 
            setOrFolderText={setOrFolderText} 
            editOrCreate={"Edit"}
            inputRef={inputRef}
            setCode={user.id + "/" + editingId.current}
            isPrivate={isPrivate}
            setIsPrivate={setIsPrivate}
            saveSharedSetSetCode={editingId.current}
            set={editingSet.current}
            answerWithTerm={answerWithTerm}
            answerWithDefinition={answerWithDefinition}
            setAnswerWithTerm={setAnswerWithTerm}
            setAnswerWithDefinition={setAnswerWithDefinition}
          />
        </View>
        {!isFolder && data.current[1].data != null && data.current[0].data != null && data.current[1].data.length == 0 && data.current[0].data.length == 0 ? <NoSetsComponent /> : 
        (
          <SwipeListView
            sections={data.current}
            renderSectionHeader={renderSectionHeader}
            useSectionList={true}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            contentContainerStyle={{paddingBottom:10}}
            rightOpenValue={-144}
            disableRightSwipe
            closeOnRowPress={true}
            closeOnScroll={true}
            keyExtractor={keyExtractor}
          />
        )
        }
    </View>
    )
  }