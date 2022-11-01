import React from 'react';
import { MainLayout } from 'layout';
import { Route, Switch } from 'react-router-dom';
import {
  Dashboard,
  Explorer,
  Join,
  Messenger,
  Setting,
  GroupList,
  GroupCreate,
  GroupDetail,
  ConferenceCreate,
  ConferenceDetail,
  Conclusion,
  ConferenceModify,
} from './pages';

/**
 * [Component] Main
 * --
 */
const Main = () => {
  /* ===== Render ===== */
  return (
    <Switch>
      {/* <Route path="/" exact component={Messenger}></Route> */}
      <MainLayout>
        {/* 메신저 */}
        <Route path="/messenger" exact component={Messenger}></Route>

        {/* 대시보드 */}
        <Route path="/dashboard" exact component={Dashboard}></Route>
        {/* 그룹 */}
        <Route path="/groups" exact component={GroupList}></Route>
        <Route path="/groups/:group_id" exact component={GroupDetail}></Route>
        <Route path="/create/group" exact component={GroupCreate}></Route>
        {/* 컨퍼런스 */}
        <Route
          path="/conference/:conference_id"
          exact
          component={ConferenceDetail}
        ></Route>
        <Route
          path="/create/conference"
          exact
          component={ConferenceCreate}
        ></Route>
        <Route
          path="/modify/conference"
          exact
          component={ConferenceModify}
        ></Route>
        {/* 컨퍼런스 종료 */}
        <Route path="/conclusion" exact component={Conclusion}></Route>
        {/* 탐색 */}
        <Route path="/explorer" exact component={Explorer}></Route>
        {/* 가입 */}
        <Route path="/join" component={Join}></Route>
        {/*  */}
        <Route path="/set" component={Setting}></Route>
      </MainLayout>
    </Switch>
  );
};

export default Main;
