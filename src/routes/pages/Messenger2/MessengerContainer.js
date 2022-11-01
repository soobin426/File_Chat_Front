/**
 *
 *
 *
 */

import React, { useEffect, useState, useCallback } from 'react';
import MessengerPresenter from './MessengerPresenter';
import { io } from 'socket.io-client';
import { MessageAlert } from 'utils';
import { API } from 'api';
// import {
//   initSocketConnection,
//   disconnectSocket,
//   sendSocketMessage,
//   socketInfoReceived,
// } from 'utils/SocketIO';

let socket;

const initSocketConnection = () => {
  if (socket) return true;
  socket = io('http://localhost:3333', {
    transports: ['websocket'],
  });
  socket.connect();
  return null;
};
initSocketConnection();

/**
 * [Component] Messenger Container
 * --
 */
const MessengerContainer = (props) => {
  /* ====== STATE ====== */
  // const [currentRoom] = useState('Home');
  const [rName] = useState('Derek');
  const [roomList, setRoomList] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentRoomInfo, setCurrentRoomInfo] = useState(null);

  /* ====== FUNCTIONS ====== */
  /**
   * 방 가입 함수
   * --
   */
  const handleChangeRoom = (key = null) => {
    const filtered = roomList.filter((item) => item.room_id === key)[0];
    setCurrentRoom(key);
    setCurrentRoomInfo(key ? filtered : null);
  };

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
        room_id,
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

      // 모델
      const newData = {
        room_id,
        room_name,
        room_storage,
        room_ftpid,
        room_ftppw,
        room_ftpip,
        room_description,
        members: inviteList,
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
  const handleSetCommand = (cmd = 'message', data) => {
    socket.emit(cmd, currentRoom, rName, data);
  };

  /**
   * 채팅방 상세조회
   * --
   */
  const handleGetRoom = useCallback(async () => {
    try {
      const { status, data } = await API.getRoom(currentRoom);
      if (status !== 200) {
        throw {
          message: '채팅방 데이터를 불러올 수 없습니다. 다시 시도해주세요',
        };
      }
      setCurrentRoomInfo(data);
    } catch (err) {
      console.log('[handleGetRoom] Error: ', err);
      MessageAlert.error(err.message);
    }
  }, [currentRoom]);

  /* ====== VARIABLES ====== */

  /* ====== HOOKS ====== */
  /**
   * 소켓 초기설정
   * --
   */
  useEffect(() => {
    const call = () => {
      /*  */
      socket.on('RoomList', (data) => {
        setRoomList(data);
      });
      /*  */
      socket.on('creatRoom', (data) => {
        console.log('[creatRoom] data: ', data);
      });
      /*  */
      socket.on('userList', (data) => {
        console.log('[userList] data: ', data);
      });
      /*  */
      socket.on('inviteUser', (data) => {
        console.log('[inviteUser] data: ', data);
      });
      /*  */
      socket.on('chat message', (data) => {
        console.log('[chat message] data: ', data);
      });
      /*  */
      socket.on('leaveRoom', (data) => {
        console.log('[leaveRoom] data: ', data);
      });
      /*  */
      socket.on('joinRoom', (data) => {
        console.log('[joinRoom] data: ', data);
      });
    };

    !socket && initSocketConnection();
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

  /* ====== RENDER ====== */
  return (
    <MessengerPresenter
      // States
      roomList={roomList}
      currentRoom={currentRoom}
      currentRoomInfo={currentRoomInfo}
      // Functions
      onChangeRoom={handleChangeRoom}
      onGetRoomList={handleGetRoomList}
      onJoinRoom={handleJoinRoom}
      onSetCommand={handleSetCommand}
      onCreateRoom={handleCreateRoom}
    />
  );
};

export default MessengerContainer;
