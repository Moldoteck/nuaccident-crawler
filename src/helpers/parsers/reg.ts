const relinkCleaner =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)).*/g
const reGZIPlinkCleaner =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)gz).*/g
const reXMLlinkCleaner =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)xml).*/g
const reaccidentFilter =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)accident([-a-zA-Z0-9()@:%_+.~#?&//=]*)).*/g
const reautomobilFilter =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)automobil([-a-zA-Z0-9()@:%_+.~#?&//=]*)).*/g
const retransportFilter1 =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)transport([-a-zA-Z0-9()@:%_+.~#?&//=]*)restabilit([-a-zA-Z0-9()@:%_+.~#?&//=]*)).*/g
const retransportFilter2 =
  /.*(https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)restabilit([-a-zA-Z0-9()@:%_+.~#?&//=]*)transport([-a-zA-Z0-9()@:%_+.~#?&//=]*)).*/g

export const linkCleaner = new RegExp(relinkCleaner)
export const GZIPlinkCleaner = new RegExp(reGZIPlinkCleaner)
export const XMLlinkCleaner = new RegExp(reXMLlinkCleaner)
export const accidentFilter = new RegExp(reaccidentFilter)
export const automobilFilter = new RegExp(reautomobilFilter)
export const transportFilter1 = new RegExp(retransportFilter1)
export const transportFilter2 = new RegExp(retransportFilter2)
