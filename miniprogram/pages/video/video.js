// pages/video/video.js
const db = wx.cloud.database();
const util = require('../../mixin/utils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zhuti:false,
    TabCur: 0,
    scrollLeft: 0,
    tab: [{
      name: "普法课堂"
    }, {
      name: "生活圈"
    }, {
      name: "农技知识"
    }]
  },
  onswiperVideoTap(e) {
    console.log(e)
    let video_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: './swiperVideo/swiperVideo?video_id=' + video_id
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  WXshareVideo(e){
      console.log(e.currentTarget.dataset.id)
  },
  onlikeTap: util.throttle(function (e) {
    let isPlayId = e.currentTarget.dataset.id
    console.log(e)
    let that = this
    // 拿到缓存
    var Videolikes_OK2 = wx.getStorageSync('Videolikes_OK');
    // 拿到此id的值
    let isPlayId2 = isPlayId
    let oneVideolikeOK = Videolikes_OK2[isPlayId2]
    // 取反
    oneVideolikeOK = !oneVideolikeOK
    Videolikes_OK2[isPlayId2] = oneVideolikeOK
    // 更新缓存值
    wx.setStorageSync('Videolikes_OK', Videolikes_OK2)
    // that.setData({
    //   Videolikes_OK: oneVideolikeOK
    // })
    wx.showToast({
      title: oneVideolikeOK ? '点赞成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
    let video2 = that.data.video2
    if(oneVideolikeOK){
      db.collection("video").doc(isPlayId).update({
        data: {
          like_num: db.command.inc(1)
        }
      }).then(res => {
        console.log("点赞成功", res)
      })

      for (let i = 0; i < video2.length; i++){
        // 获取缓存，用户是否点赞 
        let isPlayId3 =video2[i]._id
        // 拿到缓存
        var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
        // 拿到此id的值
        let oneVideolikeOK = Videolikes_OK3[isPlayId3]
        video2[i].like_OK = oneVideolikeOK
        video2[i].like_num += 1
        //console.log( video2[i].like_OK)
        //  console.log(i,video2[i],video2[i].like_OK)
        that.setData({
          video2: video2
        })
      }
      return false
    }else{
      db.collection("video").doc(isPlayId).update({
        data: {
          like_num: db.command.inc(-1)
        }
      }).then(res => {
        console.log("取消点赞", res)
       
      })
      for (let i = 0; i < video2.length; i++){
        // 获取缓存，用户是否点赞 
        let isPlayId3 =video2[i]._id
        // 拿到缓存
        var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
        // 拿到此id的值
        let oneVideolikeOK = Videolikes_OK3[isPlayId3]
        video2[i].like_OK = oneVideolikeOK
        video2[i].like_num -= 1
        //console.log( video2[i].like_OK)
        // console.log(i,video2[i],video2[i].like_OK)
        that.setData({
          video2: video2
        })
      }
      return false
    }
  }),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    if(options.TabCur){
      this.setData({
        TabCur:options.TabCur
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this
    db.collection('more').where({_id:"1"}).get({
      success:(res)=>{
        console.log("主题",res.data)
        that.setData({
          zhuti:res.data[0].zhuti
        })
      }
    })
    // 普法
    db.collection('video').where({
      menu_id: "8f75309d6273968701707473701ad57e"
    }).get({
      success: (res) => {
        that.setData({
          video: res.data
        })
      }
    })
    // 生活圈
    db.collection('video').where({
      menu_id: "8f75309d6273997d0170b585113ca52d"
    }).get({
      success: (res) => {
        let  video1 = res.data
        for (let i = 0; i < video1.length; i++){
          let user_id =  video1[i].user_id
          //console.log(user_id)
          //获取头像和昵称
          db.collection('t_user').doc(user_id).get({
            success: (res) =>{
              //console.log(res.data)
              video1[i].author_img = res.data.user_img
              video1[i].author_name = res.data.user_name
              // 获取缓存，用户是否点赞 
              let isPlayId3 =video1[i]._id
              // 拿到缓存
              var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
              // 拿到此id的值
              let oneVideolikeOK = Videolikes_OK3[isPlayId3]
              video1[i].like_OK = oneVideolikeOK
              // console.log(i,video2[i],video2[i].like_OK)
              that.setData({
                video1: video1
              })
            }
          })

        }
      }
    })
    // 农技知识
    db.collection('video').where({
      menu_id: "058dfefe6273e171018bbc805e6fd016"
    }).get({
      success: (res) => {
        let  video2 = res.data
        for (let i = 0; i < video2.length; i++){
          let user_id =  video2[i].user_id
          //console.log(user_id)
          //获取头像和昵称
          db.collection('t_user').doc(user_id).get({
            success: (res) =>{
              //console.log(res.data)
              video2[i].author_img = res.data.user_img
              video2[i].author_name = res.data.user_name
              // 获取缓存，用户是否点赞 
              let isPlayId3 =video2[i]._id
              // 拿到缓存
              var Videolikes_OK3 = wx.getStorageSync('Videolikes_OK');
              // 拿到此id的值
              let oneVideolikeOK = Videolikes_OK3[isPlayId3]
              video2[i].like_OK = oneVideolikeOK
              // console.log(i,video2[i],video2[i].like_OK)
              that.setData({
                video2: video2
              })
              wx.hideLoading()
            }
          })

        }
      }
    })


  },
  onPlay(e) {},

  onPause(e) {
    //  console.log('pause', e.detail.activeId)
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
  onPullDownRefresh() {
    let newvideo2  = this.data.video2.reverse()
    console.log(newvideo2)
  },

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