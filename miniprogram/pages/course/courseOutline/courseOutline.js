// pages/course/courseOutline/courseOutline.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabcurlist: [{
        name: '推荐'
      },
      {
        name: '课程大纲'
      },
    ],
    TabCur: 1,
    scrollLeft: 0
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    console.log(e.currentTarget.dataset.id)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    console.log(options.id)
    this.setData({
      id: options.id
    })
    //获取当前视频
    db.collection('course_content').where({
      _id: options.id
    }).get({
      success: res => {
        console.log("当前视频", res.data)
        that.setData({
          contentOne: res.data[0]
        })
        //获取所有课程大纲
        let course_id = res.data[0].course_id
        //获取大纲
        db.collection('course_content').where({
          course_id: course_id
        }).get({
          success: res => {
            console.log("大纲前三个", res.data)
            that.setData({
              contentList: res.data
            })
          }
        })
      }
    })
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    let courseOk = prevPage.data.CourseOK
    this.setData({
      CourseOK: courseOk
    })
  },
  onOpenOutlineTap(e) {
    let that = this
    console.log(e.currentTarget.dataset.id)
    let id = e.currentTarget.dataset.id
    db.collection('course_content').where({
      _id: id
    }).get({
      success: res => {
        console.log("当前视频", res.data)
        that.setData({
          contentOne: res.data[0]
        })
      }
    })
  },
  onOpenOutlineNOTap(e) {
    wx.showToast({
      title: '报名后即可观看',
      icon: 'error',
      duration: 2000
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
    // 获取自动播放
    db.collection('more').doc('1').get({
      success: res => {
        this.setData({
          autoplay: res.data.autoplay
        })
      }
    })
    let that =this
     // 给上一个页面传值
     let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    
     let prevPage = pages[pages.length - 2];

     //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
     let menu_id =  prevPage.data.course.course_menu[0]

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