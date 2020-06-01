let app = getApp();
Page({
  data: {
    list: [],
    maxtime: '',
    loadingHidden: false,
    faceImage: [],
    nickname: '',
    newsdata: [],
    images: [],
    id: '',
    index: '',
    imgs: [],
    page: 0,
    str:''
  },
  onShareAppMessage: function (res) {
    return {
      title: '河工大失物招领平台',
      path: '/pages/shiwuzhanshi',
      success: function (res) {
        //转发成功
      },
      fail: function (res) {
        //转发失败
      }
    }
  },
  onLoad: function (options) {
    wx.stopPullDownRefresh();
    this.setData({
      nickname: app.globalData.user.nickname,
      faceImage: app.globalData.user.faceImage,
      page: 0
    })
    var that = this;
    wx.request({
      url: app.serverUrl+'queryFishes',
      data: {
      },
      success: function (res) {
        that.setData({
          newsdata: res.data
        });
      },
    })
  },
  onPullDownRefresh: function () {
    this.onLoad();
  },
  onReachBottom: function () {
    console.log("用户拉到底部");
    var that = this;
    wx.showLoading({
      title: '拼命加载中',
    })
    let page = this.data.page + 1;
    wx.request({
      url: app.serverUrl+'queryFishes', //此处要加page页 
      data: {
        page: page
      },
      success: function (res) {
        if (res.data.length === 0) {
          wx.showToast({
            title: '-- 我是有底线的 --',
            duration: 1000,
            icon: 'none',
            mask: true,
          })
          return;
        }
        let newsdata = that.data.newsdata.concat(res.data);
        that.setData({
          newsdata: newsdata,
          page: page
        });
      },
      fail: function (res) {
        that.setData({
          bottomTitle: true,
          title: '-- 我是有底线的 --'
        })
      }
    })
    wx.hideLoading();
  },
  liujiayu: function () {
    wx.navigateTo({
      url: '/pages/fishpond/fishpond_publish',
    })
  },
  previewImg: function (e) {
    this.setData({
      str: e.currentTarget.dataset.id.slice(0, -12)
    })
    wx.previewImage({
      current: e.currentTarget.dataset.id,
      urls: this.data.str.concat('.png').split()
    })
  },
})