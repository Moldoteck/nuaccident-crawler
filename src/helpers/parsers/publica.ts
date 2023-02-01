import {
  accidentFilter,
  automobilFilter,
  linkCleaner,
  transportFilter1,
  transportFilter2,
} from '@/helpers/parsers/reg'

export default function publicaParse(xmlbody: string) {
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
