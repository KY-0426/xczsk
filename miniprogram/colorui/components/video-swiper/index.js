module.exports =
/******/ (function (modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if (installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
        /******/
}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
        /******/
};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
      /******/
}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function (exports, name, getter) {
/******/ 		if (!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
        /******/
}
      /******/
};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function (exports) {
/******/ 		if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        /******/
}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
      /******/
};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function (value, mode) {
/******/ 		if (mode & 1) value = __webpack_require__(value);
/******/ 		if (mode & 8) return value;
/******/ 		if ((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if (mode & 2 && typeof value != 'string') for (var key in value) __webpack_require__.d(ns, key, function (key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
      /******/
};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function (module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
      /******/
};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
    /******/
})
/************************************************************************/
/******/([
/* 0 */
/***/ (function (module, exports, __webpack_require__) {

    "use strict";
    const db = wx.cloud.database()
    const util = require('../../../mixin/utils.js')
    const app = getApp();
    Component({
      options: {
        addGlobalClass: true,
        pureDataPattern: /^_/
      },
      properties: {
        duration: {
          type: Number,
          value: 500
        },
        easingFunction: {
          type: String,
          value: 'default'
        },
        loop: {
          type: Boolean,
          value: false
        },
        videoList: {
          type: Array,
          value: [],
          observer: function observer() {
            var newVal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            if (newVal.length) {
              newVal.map((item, index) => {
                return item.idxKey = index;
              });
              this._videoListChanged(newVal);
              this.setData({ total: newVal.length })
            }
          }
        }
      },
      data: {
        nextQueue: [],
        prevQueue: [],
        curQueue: [],
        circular: false,
        _last: 1,
        _change: -1,
        _invalidUp: 0,
        _invalidDown: 0,
        _videoContexts: [],
        total: 0,
        videoBol: [false, false, false, false],
        inputshow: "none",
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        SendComment: {},
        inputHeight: 0,
        toggleDelay: false
      },
      lifetimes: {
        attached: function attached() {
          this.data._videoContexts = [wx.createVideoContext('video_0', this), wx.createVideoContext('video_1', this), wx.createVideoContext('video_2', this), wx.createVideoContext('video_3', this)];

        }
      },
      methods: {
        _videoListChanged: function _videoListChanged(newVal) {
          var _this = this;

          var data = this.data;
          newVal.forEach(function (item) {
            data.nextQueue.push(item);
          });
          if (data.curQueue.length === 0) {
            let curQueue = [];
            if (newVal.length == 4) {
              curQueue = data.nextQueue;
            } else {
              curQueue = data.nextQueue.splice(0, 3);
            }
            this.setData({
              curQueue: curQueue,
            }, function () {
              _this.playCurrent(0);
            });
          }
        },
        animationfinish: function animationfinish(e) {
          var _data = this.data,
            _last = _data._last,
            _change = _data._change,
            curQueue = _data.curQueue,
            prevQueue = _data.prevQueue,
            nextQueue = _data.nextQueue,
            total = _data.total;

          var current = e.detail.current;
          var diff = current - _last;
          this.data.swiperCurrent = current;
          this.playCurrent(current);
          if (diff === 0 || total <= 4) return;
          this.data._last = current;
          this.triggerEvent('change', { activeId: curQueue[current].id });
          var direction = diff === 1 || diff === -2 ? 'up' : 'down';
          if (direction === 'up') {
            if (this.data._invalidDown === 0) {
              var change = (_change + 1) % 3;
              var add = nextQueue.shift();
              var remove = curQueue[change];
              if (add) {
                prevQueue.push(remove);
                curQueue[change] = add;
                this.data._change = change;

                // strart ?????????????????????????????????????????????????????????2?????????4??????????????????3?????????
                if ((total % 3) === 1 && nextQueue.length === 0) {
                  let timers = new Date();
                  let addItem = JSON.parse(JSON.stringify(add));
                  addItem.idxKey = timers.getTime();
                  curQueue[3] = addItem;
                } else if ((total % 3) === 2 && nextQueue.length === 0) {
                  let _pop = curQueue.pop();
                  this.setData({
                    _pop: _pop
                  })
                }
                // end

              } else {
                this.data._invalidUp += 1;
              }
            } else {
              this.data._invalidDown -= 1;
            }
          }
          if (direction === 'down') {
            if (this.data._invalidUp === 0) {
              var _change2 = _change;
              var _remove = curQueue[_change2];
              var _add = prevQueue.pop();
              if (_add) {
                curQueue[_change2] = _add;
                nextQueue.unshift(_remove);
                this.data._change = (_change2 - 1 + 3) % 3;
              } else {
                this.data._invalidDown += 1;
              }
            } else {

              // strart ?????????????????????????????????????????????????????????2?????????4??????????????????3?????????
              if ((total % 3) === 1 && curQueue.length === 4) {
                curQueue.pop();
              } else if ((total % 3) === 2 && nextQueue.length === 0) {
                curQueue.push(this.data._pop);
              }
              // end

              this.data._invalidUp -= 1;
            }
          }
          var circular = true;
          if (nextQueue.length === 0 && current !== 0) {
            circular = false;
          }
          if (prevQueue.length === 0 && current !== 2) {
            circular = false;
          }
          this.setData({
            curQueue: curQueue,
            circular: circular
          }, () => {
            console.log('curQueue:', JSON.parse(JSON.stringify(this.data.curQueue)), 'nextQueue:', this.data.nextQueue, 'prevQueue:', this.data.prevQueue)
            console.log(this.data);
            // console.log(curQueue[current], 'id', this.data, current);
            // console.log('_change:', this.data._change, '_invalidDown:', this.data._invalidDown, '_invalidUp:', this.data._invalidUp, '_last:', this.data._last)
          });
        },
        // ?????????????????????
        clickVideo(e) {
          let current = this.data.swiperCurrent;
          let index = e.currentTarget.dataset.index;
          var videoContextPrev = wx.createVideoContext(`video_${current}`, this)
          if (this.data.videoBol[index]) {
            videoContextPrev.pause();
          } else {
            videoContextPrev.pause();
            setTimeout(function () {
              //???????????????????????????
              videoContextPrev.play();
            }, 300)
          }
        },
        playCurrent: function playCurrent(current) {
          let curQueue = this.data.curQueue;
          let content = curQueue[current].content;
          this.triggerEvent('updatashareid', { videoId: curQueue[current].id });
          this.setData({ swiperCurrent: current }, () => {
            let _videoContexts = this.data._videoContexts;
            _videoContexts.map((item, index) => {
              if (current == index) {
                item.play();
              } else {
                item.stop();
              }
            })
          });
        },
        onPlay: function onPlay(e) {
          this.trigger(e, 'play');
          let index = e.currentTarget.dataset.index;
          let id = e.currentTarget.dataset.id;
          this.setData({ [`videoBol[${index}]`]: true });
        },
        onPause: function onPause(e) {
          this.trigger(e, 'pause');

          let index = e.currentTarget.dataset.index;
          this.setData({ [`videoBol[${index}]`]: false });
        },
        onEnded: function onEnded(e) {
          this.trigger(e, 'ended');

          let index = e.currentTarget.dataset.index;
          this.setData({ [`videoBol[${index}]`]: false });
        },
        onError: function onError(e) {
          this.trigger(e, 'error');

          let index = e.currentTarget.dataset.index;
          this.setData({ [`videoBol[${index}]`]: false });
        },
        onTimeUpdate: function onTimeUpdate(e) {
          this.trigger(e, 'timeupdate');
        },
        onWaiting: function onWaiting(e) {
          this.trigger(e, 'wait');
        },
        onProgress: function onProgress(e) {
          this.trigger(e, 'progress');
        },
        onLoadedMetaData: function onLoadedMetaData(e) {
          this.trigger(e, 'loadedmetadata');
        },
        trigger: function trigger(e, type) {
          var ext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

          var detail = e.detail;
          var activeId = e.target.dataset.id;
          this.triggerEvent(type, Object.assign(Object.assign(Object.assign({}, detail), { activeId: activeId }), ext));
          //console.log(activeId)
        },
        showModal(e) {
          let that = this
          this.setData({
            modalName: e.currentTarget.dataset.target,
            inputshow: "block",
            paper_id: e.currentTarget.dataset.id
          })
          let id = e.currentTarget.dataset.id
          db.collection('video').doc(id).get({
            success: function (res) {
              let QueryComments = res.data.comments
              that.setData({
                inputContent: "",
                newComments: "",
                Comments: QueryComments
              })
            }
          })
        },
        hideModal(e) {
          this.setData({
            modalName: null,
            inputshow: "none"
          })
        },
        inputFocus(e) {
          let that = this
          console.log("????????????", e)
          let height = e.detail.height
          if (e.detail.height) {
            that.setData({
              inputHeight: height * 2 - 170
            })
          }
        },
        changeInputBlur() {
          console.log("blur")
          this.setData({
            inputHeight: 0
          })
        },
        // ??????
        // ????????????????????????????????????
        InputContent: function (e) {
          let newComments = new Object() //???????????? ?????? ???????????? ????????????
          let that = this
          let userInfo = wx.getStorageSync('userInfo')
          let openId = wx.getStorageSync('openId')
          if (userInfo) {
            var value = e.detail.value;
            that.setData({
              inputContent: value
            })
            newComments.openId = openId
            newComments.avatarUrl = userInfo.avatarUrl
            newComments.nickName = userInfo.nickName
            newComments.inputContent = that.data.inputContent
            newComments.time = Date.parse(new Date())
            that.setData({
              newComments: newComments
            });
          } else {
            console.log("????????????", e)
            that.setData({
              inputContent: ""
            });
            wx.showModal({
              title: '??????',
              content: '??????????????????',
              success(res) {
                if (res.confirm) {
                  console.log('??????????????????')
                  wx.switchTab({
                    url: '../my/my'
                  })
                } else if (res.cancel) {
                  console.log('??????????????????')
                }
              }
            })
            return
          }

        },
        //???????????? ???????????? 
        SendCommentsTap: util.throttle(function (e) {
          let that = this
          let SendComment = that.data.newComments //????????????
          if (SendComment) {
            let id = that.data.paper_id // ???????????????id
            const _ = db.command
            db.collection('video').doc(id).update({
              data: {
                'comments': _.unshift(SendComment)
              },
              success: res => {
                console.log("????????????", res)
                db.collection('video').doc(id).get({
                  success: function (res) {
                    let QueryComments = res.data.comments
                    that.setData({
                      inputContent: "",
                      newComments: "",
                      Comments: QueryComments
                    })
                  }
                })
              }
            })
          } else {
            wx.showToast({
              title: '?????????',
              icon: 'error',
              duration: 2000
            })
          }

        }),
        //????????????
        showModalMenu: util.throttle(function (params) {
          let that = this
          let deletecomment = params.currentTarget.dataset.deletecomment
          wx.showActionSheet({
            itemList: ['??????'],
            success(res) {
              console.log(res.tapIndex)
              switch (res.tapIndex) {
                case 0:
                  //????????????
                  const _ = db.command
                  let id = that.data.paper_id // ???????????????id
                  let deleteavatarUrl = deletecomment.avatarUrl
                  let deleteopenId = deletecomment.openId
                  let deletetime = deletecomment.time
                  let deleteinputContent = deletecomment.inputContent
                  let deletenickName = deletecomment.nickName
                  let openId = wx.getStorageSync('openId')
                  if (deleteopenId != openId) {
                    return
                  }
                  db.collection('video').doc(id).update({
                    data: {
                      comments: _.pull({
                        avatarUrl: deleteavatarUrl,
                        openId: deleteopenId,
                        time: deletetime,
                        inputContent: deleteinputContent,
                        nickName: deletenickName
                      })
                    },
                    success: function (res) {
                      //????????????
                      db.collection('video').doc(id).get({
                        success: function (res) {
                          let QueryComments = res.data.comments
                          that.setData({
                            inputContent: "",
                            Comments: QueryComments
                          })
                        }
                      })
                      console.log("????????????", res)
                    }
                  })

              }
            },
            fail(res) {
              console.log(res.errMsg)
            }
          })
        }),
        onlikeTap: util.throttle(function (e) {
          let isPlayId = e.currentTarget.dataset.id
          let that = this
          // ????????????
          var Videolikes_OK2 = wx.getStorageSync('Videolikes_OK');

          // ?????????id??????
          let isPlayId2 = isPlayId
          let oneVideolikeOK = Videolikes_OK2[isPlayId2]
          if (Videolikes_OK2) {
            var Videolikes_OK = Videolikes_OK2[isPlayId]
            that.setData({
              Videolikes_OK: Videolikes_OK
            })
          } else {
            var Videolikes_OK2 = {}
            Videolikes_OK2[isPlayId] = false;
            wx.setStorageSync('Videolikes_OK', Videolikes_OK2);
          }
          // ??????
          oneVideolikeOK = !oneVideolikeOK
          Videolikes_OK2[isPlayId2] = oneVideolikeOK
          // ???????????????
          wx.setStorageSync('Videolikes_OK', Videolikes_OK2)
          // that.setData({
          //   Videolikes_OK: oneVideolikeOK
          // })
          wx.showToast({
            title: oneVideolikeOK ? '????????????' : '????????????',
            duration: 800,
            icon: 'success'
          })
          let video2 = that.data.curQueue
          console.log(video2)
          if (oneVideolikeOK) {
            db.collection("video").doc(isPlayId).update({
              data: {
                like_num: db.command.inc(1)
              }
            }).then(res => {
              console.log("????????????", res)
            })
            // ????????????
            var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
            for (let i = 0; i < video2.length; i++) {
              // ????????????????????????????????? 
              let isPlayId3 = video2[i]._id
              // ?????????id??????
              let oneVideolikeOK = Videolikes_OK3[isPlayId3]
              video2[i].like_OK = oneVideolikeOK
              video2[i].like_num += 1
              //console.log( video2[i].like_OK)
              //  console.log(i,video2[i],video2[i].like_OK)
              that.setData({
                curQueue: video2
              })
            }
            return false

          } else {
            db.collection("video").doc(isPlayId).update({
              data: {
                like_num: db.command.inc(-1)
              }
            }).then(res => {
              console.log("????????????", res)

            })
            for (let i = 0; i < video2.length; i++){
              // ????????????????????????????????? 
              let isPlayId3 =video2[i]._id
              // ????????????
              var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
              // ?????????id??????
              let oneVideolikeOK = Videolikes_OK3[isPlayId3]
              video2[i].like_OK = oneVideolikeOK
              video2[i].like_num -= 1
              //console.log( video2[i].like_OK)
              // console.log(i,video2[i],video2[i].like_OK)
              that.setData({
                curQueue: video2
              })
            }
            return false
          }

        }),
        WXshareVideo(e){
          console.log(e.currentTarget.dataset.id)
        },

      }
    });

    /***/
})
/******/]);