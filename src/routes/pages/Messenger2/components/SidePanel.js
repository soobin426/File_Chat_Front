/**
 *
 *
 */

import React, { useState } from 'react';
import { Sidebar, ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import { Tabs, Card, Avatar, Select, Button, Empty, Form, Input } from 'antd';
import { Row, Col, ModalLayout, Title } from 'components';
import { UserOutlined } from '@ant-design/icons';

/**
 * [Component] 사이드 패널
 * --
 */
const SidePanel = ({ currentRoomInfo }) => {
  const [form] = Form.useForm();
  /* ===== STATE ===== */
  const [inviteList, setInviteList] = useState([]);
  const [members] = useState([1, 2, 3, 4, 5, 6]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [modifyModal, setModifyModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('t1');
  const [files] = useState([
    {
      key: 'file_001',
      name: '디자인시안_01',
      size: 100000,
      extension: 'png',
    },
    {
      key: 'file_002',
      name: '디자인시안_02',
      size: 100000,
      extension: 'png',
    },
    {
      key: 'file_003',
      name: '디자인시안_03',
      size: 100000,
      extension: 'png',
    },
    {
      key: 'file_004',
      name: '디자인시안_04',
      size: 100000,
      extension: 'png',
    },
    {
      key: 'file_005',
      name: '디자인시안_05',
      size: 100000,
      extension: 'png',
    },
  ]);

  /* ===== FUNCTIONS ===== */
  const handleChange = (value) => {
    setInviteList(value);
  };

  /* ===== RENDER ===== */
  return (
    <>
      <Sidebar position="right" style={{ paddingTop: 46 }}>
        <Tabs
          defaultActiveKey={'t1'}
          onChange={setCurrentTab}
          style={{
            height: 46,
            top: 0,
            width: '100%',
            position: 'absolute',
          }}
          centered
        >
          {/* 기본정보 */}
          <Tabs.TabPane tab="기본정보" key="t1" />

          {/* 파일목록 */}
          <Tabs.TabPane tab="파일목록" key="t2" />
        </Tabs>

        {/* ===== 탭 컨텐츠 ===== */}
        {currentTab === 't1' ? (
          // === 기본정보 === //
          <>
            <ExpansionPanel open title="FTP 연결정보">
              {/* <p>저장폴더: /Users/gimseonghun/Projects </p> */}
              <p>FTP서버: {currentRoomInfo && currentRoomInfo.room_ftpip}</p>
              <p>ID: {currentRoomInfo && currentRoomInfo.room_ftpid}</p>
              <p>PW: {currentRoomInfo && currentRoomInfo.room_ftppw}</p>
              <p>
                <Button block size="small" onClick={() => setModifyModal(true)}>
                  편집하기
                </Button>
              </p>
            </ExpansionPanel>
            <ExpansionPanel open title={`멤버(${members.length})`}>
              <Row>
                <Col x={12} style={{ padding: 3 }}>
                  <Card
                    hoverable
                    style={{
                      height: 56,
                      padding: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#2e63e8',
                      border: '1px dotted #2e63e8',
                      background: '#f2f6ff',
                    }}
                    onClick={() => setAddMemberModal(true)}
                  >
                    + Invite
                  </Card>
                </Col>
                {members.map((item) => (
                  <Col x={12} style={{ padding: 3 }} key={item}>
                    <Card hoverable bodyStyle={{ padding: '12px 10px' }}>
                      <Avatar>김</Avatar> 김채팅
                    </Card>
                  </Col>
                ))}
              </Row>
            </ExpansionPanel>
            <ExpansionPanel title="설정">
              <p>나가기 이용약관</p>
              <p>
                <Button block size="small" danger>
                  채팅방 나가기
                </Button>
              </p>
            </ExpansionPanel>
          </>
        ) : (
          // === 파일목록 === //
          <>
            <Row>
              {files.map((file) => (
                <Col x={12} style={{ padding: 5 }} key={file.key}>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt="example"
                        src="https://wallpaperaccess.com/full/147476.jpg"
                        width={'100%'}
                        height={82}
                      />
                    }
                    bodyStyle={{ padding: '15px 10px' }}
                  >
                    <Card.Meta
                      title={
                        <span style={{ fontSize: '0.85em' }}>{file.name}</span>
                      }
                      description={
                        <>
                          {(file.size / 1024 / 1024).toFixed(2)}MB
                          <br />
                          {file.extension}
                        </>
                      }
                      style={{ lineHeight: 1.05, fontSize: '0.85em' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Sidebar>

      {/* ===== 모달 레이아웃 ===== */}
      {/* = 멤버추가 = */}
      <ModalLayout
        type={'drawer'}
        title={'FTP 연결정보 수정'}
        width={320}
        visible={modifyModal}
        onOk={() => setModifyModal(false)}
        onCancel={() => setModifyModal(false)}
        style={{ padding: 15 }}
        footer={
          <div
            style={{
              textAlign: 'right',
              width: '100%',
            }}
          >
            <Button
              size={'large'}
              onClick={() => setModifyModal(false)}
              style={{ marginRight: '1%', width: '30%' }}
            >
              취소
            </Button>
            <Button
              size={'large'}
              type="primary"
              style={{ width: '69%' }}
              onClick={() => setModifyModal(false)}
            >
              수정 완료
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="저장폴더">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item label="FTP서버">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item label="ID">
            <Input placeholder="input placeholder" />
          </Form.Item>
          <Form.Item label="PW">
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </ModalLayout>

      {/* = 멤버추가 = */}
      <ModalLayout
        type={'drawer'}
        title={'멤버 초대'}
        width={320}
        visible={addMemberModal}
        onOk={() => setAddMemberModal(false)}
        onCancel={() => setAddMemberModal(false)}
        style={{ padding: 15 }}
        footer={
          <div
            style={{
              textAlign: 'right',
              width: '100%',
            }}
          >
            <Button
              size={'large'}
              onClick={() => setAddMemberModal(false)}
              style={{ marginRight: '1%', width: '30%' }}
            >
              취소
            </Button>
            <Button
              size={'large'}
              type="primary"
              style={{ width: '69%' }}
              onClick={() => setAddMemberModal(false)}
              disabled={inviteList.length < 1}
            >
              ({inviteList.length})명 완료
            </Button>
          </div>
        }
      >
        <Title size={5} color="#333">
          이메일
        </Title>
        <Select
          mode="tags"
          placeholder="이메일을 입력해주세요"
          defaultValue={[]}
          value={inviteList}
          onChange={handleChange}
          style={{
            width: '100%',
            marginBottom: 15,
          }}
        />

        <Title size={5} color="#333">
          선택({inviteList.length})
        </Title>
        {!inviteList || inviteList.length < 1 ? (
          <Empty />
        ) : (
          inviteList.map((item, index) => (
            <Card
              key={`selected_member_${index}`}
              hoverable
              style={{
                marginTop: 5,
              }}
              bodyStyle={{
                padding: '12px 10px',
                // width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ textAlign: 'left', flex: 1 }}>
                <UserOutlined />
                &nbsp;
                {item}
              </div>
              <div>
                <Button
                  size="small"
                  type="link"
                  danger
                  onClick={() =>
                    setInviteList(inviteList.filter((i) => i !== item))
                  }
                >
                  삭제
                </Button>
              </div>
            </Card>
          ))
        )}
      </ModalLayout>
    </>
  );
};

/* DF */
SidePanel.defaultProps = {
  currentRoomInfo: null,
};
export default SidePanel;
