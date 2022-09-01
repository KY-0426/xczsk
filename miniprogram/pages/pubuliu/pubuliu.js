Page({
  data: {
    item: {},
    msg1: 'pubuliu',
    noramalData: []
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const db = wx.cloud.database();
    db.collection('article').where({
        menu_id: '8f75309d6273997d0170b585113ca52d'
      })
      .get({
        success: (res) => {
          // res.data 是包含以上定义的两条记录的数组
          // console.log(this);
          this.setData({
            noramalData: res.data
          })
        }
      })
  },
  paperTap: function (e) {
    //  console.log(e.currentTarget.dataset.id)
    let paper_id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../pubuliu/paper/paper?paper_id=' + paper_id
    })
  },

})
