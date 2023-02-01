import {
  existsSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  unlinkSync,
} from 'fs'
import agoraParse from './parsers/agora'
import europaliberaParse from './parsers/europalibera'
import jurnaltvParse from './parsers/jurnaltv'
import moldovaorgParse from './parsers/moldovaorg'
import protvParse from './parsers/protv'
import publicaParse from './parsers/publica'
import stirimdParse from './parsers/stirimd'
import tv8Parse from './parsers/tv8'
import unimediaParse from './parsers/unimedia'
import zdgParse from './parsers/zdg'
var Crawler = require('crawler')
import { Bot, NextFunction } from 'grammy'
import Context from '@/models/Context'

import env from '@/helpers/env'
import { downloadFileNews } from '@/handlers/handleReply'

const timeout = 1000 * 60 * 60 //1 hour
let sleeping = false

let firstCrawl = true
export default async function crawlData(
  bot: Context,
  next: NextFunction | undefined
) {
  if (next == undefined || firstCrawl) {
    if (bot.from?.id.toString() == env.ADMIN_ID) {
      firstCrawl = false
      var c = new Crawler({
        rateLimit: 1000,
        retryTimeout: 30000,
        // options: {
        //   userAgent: 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)',
        // },
        callback: async function (error: any, res: any, done: any) {
          sleeping = false
          if (error) {
            console.log(error)
          } else {
            console.log('Executing...')
            let toProcessContent: string[] = []
            let processedContent: string[] = []
            try {
              toProcessContent = bot.dbuser.toprocess // JSON.parse(readFileSync(toProcess).toString())
              processedContent = bot.dbuser.processed //JSON.parse(readFileSync(processed).toString())
            } catch (e) {
              console.log(e)
              // let ind = 0
              // while (existsSync(`accPath${ind}.bak`)) {
              //   ++ind
              // }
              // copyFileSync(toProcess, `accPath${ind}.bak`)
              // unlinkSync(toProcess)
              // writeFileSync(toProcess, '[]')
            }
            let fileDict: Set<string> = new Set(toProcessContent)
            let processedDict: Set<string> = new Set(processedContent)
            // fileDict = new Set([...fileDict, ...new Set(processedContent)])

            let siteContent: string = res.body.toString()
            let merged = fileDict
            let uri: string = res.options.uri.toString()

            if (uri.includes('tv8.md')) {
              let links = await tv8Parse(siteContent)
              if (links) {
                links = new Set(
                  await Promise.all(
                    [...links].map(async (link: string) => {
                      await new Promise((resolve) => {
                        setTimeout(() => {
                          resolve(true)
                        }, 1000)
                      })
                      let news: string | undefined = await downloadFileNews(
                        link
                      )
                      if (!news) {
                        return link
                      } else {
                        let originalLinkArray = news.split(
                          '<meta property="og:url" content="/ru/'
                        )
                        if (originalLinkArray.length < 2) return link
                        let ogLink = originalLinkArray[1].split('"/>')
                        if (ogLink.length < 1) return link
                        return 'https://tv8.md/' + ogLink[0]
                      }
                    })
                  )
                )
                merged = new Set([...merged, ...links])
              }
              console.log('done tv8.md')
            }
            if (uri.includes('protv.md')) {
              let links = await protvParse(siteContent)
              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done protv.md')
            }
            if (uri.includes('jurnal.md')) {
              let links = await jurnaltvParse(siteContent)
              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done jurnal.md')
            }
            if (uri.includes('unimedia.info')) {
              let links = await unimediaParse(siteContent)
              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done unimedia.info')
            }
            if (uri.includes('agora.md')) {
              let links = await agoraParse(siteContent)
              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done agora.md')
            }
            if (uri.includes('moldova.europalibera.org')) {
              let links = await europaliberaParse(siteContent)
              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done moldova.europalibera.org')
            }
            if (uri.includes('zdg.md')) {
              let links = await zdgParse(siteContent)

              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done zdg.md')
            }
            if (uri.includes('moldova.org')) {
              let links = await moldovaorgParse(siteContent)

              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done moldova.org')
            }
            if (uri.includes('publika.md')) {
              let links = await publicaParse(siteContent)

              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done publika.md')
            }
            if (uri.includes('stiri.md')) {
              let links = await stirimdParse(siteContent)

              if (links) {
                merged = new Set([...merged, ...links])
              }
              console.log('done stiri.md')
            }

            ;[...processedDict].forEach((link) => {
              merged.delete(link)
            })

            bot.dbuser.toprocess = [...merged] // maybe escape for sanitizing? .map((link:string) => link)
            bot.dbuser.markModified('toprocess')
            bot.dbuser.save()
          }
          done()
        },
      })
      c.on('drain', async () => {
        sleeping = true
        console.log('Drained sleep for a hour...')
        setTimeout(() => {
          crawlData(bot, undefined)
        }, timeout)
        // sendToProcess(bot)
        //processed
      })
      c.queue('https://tv8.md/sitemap.xml')
      c.queue('https://protv.md/sitemap.xml')
      c.queue('https://www.jurnal.md/ro/sitemap.xml')
      c.queue('https://unimedia.info/ro/sitemap.xml')
      c.queue('https://agora.md/sitemap-news.xml')
      c.queue('https://moldova.europalibera.org/sitemap.xml')
      c.queue('https://www.zdg.md/sitemap.xml')
      c.queue('https://www.moldova.org/sitemap_index.xml')
      c.queue('https://www.publika.md/sitemap_news.xml')
      c.queue('https://stiri.md/rss/news')
    }
  }
  return next ? next() : undefined
}

export async function sendToProcess(bot: Context) {
  if (sleeping) {
    try {
      let fileContent = bot.dbuser.toprocess
      let processedContent = bot.dbuser.processed

      let fileDict: Set<string> = new Set(fileContent)
      let fileDictToProcess = fileDict
      let fileDictProcessed: Set<string> = new Set()
      let done = 0
      for (let link of fileDict) {
        ++done
        try {
          await bot.api.sendMessage(env.ADMIN_ID, link)

          await new Promise((resolve) => setTimeout(resolve, 500))
          fileDictToProcess.delete(link)
          fileDictProcessed.add(link)
        } catch (e) {
          console.log(e)
        }
        if (done == 50) {
          break
        }
      }

      bot.dbuser.toprocess = [...fileDictToProcess]

      fileDictProcessed = new Set([...fileDictProcessed, ...processedContent])
      bot.dbuser.processed = [...fileDictProcessed]
      bot.dbuser.markModified('toprocess')
      bot.dbuser.markModified('processed')
      bot.dbuser.save()
      // if(fileDictToProcess.size>0){
      //   setTimeout(() => {
      //     sendToProcess(bot)
      //   }, 1000*60)
      // }
    } catch (e) {
      console.log(e)
    }
  }
}

let first = true
export async function updateProcessed(bot: Context, next: NextFunction) {
  if (first) {
    if (bot.from?.id.toString() == env.ADMIN_ID) {
      first = false
      if (!bot.dbuser.updated) {
        try {
          let processed = JSON.parse(readFileSync('./processed.txt').toString())
          bot.dbuser.processed = [
            ...new Set<string>([...bot.dbuser.processed, ...processed]),
          ]
          bot.dbuser.updated = true
          bot.dbuser.markModified('processed')
          bot.dbuser.save()
        } catch (e) {
          console.log(e)
        }
      }
    }
  }
  return next()
}
