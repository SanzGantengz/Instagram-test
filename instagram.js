const puppeteer = require("puppeteer");
const fs = require("fs");
const selector = {
  login: {
    username: "input[type=text]",
    password: "input[type=password]",
    submit: "button[type=submit]"
  },
  acsess: {
    verify: {
      code: "//button[text() = 'Send Security Code']",
      submit: "//button[text() = 'Submit']",
      type: "input[name=security_code]",
      timeout: 2000
    }
  },
  follow: {
    selector: "//button[text() =  'Follow']",
    timeout: 1000
  },
  message: {
    TYPE_AND_SEND: "svg[aria-label=Messenger]",
    send: "\u000d"
  }
}
function Client(options, page)
{
  new Promise(async() => {
  this._options = options;
  this.OPTIONS_PUPPETEER = this._options.launch;
  this.PATH_SESSION = this._options.PATH_SESSION = process.cwd() + "/INSTAGRAM_LOGIN.json";
  this._username;
  this._password;
  this.browser;
  this.page;
  })
}

Client.prototype.login = function login(username, password, code)
{
  new Promise(async(resolve) => {
    try {
    this._username = username;
    this._password = password;
    this.browser = await puppeteer.launch(this.OPTIONS_PUPPETEER)
    this.page = await this.browser.newPage()
    if (!fs.existsSync(this.PATH_SESSION))
    {
      await this.page.goto(
      "https://www.instagram.com/accounts/login/"
      )
      console.log("session no detect")
      await this.page.waitForSelector(selector.login.username)
      await this.page.type(selector.login.username, username)
      await this.page.type(selector.login.password, password)
      await this.page.click(selector.login.submit)
      await this.page.waitForTimeout(3000)
      let[verify] = await this.page.$x(selector.acsess.verify.code)
      if (verify || code)
      {
        await this.page.screenshot({ path: "code.png" })
        await verify.click()
        await this.page.waitForSelector(selector.acsess.verify.type)
        await this.page.type(selector.acsess.verify.type, code);
        await this.page.click(selector.acsess.verify.submit)
        await this.page.waitForTimeout(selector.acsess.verify.timeout)
      } else {
        let cookie = await this.page.cookies();
        fs.writeFileSync(this.PATH_SESSION, JSON.stringify(cookie))
        console.log("login suscess")
      }
    } else {
      try {
        let cookie = JSON.parse(fs.readFileSync(this.PATH_SESSION));
        console.log("setting cookies: " + cookie.length)
        for (let i = 0; i <cookie.length; i++)
        {
          await this.page.setCookie(cookie[i])
        }
        console.log("set cookie suscess")
        await this.page.goto(
          "https://www.instagram.com/"
          )
        await this.page.screenshot({ path: "login.png" })
          console.log("login suscess")
      } catch (e) {
        console.log(e)
      }
    }
    } catch (e) {
      console.log(e)
    }
  })
}

Client.prototype.follow = function follow(username)
{
  new Promise(async(resolve, reject) => {
    if (typeof username !== "string"){
      reject(new Error(username + " not a string"))
    } else {
      try {
        if (fs.existsSync(this.PATH_SESSION))
        {
        let cookie = JSON.parse(fs.readFileSync(this.PATH_SESSION));
        for (let i = 0; i <cookie.length; i++)
          {
            await this.page.setCookie(cookie[i])
          }
          await this.page.goto(
            "https://www.instagram.com/" + username
            )
            await this.page.waitForTimeout(selector.follow.timeout);
            let[follow] = await this.page.$x(selector.follow.selector)
            if (follow)
            {
              await follow.click()
              var pp_url = await this.page.evaluate(() => {
                return document.querySelector("img").src
              })
              resolve({
                status: 200,
                title: this.page.title(),
                pp_url
              })
            }
            else {
              reject({
                status: false,
                message: {
                  error: undefined
                }
              })
            }
        }
        else {
          try{
        login(this._username, this._password)
      }catch(e){
        console.log(e)
        }
        }
    } catch (e) {
      console.log(e)
      return e.message
    }
    }
  })
}
Client.prototype.actifity = function actifity()
{
  new Promise(async(resolve, reject) => {
    if (fs.existsSync(this.PATH_SESSION))
    {
      try {
        await this.page.goto(
        "https://www.instagram.com/accounts/activity/"
          )
          /*resolve({
            status: true,
            message: {
              message: "soon",
              image: {
                path: "actifity.png",
                buffer: this.page.screenshot({ path: "actifity.png" })
              }
            }
          })*/
        this.page.screenshot({ path: "actifity.png" })
      } 
      catch (e) {
        reject(e)
      }
    } 
    else {
     await login(this._username, this._password)
    }
  })
}
Client.prototype.dm = function dm(USERNAME_OR_ID, message, type)
{
  if (!USERNAME_OR_ID) reject(new Error("invalid username or id"))
  if (!message) reject(new Error("no message"))
if (!type) reject(new Error("no type"))
  new Promise(async(resolve, reject) => {
    if (fs.existsSync(this.PATH_SESSION))
    {
      try {
        
        this.login(this._username, this._password)
        let cookie = JSON.parse(fs.readFileSync(this.PATH_SESSION));
        for (let i = 0; i <cookie.length; i++)
        {
          this.browser = await puppeteer.launch(this.OPTIONS_PUPPETEER)
          this.page = await this.browser.newPage()
          await this.page.setCookie(cookie[i])
        }
        await this.page.goto(
          "https://www.instagram.com/" + USERNAME_OR_ID
          )
        let[dm]=await this.page.$x(selector.dm.messager)
        if (dm){
          await dm.click()
        }
          if (type === "text")
          {
            await page.type(selector.message.TYPE_AND_SEND, message)
           await page.type(selector.message.TYPE_AND_SEND, selector.message.send)
          } else if (type === "media")
          {
            reject("blom jadi")
          }
        await this.page.screenshot({ path: "dm.png" })
        console.log("dm to " + USERNAME_OR_ID + " suscess")
      } catch (e) {
        reject(e)
      }
    } else {
      try{
        this.login(this._username, this._password)
      }catch(e){
        console.log(e)
      }
    }
  })
}


exports.Client = function client(options){
  try {
    return new Client(options)
  } catch (e) {
    console.log(e)
  }
  }
