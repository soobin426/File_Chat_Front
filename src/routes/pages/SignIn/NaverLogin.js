import { React } from 'react';

export const Naver = () => {
  const NAVER_CLIENT_ID = 'uObapsg2_g5gXuv9ZRKm'
  const REDIRECT_URL = encodeURI('http://localhost:3333/api/v1/callback')
  const STATE = 'flase'
  const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${REDIRECT_URL}`;

  return (
    <div>
      {/* <button onClick={NaverLogin}>네이버 로그인</button> */}
      <a href={NAVER_AUTH_URL}><img  width='100%' src='http://static.nid.naver.com/oauth/small_g_in.PNG'/></a>
    </div>
  );
};

export default Naver;