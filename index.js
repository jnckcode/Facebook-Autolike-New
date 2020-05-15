const fetch = require('node-fetch')
const moment = require('moment')
const cron = require('node-cron')
require('colors')

let ACCESS_TOKEN = '';
let LIMIT_FETCH = 20;

const getFriendPost = () => new Promise((resolve, reject) => {
  try {
    fetch(`https://graph.facebook.com/v2.1/me/home?fields=id,from,type,message&limit=${LIMIT_FETCH}}&access_token=${ACCESS_TOKEN}`)
    .then(res => res.json())
    .then(result => {
      if (result.error) {
        resolve({ status: false, message: result.error.message })
      } else {
        resolve({ status: true, message: result.data })
      }
    })
  } catch(error) {
    reject(error)
  }
})

const postLikeStatus = (POST_ID) => new Promise((resolve, reject) => {
  try {
    fetch(`https://graph.facebook.com/v2.1/${POST_ID}/likes?method=POST&access_token=${ACCESS_TOKEN}`)
    .then(res => res.text())
    .then(result => resolve(result))
  } catch(e) {
    reject(e)
  }
})

;(async () => {
  try {
    console.log(`.. [${moment().format('HH:MM:SS')}] Cron is running every 15 minutes...`.cyan)
    cron.schedule('*/5 * * * *', async function() {
      let resGFP = await getFriendPost()
      if (resGFP.status) {
        resGFP.message.forEach(async function(element) {
          let resPLS = await postLikeStatus(element.id)
          if (JSON.parse(resPLS).success) {
            console.log(`.. [${moment().format('HH:MM:SS')}] ${`Success`.green} like "${element.type}" -> ${element.message ? `${element.message.substr(20).replace(/\r?\n|\r/g, '')}...` : 'No caption'}`)
          } else {
            console.log(`.. [${moment().format('HH:MM:SS')}] ${`Failed`.red} like "${element.type}" -> ${element.message ? `${element.message.substr(20).replace(/\r?\n|\r/g, '')}...` : 'No caption'}`)
          }
        })
      } else {
        console.log(`[ERR] Message : ${resGFP.message}`.red)
      }
    })
  } catch(e) {
    console.log(e)
  }
})()