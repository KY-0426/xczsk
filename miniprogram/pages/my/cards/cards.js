// pages/my/cards/cards.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  getSimpleText(html){
    var re1 = new RegExp("<.+?>", "g");//匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
    var msg = html.replace(re1, '');//执行替换成空字符
    return msg;
  },
//调用


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    let article=[]
    // 获取缓存 浏览量 收藏量  点赞值;
    let likes_OK = wx.getStorageSync('likes_OK')
    let collection_OK = wx.getStorageSync('collection_OK')
    let visitTotal_num = wx.getStorageSync('visitTotal_num')
    let menu_id = options.storagekey
    console.log(menu_id)
    let menu_name=''
    switch (menu_id) {
      case "likes_OK":
        menu_name = '点赞'
        for (let i = 0; i < Object.keys(likes_OK).length; i++) {
          if (Object.values(likes_OK)[i] == true) {
            let like_id = Object.keys(likes_OK)[i]
            db.collection('article').doc(like_id).field({
              title:true,
              content:true,
              img:true,
              views_num:true,
              comments:true,
              like_num:true
            }).get({
              success:function (res) {
                // console.log(res.data)
                let contentww =  that.getSimpleText(res.data.content).substring(0,100)
                res.data.content = contentww
                article.push(res.data)
                console.log(article)
                that.setData({
                  article:article
                })
              }
            })
          }
        } // 1获取到点赞的文章id , 2循环查id所在表 3查询数据库 4保存到数组中
      break;

      case "collection_OK":
        menu_name = '收藏'
        for (let i = 0; i < Object.keys(collection_OK).length; i++) {
          if (Object.values(collection_OK)[i] == true){
           let collection_id = Object.keys(collection_OK)[i]
            db.collection('article').doc(collection_id).field({
              title:true,
              content:true,
              img:true,
              views_num:true,
              comments:true,
              like_num:true
            }).get({
              success:function (res) {
                // console.log(res.data)
                let contentww =  that.getSimpleText(res.data.content).substring(0,100)
                res.data.content = contentww
                article.push(res.data)
                console.log(article)
                that.setData({
                  article:article
                })
              }
            })
          }
        }

      break;

      case "visitTotal_num":
        menu_name = '看过'
        // keys是id  values是表名 循环获取数据
        for (let i = 0; i < Object.keys(visitTotal_num).length; i++) {
          let visitTotal_id =  Object.keys(visitTotal_num)[i]
          db.collection('article').doc(visitTotal_id).field({
            title:true,
            content:true,
            img:true,
            views_num:true,
            comments:true,
            like_num:true
          }).get({
            success:function (res) {
              // console.log(res.data)
              let contentww =  that.getSimpleText(res.data.content).substring(0,100)
              res.data.content = contentww
              article.push(res.data)
              console.log(article)
              that.setData({
                article:article
              })
            }
          })
        }

      break;
      
    }
    // 设置头部名称
    that.setData({
      menu_name: menu_name
    })

    // TRUE为个数 不是object的长度

  },
  outpagetap: function (e) {
    wx.navigateBack({
      delta: 1,
    })
  },
  paperTap:function (e) {
    console.log(e.currentTarget.dataset.id)
     let paper_id =  e.currentTarget.dataset.id
      wx.navigateTo({
        url: '../../pubuliu/paper/paper?paper_id='+paper_id
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