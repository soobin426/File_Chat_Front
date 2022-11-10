/**
 *
 *
 *
 */

import './Messenger.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import React, { useState } from 'react';
import { MainContainer } from '@chatscope/chat-ui-kit-react';
import ChatSidebar from './components/ChatSidebar';
import MessageContainer from './components/MessageContainer';
import SidePanel from './components/SidePanel';

/**
 * [Component] Messenger Presenter
 * --
 */
export default function MessengerPresenter(props) {
  /* ====== PROPS ====== */
  const {
    roomList,
    userList,
    currentRoom,
    currentRoomInfo,
    userInfo,
    chatList,
    userId,
    onJoinRoom,
    onGetRoomList,
    onChangeRoom,
    onSetCommand,
    onCreateRoom,
    onSendMessage,
    onSendFile,
    onUpdateFTP,
    onChangeDate,
  } = props;

  /* ====== STATE ====== */
  const [isOpenSidePanel, setIsOpenSidePanel] = useState(false);
  /* ====== VARIABLES ====== */

  /* ====== HOOKS ====== */

  /* ====== RENDER ====== */
  return (
    <>
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 70px)',
          position: 'absolute',
        }}
      >
        <MainContainer responsive>
          {/* 채팅목록 */}
          <ChatSidebar
            userInfo={userInfo}
            roomList={roomList}
            userList={userList}
            currentRoom={currentRoom}
            onChangeRoom={onChangeRoom}
            onCreateRoom={onCreateRoom}
          />
          {/* 채팅창 */}
          <MessageContainer
            chatList={chatList}
            userList={userList}
            userId={userId}
            currentRoomInfo={currentRoomInfo}
            isOpenSidePanel={isOpenSidePanel}
            onOpenSidePanel={() => setIsOpenSidePanel(!isOpenSidePanel)}
            onSetCommand={onSetCommand}
            onSendMessage={onSendMessage}
            onSendFile={onSendFile}
            onChangeDate={onChangeDate}
          />
          {/* 사이드패널 */}
          {isOpenSidePanel && (
            <SidePanel
              currentRoomInfo={currentRoomInfo}
              userList={userList}
              onUpdateFTP={onUpdateFTP}
            />
          )}
        </MainContainer>
      </div>
    </>
  );
}
