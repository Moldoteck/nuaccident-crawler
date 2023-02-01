import Context from '@/models/Context'
import env from '@/helpers/env'
import { Octokit } from '@octokit/rest'
import he = require('he')
const needle = require('needle')
const urllib = require('urllib')
let previousContent = ''

const octokit = new Octokit({
  auth: env.GHTOKEN,
})
export type Entry = {
  date: string
  title: string
  link: string
}

function transformMonth(month: string) {
  month = month.toLowerCase()
  switch (month) {
    case 'ianuarie':
      return '01'
    case 'februarie':
      return '02'
    case 'martie':
      return '03'
    case 'aprilie':
      return '04'
    case 'mai':
      return '05'
    case 'iunie':
      return '06'
    case 'iulie':
      return '07'
    case 'august':
      return '08'
    case 'septembrie':
      return '09'
    case 'octombrie':
      return '10'
    case 'noiembrie':
      return '11'
    case 'decembrie':
      return '12'
  }
  return '00'
}

async function downloadFile(url: string) {
  try {
    let result = await urllib.request(url, {
      followRedirect: true,
    })
    if (result && result.res.status == 200 && result.data) {
      let array = JSON.parse(result.data) as Entry[]
      return array
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
}

export async function downloadFileNews(url: string) {
  try {
    let result = await needle('get', url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36',
      },
      follow_max: 5,
    })
    if (result && result.body) {
      // result.body = ''
      // console.log(result)
      return result.body
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
}

export default async function handleReply(ctx: Context) {
  if (
    ctx.msg &&
    ctx.from?.id.toString() == env.ADMIN_ID &&
    ctx.msg.reply_to_message
  ) {
    let link = ctx.msg.reply_to_message.text
    if (link) {
      // let result = await needle('get', link, { follow_max: 5 })
      try {
        let res = await octokit.request(
          'GET /repos/Moldoteck/nuaccident-frontend/contents/src/linkContent.json',
          {
            owner: 'Moldoteck',
            repo: 'nuaccident-frontend',
            path: 'src/linkContent.json',
          }
        )
        if (res.status != 200) {
          ctx.reply('cant download file')
          return
        }
        if (!res.data.sha || !res.data.download_url) {
          return
        }
        let sha: string = res.data.sha
        let download_url: string = res.data.download_url
        console.log(sha)
        console.log(download_url)
        let file =
          previousContent == ''
            ? await downloadFile(download_url)
            : (JSON.parse(previousContent) as Entry[])
        if (!file) {
          ctx.reply('cant download file')
          return
        }

        let news: string | undefined = await downloadFileNews(link)
        if (!news) {
          ctx.reply('cant download file')
          return
        }
        let obj: Entry = {
          date: '2021-09-01T00:00:00.000Z',
          title: 'test',
          link: link,
        }
        if (link.includes('tv8.md')) {
          //month and day are reversed on the site
          let dt = news.split('"query":{"year":"')[1].split('","slug"')[0]
          obj.date =
            dt.slice(0, 4) +
            '-' +
            dt.split('"day":"')[1].slice(0, 2) +
            '-' +
            dt.split('"month":"')[1].slice(0, 2)
          obj.title = news.split('<title>')[1].split('</title>')[0]
        }
        if (link.includes('protv.md')) {
          let dt = news.split('Publicat:<b>')[1].slice(0, 10)
          obj.date =
            dt.slice(6, 10) + '-' + dt.slice(3, 5) + '-' + dt.slice(0, 2)
          obj.title = news.split('<title>')[1].split('</title>')[0]
        }
        if (link.includes('jurnal.md')) {
          obj.date = news.split('"datePublished": "')[1].slice(0, 10)
          obj.title = news.split('<title>')[1].split('</title>')[0]
        }
        if (link.includes('unimedia.info')) {
          obj.date = news
            .split('name="article:published_time" content="')[1]
            .slice(0, 10)
          obj.title = news.split('"og:title" content="')[1].split('">')[0]
        }
        if (link.includes('agora.md')) {
          let dt = news
            .split('<i class="icon-calendar"></i>')[1]
            .split('\r\n')[0]
          let y = dt.split(' ')[2].slice(0, 4)
          let d = dt.split(' ')[0]
          let m = transformMonth(dt.split(' ')[1])
          obj.date = y + '-' + m + '-' + d
          obj.title = news.split('<title>')[1].split('</title>')[0]
        }
        if (link.includes('moldova.europalibera.org')) {
          obj.date = news.split('"datePublished":"')[1].slice(0, 10)
          obj.title = news.split('<title>')[1].split('</title>')[0]
          obj.title = he.decode(obj.title)
        }
        if (link.includes('zdg.md')) {
          obj.date = news
            .split('<meta property="article:published_time" content="')[1]
            .slice(0, 10)
          obj.title = news
            .split('<meta property="og:title" content="')[1]
            .split('"/>')[0]
        }
        if (link.includes('moldova.org')) {
          obj.date = news.split('"datePublished":"')[1].slice(0, 10)
          obj.title = news.split('<title>')[1].split('</title>')[0]
        }
        if (link.includes('publika.md')) {
          let arr = news.split('"datePublished":"')
          if (!arr || arr.length < 2) {
            obj.date = news.split('"datePublished": "')[1].slice(0, 10)
          } else {
            obj.date = arr[1].slice(0, 10)
          }
          obj.title = news
            .split('meta property="og:title" content="')[1]
            .split('"/>')[0]
          obj.title = he.decode(obj.title)
        }
        if (link.includes('stiri.md')) {
          obj.date = news.split('"datePublished":"')[1].slice(0, 10)
          obj.title = news
            .split('<title itemProp="title">')[1]
            .split(' - Stiri.md</title>')[0]
        }
        // console.log(obj)
        new Date(obj.date)
        // console.log(file)
        file.push(obj)
        // console.log(file)
        // avoid duplicates
        file.sort((a, b) => {
          return Date.parse(b.date) - Date.parse(a.date)
        })
        let allLinks = file.map((x) => x.link)
        let newFile: Entry[] = []
        let linkSet = new Set<string>()
        for (let i = 0; i < allLinks.length; i++) {
          if (!linkSet.has(allLinks[i])) {
            linkSet.add(allLinks[i])
            newFile.push(file[i])
          }
        }
        file = newFile
        // console.log('\n')
        let uploadResult = await octokit.request(
          'PUT /repos/Moldoteck/nuaccident-frontend/contents/src/linkContent.json',
          {
            owner: 'Moldoteck',
            repo: 'nuaccident-frontend',
            path: 'src/linkContent.json',
            message: 'A new entry',
            committer: {
              name: 'Cristian Padureac',
              email: 'cpadureac@google.com',
            },
            content: Buffer.from(JSON.stringify(file, null, 2)).toString(
              'base64'
            ),
            sha: sha,
          }
        )
        if (!uploadResult?.data?.content?.sha) {
          console.log('no sha upload')
          return
        }
        previousContent = JSON.stringify(file, null, 2)
        ctx.reply('Done').catch(console.error)
        console.log('done for ' + link)
      } catch (e) {
        ctx.reply('cant parse date')
        return
      }
    }
  } else {
    ctx.reply('Something wrong').catch(console.error)
  }
}
