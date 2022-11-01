// import ApiConstant from './ApiConstant';
import ApiManager from 'utils/ApiManager';
import { parameterToPath } from 'utils';
const $http = new ApiManager();

const API = {
  /**
   * 채팅방 생성
   * --
   */
  createRoom: (body) => $http.post(`/rooms`, body),

  /**
   * 채팅방 상세조회
   * --
   */
  getRoom: (roomId) => $http.get(parameterToPath(`/rooms/:roomId`, { roomId })),

  /**
   * 채팅방 상세조회
   * --
   */
  getUsers: () => $http.get('/users'),

  /**
   * 채팅방 상세조회
   * --
   */
  getInvites: (userId) => $http.get('/invite', { userId }),

  /**
   * 회원가입
   * --
   */
  inviteAccess: (inviteId, body) =>
    $http.put(parameterToPath(`/invite/:inviteId/update`, { inviteId }), body),

  /**
   * 회원가입
   * --
   */
  join: (body) => $http.post(`/users`, body),

  /**
   * 로그인
   * --
   */
  login: (body) => $http.post(`/users/login`, body),
};
export default API;
