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
/**
 * [Class]
 * --
 */
class SocketManager {
  /**
   *
   */
  constructor(uid) {
    if (!SocketManager.instance) {
      if (this.socket) return true;
      this.socket = io('http://localhost:3333', {
        transports: ['websocket'],
        query: `userId=${uid ? uid : userId}`,
      });
      console.log(1111111111111111);
      this.socket.connect();

      SocketManager.instance = this;
    }
    return SocketManager.instance;
  }

  /**
   *
   */
  onConnet = () => {
    console.log(2222222222222222);
    this.socket.connect();
  };

  /**
   *
   */
  getSocket = () => {
    return this.socket;
  };
}

let Socket = null;
let socket = null;

/**
 * [Component] Messenger Container
 * --
 */
const MessengerContainer = (props) => {
  Socket = new SocketManager(userId);
  socket = Socket.getSocket();
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
    history.push(`/messenger${key ? `?roomId=${key}` : ''}`);
  };

  useEffect(() => {
    const call = (key = null) => {
      const filtered = roomList.filter((item) => item.room_id === key)[0];
      //Chat roomId 오류 수정
      setCurrentRoom(Number(key));
      setCurrentRoomInfo(key ? filtered : null);
    };
    call(roomId);
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
        room_ftppath,
        room_ftpport,
        room_ftptype,
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
        room_ftppath: room_ftppath ? room_ftppath : '/',
        room_ftpport: room_ftpport ? room_ftpport : 21,
        room_ftptype: room_ftptype ? room_ftptype : 'ftp',
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
      // // 파일정보 리스트
      // const fileResult = await API.getFiles(currentRoom);
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
    const maxSize = 10000000;
    const fileSize = files.size;
    console.log(files);
    if (fileSize > maxSize) {
      alert('첨부파일 사이즈는 1MB 이내로 등록 가능합니다.');
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

  /**
   * 저장 함수
   * --
   */
  const handleUpdateFTP = async (newData) => {
    try {
      const { room_id } = currentRoomInfo;
      const { status, message } = await API.updateRoom(room_id, newData);
      if (status !== 200) {
        MessageAlert.error(message);
        return false;
      }
      setCurrentRoomInfo((prev) => ({
        ...prev,
        ...newData,
      }));
      MessageAlert.success('저장되었습니다.');
      return true;
    } catch (err) {
      MessageAlert.error(err.message);
      return false;
    }
  };

  /*
   * 시간 변환
   * --
   */
  const onChangeDate = (date) => {
    const data = new Date(date);
    const timestamp = date && date.split('T');
    // console.log(typeof data, 'data:', data);
    const dateTime = `${data.getFullYear()}년 ${
      data.getMonth() + 1
    }월 ${data.getDate()}일 ${
      timestamp && timestamp.length > 1 ? data.getUTCHours() : data.getHours()
    }:${data.getMinutes()}`;
    return dateTime;
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
        console.log('chatList:', chatList);
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

    if (socket) {
      call();
      handleGetRoomList();
    }

    // !socket && initSocketConnection(userId);

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
        Socket = new SocketManager(userId);
        Socket.onConnet(userId);
        socket = Socket.getSocket();
        socket.emit('RoomList', rName);

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

    if (!socket) {
      call();
    }

    return () => {
      Socket = null;
      socket = null;
    };
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
      onUpdateFTP={handleUpdateFTP}
      onChangeDate={onChangeDate}
    />
  );
};

export default MessengerContainer;
