import {
  accidentFilter,
  automobilFilter,
  linkCleaner,
  transportFilter1,
  transportFilter2,
  GZIPlinkCleaner,
  XMLlinkCleaner,
} from '@/helpers/parsers/reg'

const urllib = require('urllib')
const targetDir = require('os').tmpdir()
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { v4 } from 'uuid'

async function downloadFile(url: string) {
  try {
    let result = await urllib.request(url, {
      followRedirect: true,
    })
    if (result && result.res.status == 200 && result.data) {
      let fileName = targetDir + '/' + v4() + '.xml'
      writeFileSync(fileName, result.data)
      return fileName
    }
  } catch (e) {
    console.error(e)
  }
  return undefined
}

export default async function moldovaorgParse(xmlbody: string) {
  let merged = new Set<string>()

  xmlbody = xmlbody.replaceAll('<loc>', '\r\n')
  xmlbody = xmlbody.replaceAll('\r\n\r\n', '\r\n')

  const cleanedBody = xmlbody.replaceAll(XMLlinkCleaner, '$1')

  const regexpLinks = cleanedBody.match(XMLlinkCleaner)
  let fileArray: string[] = []
  console.log(`moldovaorg found ${regexpLinks?.length} links`)
  const allLinks = regexpLinks?.filter(
    (link) =>
      link.includes('post-sitemap') &&
      parseInt(link.replace(/[^0-9]/g, '')) > 60
  )
  if (allLinks) {
    for (let link of allLinks) {
      console.log(`moldovaorg downloading: ${link}`)
      let result = await downloadFile(link)
      if (result) {
        fileArray.push(result)
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    let countDown = fileArray.length
    for (let file of fileArray) {
      console.log(`moldovaorg processing left: ${countDown}`)
      --countDown
      let content = readFileSync(file)
      let parsed = moldovaorgParseChild(content.toString())
      merged = new Set([...merged, ...parsed])
      unlinkSync(file)
    }
  }
  return merged
}

export function moldovaorgParseChild(xmlbody: string) {
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
