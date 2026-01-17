export default defineContentScript({
  // TODO: load url from config/options
  matches: ['*://*.docs.google.com/spreadsheets*'],
  main() {
    console.log('Hello content.');
  },
});
