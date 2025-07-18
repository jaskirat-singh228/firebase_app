import {useNetInfo} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import BaseText from 'components/base_components/base_text';
import BaseTextInput from 'components/base_components/base_text_input';
import CardView from 'components/hoc/card_view';
import FullScreenContainer from 'components/hoc/full_screen_container';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import {BackWithTitleHeader} from 'components/molecules/back_with_title_view';
import BounceView from 'components/molecules/bounce_view';
import React from 'react';
import {FlatList} from 'react-native';
import {Icon, useTheme} from 'react-native-paper';
import {AppStackParamList} from 'types/navigation_types';
import {MaterialIcon} from 'utilities/constants';
import {ms} from 'utilities/scale_utils';
import {v4 as UUIDv4} from 'uuid';
import TodoLocalRepository from '../../local_storage/SQLite/todosRepository';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'TodoScreen'>;

export type TTodoData = {
  isSynced: boolean;
  todo: string;
  todoId: string;
  createdAt: object;
};

const TodoScreen: React.FC<HomeScreenProps> = () => {
  const theme = useTheme();
  const {isConnected} = useNetInfo();
  const [value, setValue] = React.useState<string>('');
  const [todoList, setTodoList] = React.useState<TTodoData[]>([]);

  const localTodos = async () => {
    const data = await TodoLocalRepository.getUnsyncedTodos();
    console.log(data, 'dataaaaaaa>>>>>>>>>>');
  };

  React.useEffect(() => {
    localTodos();
    // const subscribe = firestore()
    //   .collection('Todos')
    //   .orderBy('createdAt', 'desc')
    //   .onSnapshot(querySnapshot => {
    //     const todos: TTodoData[] = [];
    //     querySnapshot.forEach((documentSnapshot: any) => {
    //       todos.push(documentSnapshot.data());
    //     });
    //     setTodoList(todos);
    //   });
    // return () => subscribe();
  }, []);

  const addTodo = async () => {
    const todoId = UUIDv4();

    const data: TTodoData = {
      todoId,
      todo: value.trim(),
      isSynced: isConnected ? true : false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    if (isConnected) {
      // await firestore().collection('Todos').doc(todoId).set(data);
      await TodoLocalRepository.addOfflineTodo(data);
    }
    // await TodoLocalRepository.addOfflineTodo(data);
  };

  const deleteTodo = async (todoId: string) => {
    if (isConnected) {
      await firestore().collection('Todos').doc(todoId).delete();
      await TodoLocalRepository.deleteLocalTodo(todoId);
    }
    await TodoLocalRepository.deleteLocalTodo(todoId);
  };

  return (
    <FullScreenContainer>
      <BackWithTitleHeader title="Todos" />
      <BaseTextInput
        value={value}
        onChangeText={text => setValue(text)}
        placeholder="Enter something..."
        autoCapitalize="words"
      />
      <AnimatedLoaderButton title="Add" onPress={addTodo} alignSelfCenter />
      <FlatList
        data={todoList}
        contentContainerStyle={{
          paddingHorizontal: ms(15),
          paddingBottom: ms(100),
        }}
        style={{paddingTop: ms(10)}}
        keyExtractor={(item: TTodoData) => item.todoId}
        renderItem={({item}: {item: TTodoData}) => {
          return (
            <CardView
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <BaseText
                numberOfLines={2}
                children={item.todo}
                style={{fontSize: 16, padding: ms(10), width: '90%'}}
              />
              <BounceView onPress={() => deleteTodo(item.todoId)}>
                <Icon
                  source={MaterialIcon.DELETE}
                  size={25}
                  color={theme.colors.error}
                />
              </BounceView>
            </CardView>
          );
        }}
      />
    </FullScreenContainer>
  );
};

export default TodoScreen;
