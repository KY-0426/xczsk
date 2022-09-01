// pages/course/course.js
const app = getApp();
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom
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
    // 查询课程菜单
    db.collection('course_menu').get({
      success: res => {
        console.log("课程菜单获取成功",res.data)
        let result = res.data
        this.setData({
          courseList: result
        })
      }
    })
    // "优选课程"
    db.collection('course').where({
      course_menu: "058dfefe62971f9906aea33c18b4383b"
    }).get({
      success: res => {
        console.log("优选课程获取成功",res.data)
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
                courseList1: course
              })
            }
          })
         
        }
      }
    })
    // "精选课程"
    db.collection('course').where({
      course_menu:"6d85a2b9629ca07408dca3083637c109"
    }).get({
      success: res => {
        console.log("精选课程获取成功",res.data)
        let course = res.data
        for (let i = 0; i < course.length; i++) {
          let menu_id = course[i].course_menu
          let course_id =  course[i]._id
          db.collection('teacher').where({
            course_id: course_id
          }).get({
            success: res => {
              console.log("获取教师成功",res.data)
              course[i].course_teacher = res.data
            }
          })
          db.collection('courseOrder').where({
            course_id:course_id
          }).get({
            success:res=>{
              //console.log(res.data)
              course[i].order_num = res.data.length
            }
          })
          db.collection('course_content').where({
            course_id:course_id
          }).get({
            success:res=>{
              //console.log(res.data)
              course[i].course_content_num = res.data.length
            }
          })
          db.collection('course_menu').where({
            _id: menu_id[0]
          }).field({
            menu_name: true
          }).get({
            success: res => {
              course[i].menu_name = res.data[0].menu_name
              console.log(course)
              // courseList2.push(course)
              setTimeout(function (params) {
                that.setData({
                courseList2: course
              })
              },500)
              
            }
          })
        }
      }
    })

  },
  onIncourseTap(e) {
    console.log("课程菜单id：", e.currentTarget.dataset.index)
    wx.navigateTo({
      url: '../course/courseList/courseList?id=' + e.currentTarget.dataset.index
    })
  },
  oncoursepaperTap(e) {
    wx.navigateTo({
      url: '../course/paper/paper?id=' + e.currentTarget.dataset.id
    })
  },
  onSearchBoxTap(e){
    wx.navigateTo({
      url: '../course/serchCourse/serchCourse',
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