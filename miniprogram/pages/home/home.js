const db = wx.cloud.database()
const app = getApp();
Page({
  data: {
    CustomBar: app.globalData.CustomBar,
    menus: [],
    cardCur: 0,
    swiperList: [],
    huan_num:0,
  },
  paperTap: function (e) {
    //  console.log(e.currentTarget.dataset.id)
    let paper_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../pubuliu/paper/paper?paper_id=' + paper_id
    })
  },
  //跳转搜索页面
  onSearchBoxTap() {
    wx.navigateTo({
      url: '../SearchBox/SearchBox',
    })
  },
  tiaozhuanwenzhangTap() {
    console.log("ddd")
  },
  getSimpleText(html) {
    var re1 = new RegExp("<.+?>", "g"); //匹配html标签的正则表达式，"g"是搜索匹配多个符合的内容
    var msg = html.replace(re1, ''); //执行替换成空字符
    return msg;
  },
  onLoad:async function(params)  {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let that = this
    //获取轮播图
    db.collection('slideshow').get({
      success(res) {
        //  console.log(res.data)
        that.setData({
          swiperList: res.data
        })
        // 初始化towerSwiper 传已有的数组名即可
      }
    })
    this.towerSwiper('swiperList');

    // 获取菜单
    db.collection('t_menu').get({
      success(res) {
        //  console.log(res.data)
        that.setData({
          menus: res.data
        })
      }
    })
    const c = db.collection("article").where({menu_id:"16db756f627cdda80259f01b6410b026"}); //获取集合中记录的总数
    const total = await (await c.count()).total
    const batchTimes = Math.ceil(total / 2)
    console.log(batchTimes) //计算需要获取几次  比如你有36条数据就要获取两次 第一次20条第二次16条
    this.addwenzhang(0)
    this.setData({
      batchTimes:batchTimes,
      batchTimes2:batchTimes
    })
  },
  
  addwenzhang(next) {
    let that = this
    //获取推荐文章 recommend article
    db.collection('article').skip(next).limit(2).where({
      menu_id: "16db756f627cdda80259f01b6410b026"
    }).get({
      success(res) {
        // console.log(res)
        if (res.data == "") {
          return
        }
        for (let i = 0; i < res.data.length; i++) {
          const element = res.data[i];
          let contentww = that.getSimpleText(element.content).substring(0, 100)
          element.content = contentww
        }
        that.setData({
          article: res.data
        })
      }
    })
  },
  huanyihuan(){
    let num = this.data.huan_num + 2
    let batchTimes1 = this.data.batchTimes-1
    if (batchTimes1 == 0) {
      this.addwenzhang(num)
      let batchTimes2 = this.data.batchTimes2
      this.setData({
        huan_num:0,
        batchTimes:batchTimes2
      })
     return false
    }
    this.setData({
      huan_num:num,
      batchTimes:batchTimes1
    })
    this.addwenzhang(num)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.hideLoading()
  },

  // 轮播图
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
  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  // cardSwiper
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },
  // 下拉动作
  onPullDownRefresh() {
    console.log("下拉")
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '乡村知识库'
    }
  }

})