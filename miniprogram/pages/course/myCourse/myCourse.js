// pages/course/courseList/courseList.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let openid = wx.getStorageSync('openId')
    db.collection('courseOrder').where({
      _openid: openid
    }).field({
      course_id: true,
      order_num:true
    }).get({
      success: res => {
        // 循环查课程
        let result = res.data
        let courseList = []
        for (let i = 0; i < result.length; i++) {
          let course_id = result[i].course_id
          db.collection('course').where({
            _id: course_id
          }).get({
            success: res => {
              courseList[i] = res.data[0]
              courseList[i].order_num = result[i].order_num
              console.log(courseList)
              that.setData({
                courseList:courseList
              })
            }
          })
        }

      }
    })
  },
  oncoursepaperTap(e) {
    wx.navigateTo({
      url: '../paper/paper?id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.hideLoading()
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