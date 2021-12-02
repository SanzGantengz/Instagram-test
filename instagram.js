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
function Client(options)
{
  this._options = options;
  this.page = null;
  this.browser = null;
  this.OPTIONS_PUPPETEER = this._options.launch = { args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox" ]};
  this.PATH_SESSION = this._options.PATH_SESSION = process.cwd() + "/INSTAGRAM_LOGIN.json";
}

Client.prototype.login = function login(username, password, code)
{
  new Promise(async(resolve) => {
    try {
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
          reject({
            status: false,
            message: "not logged in yet"
          })
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
          resolve({
            status: true,
            message: {
              message: "soon",
              image: {
                path: "actifity.png",
                buffer: this.page.screenshot({ path: "actifity.png" })
              }
            }
          })
      } 
      catch (e) {
        reject(e)
      }
    } 
    else {
      reject({
        status: false,
        message: "login first"
      })
    }
  })
}
Client.prototype.dm = function dm(USERNAME_OR_ID, message, type)
{
  new Promise(async(resolve, reject) => {
    if (fs.existsSync(this.PATH_SESSION))
    {
      try {
        if (USERNAME_OR_ID) reject(new Error("invalid username or id"))
        let cookie = JSON.parse(fs.readFileSync(this.PATH_SESSION));
        for (let i = 0; i <cookie.length; i++)
        {
          await this.page.setCookie(cookie[i])
        }
        await page.goto(
          "https://www.instagram.com/" + USERNAME_OR_ID
          )
          if (type === "text")
          {
            await page.type(selector.message.TYPE_AND_SEND, message)
           await page.type(selector.message.TYPE_AND_SEND, selector.message.send)
          } else if (type === "media")
          {
            reject("blom jadi")
          }
      } catch (e) {
        reject(e)
      }
    } else {
      reject({
        status: false,
        message: "login first"
      })
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
