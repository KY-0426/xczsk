const db = wx.cloud.database();
const app = getApp();
const util = require('../../../mixin/utils.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    contentInfo: "", //富文字
    SendComment: {},
    inputshow: "none",
    inputHeight: 0,
    toggleDelay: false,

  },
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
      let id = that.data.paper_id // 评论文章的id
      const _ = db.command
      db.collection('article').doc(id).update({
        data: {
          'comments': _.unshift(SendComment)
        },
        success: res => {
          console.log("评论成功", res)
          db.collection('article').doc(id).get({
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
            let id = that.data.paper_id // 评论文章的id
            let deleteavatarUrl = deletecomment.avatarUrl
            let deleteopenId = deletecomment.openId
            let deletetime = deletecomment.time
            let deleteinputContent = deletecomment.inputContent
            let deletenickName = deletecomment.nickName
            let openId = wx.getStorageSync('openId')
            if (deleteopenId != openId) {
              return
            }
            db.collection('article').doc(id).update({
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
                db.collection('article').doc(id).get({
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
  showModal(e) {
    let that = this
    this.setData({
      modalName: e.currentTarget.dataset.target,
      inputshow: "block"
    })
    let id = that.data.paper_id // 评论文章的id
    db.collection('article').doc(id).get({
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
  // 返回
  outpagetap: function (e) {
    // 退出页面
    wx.navigateBack({
      delta: 0,
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    // 获取传来的值
    let that = this
    let paper_id = options.paper_id
    db.collection("article").where({
      _id: paper_id
    }).get({
      success(res) {
        console.log("获取文章数据成功", res.data)
        that.setData({
          paper: res.data[0],
          paper_id: paper_id,
          Comments: res.data[0].comments
        })
        // 处理图片自适应
        let content = that.data.paper.content
        that.setData({
          contentInfo: content.replace('<img ', '<img style="max-width:100%;height:auto;display:block;margin:10px 0;"')
        })
        // 查询作者
        let user_id = res.data[0].user_id
        db.collection("t_user").doc(user_id).field({
          user_name:true,
          user_img:true
        }).get({
          success:(res)=>{
            let paper = that.data.paper
            paper['author_img']=res.data.user_img
            paper['author_name']=res.data.user_name
            console.log(res)
            that.setData({
              paper:paper
            })
          }
        })
      }
    })
    //查询 轮播图片
    db.collection('life_img').where({"lifeArticle_id":paper_id}).get({
      success:(res)=>{
        that.setData({
          imgswiper:res.data[0].img
        })
        
      }
    })
    // 加载时浏览量就加1
    db.collection("article").doc(paper_id).update({
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
    //获取点赞
    var onelikeOK = wx.getStorageSync('likes_OK');
    if (onelikeOK) {
      var like_OK = onelikeOK[paper_id]
      that.setData({
        like_OK: like_OK
      })
    } else {
      var onelikeOK = {}
      onelikeOK[paper_id] = false;
      wx.setStorageSync('likes_OK', onelikeOK);
    }
    // 获取收藏
    var onecollection_OK = wx.getStorageSync('collection_OK');
    if (onecollection_OK) {
      var collection_OK = onecollection_OK[paper_id]
      that.setData({
        collection_OK: collection_OK
      })
    } else {
      var onecollection_OK = {}
      onecollection_OK[paper_id] = false;
      wx.setStorageSync('collection_OK', onecollection_OK);
    }
    //浏览文章的id 放到缓存 visitTotal_num
    let visitTotal_num = wx.getStorageSync('visitTotal_num')
    if (visitTotal_num) {
      visitTotal_num[paper_id] = true
      wx.setStorageSync('visitTotal_num', visitTotal_num)
    } else {
      let onevisitTotal_num = {}
      onevisitTotal_num[paper_id] = true
      wx.setStorageSync('visitTotal_num', onevisitTotal_num)
    }
  


  },
  /**
   * 
   * @param {点赞按钮} e 
   */
  onlikeTap: function (e) {
    let that = this
    // 拿到缓存
    var likes_OK2 = wx.getStorageSync('likes_OK');
    // 拿到此id的值
    let post_id = that.data.paper_id
    let onelikeOK = likes_OK2[post_id]
    // 取反
    onelikeOK = !onelikeOK
    likes_OK2[post_id] = onelikeOK
    // 更新缓存值
    wx.setStorageSync('likes_OK', likes_OK2)
    // 切换图片
    that.setData({
      like_OK: onelikeOK
    })
    wx.showToast({
      title: onelikeOK ? '点赞成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
    // 如果 like_ok 是true 点赞加一  更新数据库
    let id = that.data.paper._id
    if (onelikeOK) {
      db.collection("article").doc(id).update({
        data: {
          like_num: db.command.inc(1)
        }
      }).then(res => {
        console.log("点赞成功", res)
      })
    } else {
      db.collection("article").doc(id).update({
        data: {
          like_num: db.command.inc(-1)
        }
      }).then(res => {
        console.log("点赞成功", res)
      })
    }
  },
  /**
   * 收藏
   * @param {收藏按钮} e 
   */
  oncollectionTap: function (e) {
    let that = this
    that.setData({
      collection_OK: !that.data.collection_OK
    })
    // 拿到缓存
    var collection_OK2 = wx.getStorageSync('collection_OK');
    // 拿到此id的值
    let post_id = that.data.paper_id
    let onecollection_OK = collection_OK2[post_id]
    // 取反
    onecollection_OK = !onecollection_OK
    collection_OK2[post_id] = onecollection_OK
    // 更新缓存值
    wx.setStorageSync('collection_OK', collection_OK2)
    // 切换图片
    that.setData({
      collection_OK: onecollection_OK
    })
    wx.showToast({
      title: onecollection_OK ? '收藏成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
  },
  onshareTap: function (e) {
    console.log("分享")
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


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