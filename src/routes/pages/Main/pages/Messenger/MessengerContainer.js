/**
 *
 *
 *
 */

import React, { useEffect, useState, useCallback } from 'react';
import MessengerPresenter from './MessengerPresenter';
import { io } from 'socket.io-client';
import { getCookie, MessageAlert } from 'utils';
import { API } from 'api';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

// import {
//   initSocketConnection,
//   disconnectSocket,
//   sendSocketMessage,
//   socketInfoReceived,
// } from 'utils/SocketIO';

let userId = getCookie('userId');
let socket;
const initSocketConnection = (uid = null) => {
  if (socket) return true;
  socket = io('http://localhost:3333', {
    transports: ['websocket'],
    query: `userId=${uid ? uid : userId}`,
  });
  console.log('socket', socket);
  socket.connect();
  return null;
};
initSocketConnection();

// 나가기 아이디

/**
 * [Component] Messenger Container
 * --
 */
const MessengerContainer = (props) => {
  /* ====== Initial ====== */
  const history = useHistory();
  const { search } = useLocation();
  const { roomId } = queryString.parse(history.location.search);

  /* ====== State ====== */
  // const [currentRoom] = useState('Home');
  const [rName] = useState('Derek');
  const [roomList, setRoomList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState(null);
  const [chatList, setChatList] = useState([]);
  // 유저정보
  const userInfo = JSON.parse(getCookie('userInfo'));

  // let leaveRoomTemp = null;
  let leaveRoomTemp = null;

  /* ====== FUNCTIONS ====== */
  /**
   * 채팅방 선택
   * --
   */
  const handleChangeRoom = (key = null) => {
    history.push(`/messenger${key && `?roomId=${key}`}`);
  };

  useEffect(() => {
    const call = (key = null) => {
      const filtered = roomList.filter((item) => item.room_id === key)[0];
      setCurrentRoom(key);
      setCurrentRoomInfo(key ? filtered : null);
    };
    roomId && call(roomId);
  }, [roomId]);

  /**
   * 방 가입 함수
   * --
   */
  const handleJoinRoom = () => {};

  /**
   * 방 생성 함수
   * --
   */
  const handleCreateRoom = async (roomData, inviteList) => {
    try {
      const {
        room_name,
        room_storage,
        room_ftpid,
        room_ftppw,
        room_ftpip,
        room_description,
      } = roomData;

      // 기본정보 예외처리
      if (!room_name || inviteList.length <= 0) {
        return MessageAlert.warning('모든 정보를 입력해주세요');
      }

      // ftp예외처리
      if (room_storage && (!room_ftpid || !room_ftppw || !room_ftpip)) {
        return MessageAlert.warning('FTP사용 시 입력정보는 필수입니다.');
      }

      const members = [];
      for (let i of inviteList) {
        members.push(Number(i));
      }
      // 모델
      const newData = {
        room_id: currentRoom,
        room_name,
        room_storage,
        room_ftpid,
        room_ftppw,
        room_ftpip,
        room_description,
        members,
        user_id: Number(userInfo.user_id),
      };

      // API Call
      const { status, data } = await API.createRoom(newData);
      if (status !== 200) {
        throw { message: '채팅방을 생성할 수 없습니다. 다시 시도해주세요' };
      }

      setRoomList((prev) => [...prev, data]);
      MessageAlert.success('생성되었습니다');
      return true;
    } catch (err) {
      console.log('[handleCreateRoom] Error: ', err);
      MessageAlert.error(err.message);
      return false;
    }
  };

  /**
   * 방 리스트 조회
   * --
   */
  const handleGetRoomList = useCallback(() => {
    socket.emit('RoomList', rName);
  }, [rName]);

  /**
   * 방 리스트 조회
   * --
   */
  const handleSendMessage = (msg = '') => {
    if (msg) socket.emit('chat', currentRoom, userInfo.user_id, msg);
  };

  /**
   * 채팅방 상세조회
   * --
   */
  const handleGetRoom = useCallback(async () => {
    console.log('[CHANGE ROOM] currentRoom: ', currentRoom);

    try {
      // API Call
      const { status, data } = await API.getRoom(currentRoom);
      const chatResult = await API.getChats(currentRoom);
      // 예외처리
      if (status !== 200) {
        throw {
          message: '채팅방 데이터를 불러올 수 없습니다. 다시 시도해주세요',
        };
      }
      // 연결정보
      const { room_id } = data;
      const { user_id, user_name } = userInfo;

      // 나가기 할 아이디가 있을경우
      // if (leaveRoomTemp !== null) {
      //   // 소켓아웃
      //   socket.emit('leaveRoom', leaveRoomTemp, user_name);
      // }
      // console.log('leaveRoomTemp: ', leaveRoomTemp);
      // socket.emit('leaveRoom', leaveRoomTemp, user_name);
      // leaveRoomTemp = currentRoom;
      // socket.emit('leaveRoom', currentRoom, user_name);
      // 소켓연결
      socket.emit('joinRoom', room_id, user_name);
      socket.emit('login', {
        room_id,
        user_name,
        user_id,
      });
      // Set state
      setChatList(chatResult.data);
      setCurrentRoomInfo(data);
    } catch (err) {
      console.log('[handleGetRoom] Error: ', err);
      MessageAlert.error(err.message);
    }
  }, [currentRoom]);

  /**
   * 파일 업로드
   * --
   */
  const handleSendFile = (fileInfo) => {
    const files = fileInfo;
    const maxSize = 5 * 1024 * 1024;
    const fileSize = files.size;
    console.log(files);
    if (fileSize > maxSize) {
      alert('첨부파일 사이즈는 5MB 이내로 등록 가능합니다.');
      return false;
    } else {
      // 서버로 파일을 전송한다.
      files &&
        socket.emit(
          'upload',
          files,
          files.name,
          files.size,
          files.type,
          currentRoom,
          userInfo.user_id,
          (status) => {
            console.log(status);
          }
        );
    }
  };

  /* ====== VARIABLES ====== */

  /* ====== HOOKS ====== */
  /**
   * 소켓 초기설정
   * --
   */
  useEffect(() => {
    const call = () => {
      socket.on('RoomList', (data) => {
        setRoomList(data);
      });
      socket.on('creatRoom', (data) => {
        console.log('[creatRoom] data: ', data);
      });
      socket.on('userList', (data) => {
        console.log('[userList] data: ', data);
      });
      socket.on('inviteUser', (data) => {
        console.log('[inviteUser] data: ', data);
      });
      socket.on('chat', (data) => {
        console.log(chatList);
        console.log('[chat] data: ', data);
        setChatList((prev) => [...prev, data]);
      });
      // socket.on('chat', (data, dd) => {
      //   console.log('[chat] data: ', data);
      //   console.log('[chat] dd: ', dd);
      // });
      socket.on('leaveRoom', (data) => {
        console.log('[leaveRoom] data: ', data);
      });
      socket.on('joinRoom', (data) => {
        console.log('[joinRoom] data: ', data);
      });
      socket.on('login', (data) => {
        console.log('[login] data: ', data);
      });
      socket.on('login', (data) => {
        console.log('[login] data: ', data);
      });
    };

    if (!userId) {
      userId = getCookie('userId');
    }
    !socket && initSocketConnection(userId);
    call();
    handleGetRoomList();

    return () => {
      if (socket == null || socket.connected === false) {
        return;
      }
      socket.disconnect();
      socket = undefined;
    };
  }, [handleGetRoomList]);

  /**
   * 채팅방 상세 조회
   * --
   */
  useEffect(() => {
    currentRoom && handleGetRoom();
  }, [handleGetRoom]);

  /**
   * 유저목록 조회
   * --
   */
  useEffect(() => {
    const call = async () => {
      try {
        const { status, data } = await API.getUsers();
        if (status !== 200) {
          return MessageAlert.error('유저정보를 불러올 수 없습니다.');
        }
        setUserList(data);
      } catch (err) {
        MessageAlert.error('X');
      }
    };

    call();
  }, []);

  // console.log('currentRoom : ', currentRoom);
  /* ====== RENDER ====== */
  return (
    <MessengerPresenter
      // States
      roomList={roomList.sort((a, b) =>
        a.room_id < b.room_id ? -1 : a.room_id > b.room_id ? 1 : 0
      )}
      userList={userList}
      userId={userId}
      currentRoom={currentRoom}
      currentRoomInfo={currentRoomInfo}
      userInfo={userInfo}
      chatList={chatList}
      // Functions
      onJoinRoom={handleJoinRoom}
      onChangeRoom={handleChangeRoom}
      onCreateRoom={handleCreateRoom}
      onGetRoomList={handleGetRoomList}
      onSendMessage={handleSendMessage}
      onSendFile={handleSendFile}
    />
  );
};

export default MessengerContainer;
