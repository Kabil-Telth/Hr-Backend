require('http')
  .createServer((req, res) => {
    res.end('NODE OK');
  })
  .listen(8000, () => {
    console.log('✅ RAW NODE SERVER ON 8000');
  });
