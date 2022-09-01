const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    load: true
  },
  onLoad() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let list = [{}]
    let that = this

    db.collection('course_menu').get({
      success: res => {
         console.log(res.data)
        let result = res.data
        for (let i = 0; i < result.length; i++) {
          list[i] = {};
          list[i].id = i;
          list[i].name = result[i].menu_name
          list[i].menu_id = result[i]._id
          //console.log("list", list)
          db.collection('course').where({
            course_menu: list[i].menu_id
          }).field({
            course_icon: true,
            course_name: true,
            course_content:true,
            _id: true
          }).get({
            success: res => {
              //console.log(res.data)
              list[i].course = res.data
              console.log("list:", list)
              that.setData({
                list: list,
                listCur: list[0]
              })
            }
          })
        } 
      }
    })
    db.collection('more').doc('1').get({
      success:res=>{
        let imgList = []
        let imgId = res.data.course_swiper_img
        for (let i = 0; i < imgId.length; i++) {
          db.collection('course').doc(imgId[i]).get({
            success:res=>{
              //console.log(res.data.course_icon)
              imgList[i] = {};
              imgList[i].src = res.data.course_icon
              imgList[i].id = res.data._id
              //console.log(imgList)
              that.setData({
                imgList:imgList
              })
            }
          })
          
        }
      }
    })

  },
  onReady() {
    wx.hideLoading()
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          if (data) {
            tabHeight = tabHeight + data.height;
          }
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  oncoursepaperTap(e) {
    wx.navigateTo({
      url: '../paper/paper?id=' + e.currentTarget.dataset.id
    })
  },
})