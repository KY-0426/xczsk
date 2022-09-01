// pages/my/denglu/denglu.js
const db = wx.cloud.database()
const defaultAvatarUrl = 'https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/menu/logo.png?sign=0378d043d462766cdbb1d15c9d7437ab&t=1654480696'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    name: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let openId = wx.getStorageSync('openId')
    console.log(openId)
    this.setData({
      userid: openId
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },
  formSubmit(e) {
    console.log()
    if (e.detail.value.input == "") {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'error',
        duration: 2000
      })
      return false
    }
    this.setData({
      name: e.detail.value.input
    })
    var that = this;
    wx.cloud.uploadFile({
      cloudPath: 'touxiang/' + (new Date()).valueOf() + '.png', // 文件名
      filePath: this.data.avatarUrl, // 文件路径
      success: res => {
        // get resource ID
        console.log(res.fileID)
        let img = res.fileID
        // 赋值图片
        wx.cloud.getTempFileURL({
          fileList: [img],
          success: res => {
            console.log("获取url地址：", res.fileList[0].tempFileURL);
            that.setData({
              avatarUrl:res.fileList[0].tempFileURL
            })
            db.collection("t_user").add({
              data: {
                youke:true,
                user_name: that.data.name,
                _openid: that.data.userid,
                user_img: that.data.avatarUrl,
                _createTime: Date.parse(new Date()),
              }
            }).then(res => {
              wx.showToast({
                title: '添加成功',
                icon: 'success',
                duration: 2000
              })
              //设缓存
              let userInfo = {}
              userInfo.nickName = that.data.name
              userInfo.avatarUrl = that.data.avatarUrl
              wx.setStorageSync('userInfo', userInfo)
              wx.setStorageSync('youke', true)
              // 给上一个页面传值
              let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    
              let prevPage = pages[pages.length - 2];
    
              //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
    
              prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                userInfo: userInfo, 
                hasUserInfo:true
              })
    
              setTimeout(function name(params) {
                wx.navigateBack({
                  delta: 1,
                })
              }, 2000)
    
            })
          },
          fail: console.error
        })

      },
      fail: err => {
        wx.showToast({
          title: '请填写头像和昵称',
          icon: 'error',
          duration: 2000
        })
      }
    })
  },
  upload(filepath) {
    console.log(filepath)
  },
  formReset(e) {
    console.log('form发生了reset事件，携带数据为：', e.detail.value)
    this.setData({
      chosen: ''
    })
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