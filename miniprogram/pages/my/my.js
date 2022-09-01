const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starCount: 0,
    forksCount: 0,
    visitTotal: 0,
    appId: "wx8abaf00ee8c3202e",
    extraData : {
        // 把1221数字换成你的产品ID，否则会跳到别的产品
        id : "411333",
        // 自定义参数，具体参考文档
        customData : {
            clientInfo: `iPhone OS 10.3.1 / 3.2.0.43 / 0`,
        }
    }
  },
  opentuxiaochao(){
    wx.openEmbeddedMiniProgram({
      appId: "wx8abaf00ee8c3202e",
      extraData :{
        // 把1368数字换成你的产品ID，否则会跳到别的产品
        id : "411333",
        // 自定义参数，具体参考文档
        customData : {
            clientInfo: `iPhone OS 10.3.1 / 3.2.0.43 / 0`,
        }
      }
    })
  },


  coutNum(e) {
    if (e > 1000 && e < 10000) {
      e = (e / 1000).toFixed(1) + 'k'
    }
    if (e > 10000) {
      e = (e / 10000).toFixed(1) + 'W'
    }
    return e
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  onAvatarTap(e){
    let that =this
    wx.showActionSheet({
      itemList: ['退出登录'],
      success (res) {
        // console.log(res.tapIndex)
        let num = res.tapIndex
        if (num == 0) {
          console.log("退出登录")
          that.removeStorage()
        }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  },
 

  getUserProfile(e) {
    let that = this
    wx.showActionSheet({
      itemList: ['微信授权', '游客登录'],
      success (res) {
        console.log(res.tapIndex)
        if(res.tapIndex === 0){
            that.getmyuserinfo()
          }else{
            console.log("填写")
            wx.navigateTo({
              url: '../my/denglu/denglu',
            })
          }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
   
  
  }, 
  getmyuserinfo(){
    let that = this
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 添加缓存---登录信息
        // let visitTotal_num = wx.getStorageSync('visitTotal_num')
        db.collection('t_user').where({
          _openid: that.data.openId,
          youke:false,
        }).get({
          success: function (res) {
            console.log(res.data[0])
            wx.setStorageSync('likes_OK', res.data[0].likes_OK)
            wx.setStorageSync('collection_OK', res.data[0].collection_OK)
            wx.setStorageSync('visitTotal_num', res.data[0].visitTotal_num)
            wx.setStorageSync('dakadate', res.data[0].dakadate)
            wx.setStorageSync('text', res.data[0].text)
            wx.setStorageSync('youke', false)
            setTimeout(function name(params) {
              that.onShow()
            },1000)
          },
          fail: function (params) {
            db.collection('t_user').add({
              data: {
                youke:false,
                user_img:that.data.userInfo.avatarUrl,
                user_name:that.data.userInfo.nickName,
                _createTime: Date.parse(new Date()),
                _openid: that.data.openId,
              }
            })
          }
        })
        try {
          wx.setStorageSync('userInfo', this.data.userInfo)
        } catch (e) {
          wx.showModal({
            title: "失败"
          })
        }
      }
    })


  },
  //清理登录缓存, -- 注销
  removeStorage(e) {
    let that = this
    let likes_OK = wx.getStorageSync('likes_OK')
    let collection_OK = wx.getStorageSync('collection_OK')
    let visitTotal_num = wx.getStorageSync('visitTotal_num')
    let dakadate = wx.getStorageSync('dakadate')
    let text = wx.getStorageSync('text')
    let Videolikes_OK = wx.getStorageSync('Videolikes_OK')
    let youkeOk = wx.getStorageSync('youke')
    wx.showModal({
      title: '提示',
      content: '注销将删除您的所有记录',
      success(res) {
        if (res.confirm) {
          db.collection('t_user').where({
            _openid: that.data.openId,
            youke:youkeOk,
          }).remove({
            success: function (res) {
              console.log("删除成功", res)
              // 保存到t_user
              db.collection('t_user').add({
                data: {
                  youke:youkeOk,
                  user_name: that.data.userInfo.nickName,
                  user_img: that.data.userInfo.avatarUrl,
                  likes_OK: likes_OK,
                  collection_OK: collection_OK,
                  visitTotal_num: visitTotal_num,
                  dakadate:dakadate,
                  text:text,
                  Videolikes_OK:Videolikes_OK
                },
                success: function (res) {
                  // 删除缓存
                  setTimeout(function (params) {
                    wx.removeStorage({
                      key: 'userInfo'
                    })
                    wx.removeStorage({
                      key: 'visitTotal_num'
                    })
                    wx.removeStorage({
                      key: 'likes_OK'
                    })
                    wx.removeStorage({
                      key: 'collection_OK'
                    })
                    wx.removeStorage({
                      key: 'dakadate'
                    })
                    wx.removeStorage({
                      key: 'text'
                    })
                    wx.removeStorage({
                      key: 'Videolikes_OK'
                    })
                    that.setData({
                      hasUserInfo: false,
                      havevip: false,
                      starCount: 0,
                      forksCount: 0,
                      visitTotal: 0
                    })
                  }, 1000)

                }
              })
            }
          })
          console.log('用户点击确定')

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // 获取openid 数据库找到
  getOpenId() {
    wx.showLoading({
      title: '',
    });
    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      config: {
        env: this.data.envId
      },
      data: {
        type: 'getOpenId'
      }
    }).then((resp) => {
      this.setData({
        haveGetOpenId: true,
        openId: resp.result.openid
      });
      wx.setStorageSync('openId', resp.result.openid)
      wx.hideLoading();
    }).catch((e) => {
      this.setData({
        showUploadTip: true
      });
      wx.hideLoading();
    });
  },

  clearOpenId() {
    this.setData({
      haveGetOpenId: false,
      openId: ''
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.setData({
      envId: options.envId
    });
    // 获取openid 
    this.getOpenId()
    // let openid =  that.data.openId
    // 获取缓存登录信息
    let that = this
    var value = wx.getStorageSync('userInfo')
    console.log(value)
    if (value) {
      that.setData({
        userInfo: value,
        hasUserInfo: true
      })
    }

  },
  onLikeListTap: function (e) {
    console.log(e.currentTarget.dataset.storagekey)
    let storagekey = e.currentTarget.dataset.storagekey
    wx.navigateTo({
      url: '../my/cards/cards?storagekey=' + storagekey
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log("success")
    let that = this;
    wx.showLoading({
      title: '数据加载中',
      mask: true,
    })
      // 获取现在时间
    that.setData({
      Day : new Date().getDate(),
      month :  new Date().toDateString().split(" ")[1]
    }) 

    // 获取缓存 浏览量 收藏量  点赞值;
    let likes_OK = wx.getStorageSync('likes_OK')
    let collection_OK = wx.getStorageSync('collection_OK')
    let visitTotal_num = wx.getStorageSync('visitTotal_num')

    // TRUE为个数 不是object的长度
    let like_nums = 0
    let like
    for (let i = 0; i < Object.keys(likes_OK).length; i++) {
      if (Object.values(likes_OK)[i] == true) {
        like_nums += 1
        like = Object.keys(likes_OK)[i]
      }
    }
    //收藏数
    let collection_nums = 0
    for (let i = 0; i < Object.keys(collection_OK).length; i++) {
      if (Object.values(collection_OK)[i] == true) {
        collection_nums += 1
      }
    } //console.log(collection_nums) 


    let i = 0;
    numDH();

    function numDH() {
      that.setData({
        starCount: that.coutNum(collection_nums),
        forksCount: that.coutNum(like_nums),
        visitTotal: that.coutNum(Object.keys(visitTotal_num).length)
      })
    }
    wx.hideLoading()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})