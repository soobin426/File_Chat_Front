/**
 *
 *
 *
 */

import React, { useEffect, useState, useCallback } from 'react';
import MessengerPresenter from './MessengerPresenter';
import { io } from 'socket.io-client';
import { getCookie, MessageAlert, BACKEND_URL } from 'utils';
import { API } from 'api';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
const wrtc = require('wrtc');
const { RTCPeerConnection, RTCSessionDescription } = wrtc;
// 피어 간 연결 설정 
const peerConnection = new RTCPeerConnection();
// let dataChannel = null; // 전역 변수로 데이터 채널 관리

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
      // this.socket = io('http://localhost:3333', {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket'],
        query: `userId=${uid ? uid : userId}`,
      });
      // console.log(1111111111111111);
      this.socket.connect();

      SocketManager.instance = this;
    }
    return SocketManager.instance;
  }

  /**
   *
   */
  onConnet = () => {
    // console.log(2222222222222222);
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
        room_id: null,
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
      const { status, data } = await API.createRoom(newData); // data의 authCode값이 인증코드임.
      if (status !== 200) {
        throw { message: '채팅방을 생성할 수 없습니다. 다시 시도해주세요' };
      }

      setRoomList((prev) => [...prev, data]);
      MessageAlert.success(`생성되었습니다 \n 채팅방 인증코드는 ${data.authCode} 입니다.`);
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
    socket.emit('RoomList', userInfo.user_id, rName);
  }, [rName]);

  /**
   * 방 리스트 조회
   * --
   */
  const handleSendMessage = (msg = '') => {
    // 메세지 보냈을때의 처리
    
    if (msg) socket.emit('chat', currentRoom, userInfo.user_id, msg);
  };

  // const handleSendFile = (msg = '') => {
  //   // 메세지 보냈을때의 처리
  //   console.log('handleSendMessage Msg text : '+ msg +', currentRoom : '+currentRoom );
  //   if (msg) socket.emit('chat', currentRoom, userInfo.user_id, msg, category);
  // };

  /**
   * 채팅방 상세조회
   * --
   */
  const handleGetRoom = useCallback(async () => {
    //채팅방 이동하였을떄 
    console.log('[CHANGE ROOM] currentRoom: ', currentRoom);

    try {
      // API Call
      const { status, data } = await API.getRoom(currentRoom); //data
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
      socket.emit('join', room_id);
      socket.emit('login', {
        room_id,
        user_name,
        user_id,
      });

      peerConnection.createOffer()
      .then(offer => {
        console.log('offer 생성 : '+offer)
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        console.log('offer 호출 : '+JSON.stringify(peerConnection.localDescription))
        socket.emit('offer', peerConnection.localDescription,room_id);
      });

      // DataChannel 생성
      peerConnection.ondatachannel = (event) => {
        const dataChannel = event.channel;

        dataChannel.onmessage = (event) => {
          // 받은 파일 데이터 처리 및 저장
          const fileData = event.data;
          // 파일 데이터 처리 및 저장 로직 추가
        };
      };

      // DataChannel 생성
      // const dataChannel = peerConnection.createDataChannel('fileTransfer');
      // dataChannel.onopen = () => {
      //   // DataChannel이 열렸을 때의 처리
      //   console.log('data channel 생성')
      //   const fileData = 'Sample file content'; // 실제 파일 데이터 입력
      //   dataChannel.send(fileData); // 데이터 채널을 통해 파일 데이터 전송
      // };

      // dataChannel.onmessage = (event) => {
      //   // DataChannel 메시지 수신 처리
      //   console.log('event.data : '+JSON.stringify(event.data))
      //   const receivedData = event.data;
      //   console.log('Received file data:', receivedData);
      //   const downloadLink = document.createElement('a');
      //   downloadLink.href = URL.createObjectURL(receivedData);
      //   downloadLink.download = 'received_file.txt'; // 파일명 지정
      //   downloadLink.click();
      // }; 

      // 클라이언트 측에서 offer 수신
      socket.on('offer', (offer) => { 
        // 수신한 offer를 RTCSessionDescription 객체로 변환
        const remoteOffer = new RTCSessionDescription(offer);
        // 피어 연결 설정 및 offer 적용
        peerConnection.setRemoteDescription(remoteOffer)
          .then(() => {
            // answer 생성 및 시그널링 서버로 전송
            return peerConnection.createAnswer();
          })
          .then((localAnswer) => {
            // localAnswer를 시그널링 서버를 통해 전송
            console.log('@@@@@@@ localAnswer를 시그널링 서버를 통해 전송', localAnswer)
            socket.emit('answer', localAnswer,room_id);
          })
          .catch((error) => {
            console.error('Error handling offer:', error);
          });
      });

      // 클라이언트 측에서 answer 수신
      socket.on('answer', (answer) => {
        // 수신한 answer를 RTCSessionDescription 객체로 변환
        const remoteAnswer = new RTCSessionDescription(answer);

        // 피어 연결 설정에 answer 적용
        peerConnection.setRemoteDescription(remoteAnswer)
          .then(() => {
            console.log('@@@@@@@ answer 받음!!!! ');
            createDataChannel()
          })
          .catch((error) => {
            console.error('Error handling answer:', error);
          });
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
    console.log('ManagerContainer 파일의 handelSendFile 들어옴 : ' + JSON.stringify(fileInfo))
    const files = fileInfo;
    const maxSize = 99 * 1024 * 1024;
    const fileSize = files && files.size;
    console.log('currentRoom:L', currentRoom);
    console.log(userInfo, files);
    if (fileSize > maxSize) {
      alert('첨부파일 사이즈는 100MB 이내로 등록 가능합니다.');
      return false;
    } else {
      // // 데이터 채널을 통해 파일 데이터 전송
      // const dataChannel =  createDataChannel('fileTransfer');
      // dataChannel.send(files);
      const detaChannel = createDataChannel()
      // detaChannel.send(files);

      // dataChannel.send(files);

      // 서버로 파일을 전송한다.
      files &&
        socket && socket.emit('sendFile', files, currentRoom, userInfo.user_id) &&
        socket.emit(
          'upload',
          files,
          encodeURIComponent(files.name),
          files.size,
          files.type,
          currentRoom,
          userInfo.user_id,
          (status) => {
            console.log('파일 업로드 이후 상태 코드 값 : '+status);
          }
        );
    }
  };


// 데이터 채널 생성 함수
function createDataChannel() {
  const newDataChannel = peerConnection.createDataChannel('fileChannel');

  newDataChannel.onopen = () => {
    console.log('Data channel opened');
    // 파일 데이터를 보내거나 받을 준비
  };

  newDataChannel.onmessage = (event) => {
    console.log('Received data:', event.data);
    // 받은 파일 데이터 처리
  };

  // dataChannel = newDataChannel; // 전역 변수에 채널 할당
  return newDataChannel
}

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
      console.log(1231231231231231);
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
        console.log('[chat] data: ', data);
        console.log('서버에서 chat 신호를 보내주면 여기로 들어옴')
        const fid = chatList.findIndex((c) => c.chat_id === data.chat_id);
        if (fid < 0) {
          setChatList((prev) => [...prev, data]);
        }
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
      socket.on('uploadFailed', (_) => {
        console.log('[uploadFailed] data: ');

        MessageAlert.error('파일을 업로드 할 수 없습니다. 다시 시도해주세요.');
      });
      socket.on('downloadLink',(downloadLink, data, fileData)=>{
        console.log('다운로드 링크 : '+downloadLink)
        console.log('fileData : '+ JSON.stringify(fileData))
        // URL 객체 생성
        const urlObject = new URL(downloadLink);
        
        window.open(urlObject,'_self');

        const fid = chatList.findIndex((c) => c.chat_id === data.chat_id);
        if (fid < 0) {
          setChatList((prev) => [...prev, data]);
        }

        // 여기서 문제없이 실행되었을 경우 후처리 필요 ?
      })
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
        socket.emit('RoomList', userInfo.user_id, rName);

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
