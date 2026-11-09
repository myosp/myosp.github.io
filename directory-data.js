'use strict';
const directorySources = {
  dosen: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vScik3DKnPzr0YNrbbDmhPDr5ee_3f4JFN1jRxDfZwdHxgRynvqEjvK9MRklX7F5o-OnX_FdB-Ey-7v/pub?gid=1113264425&single=true&output=csv',
  plp: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSK5tG4G0v7bEM4QHN8Y2LPgnm5YTJa01Fo_EkHcgk-zZiNErQyrDwumWKjT7f59OSYV-vTOeeYuqsR/pub?gid=974922281&single=true&output=csv'
};
async function loadDirectoryData(kind, signal) {
  const response = await fetch(directorySources[kind], { cache: 'no-cache', signal });
  if (!response.ok) throw Error('Data tidak tersedia.');
  return parseLecturerCsv(await response.text(), kind === 'plp');
}
