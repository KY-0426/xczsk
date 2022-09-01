// pages/about/about.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banquan:" 本小程序为乡村知识库。本小程序提供的内容仅用于个人学习、研究或欣赏。我们不保证内容的正确性。通过使用本站内容随之而来的风险与本小程序无关。本小程序使用colorUI、 腾讯视频插件、极点日历插件、openaiwidget插件开发。本小程序主要用做宣传农技知识、普法小知识、乡村美景。视频来自腾讯视频，文章来自网络。如有侵权，请及时联系客服，给予删除。"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    db.collection('more').where({_id:"1"}).get({
      success:(res)=>{
        console.log("版权",res.data[0].banquan)
        this.setData({
          banquan:res.data[0].banquan
        })
      }
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