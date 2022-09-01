// pages/video/swiperVideo/swiperVideo.js
// const txvContext = requirePlugin("tencentvideo");
const db = wx.cloud.database();
const app = getApp();
const util = require('../../../mixin/utils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // isPlayId:null,
    oneList: [], //id对应的视频
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    SendComment: {},
    inputHeight: 0,
    toggleDelay: false
  },

  onlikeTap: util.throttle(function (e) {
    let isPlayId = this.data.isPlayId
    console.log(e)
    let that = this
    // 拿到缓存
    var Videolikes_OK2 = wx.getStorageSync('Videolikes_OK');
    // 拿到此id的值
    let isPlayId2 = this.data.isPlayId
    let oneVideolikeOK = Videolikes_OK2[isPlayId2]
    // 取反
    oneVideolikeOK = !oneVideolikeOK
    Videolikes_OK2[isPlayId2] = oneVideolikeOK
    // 更新缓存值
    wx.setStorageSync('Videolikes_OK', Videolikes_OK2)
    that.setData({
      Videolikes_OK: oneVideolikeOK
    })
    wx.showToast({
      title: oneVideolikeOK ? '点赞成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
    let oneList = that.data.oneList
    if(oneVideolikeOK){
      db.collection("video").doc(isPlayId).update({
        data: {
          like_num: db.command.inc(1)
        }
      }).then(res => {
        console.log("点赞成功", res)
        oneList.like_num+=1
        that.setData({
          oneList:oneList
        })
      })
      
    }else{
      db.collection("video").doc(isPlayId).update({
        data: {
          like_num: db.command.inc(-1)
        }
      }).then(res => {
        console.log("取消点赞", res)
        oneList.like_num-=1
        that.setData({
          oneList:oneList
        })
      })
    }
  }),
  // 评论
  // 如果没有登录，提示模态框
  InputContent: function (e) {
    let newComments = new Object() //评论数据 头像 微信昵称 评论语句
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
      console.log("没有登录", e)
      that.setData({
        inputContent: ""
      });
      wx.showModal({
        title: '提示',
        content: '请登录后评论',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.switchTab({
              url: '../../my/my'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }

  },
  //发送评论 到数据库 
  SendCommentsTap: util.throttle(function (e) {
    let that = this
    let SendComment = that.data.newComments //单条评论
    if (SendComment) {
      let id = that.data.isPlayId // 评论文章的id
      const _ = db.command
      db.collection('video').doc(id).update({
        data: {
          'comments': _.unshift(SendComment)
        },
        success: res => {
          console.log("评论成功", res)
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
        title: '请输入',
        icon: 'error',
        duration: 2000
      })
    }

  }),
  //删除评论
  showModalMenu: util.throttle(function (params) {
    let that = this
    let deletecomment = params.currentTarget.dataset.deletecomment
    wx.showActionSheet({
      itemList: ['删除'],
      success(res) {
        console.log(res.tapIndex)
        switch (res.tapIndex) {
          case 0:
            //删除评论
            const _ = db.command
            let id = that.data.isPlayId // 评论文章的id
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
                //查询评论
                db.collection('video').doc(id).get({
                  success: function (res) {
                    let QueryComments = res.data.comments
                    that.setData({
                      inputContent: "",
                      Comments: QueryComments
                    })
                  }
                })
                console.log("删除成功", res)
              }
            })

        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  }),
  inputFocus(e) {
    let that = this
    console.log("键盘弹起", e)
    let height = e.detail.height
    if (e.detail.height) {
      that.setData({
        inputHeight: height * 2 - 50
      })
    }
  },
  changeInputBlur() {
    console.log("blur")
    this.setData({
      inputHeight: 0
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
    let isPlayId = options.video_id
    let that = this
    that.setData({
      isPlayId: isPlayId
    })
    db.collection('video').where({
      _id: isPlayId
    }).get({
      success: (res) => {
        let oneList = res.data
        that.setData({
          oneList: oneList[0]
        })
      }
    })
    // 加载时浏览量就加1
    db.collection("video").where({
      _id: isPlayId
    }).update({
      data: {
        // 自增1
        views_num: db.command.inc(1)
      },
      success: function (res) {
        console.log("浏览量加1", res)
      },
      fail(err) {
        console.log(err)
      }
    })
    let id = that.data.isPlayId // 评论文章的id
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
    //获取点赞
    var onelikeOK = wx.getStorageSync('Videolikes_OK');
    if (onelikeOK) {
      var Videolikes_OK = onelikeOK[isPlayId]
      that.setData({
        Videolikes_OK: Videolikes_OK
      })
    } else {
      var onelikeOK = {}
      onelikeOK[isPlayId] = false;
      wx.setStorageSync('Videolikes_OK', onelikeOK);
    }

  },
  outpagetap: function (e) {
    wx.navigateBack({
      delta: 0,
    })
  },
  bindchange(e) {
    console.log(e.detail)
  },
  onPlay(e) {},

  onPause(e) {
    // console.log('pause', e.detail.activeId)
  },

  onEnded(e) {},

  onError(e) {},

  onWaiting(e) {},

  onTimeUpdate(e) {},

  onProgress(e) {},

  onLoadedMetaData(e) {
    console.log('LoadedMetaData', e)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 获取自动播放
    db.collection('more').doc('1').get({
      success:res=>{
        this.setData({
          autoplay:res.data.autoplay
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (params) {
    // console.log(params)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})