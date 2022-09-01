// pages/card/card.js
 const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article:[],
    menu_id:'8f75309d6273968701707473701ad57e'
  },
  outpagetap:function(e){
    wx.navigateBack({
      delta: 0,
    })
  },
  paperTap:function (e) {
  console.log(e.currentTarget.dataset.id)
   let paper_id =  e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../pubuliu/paper/paper?paper_id='+paper_id
    })
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function(params)  {
    let that = this
    // 获取对应的数据
    const c = db.collection("article").where({menu_id:"8f75309d6273968701707473701ad57e"}); //获取集合中记录的总数
    const total = await (await c.count()).total
    const batchTimes = Math.ceil(total / 20)
    console.log(batchTimes) //计算需要获取几次  比如你有36条数据就要获取两次 第一次20条第二次16条
    let arraypro = [] // 定义空数组 用来存储每一次获取到的记录 

    let x = 0 //这是一个标识每次循环就+1 当x等于batchTimes 说明已经到了最后一次获取数据的时候
    //没错，循环查询，看着就觉得很影响性能，但是么的办法。
    for (let i = 0; i < batchTimes; i++) {
    //分组获取
      c.skip(i * 20).get({
        success: function (res) {
          x += 1
          // 20个20个的获取 最后一次不够20 那就是剩下的
          for (let j = 0; j < res.data.length; j++) {
            arraypro.push(res.data[j])
          }
          //判断是否是最后一次，如果是说明已经不用再继续获取了，这时候就可以赋值了
          if (x == batchTimes) {
            // console.log(arraypro)
            that.setData({
              article: arraypro
            })
            console.log(that.data.article)
          }
        }
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