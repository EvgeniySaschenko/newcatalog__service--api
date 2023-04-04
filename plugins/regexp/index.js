/* eslint-disable no-useless-escape */
module.exports = {
  $regexp: {
    colorHex: /#([a-f0-9]{6})/,
    translations: [
      /(?<=\$t\(\")(.*?)(?=\"\))/,
      /(?<=\$t\(')(.*?)(?='\))/,
      /(?<=\$t\(`)(.*?)(?=`\))/,
    ],
  },
};
