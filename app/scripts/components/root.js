window._trackJs = {
  token: 'bd495185bd7643e3bc43fa62a30cec92',
  enabled: false,
  onError: function (payload) { return true; },
  version: "",
  callback: {
    enabled: true,
    bindStack: true
  },
  console: {
    enabled: true,
    display: true,
    error: true,
    warn: false,
    watch: ['info', 'warn', 'error']
  },
  network: {
    enabled: true,
    error: true
  },
  visitor: {
    enabled: true
  },
  window: {
    enabled: true,
    promise: true
  }
};
var trackJs = require('trackjs');
import React from 'react';
import ReactDOM from 'react-dom';
import Reflux from 'reflux';
import _ from 'lodash';
import v from 'vquery';
import kmp from 'kmp';
import ReactUtils from 'react-utils';
import ReactTooltip from './tooltip/tooltip';
import '../../styles/app.scss';
import '../../styles/icons/icomoon/styles.css';
window.v = v;
import state from './stores/state';
import {keyboardStore, chromeAppStore, actionStore, historyStore, bookmarksStore, clickStore, utilityStore, faviconStore} from './stores/main';
import themeStore from './stores/theme';
import tabStore from './stores/tab';
import sessionsStore from './stores/sessions';
import screenshotStore from './stores/screenshot';
import utils from './utils';
import {Btn, Col, Row, Container} from './bootstrap';
import TileGrid from './tile';
import ModalHandler from './modal';
import ContextMenu from './context';
import Preferences from './preferences';
import Alert from './alert';
if (module.hot) {
  module.hot.accept();
}

var Loading = React.createClass({
  getInitialState(){
    return {
      failSafe: false,
      error: ''
    };
  },
  componentDidMount(){
    window.onerror = (err)=>{
      console.log(err);
      _.delay(()=>{
        this.setState({
          failSafe: true,
          error: `${err}
            ${chrome.runtime.lastError ? 'chrome.runtime: '+chrome.runtime.lastError : ''}
            ${chrome.extension.lastError ? 'chrome.extension: '+chrome.extension.lastError : ''}`
        });
      },1000);
    };
  },
  handleReset(){
    var c = confirm('Resetting will delete all data. Please backup your sessions and themes before you begin.');
    if (c) {
      chrome.storage.local.clear();
      chrome.runtime.reload();
    }
  },
  render: function() {
    var s = this.state;
    var p = this.props;
    var topStyle = {width: '20px', height: '20px', margin: '0px', float: 'right', marginRight: '4px', marginTop: '7px'};
    var fullStyle = {marginTop: `${window.innerHeight / 2.4}px`};
    var errorLink = {color: 'rgba(34, 82, 144, 0.9)'};
    return (
      <div>
        <div style={p.top ? topStyle : fullStyle} className="sk-cube-grid">
          <div className="sk-cube sk-cube1"></div>
          <div className="sk-cube sk-cube2"></div>
          <div className="sk-cube sk-cube3"></div>
          <div className="sk-cube sk-cube4"></div>
          <div className="sk-cube sk-cube5"></div>
          <div className="sk-cube sk-cube6"></div>
          <div className="sk-cube sk-cube7"></div>
          <div className="sk-cube sk-cube8"></div>
          <div className="sk-cube sk-cube9"></div>
        </div>
        {s.failSafe && !p.top ?
          <div className="container">
            <div className="row">Tab Master encountered an error and was unable to initialize. Sorry for the inconvenience. Please report this to the Support tab in the <a style={errorLink} href="https://chrome.google.com/webstore/detail/tab-master-5000-tab-swiss/mippmhcfjhliihkkdobllhpdnmmciaim/support">Chrome Web Store</a>, or as an issue on <a style={errorLink} href="https://github.com/jaszhix/tab-master-5000-chrome-extension/issues">Github</a>, so this issue can be investigated. Thank you! </div>
            
            <div className="row" style={{margin: '0px auto', position: 'fixed', right: '0px', bottom: '0px'}}>
              <button className="ntg-btn" onClick={()=>sessionsStore.exportSessions()}>Backup Sessions</button>
              <button className="ntg-btn" onClick={()=>themeStore.export()}>Backup Themes</button>
              <button className="ntg-btn" onClick={this.handleReset}>Reset Data</button>
            </div>
          </div>
          : null}
      </div>
    );
  }
});

var Search = React.createClass({
  getInitialState(){
    return {
      theme: this.props.theme
    };
  },
  componentWillReceiveProps(nP){
    if (nP.theme !== this.props.theme) {
      this.setState({theme: nP.theme});
    }
    if (nP.s.width !== this.props.s.width) {
      ReactTooltip.rebuild();
    }
  },
  preventSubmit(e) {
    e.preventDefault();
  },
  handleSearch(e) {
    state.set({search: e.target.value});
  },
  handleWebSearch(e) {
    e.preventDefault();
    chrome.tabs.query({
      title: 'New Tab'
    }, (tabs) => {
      chrome.tabs.update(tabs[0].id, {
        url: 'https://www.google.com/?gws_rd=ssl#q=' + this.props.s.search
      });
    });
  },
  openAbout(){
    state.set({settings: 'about', modal: {state: true, type: 'settings'}});
  },
  handleSidebar(){
    this.props.onMenuClick();
  },
  handleEnter(e){
    if (e.keyCode === 13) {
      this.handleWebSearch(e);
    }
  },
  render: function() {
    var p = this.props;
    const headerStyle = p.s.prefs && p.s.prefs.screenshot && p.s.prefs.screenshotBg ? {backgroundColor: this.state.theme.headerBg, position: 'fixed', top: '0px', width: '100%', zIndex: '2', boxShadow: `${p.theme.tileShadow} 1px 1px 3px -1px`} : {backgroundColor: this.state.theme.headerBg, position: 'fixed', top: '0px', width: '100%', zIndex: '2', boxShadow: `${p.theme.tileShadow} 1px 1px 3px -1px`};

    return (
      <Container fluid={true} style={headerStyle} className="ntg-form">
        <Row>
          <Col size={p.s.width <= 825 ? p.s.width <= 630 ? p.s.width <= 514 ? '10' : '8' : '6' : '4'}>
            <div style={{display: 'flex', width: '100%', paddingLeft: '0px', paddingRight: '0px'}}>
              <Btn onClick={this.handleSidebar} onMouseEnter={p.onMenuHoverIn} onMouseLeave={p.onMenuHoverOut} style={{marginRight: '0px', padding: '9px 13px'}} className="ntg-top-btn" fa="reorder" />
              <input 
                type="text"
                value={p.s.search}
                className="form-control search-tabs" 
                placeholder={`Search ${p.s.prefs.mode}...`}
                onChange={this.handleSearch} 
                onKeyDown={(e)=>this.handleEnter(e)}/>
            </div>
          </Col>
          <Col size={p.s.width <= 825 ? p.s.width <= 630 ? p.s.width <= 514 ? '2' : '4' : '6' : '8'} style={{float: 'right'}}>
            {p.s.search.length > 3 ? <span style={{color: p.theme.textFieldsPlaceholder}} className="search-msg ntg-search-google-text">Press Enter to Search Google</span> : null}
            {p.s.context.id === 'newVersion' ? <Btn onClick={()=>chrome.runtime.reload()} style={{fontSize: p.s.width <= 841 ? '20px' : '14px', marginRight: 'initial'}} className="ntg-sort-btn pull-right" fa="rocket" data-place="bottom" data-tip={p.s.width <= 841 ? 'New Version Available' : null}>{p.s.width <= 841 ? '' : 'New Version Available'}</Btn> : null}
            {p.s.context.id === 'versionUpdate' ? <Btn onClick={this.openAbout} style={{fontSize: p.s.width <= 841 ? '20px' : '14px', marginLeft: '8px',  marginRight: 'initial'}} className="ntg-sort-btn pull-right" fa="info-circle" data-place="bottom" data-tip={p.s.width <= 841 ? `Updated to ${utilityStore.get_manifest().version}` : null}>{p.s.width <= 841 ? '' : `Updated to ${utilityStore.get_manifest().version}`}</Btn> : null}
            {p.s.context.id === 'installed' ? <Btn onClick={this.openAbout} style={{fontSize: p.s.width <= 841 ? '20px' : '14px'}} className="ntg-sort-btn pull-right" fa="thumbs-o-up" data-place="bottom" data-tip={p.s.width <= 841 ? 'Thank you for installing TM5K' : null}>{p.s.width <= 841 ? '' : 'Thank you for installing TM5K'}</Btn> : null}
            {p.topLoad ? <Loading top={true} /> : null}
            {p.s.context.id === 'dlFavicons' && p.topLoad ? <div><p className="tm5k-info pull-right" style={{color: p.theme.darkBtnText, textShadow: `2px 2px ${p.theme.darkBtnTextShadow}`, position: 'relative', top: '2px', marginRight: '8px'}}> {p.s.width <= 841 ? '' : 'Downloading and caching favicons...'}</p></div> : null}
          </Col>  
        </Row>
      </Container>
    );
  }
});
var synchronizeSession = _.throttle(sessionsStore.syncSession, 1, {leading: true});
var Root = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getInitialState() {
    return {
      init: true,
      tabs: [],
      allTabsByWindow: [],
      render: false,
      grid: true,
      search: '',
      window: true,
      settings: 'sessions',
      collapse: true,
      width: window.innerWidth,
      height: window.innerHeight,
      context: false,
      modal: null,
      event: '',
      chromeVersion: utilityStore.chromeVersion(),
      prefs: [],
      load: true,
      topLoad: false,
      tileLimit: 100,
      oldTileLimit: 100,
      sessions: [],
      favicons: [],
      screenshots: [],
      relay: [],
      applyTabOrder: false,
      folder: '',
      folderState: false,
      chromeApps: [],
      duplicateTabs: [],
      sort: 'index',
      theme: null,
      savedThemes: [],
      standardThemes: [],
      wallpaper: null,
      wallpapers: [],
      sidebar: false,
      disableSidebarClickOutside: false,
    };
  },
  componentWillMount(){
    v('#main').css({cursor: 'wait'});
  },
  componentDidMount() {
    // Initialize Reflux listeners.
    actionStore.clear();
    this.listenTo(themeStore, this.themeChange);
    this.listenTo(bookmarksStore, this.updateTabState);
    this.listenTo(historyStore, this.updateTabState);
    this.listenTo(chromeAppStore, this.updateTabState);
    this.listenTo(actionStore, this.actionsChange);
    this.listenTo(sessionsStore, this.sessionsChange);
    this.listenTo(screenshotStore, this.screenshotsChange);
    window._trackJs.version = utilityStore.get_manifest().version;
    
  },
  componentWillReceiveProps(nP){
    var p = this.props;
    if (!_.isEqual(nP.s.prefs, p.s.prefs) || this.state.init) {
      this.prefsChange(nP.s.prefs);
    }
    if (!_.isEqual(nP.s.update, p.s.update)) {
      this.updateSingleItem(nP.s.update);
    }
    if (!_.isEqual(nP.s.remove, p.s.remove)) {
      this.removeSingleItem(nP.s.remove);
    }
    if (!_.isEqual(nP.s.create, p.s.create)) {
      this.createSingleItem(nP.s.create);
    }
    if (!_.isEqual(nP.s.move, p.s.move)) {
      this.moveSingleItem(nP.s.move);
    }
    if (!_.isEqual(nP.s.search, p.s.search)) {
      this.searchChange(nP.s.search);
    }
    if (!_.isEqual(nP.s.modal, p.s.modal)) {
      this.modalChange(nP.s.modal);
    }
    if (nP.s.folder !== p.s.folder) {
      this.updateTabState(nP.s.folder, 'folder');
    }
    if (nP.s.favicons !== p.s.favicons) {
      this.faviconsChange(nP.s.favicons);
    }
    if (!_.isEqual(nP.s.reQuery, p.s.reQuery) && nP.s.reQuery.state) {
      this.reQuery(nP.s.reQuery);
      state.set({reQuery: {state: false}});
    }
    if (nP.s.applyTabOrder !== p.s.applyTabOrder) {
      if (nP.s.applyTabOrder) {
        _.defer(()=>state.set({applyTabOrder: false}));
      } else {
        this.reQuery(true, 'cycle');
      }
    }
  },
  componentDidUpdate(pP, pS){
    if (!_.isEqual(pS.theme, this.state.theme)) {
      this.themeChange({theme: this.state.theme});
    }
  },
  stateChange(e){
    this.setState({s: e});
  },
  sessionsChange(e){
    this.setState({sessions: e});
  },
  prefsChange(e){
    var s = this.state;

    this.setState({
      allTabsByWindow: tabStore.getAllTabsByWindow()
    });
    if (s.init) {
      themeStore.load(e);
      // Init methods called here after prefs are loaded from Chrome storage.
      if (e.mode !== 'tabs') {
        _.defer(()=>utilityStore.handleMode(e.mode));
      }
      this.captureTabs('init');
    }
    if (e.keyboardShortcuts) {
      keyboardStore.set(e);
    } else {
      keyboardStore.reset();
    }
  },
  faviconsChange(e){
    this.setState({event: 'dlFavicons', topLoad: true});
    _.defer(()=>this.setState({event: '', topLoad: false}));
  },
  actionsChange(e){
    this.setState({actions: e});
  },
  screenshotsChange(){
    this.setState({screenshots: screenshotStore.get_ssIndex()});
  },
  chromeAppChange(e){
    this.setState({apps: e});
  },
  themeChange(e){
    var s = this.state;
    var p = this.props;
    s.standardThemes = themeStore.getStandardThemes();
    if (e.savedThemes) {
      s.savedThemes = e.savedThemes;
    }
    if (e.theme) {
      var rgb = e.theme.settingsBg;
      var colors = rgb.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d*)?)|(\.\d+)\)$/);
      
      console.log('color', colors, e.theme.textFieldsText);
      var r = colors[1];
      var g = colors[2];
      var b = colors[3];
      var brightness = colors[4];

      var ir = Math.floor((255-r)*brightness);
      var ig = Math.floor((255-g)*brightness);
      var ib = Math.floor((255-b)*brightness);

      var sessionFieldColor = 'rgb('+ir+','+ig+','+ib+')';
      console.log('color', sessionFieldColor);
      v('style').n.innerHTML += `
      a, a:focus, a:hover {
        color: ${themeStore.opacify(e.theme.bodyText, 0.9)};
      }
      .form-control::-webkit-input-placeholder {
        color: ${e.theme.textFieldsPlaceholder};
      }
      .form-control {
        color: ${e.theme.textFieldsText};
        border-bottom-color: ${e.theme.textFieldsBorder};
        box-shadow: 0 1px 0 ${e.theme.textFieldsBorder};
      }
      .form-control:focus {
        border-bottom-color: ${e.theme.textFieldsBg};
        box-shadow: 0 1px 0 ${e.theme.textFieldsBg};
      }
      .session-field {
        color: ${sessionFieldColor};
      }
      .nav-tabs>li {
        background-color: ${e.theme.lightBtnBg};
      }
      .nav-tabs>li>a {
         color: ${e.theme.lightBtnText};
      }
      .nav-tabs>li.active {
        background-color: ${e.theme.settingsBg};
      }
      .nav-tabs>li.active>a, .nav-tabs>li.active>a:focus {
        color: ${e.theme.darkBtnText};
        background-color: ${e.theme.darkBtnBg};
        border: 1px solid ${e.theme.tileShadow};
      }
      .nav-tabs>li.active>a:hover {
        color: ${e.theme.darkBtnText};
        background-color: ${e.theme.darkBtnBgHover};
        border: 1px solid ${e.theme.textFieldsBorder};
      }
      .nav-tabs>li:hover {
        background-color: ${e.theme.lightBtnBgHover};
      }
      .ntg-tile-disabled, .ntg-tile-hover, .ntg-tile-moving { 
        color: ${e.theme.tileText};
        background-color: ${e.theme.tileBg};
        box-shadow: ${e.theme.tileShadow} 1px 1px 3px -1px;
      }
      .ntg-x {
        color: ${e.theme.tileX};
      }
      .ntg-x-hover {
        color: ${e.theme.tileXHover};
      }
      .ntg-pinned {
        color: ${e.theme.tilePin};
      }
      .ntg-pinned-hover {
        color: ${e.theme.tilePinHover};
      }
      .ntg-mute {
        color: ${e.theme.tileMute};
      }
      .ntg-mute-hover {
        color: ${e.theme.tileMuteHover};
      }
      .ntg-mute-audible {
        color: ${e.theme.tileMuteAudible};
      }
      .ntg-mute-audible-hover {
        color: ${e.theme.tileMuteAudibleHover};
      }
      .ntg-move {
        color: ${e.theme.tileMove};
      }
      .ntg-move-hover {
        color: ${e.theme.tileMoveHover};
      }
      .ntg-session-text {
        color: ${e.theme.bodyText};
      }
      .ntg-folder {
        text-shadow: 2px 2px ${e.theme.tileTextShadow};
      }
      .sk-cube-grid .sk-cube {
        background-color: ${e.theme.darkBtnBg};
      }
      body > div.ReactModalPortal > div > div {
        -webkit-transition: ${p.s.prefs.animations ? 'background 0.5s ease-in, height 0.2s, width 0.2s, top 0.2s, left 0.2s, right 0.2s, bottom 0.2s' : 'initial'};
        border: ${e.theme.tileShadow};
      }
      body > div.ReactModalPortal > div > div > div > div.row.ntg-tabs > div:nth-child(2) {
        -webkit-transition: ${p.s.prefs.animations ? 'background 0.5s ease-in, top 0.2s, left 0.2s' : 'initial'};
      }
      .rc-color-picker-panel {
        background-color: ${e.theme.settingsBg};
      }
      .rc-color-picker-panel-inner {
        background-color: ${e.theme.settingsBg};
        border: 1px solid ${e.theme.tileShadow};
        box-shadow: ${e.theme.tileShadow} 1px 1px 3px -1px;
      }
      .rc-color-picker-panel-params input {
        color: ${e.theme.textFieldsText};
        background-color: ${e.theme.textFieldsBg};
        border: 0.5px solid ${e.theme.textFieldsBorder};
      };
      .rc-slider {
        background-color: ${themeStore.opacify(e.theme.darkBtnBg, 0.5)};
      }
      .rc-slider-step {
        background: ${themeStore.opacify(e.theme.settingsBg, 0.35)};
      }
      .rc-slider-track {
        background-color: ${themeStore.opacify(e.theme.lightBtnBg, 0.85)};
      }
      .rc-slider-handle {
        background-color: ${themeStore.opacify(e.theme.darkBtnBg, 0.9)};
        border: solid 2px ${themeStore.opacify(e.theme.lightBtnBg, 0.85)};
      }
      .rc-slider-handle:hover {
        background-color: ${themeStore.opacify(e.theme.darkBtnBgHover, 0.9)};
        border: solid 2px ${themeStore.opacify(e.theme.lightBtnBgHover, 0.85)}; 
      }
      .__react_component_tooltip.type-dark {
        color: ${e.theme.darkBtnText};
        background-color: ${themeStore.opacify(e.theme.darkBtnBg, 1)};
      }
      .__react_component_tooltip.type-dark.place-bottom:after {
        border-bottom: 6px solid ${themeStore.opacify(e.theme.darkBtnBg, 1)};
      }
      .__react_component_tooltip.type-dark.place-top:after {
        border-top: 6px solid ${themeStore.opacify(e.theme.darkBtnBg, 1)};
      }
      .__react_component_tooltip.type-dark.place-right:after {
        border-right: 6px solid ${themeStore.opacify(e.theme.darkBtnBg, 1)};
      }
      #main {
        -webkit-transition: ${p.s.prefs.animations ? '-webkit-filter 0.2s ease-in' : 'initial'};
      }
      .alert-success {
        color: ${e.theme.lightBtnText};
        background-color: ${e.theme.lightBtnBg};
        border-color: ${e.theme.lightBtnBg};
      }
      .alert-danger {
        color: ${e.theme.darkBtnText};
        background-color: ${e.theme.darkBtnBg};
        border-color: ${e.theme.darkBtnBg};
      }
      `;
      v(document.body).css({
        color: e.theme.bodyText,
        backgroundColor: e.theme.bodyBg,
      });
      v('#bgImg').css({backgroundColor: e.theme.bodyBg});
      s.theme = e.theme;
    }
    if (e.currentWallpaper && typeof e.currentWallpaper.data !== 'undefined') {
      if (e.currentWallpaper.data !== -1) {
        v('#bgImg').css({
          backgroundImage: `url('${e.currentWallpaper.data}')`,
          backgroundSize: 'cover'
        });
        s.wallpaper = e.currentWallpaper;
      } else {
        v('#bgImg').css({
          backgroundImage: 'none'
        });
        s.wallpaper = null;
      }
    }
    if (e.wallpapers) {
      s.wallpapers = e.wallpapers;
    }
    this.setState(s);
  },
  modalChange(e){
    if (this.props.s.prefs.animations) {
      if (e.state) {
        v('#main').css({
          WebkitTransition: '-webkit-filter .0.5s ease-in',
          WebkitFilter: 'blur(5px)'
        });
      } else {
        v('#main').css({WebkitFilter: 'none'});
      }
    } else {
      v('#main').css({WebkitFilter: 'none'});
    }
  },
  searchChange(e, update) {
    var search = e;
    var p = this.props;
    var tabs = update ? update : p.s.tabs;
    this.setState({topLoad: true});
    // Mutate the tabs array and reroute all event methods to searchChanged while search length > 0
    if (search.length > 0) {
      for (var i = tabs.length - 1; i >= 0; i--) {
        if (kmp(tabs[i].title.toLowerCase(), search) !== -1 || kmp(tabs[i].url, search) !== -1) {
          tabs.push(tabs[i]);
        } else {
          tabs = _.without(tabs, tabs[i]);
        }
      }
      this.setState({tabs: _.uniq(tabs)});
      tabStore.set_tab(tabs);
    } else {
      // fix
      state.set({mode: p.s.prefs.mode});
    }
    _.defer(()=>this.setState({topLoad: false}));
  },
  createSingleItem(e){
    var s = this.state;
    var p = this.props;
    if (p.s.init) {
      return;
    }
    var tab = e;
    _.each(p.s.favicons, (fVal, fKey)=>{
      if (tab.url.indexOf(fVal.domain) !== -1) {
        tab.favIconUrl = fVal.favIconUrl;
      } else {
        faviconStore.set_favicon(tab, 0, 0);
      }
    });
    _.assign(tab, {
      timeStamp: new Date(Date.now()).getTime(),
      favIconUrl: _.find(p.s.favicons, (fv)=>{
        if (tab.url.indexOf(fv.domain) !== -1) {
          return fv.favIconUrl;
        }
      })
    });
    if (typeof p.s.altTabs[tab.index] !== 'undefined') {
      for (var i = p.s.altTabs.length - 1; i >= 0; i--) {
        if (i > tab.index) {
          if (i <= p.s.altTabs.length) {
            p.s.altTabs[i].index = i + 1;
          }
        }
      }
      p.s.altTabs.push(tab);
      utils.arrayMove(p.s.altTabs, _.findIndex(p.s.altTabs, _.last(p.s.altTabs)), tab.index);   
    } else {
      p.s.altTabs.push(tab);
    }
    p.s.altTabs = _.orderBy(_.uniqBy(p.s.altTabs, 'id'), ['pinned'], ['desc']);
    console.log('Single tab to update:', tab);
    if (p.s.prefs.sessionsSync) {
      synchronizeSession(s.prefs, p.s.altTabs);
    }
    state.set({
      tabs: p.s.prefs.mode === 'tabs' ? p.s.altTabs : p.s.tabs,
      altTabs: p.s.altTabs 
    });
  },
  removeSingleItem(e){
    var p = this.props;
    if (p.s.init) {
      return;
    }
    var tabToUpdate = _.findIndex(p.s.altTabs, {id: e});
    if (tabToUpdate > -1) {
      var s = this.state;
      if (p.s.prefs.actions) {
        actionStore.set_action('remove', p.s.altTabs[tabToUpdate]);
      }
      p.s.altTabs = _.without(p.s.altTabs, p.s.altTabs[tabToUpdate]);
      p.s.altTabs = _.orderBy(_.uniqBy(p.s.altTabs, 'id'), ['pinned'], ['desc']);
      console.log('Single tab to remove:', p.s.altTabs[tabToUpdate]);
      if (p.s.prefs.sessionsSync) {
        synchronizeSession(s.prefs, p.s.altTabs);
      }
      state.set({
        tabs: p.s.prefs.mode === 'tabs' ? p.s.altTabs : p.s.tabs,
        altTabs: p.s.altTabs 
      });
    }
  },
  updateSingleItem(e){
    var p = this.props;
    if (p.s.init) {
      return;
    }
    console.log('updateSingleItem', p.s.updateType);
    _.merge(e, {
      timeStamp: new Date(Date.now()).getTime()
    });
    var orderBy = ['pinned'];
    var tabToUpdate = _.findIndex(p.s.altTabs, {id: e.id});

    if (tabToUpdate > -1) {
      var s = this.state;
      if (p.s.updateType === 'move') {
        console.log('Move indexes: ', tabToUpdate, e.index);
        p.s.altTabs = v(p.s.altTabs).move(tabToUpdate, e.index).ns;
        orderBy.push('index');
      } else {
        p.s.altTabs[tabToUpdate] = e;
      }
      if (e.pinned) {
        p.s.altTabs = _.orderBy(_.uniqBy(p.s.altTabs, 'id'), ['pinned'], ['desc']);
      } else {
        p.s.altTabs = _.orderBy(p.s.altTabs, ['pinned'], ['desc']);
      }
      console.log('Single tab to update:', e);
      if (p.s.prefs.sessionsSync) {
        synchronizeSession(s.prefs, p.s.altTabs);
      }
      state.set({
        tabs: p.s.prefs.mode === 'tabs' ? p.s.altTabs : p.s.tabs,
        altTabs: p.s.altTabs 
      });
    }
  },
  moveSingleItem(e){
    var p = this.props;
    if (p.s.init) {
      return;
    }
    console.log('moveSingleItem', e);

    var tabToUpdate = _.findIndex(p.s.altTabs, {id: e.id});

    if (tabToUpdate > -1) {
      var s = this.state;
      console.log('Move indexes: ', tabToUpdate, e.index);
      p.s.altTabs = v(p.s.altTabs).move(tabToUpdate, e.index).ns;
      p.s.altTabs[tabToUpdate].timeStamp = new Date(Date.now()).getTime();
      if (e.pinned) {
        p.s.altTabs = _.orderBy(_.uniqBy(p.s.altTabs, 'id'), ['pinned'], ['desc']);
      } else {
        p.s.altTabs = _.orderBy(p.s.altTabs, ['pinned'], ['desc']);
      }
      if (p.s.prefs.sessionsSync) {
        synchronizeSession(s.prefs, p.s.altTabs);
      }
      if (tabToUpdate === e.index) {
        state.set({
          tabs: p.s.prefs.mode === 'tabs' ? p.s.altTabs : p.s.tabs,
          altTabs: p.s.altTabs 
        });
      }
    }
  },
  updateTabState(e, opt){
    var p = this.props;
    console.log('updateTabState: ',e);
    if (opt === 'folder') {
      if (e) {
        var filter = p.s.prefs.mode === 'bookmarks' ? {folder: e} : {originSession: e};
        console.log('filter', filter);
        state.set({tabs: _.filter(p.s.tabs, filter), tabsCache: p.s.tabs});  
      } else {
        state.set({tabs: p.s.tabsCache});
      }
      
    } else {
      tabStore.promise().then((Tab)=>{
        this.setState({topLoad: true});
        if (opt === 'cycle') {
          this.setState({grid: false});
        }
        state.set({altTabs: Tab});
        if (p.s.search.length === 0) {
          state.set({tabs: e});
        } else {
          this.searchChange(p.s.search, e);
        }
        _.defer(()=>this.setState({topLoad: false}));
        if (opt === 'cycle') {
          this.setState({grid: true});
        }
        if (p.s.prefs.sessionsSync) {
          synchronizeSession(p.s.prefs, Tab);
        }
      });
    }
  },
  captureTabs(opt) {
    var s = this.state;
    var p = this.props;
    this.setState({topLoad: true});
    // Query current Chrome window for tabs.
    tabStore.promise().then((Tab)=>{
      var blacklisted = [];
      _.each(Tab, (tVal, tKey)=>{
        _.assign(Tab[tKey], {
          timeStamp: new Date(Date.now()).getTime()
        });
        if (tVal.url === 'chrome://newtab/') {
          blacklisted.push(tKey);
        }
        if (p.s.favicons.length > 0) {
          var match = false;
          _.each(p.s.favicons, (fVal, fKey)=>{
            if (tVal.url.indexOf(fVal.domain) !== -1) {
              match = true;
              Tab[tKey].favIconUrl = fVal.favIconUrl;
            }
          });
          if (!match) {
            faviconStore.set_favicon(tVal, 0, 0);
          }
        } else {
          faviconStore.set_favicon(tVal, 0, 0);
        }
      });

      for (let i = blacklisted.length - 1; i >= 0; i--) {
        _.pullAt(Tab, blacklisted[i]);
      }
     
      var stateUpdate = {
        altTabs: Tab
      };
      try {
        utilityStore.set_window(Tab[0].windowId);
      } catch (e) {
        chrome.windows.getCurrent((w)=>{
          // Store the Chrome window ID for global reference
          utilityStore.set_window(w.id);
        });
      }
      this.setState({init: false});
      if (opt !== 'init') {
        v('#main').css({cursor: 'wait'});
        // Render state is toggled to false on the subsequent re-renders only.
        // tile opt forces the tiles to update, cycle forces the grid to update.
        if (opt === 'tile') {
          this.setState({render: false});
        } else if (opt === 'cycle') {
          this.setState({grid: false});
        }
      }
      var tab = [];
      // Handle session view querying, and set it to tabs var.
      if (p.s.prefs.mode === 'sessions') {
        tab = sessionsStore.flatten();
      } else {
        tab = Tab;
      }
      // Avoid setting tabs state here if the mode is not tabs or sessions. updateTabState will handle other modes.
      if (p.s.prefs.mode !== 'bookmarks' 
        && p.s.prefs.mode !== 'history' 
        && p.s.prefs.mode !== 'apps' 
        && p.s.prefs.mode !== 'extensions') {
        if (p.s.search.length === 0) {
          stateUpdate.tabs = tab;
        } else {
          this.searchChange(p.s.search, tab);
        }
        this.checkDuplicateTabs(Tab);
      }

      state.set(stateUpdate);

      this.setState({topLoad: false});
      v('#main').css({cursor: 'default'});
      // Querying is complete, allow the component to render.
      if (opt === 'init' || opt === 'tile') {
        this.setState({render: true});
        if (opt === 'init') {
          utilityStore.initTrackJs(p.s.prefs, s.savedThemes);
          this.setState({load: false});
          actionStore.set_state(false);
        }
      } else if (opt === 'cycle') {
        this.setState({grid: true});
      }
    });
  },
  checkDuplicateTabs(tabs){
    let tabUrls = [];
    for (var i = tabs.length - 1; i >= 0; i--) {
      tabUrls.push(tabs[i].url);    
    }
    console.log('Duplicates: ', utils.getDuplicates(tabUrls));
    if (utils.hasDuplicates(tabUrls)) {
      this.setState({duplicateTabs: utils.getDuplicates(tabUrls)});
    } 
  },
  reQuery(e) {
    console.log('### reQuery', e);
    // Method triggered by Chrome event listeners.
    var p = this.props;
    if (!clickStore.get_click()) {
      if (e.state) {
        // Treat attaching/detaching and created tabs with a full re-render.
        if (p.s.prefs.mode === 'bookmarks') {
          this.updateTabState(bookmarksStore.get_bookmarks(), e.type);
        } else if (p.s.prefs.mode === 'history') {
          this.updateTabState(historyStore.get_history(), e.type);
        } else if (p.s.prefs.mode === 'apps') {
          this.updateTabState(chromeAppStore.get(true), e.type);
        } else if (p.s.prefs.mode === 'extensions') {
          this.updateTabState(chromeAppStore.get(false), e.type);
        } else {
          this.captureTabs(e.type);
        }
      }
    }
  },
  render: function() {
    var s = this.state;
    var p = this.props;
    if (s.theme && p.s.prefs) {
      var newTabs = tabStore.getNewTabs();
      var cursor = utilityStore.get_cursor();
      var windowId = utilityStore.get_window();
      var stores = {
        tabs: p.s.tabs,
        altTabs: p.s.altTabs,
        duplicateTabs: s.duplicateTabs,
        screenshots: s.screenshots, 
        newTabs: newTabs, 
        prefs: p.s.prefs, 
        search: p.s.search, 
        cursor: cursor, 
        chromeVersion: s.chromeVersion, 
        relay: p.s.relay,
        applyTabOrder: p.s.applyTabOrder,
        windowId: windowId,
        sort: p.s.sort
      };
      var keys = [];
      var labels = {};
      if (p.s.prefs.mode === 'bookmarks') {
        keys = ['url', 'title', 'dateAdded', 'folder', 'index'];
        labels = {
          folder: 'Folder',
          dateAdded: 'Date Added',
          url: 'Website',
          title: 'Title',
          index: 'Original Order'
        };
      } else if (p.s.prefs.mode === 'history') {
        keys = ['openTab', 'url', 'title', 'lastVisitTime', 'visitCount', 'index'];
        labels = {
          visitCount: 'Most Visited',
          lastVisitTime: 'Last Visit',
          url: 'Website',
          title: 'Title',
          openTab: 'Open',
          index: 'Original Order'
        };
      } else if (p.s.prefs.mode === 'sessions') {
        keys = ['openTab', 'url', 'title', 'sTimeStamp', 'label', 'index'];
        labels = {
          label: 'Label',
          sTimeStamp: 'Date Added',
          url: 'Website',
          title: 'Title',
          openTab: 'Open',
          index: 'Original Order'
        };
      } else if (p.s.prefs.mode === 'apps' || p.s.prefs.mode === 'extensions') {
        keys = ['title', 'offlineEnabled', 'index'];
        labels = {
          offlineEnabled: 'Offline Enabled',
          title: 'Title',
          index: 'Original Order'
        };
      } else {
        keys = ['url', 'title', 'timeStamp', 'index',];
        labels = {
          index: 'Tab Order',
          url: 'Website',
          title: 'Title',
          'timeStamp': 'Updated'
        };
        if (s.chromeVersion >= 46) {
          var init = _.initial(keys);
          init.push('audible');
          keys = _.union(init, keys);
          _.assign(labels, {
            audible: 'Audible'
          });
        }
      }
      var options = v('#options').n;
      console.log('ROOT STATE: ', s);
      return (
        <div className="container-main">
          {options ? <Preferences options={true} settingsMax={true} prefs={p.s.prefs} tabs={p.s.tabs} theme={s.theme} /> : s.load ? <Loading /> 
          : 
          <div>
            {p.s.context.value ? <ContextMenu search={p.s.search} actions={s.actions} tabs={p.s.tabs} prefs={p.s.prefs} cursor={cursor} context={p.s.context} chromeVersion={s.chromeVersion} duplicateTabs={s.duplicateTabs}/> : null}
            {p.s.modal ? 
              <ModalHandler 
              modal={p.s.modal} 
              tabs={p.s.prefs.mode === 'tabs' ? p.s.tabs : p.s.altTabs}
              allTabsByWindow={s.allTabsByWindow}
              sessions={s.sessions} 
              prefs={p.s.prefs} 
              favicons={p.s.favicons} 
              collapse={p.s.collapse} 
              theme={s.theme} 
              savedThemes={s.savedThemes} 
              standardThemes={s.standardThemes}
              wallpaper={s.wallpaper}
              wallpapers={s.wallpapers}
              settings={p.s.settings}
              height={p.s.height} /> : null}
              {p.s.tabs ? 
              <div className="tile-container">
                <Search
                s={p.s}
                event={s.event}
                topLoad={s.topLoad} 
                theme={s.theme} 
                onMenuClick={()=>this.setState({sidebar: !s.sidebar})}
                onMenuHoverIn={()=>this.setState({disableSidebarClickOutside: true})}
                onMenuHoverOut={()=>this.setState({disableSidebarClickOutside: false})} />
                <div style={{marginTop: '67px'}} className="tile-child-container">
                  {s.grid ? 
                    <TileGrid
                    s={p.s}
                    data={p.s.tabs}
                    keys={keys}
                    labels={labels}
                    render={s.render}
                    collapse={p.s.collapse}
                    width={p.s.width}
                    sidebar={s.sidebar}
                    stores={stores}
                    tileLimit={p.s.tileLimit}
                    sessions={s.sessions}
                    init={s.init}
                    theme={s.theme}
                    wallpaper={s.wallpaper}
                    onSidebarClickOutside={()=>this.setState({sidebar: false})}
                    disableSidebarClickOutside={s.disableSidebarClickOutside}
                    />
                  : <Loading />}
                </div>
                {p.s.modal && !p.s.modal.state && p.s.prefs.tooltip ? 
                <ReactTooltip 
                effect="solid" 
                place="right"
                multiline={true}
                html={true}
                offset={{top: 0, left: 6}} /> : null}
              </div> : null}
            </div>}
            {p.s.modal && !p.s.modal.state && p.s.prefs.tooltip ? <Alert enabled={p.s.prefs.alerts} /> : null}
        </div>
      );
    } else {
      return <Loading />;
    }
  }
});

var App = React.createClass({
  mixins: [
    Reflux.ListenerMixin,
    ReactUtils.Mixins.WindowSizeWatch,
    ReactUtils.Mixins.ViewportWatch
  ],
  getInitialState(){
    return state.get();
  },
  componentDidMount(){
    this.listenTo(state, this.stateChange);
    chrome.runtime.sendMessage(chrome.runtime.id, {method: 'prefs'}, (response)=>{
      var stateUpdate = {prefs: response.prefs, init: false, favicons: this.props.favicons};
      state.set(stateUpdate);
      console.log('App componentDidMount: ', response);
      this.onWindowResize({width: window.innerWidth, height: window.innerHeight});
    });
  },
  stateChange(e){
    this.setState(e);
  },
  onWindowResize(e) {
    var s = this.state;
    state.set({
      collapse: e.width >= 1565,
      width: e.width,
      height: e.height
    });
    if (s.prefs.screenshotBg || s.prefs.screenshot) {
      document.getElementById('bgImg').style.width = window.innerWidth + 30;
      document.getElementById('bgImg').style.height = window.innerHeight + 5;
    }
  },
  onViewportChange(viewport) {
    var wrapper = document.body;
    if (wrapper.scrollTop + window.innerHeight >= wrapper.scrollHeight - 200) {
      this.setState({tileLimit: this.state.tileLimit + 100});
    }
  },
  render(){
    console.log('app state: ',this.state);
    if (!this.state.init) {
      return <Root s={this.state} />;
    } else {
      return null;
    }
  }
});

var renderApp = (favicons)=>{
  ReactDOM.render(<App favicons={favicons} />, document.getElementById('main'));
};

v(document).ready(()=>{
  chrome.storage.local.get('favicons', (fv)=>{
    if (fv && fv.favicons) {
      renderApp(fv.favicons);
    } else {
      chrome.storage.local.set({favicons: []}, (result)=> {
        console.log('Init favicons saved.');
        renderApp([]);
      });
    }
  });
});
