// pages/SearchBox/SearchBox.js
const db = wx.cloud.database()
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    searchValue: '', // 存放搜索值
  },
  searchValueInput: function (e) {
    var value = e.detail.value;
    this.setData({
      searchValue: value,
    });
  },
  // 搜索
  ToSearch(e) {
    let that = this
    let searchValue = that.data.searchValue
    // 输入框有值  提示加载
    if (searchValue) {
      that.setData({
        isLoad: false,
        loadSearch: true
      })
      // 开始搜索
      // 搜索成功 取消提示
      db.collection('article').where({
        title: db.RegExp({ //按照KeyWord模糊查询
          regexp: searchValue, //模糊搜索监听到的搜索信息
          options: 'i', //不区分大小写
        })
      }).field({
        title:true,
        content:true,
        img:true,
        views_num:true,
        comments:true,
        like_num:true
      }).get().then(res => { //获取查询到的信息
        console.log(res)
        if (res.data.length == 0) { //如果搜索信息在数据库中找不到 弹出三秒提示errSearch
          this.setData({
            errSearch: true,
            loadSearch: false
          })
          let  timer3 = setTimeout(function (params) {
            that.setData({
              errSearch: false
            })
          }, 3000)
          return
        }
        var total = res.data.length //总匹配信息个数
        var _collections = new Array() //声明一个数组
        //将匹配信息存入数组
        for (var i = 0; i < total; i++) {
          let contentww =  that.getSimpleText(res.data[i].content).substring(0,100)
          res.data[i].content = contentww
          _collections.push(JSON.parse(JSON.stringify(res.data[i])))
        }
        //取消提示 取到data
        that.setData({
          isLoad: true,
          loadSearch: false,
          result: _collections
        })
      })
    } else if (searchValue == "") {
      //没有输入值 提示
      that.setData({
        isLoad: false,
        errInput: true,
        loadSearch: false
      })
       let timer4 = setTimeout(function () {
        that.setData({
          errInput: false,
          loadSearch: false
        })
      }, 1000)
      return
    }
  },
  paperTap:function (e) {
    //  console.log(e.currentTarget.dataset.id)
    let paper_id =  e.currentTarget.dataset.id
     wx.navigateTo({
       url: '../pubuliu/paper/paper?paper_id='+paper_id
     })
   },
   getSimpleText(html){
    var re1 = new RegExp("<.+?>", "g");//匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
    var msg = html.replace(re1, '');//执行替换成空字符
    return msg;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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