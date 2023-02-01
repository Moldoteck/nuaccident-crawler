import {
  accidentFilter,
  automobilFilter,
  linkCleaner,
  transportFilter1,
  transportFilter2,
  GZIPlinkCleaner,
} from '@/helpers/parsers/reg'

const urllib = require('urllib')
const targetDir = require('os').tmpdir()
import { readFileSync, unlinkSync, createWriteStream } from 'fs'
import { v4 } from 'uuid'
import { gzip } from 'compressing'

async function createTheFile(content: string, tempPath: string) {
  return new Promise<void>((resolve) => {
    let b = createWriteStream(tempPath)

    new gzip.UncompressStream({
      source: content,
    })
      .on('error', (err) => {
        console.error(err)
        resolve()
      })
      .pipe(b)
      .on('error', (err) => {
        console.error(err)
        resolve()
      })
    b.on('finish', () => {
      console.log(`done europalibera: ${tempPath}`)
      resolve()
    })
    b.on('error', (err) => {
      console.error(err)
      resolve()
      resolve
    })
  })
}

async function downloadFile(url: string) {
  try {
    let result = await urllib.request(url, {
      followRedirect: true,
    })
    if (result && result.res.status == 200 && result.data) {
      let fileName = targetDir + '/' + v4() + '.xml'
      await createTheFile(result.data, fileName)
      return fileName
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
}

export default async function europaliberaParse(xmlbody: string) {
  let merged = new Set<string>()

  xmlbody = xmlbody.replaceAll('<loc>', '\r\n')
  xmlbody = xmlbody.replaceAll('\r\n\r\n', '\r\n')

  const cleanedBody = xmlbody.replaceAll(GZIPlinkCleaner, '$1')

  const allLinks = cleanedBody.match(GZIPlinkCleaner)
  let fileArray: string[] = []
  if (allLinks) {
    for (let link of allLinks) {
      let result = await downloadFile(link)
      if (result) {
        fileArray.push(result)
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    let countDown = fileArray.length
    for (let file of fileArray) {
      console.log(`europalibera processing left: ${countDown}`)
      --countDown
      let content = readFileSync(file)
      let parsed = europaliberaParseChild(content.toString())
      merged = new Set([...merged, ...parsed])
      unlinkSync(file)
    }
  }
  return merged
}

export function europaliberaParseChild(xmlbody: string) {
  xmlbody = xmlbody.replaceAll('<loc>', '\r\n')
  xmlbody = xmlbody.replaceAll('\r\n\r\n', '\r\n')

  const cleanedBody = xmlbody.replaceAll(linkCleaner, '$1')
  const accident = cleanedBody.match(accidentFilter)
  const automobil = cleanedBody.match(automobilFilter)
  const transport1 = cleanedBody.match(transportFilter1)
  const transport2 = cleanedBody.match(transportFilter2)
  let merged = new Set<string>()
  if (accident) {
    merged = new Set([...merged, ...accident])
  }
  if (automobil) {
    merged = new Set([...merged, ...automobil])
  }
  if (transport1) {
    merged = new Set([...merged, ...transport1])
  }
  if (transport2) {
    merged = new Set([...merged, ...transport2])
  }
  return merged
}
