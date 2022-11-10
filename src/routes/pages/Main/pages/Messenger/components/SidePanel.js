/**
 *
 *
 */

import React, { useState } from 'react';
import { Sidebar, ExpansionPanel } from '@chatscope/chat-ui-kit-react';
import { Tabs, Card, Avatar, Select, Button, Empty, Form, Input } from 'antd';
import { Row, Col, ModalLayout, Title } from 'components';
import { UserOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { MessageAlert } from 'utils';
import JPEG_ICON from 'assets/images/JPEG.png';
import PNG_ICON from 'assets/images/PNG.png';
import PDF_ICON from 'assets/images/PDF.png';

const { Option } = Select;

/**
 * [Component] 사이드 패널
 * --
 */
const SidePanel = ({ currentRoomInfo, userList, onUpdateFTP }) => {
  const [form] = Form.useForm();
  /* ===== STATE ===== */
  const [inviteList, setInviteList] = useState([]);
  const [members] = useState([1, 2, 3, 4, 5, 6]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [modifyModal, setModifyModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('t1');
  const [defaultMemebers, setDefaultMembers] = useState([]);
  const [ftpInfo, setFtpInfo] = useState({
    room_ftptype: 'sftp',
    room_ftpip: '',
    room_ftppath: '',
    room_ftpid: '',
    room_ftppw: '',
    room_ftpport: 21,
  });

  /* ===== Functions ===== */
  /**
   *
   */
  const handleChange = (value) => {
    setInviteList(value);
  };

  /**
   * FTP정보 변경 함수
   * --
   */
  const handleChangeFtp = ({ target }) => {
    const { name, value } = target;
    setFtpInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * 저장 함수
   * --
   */
  const handleSave = async () => {
    try {
      const newData = {
        room_ftptype: ftpInfo.room_ftptype,
        room_ftpip: ftpInfo.room_ftpip,
        room_ftppath: ftpInfo.room_ftppath,
        room_ftpid: ftpInfo.room_ftpid,
        room_ftppw: ftpInfo.room_ftppw,
        room_ftpport: ftpInfo.room_ftppw,
      };
      const result = await onUpdateFTP(newData);
      if (result) {
        setModifyModal(false);
      }
    } catch (err) {
      console.log('[SidePanel][handleSave] Error: ', err);
      MessageAlert.error(err.message);
    }
  };

  /* ===== Variables ===== */
  const { files } = currentRoomInfo ? currentRoomInfo : [];

  /* ===== Hooks ===== */
  useEffect(() => {
    currentRoomInfo &&
      setFtpInfo({
        room_ftpip: currentRoomInfo.room_ftpip,
        room_ftppath: currentRoomInfo.room_ftppath,
        room_ftpid: currentRoomInfo.room_ftpid,
        room_ftppw: currentRoomInfo.room_ftppw,
      });
  }, [currentRoomInfo]);

  /* ===== Render ===== */
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
              <p>저장경로: {currentRoomInfo && currentRoomInfo.room_ftppath}</p>
              <p>계정: {currentRoomInfo && currentRoomInfo.room_ftpid}</p>
              <p>패스워드: {currentRoomInfo && currentRoomInfo.room_ftppw}</p>
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
                {currentRoomInfo &&
                  currentRoomInfo.invites.map((item) => (
                    <Col
                      x={12}
                      style={{ padding: 3 }}
                      key={`invitememberkey${item.invite_id}`}
                    >
                      {item.user && (
                        <Card hoverable bodyStyle={{ padding: '12px 10px' }}>
                          <Avatar>{item.user.user_name[0]}</Avatar>{' '}
                          {item.user.user_name}
                        </Card>
                      )}
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
              {files &&
                files.map((file) => (
                  <Col x={12} style={{ padding: 5 }} key={file.file_id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt="example"
                          src={
                            file.file_exp.split('/')[1] === 'pdf'
                              ? PDF_ICON
                              : file.file_exp.split('/')[1] === 'jpeg'
                              ? JPEG_ICON
                              : file.file_exp.split('/')[1] === 'png'
                              ? PNG_ICON
                              : null
                          }
                          width={'90%'}
                          height={82}
                        />
                      }
                      bodyStyle={{ padding: '15px 10px' }}
                    >
                      <Card.Meta
                        title={
                          <span style={{ fontSize: '0.85em' }}>
                            {file.file_name}
                          </span>
                        }
                        description={
                          <>
                            {(file.file_size / 1024 / 1024).toFixed(2)}MB
                            <br />
                            {file.file_exp}
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
              onClick={handleSave}
            >
              수정 완료2
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="FTP서버">
            <Select
              defaultValue="sftp"
              value={ftpInfo.room_ftptype}
              options={[
                { value: 'sftp', label: 'SFTP' },
                { value: 'ftp', label: 'FTP' },
              ]}
              onChange={(value) =>
                handleChangeFtp({ target: { name: 'room_ftptype', value } })
              }
              style={{
                width: '29%',
              }}
            />
            <Input
              placeholder="아이피를 입력해주세요"
              name="room_ftpip"
              value={ftpInfo.room_ftpip}
              onChange={handleChangeFtp}
              style={{
                width: '70%',
                marginLeft: '1%',
              }}
            />
          </Form.Item>
          <Form.Item label="저장경로">
            <Input
              placeholder="저장경로를 입력해주세요"
              name="room_ftppath"
              value={ftpInfo.room_ftppath}
              onChange={handleChangeFtp}
            />
          </Form.Item>
          <Form.Item label="계정">
            <Input
              placeholder="아이디를 입력해주세요"
              name="room_ftpid"
              value={ftpInfo.room_ftpid}
              onChange={handleChangeFtp}
            />
          </Form.Item>
          <Form.Item label="PW">
            <Input
              placeholder="패스워드를 입력해주세요"
              name="room_ftppw"
              value={ftpInfo.room_ftppw}
              onChange={handleChangeFtp}
            />
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
          새 멤버
        </Title>
        <Select
          mode="multiple"
          allowClear
          style={{
            width: '100%',
          }}
          placeholder="Please select"
          defaultValue={[]}
          onChange={handleChange}
        >
          {userList.map((item) => (
            <Option key={`${item.user_id}`}>{item.user_name}</Option>
          ))}
        </Select>
        {/* <Select
          mode="tags"
          placeholder="이메일을 입력해주세요"
          defaultValue={[]}
          value={inviteList}
          onChange={handleChange}
          style={{
            width: '100%',
            marginBottom: 15,
          }}
        /> */}

        {/* <Title size={5} color="#333">
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
        )} */}
      </ModalLayout>
    </>
  );
};

/* DF */
SidePanel.defaultProps = {
  currentRoomInfo: null,
  userList: [],
};
export default SidePanel;
