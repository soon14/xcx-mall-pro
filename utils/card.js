const util = require('./util.js');
const qianbao = require('../config/qianbao.js');
const auth = require('../services/auth.js');

const app = getApp()

function getCard() {
  return util.request(qianbao.Url_Cards).then(res => {
    if (res.code === 0) {
      app.card = res.data
      if (res.data.length > 0) {
        return getUserCards()
      } else {
        return {
          cards: res.data,
          userCard: false
        }
      }
    } else {
      throw new Error('获取会员卡错误');
    }
  }).then((data) => {
    if (data) {
      return data
    }
  })
}

function getUserCards() {
  const userId = auth.getUserInfo().user.id;
  const cardId = app.card[0].wx.cardId;
  const _this = this;
  const { card: cards } = app
  return util.request(`${qianbao.Url_AppUsers}?userId=${userId}&cardId=${cardId}&pageNum=1&pageSize=20`).then((res) => {
    if (res.cord === 0 && data.data.cards.length > 0) {
      data.data.cards.forEach(card => {
        if (cards[0].code == card.code) {
          app.cardCode = card.realCode
        }
      })
      return ({
        cards,
      })
    } else {
      return ({
        cards,
      })
    }
  })
}

function cardsCallReceive(cardId) {
  return util.request(qianbao.Url_CardsCallReceive + "?cardId=" + cardId, { cardId }, "POST").then(function (res) {
    if (res.code === 0) {
      return res.data
    } else {
      throw new Error('签名错误');
    }
  })
}

function addCard(cardId) {
  wx.showLoading({ mask: true })
  cardsCallReceive(cardId).then(function (res) {
    if (res) {
      wx.addCard({
        cardList: [
          {
            cardId,
            cardExt: `{"timestamp": "${res.timestamp}","signature":"${res.signature}","nonce_str":"${res.nonceStr}","outer_str":"${res.outerStr}"}`
          }
        ],
        success: function (res) {
          console.log("cardInfo", cardInfo)
          const cardInfo = res.cardList[0]
          callBack(cardInfo).then((data) => {
            app.cardCode = data
            wx.hideLoading();
          })
        },
        fail: function (err) {
          console.log('err', err)
          app.cardCode = false
          wx.hideLoading();
        }
      })
    }
  }).catch((error) => {
    wx.hideLoading();
    console.log('发生错误！', error);
  })
}
function callBack(cardInfo) {
  const _this = this
  return util.request(qianbao.Url_UserCards, {
    "cardId": _this.data.card[0].wx.cardId,
    "encryptCode": cardInfo.code,
  }, "POST").then(function (res) {
    if (res.code == '0') {
      return res.data.realCode
    } else {
      return false
    }
  });
}

function openCard(cardId, code) {
  wx.openCard({
    cardList: [
      {
        cardId,
        code
      },
    ]
  })
}
module.exports = {
  getCard,
  addCard,
  openCard
}