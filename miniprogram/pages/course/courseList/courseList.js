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
    console.log("获取课程id成功：",options.id)
    let menu_id = options.id
    db.collection('course').where({
      course_menu:menu_id
    }).get({
      success:res=>{
        console.log("查到",res.data.length,"个课程",res.data)
        let course = res.data
        for (let i = 0; i < course.length; i++) {
          let course_id =  course[i]._id
          db.collection('teacher').where({
            course_id: course_id
          }).get({
            success: res => {
              console.log("获取教师成功",res.data)
              course[i].course_teacher = res.data
              that.setData({
                courseList: course
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