'use strict';
const directorySources = {
  dosen: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vScik3DKnPzr0YNrbbDmhPDr5ee_3f4JFN1jRxDfZwdHxgRynvqEjvK9MRklX7F5o-OnX_FdB-Ey-7v/pub?gid=1113264425&single=true&output=csv',
  plp: 'assets/data/plp.json'
};
async function loadDirectoryData(kind, signal) {
  const response = await fetch(directorySources[kind], { cache: 'no-cache', signal });
  if (!response.ok) throw Error('Data tidak tersedia.');
  return kind === 'plp' ? response.json() : parseLecturerCsv(await response.text());
}
