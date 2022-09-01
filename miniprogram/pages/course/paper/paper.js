// pages/course/paper/paper.js
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
  onOpenstudioTap(e) {
    console.log(e.currentTarget.dataset.id)
    let id = e.currentTarget.dataset.id
    let id2 = this.data.contentList[0]._id
    console.log(id2)
    if (id == id2) {
      wx.navigateTo({
        url: '../courseOutline/courseOutline?id=' + id
      })
    } else {
      wx.showToast({
        title: '报名后即可观看',
        icon: 'error',
        duration: 2000
      })
    }
  },
  onOpenstudioOKTap(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../courseOutline/courseOutline?id=' + id
    })
  },
  onLoad(options) {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let id = options.id
    this.setData({
      id: id
    })
    db.collection('course').where({
      _id: id
    }).get({
      success: res => {
        console.log("课程详情获取成功", res.data)
        let course = res.data[0]
        let menu_id = course.course_menu[0]
        db.collection('course_menu').where({
          _id: menu_id
        }).field({
          menu_name: true
        }).get({
          success: res => {
            course.menu_name = res.data[0].menu_name
            that.setData({
              course: course
            })
          }
        })

      }
    })
    //获取大纲
    db.collection('course_content').where({
      course_id: id
    }).get({
      success: res => {
        console.log("大纲前三个", res.data)
        this.setData({
          contentList: res.data
        })
      }
    })
    db.collection('teacher').where({
      course_id: id
    }).get({
      success: res => {
        console.log("获取教师成功", res.data)
        this.setData({
          course_teacher: res.data
        })
      }
    })


    let openid = wx.getStorageSync('openId')
    db.collection('courseOrder').where({
      _openid: openid,
      course_id: id
    }).get({
      success: res => {
        if (res.data[0]) {
          that.setData({
            CourseOK: true
          })
          CollectionCourse[id] = true;
          wx.setStorageSync('CollectionCourse', CollectionCourse);
        } else {
          that.setData({
            CourseOK: false
          })
          CollectionCourse[id] = false;
          wx.setStorageSync('CollectionCourse', CollectionCourse);
        }
      }
    })
  },
  onshoucangTap: function (e) {
    let that = this
    that.setData({
      shoucangCourseOK: !that.data.shoucangCourseOK
    })
    // 拿到缓存
    var collection_OK2 = wx.getStorageSync('CollectionCourse');
    // 拿到此id的值
    let post_id = that.data.course._id
    let onecollection_OK = collection_OK2[post_id]
    // 取反
    onecollection_OK = !onecollection_OK
    collection_OK2[post_id] = onecollection_OK
    // 更新缓存值
    wx.setStorageSync('CollectionCourse', collection_OK2)
    // 切换图片
    that.setData({
      shoucangCourseOK: onecollection_OK
    })
    wx.showToast({
      title: onecollection_OK ? '收藏成功' : '取消成功',
      duration: 800,
      icon: 'success'
    })
  },
  showModal(e) {
    let that = this

    // 获取缓存 没有登录获取登录
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo == "") {
      console.log("No")
      //没有登录 模态框提示
      wx.showModal({
        title: '提示',
        content: '报名需要登录',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '../../my/my',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })

    } else {
      console.log('yes')
      that.setData({
        modalName: e.currentTarget.dataset.target,
        inputshow: "block"
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: null,
      inputshow: "none"
    })
  },
  onOKDingdanTap(e) {
    let that = this
    var CourseRegistration1 = wx.getStorageSync('CourseRegistration');
    let id = that.data.course._id
    let CourseOK = CourseRegistration1[id]
    CourseOK = true
    CourseRegistration1[id] = CourseOK
    wx.setStorageSync('CourseRegistration', CourseRegistration1)
    that.setData({
      CourseOK: true
    })
    wx.showToast({
      title: '报名成功',
      duration: 800,
      icon: 'success'
    })
    if (CourseOK) {
      // 报名成功
      // 生成订单号
      let c = new Date().valueOf().toString();
      let i = (Math.random() * 100000 + 10).toFixed(0).toString()
      let order_num = i + c
      // 获取 openid 和课程id course_id=id
      let _openid = wx.getStorageSync('openId')
      let order_date = new Date().toLocaleString()
      console.log("订单号：", order_num)
      console.log("openid：", _openid)
      console.log("课程id:", id)
      console.log("订单时间:", order_date)
      db.collection('courseOrder').add({
        data: {
          order_num: order_num,
          _openid: _openid,
          course_id: id,
          order_date: order_date
        },
        success: function (res) {
          console.log("添加订单成功", res)
          that.setData({
            modalName: null,
            inputshow: "none"
          })
        }
      })
    }

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
    let id = this.data.id
    var CollectionCourse1 = wx.getStorageSync('CollectionCourse');
    if (CollectionCourse1) {
      var shoucCourseOK = CollectionCourse1[id]
      console.log(shoucCourseOK)
      this.setData({
        shoucangCourseOK: shoucCourseOK
      })
    } else {
      var CollectionCourse1 = {}
      CollectionCourse1[id] = false;
      wx.setStorageSync('CollectionCourse', CollectionCourse1);
    }
    // 获取缓存是否报名
    var CourseRegistration = wx.getStorageSync('CourseRegistration');
    if (CourseRegistration) {
      var CourseOK = CourseRegistration[id]
      this.setData({
        CourseOK: CourseOK
      })
    } else {
      var CourseRegistration = {}
      CourseRegistration[id] = false;
      wx.setStorageSync('CourseRegistration', CourseRegistration);
    }

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