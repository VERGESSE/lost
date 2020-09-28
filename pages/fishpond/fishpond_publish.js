let app = getApp();
Page({
  data: {
    faceImage: [],
    nickname: '',
    talk: '',
    id: '',
    ig: 0,
    sucimgNum: 0,
    imgList: [],
  },
  onShow: function (options) {
    this.setData({
      nickname: app.globalData.user.nickname,
      faceImage: app.globalData.user.faceImageSmall,
      id: app.globalData.user.studentId
    })
    // console.log(app.globalData.user)
  },
  onLoad: function (options) {
    var that = this
    wx.request({
      url: app.tokenUrl,
      method: "GET",
      header: { 
        'lost': app.globalData.user.token
      },
      success: function (res) {
        app.globalData.access_token = res.data;
      }
    })
  },
  input: function (e) {
    this.setData({
      talk: e.detail.value
    })
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  //图片查看
  ChooseImage() {
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  //选择图片
  DelImg(e) {
    wx.showModal({
      title: '客官',
      content: '确定要删除这张照片吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  //删除图片
  send: function () {
    var that = this;
    var user_id = that.data.id
    wx.showToast({
      title: '正在上传',
      duration: 33000,
      icon: 'loading',
      mask: true,
    })
    that.img_upload();
  },
  //发布按钮事件
  img_upload: function () {
    let img_url = this.data.imgList;
    let img_url_ok = [];
    //由于图片只能一张一张地上传，所以用循环
    // console.log(img_url.length);
    if (img_url.length === 0) {
      this.uploadFish(this);
    } else {
      this.uploadFileList(img_url, 0, this)
    }
  },
    //图片上传
  uploadFileList: function(fileList, index, that){
    var studentId = app.globalData.user.studentId;
    wx.uploadFile({
      url: app.imgUrl + app.globalData.access_token,
      method: 'POST',
      filePath: fileList[index],
      name: "media",
      formData: {},
      success: function (res) {
        if (res.data.slice(11, 16) !== "87014") {
          wx.uploadFile({
            url: app.serverUrl + 'fish/addFishImg',
            header: { 'lost': app.globalData.user.token },
            filePath: fileList[index],
            method: "POST",
            name: 'image',
            formData: {
              studentId: studentId
            },
            success: function (res) {
              if (res.statusCode === 200) {
                if (index + 1 === fileList.length) {
                  that.uploadFish(that)
                } else {
                  that.uploadFileList(fileList, index + 1, that)
                }
              } else {
                that.setData({
                  imgList: []
                })
                wx.showToast({
                  title: "上传失败，请重试！",
                  duration: 3000,
                  icon: 'none',
                })
              }
            }
          })
        } else {
          wx.hideToast();
          wx.showToast({
            title: '内容不合法',
            duration: 3000,
            icon: 'none',
          })
        }
      }
    })
  },
  uploadFish: function(that){
    var studentId = app.globalData.user.studentId;
    var talk = that.data.talk;
    wx.request({
      url: app.textUrl + app.globalData.access_token,
      method: 'POST',
      data: {
        content: talk
      },
      success: function (res) {
        //当content内含有敏感信息，则返回87014
        if (res.data.errcode !== 87014) {
          wx.request({
            url: app.serverUrl + 'fish/addFish',
            header: { 'lost': app.globalData.user.token },
            method: "GET",
            data: {
              studentId: studentId,
              talk: talk,
            },
            success: function (res) {
              if (res.statusCode == 201) {
                wx.hideToast();
                wx.showModal({
                  title: '发布成功',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.navigateBack({})
                    }
                  }
                })
              } else {
                wx.hideToast();
                wx.showToast({
                  title: res.data.message,
                  duration: 3000,
                  icon: 'none',
                })
              }
            }
          })
        } else {
          wx.hideToast();
          wx.showToast({
            title: '内容不合法',
            duration: 3000,
            icon: 'none',
          })
        }
      } 
    })
  }
})