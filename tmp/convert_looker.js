const raw = process.argv[2] || 'https://lookerstudio.google.com/reporting/7ba3fc6d-c72a-4af5-9cbe-fc70dbb83a1b/page/wvwYF';
const m = raw.match(/reporting\/([^/?#]+)(?:\/page\/([^/?#]+))?/i);
let embed = '';
if (m) {
  const reportId = m[1];
  const pageId = m[2];
  embed = `https://lookerstudio.google.com/embed/reporting/${reportId}` + (pageId ? `/page/${pageId}` : '');
} else {
  if (raw.includes('/reporting/')) embed = raw.replace('/reporting/', '/embed/reporting/');
  else if (raw.includes('/embed/reporting/')) embed = raw;
  else embed = 'INVALID';
}
console.log(embed);
