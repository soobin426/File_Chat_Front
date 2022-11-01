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
    currentRoom,
    currentRoomInfo,
    onJoinRoom,
    onGetRoomList,
    onChangeRoom,
    onSetCommand,
    onCreateRoom,
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
            roomList={roomList}
            currentRoom={currentRoom}
            onChangeRoom={onChangeRoom}
            onCreateRoom={onCreateRoom}
          />
          {/* 채팅창 */}
          <MessageContainer
            currentRoomInfo={currentRoomInfo}
            isOpenSidePanel={isOpenSidePanel}
            onOpenSidePanel={() => setIsOpenSidePanel(!isOpenSidePanel)}
            onSetCommand={onSetCommand}
          />
          {/* 사이드패널 */}
          {isOpenSidePanel && <SidePanel currentRoomInfo={currentRoomInfo} />}
        </MainContainer>
      </div>
    </>
  );
}
