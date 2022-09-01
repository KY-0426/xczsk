// pages/my/sign-up/sign-up.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateSignUp: true,
    animationMain: null, //正面
    animationBack: null, //背面
    dayStyle: [{
        month: 'current',
        day: new Date().getDate(),
        color: 'white',
        background: '#8ad9d6'
      },
      {
        month: 'current',
        day: new Date().getDate(),
        color: 'white',
        background: '#1cbcb4'
      }
    ],
    text: [{
      value: "1.开发小程序"
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    let d = new Date()
    // 获取现在时间
    var days = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    var months = [
      "一月", "二月", "三月", "四月", "五月", "六月",
      "七月", "八月", "九月", "十月", "十一月", "十二月"
    ];
    var img = [
      "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E6%97%A5.png?sign=9c6523498e603dc256f40fe58192b5ca&t=1653275384", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E4%B8%80.png?sign=a8dba09c0c016291ac51faf8f5c7f4dd&t=1653275405", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E4%BA%8C.png?sign=4b8dd1f1a6147c61080102ba76741252&t=1653275412", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E4%B8%89.png?sign=f7efac63a19051dfa73b03021a2e8dbc&t=1653275423", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E5%9B%9B.png?sign=25af684decb1032c55bf39ea4d76b747&t=1653275435", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E4%BA%94.png?sign=94c437c033bac4bdf5d0052759de8d39&t=1653275441", "https://636c-cloud1-6g8xdvmffa0e841f-1309493752.tcb.qcloud.la/images/%E6%98%9F%E6%9C%9F%E5%85%AD.png?sign=c7e9245f06f6a5dbc3b96aba247aaed3&t=1653275452"
    ];
    that.setData({
      year: d.getFullYear(),
      date: d.getDate(),
      month: months[d.getMonth()],
      months: d.getMonth() + 1,
      daysImg: img[d.getDay()],
      day: days[d.getDay()]
    })

    // 获取缓存 如果有  没有则新建 
    let nowdate = d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString()
    let dakadate = wx.getStorageSync('dakadate') // 缓存日期

    if (dakadate) {
      //console.log("缓存有值")
      let dakadateone = dakadate[nowdate] //缓存中今天是否打卡
      that.setData({
        dateSignUp: !dakadateone
      })
    } else {
      //console.log("没有缓存")
      let dakadate = {}
      dakadate[nowdate] = false
      wx.setStorageSync('dakadate', dakadate)
    }
    // let num =  this.getDiffDay('2020-2-6', '2020-2-2')  
    // console.log(num)
  },
  bindKeyInput: function (e) {
    let textid = e.currentTarget.dataset.id
    let text1 = this.data.text
    text1[textid].value = e.detail.value
    this.setData({
      text1: text1
    })
    //console.log(e)
  },
  addtextTap(e) {
    let that = this
    let text = that.data.text
    if (text) {
      let value = {}
      value["value"] = ""
      text.push(value)
      that.setData({
        text: text
      })
    } else {
      that.setData({
        text: [{
          value: "新建便签"
        }]
      })
    }


  },
  deletetextTap(e) {
    let text = this.data.text
    let id = text.length
    if (id == 0) {
      return
    }
    text.pop(id)
    this.setData({
      text: text
    })
  },
  rotateFn(e) {
    var id = e.currentTarget.dataset.id
    this.animation_main = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear'
    })
    this.animation_back = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear'
    })
    // 点击正面

    if (id == 1) {
      this.animation_main.rotateY(180).step()
      this.animation_back.rotateY(0).step()
      this.setData({
        animationMain: this.animation_main.export(),
        animationBack: this.animation_back.export(),
      })
      //点击打卡 不显示按钮 设置缓存今日为true
      let that = this
      let d = new Date()
      let daka = that.data.dateSignUp
      let dakadate = wx.getStorageSync('dakadate') // 缓存日期
      let nowdate = d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString()
      if (daka) {
        dakadate[nowdate] = true
        //更新缓存数据
        wx.setStorageSync('dakadate', dakadate)
        wx.getStorage({
          key: 'openId',
          success(res) {
            console.log(res.data)
            let openid = res.data
            db.collection("t_user").where({
              _openid: openid
            }).update({
              data: {
                date_num: db.command.inc(1)
              }
            }).then(res => {
              console.log("打卡成功", res)
              that.setData({
                dateSignUp: false
              })
              db.collection('t_user').where({
                _openid: openid
              }).field({
                date_num: true
              }).get({
                success: (res) => {
                  console.log(res)
                  that.setData({
                    date_num: res.data[0].date_num
                  })
                }
              })
            })
          }
        })
      }

    }
    // // 点击背面
    // else {
    //   this.animation_main.rotateY(0).step()
    //   this.animation_back.rotateY(-180).step()
    //   this.setData({
    //     animationMain: this.animation_main.export(),
    //     animationBack: this.animation_back.export(),
    //   })
    // }
  },
  showb1() {
    this.setData({
      styleA: 'transform:rotateY(180deg)',
      styleB: 'transform:rotateY(0deg)'
    })
  },
  showb2() {
    this.setData({
      styleA: 'transform:rotateY(0deg)',
      styleB: 'transform:rotateY(-180deg)'
    })
  },
  //监听点击下个月事件
  next: function (event) {
    console.log(event.detail);
  },
  //监听点击上个月事件
  prev: function (event) {
    console.log(event.detail);
  },
  // 监听点击日历标题日期选择器事件
  dateChange: function (event) {
    console.log(event.detail);
  },
  //监听点击日历具体某一天的事件
  dayClick: function (event) {
    console.log(event.detail);
    let clickDay = event.detail.day;
    let changeBgColor = `dayStyle[0].color`;
    let changeBg = `dayStyle[0].background`;
    let changeDay = `dayStyle[1].day`;
    let changeEndBg = `dayStyle[1].background`;

    this.setData({
      [changeDay]: clickDay,
      [changeBg]: "white",
      [changeBgColor]: "#1cbbb4",
      [changeEndBg]: "#AAD4F5"
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
    //获取便签数据
    let text = wx.getStorageSync('text')
    this.setData({
      text: text
    })
    let that = this
    //获取打卡天数
    wx.getStorage({
      key: 'dakadate',
      success(res) {
        let dakadate = res.data
        let dakadate_num = 0
        for (let i = 0; i < Object.values(dakadate).length; i++) {
          if (Object.values(dakadate)[i] == true) {
            dakadate_num += 1
            that.setData({
              date_num: dakadate_num
            })
          }
        }
      }
    })
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
    console.log("页面关闭")
    // 把便签的数据放入缓存
    let values = this.data.text
    try {
      wx.setStorageSync('text', values)
    } catch (e) {}
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