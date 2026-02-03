const getSiteFromHost = (host) => {
  if (!host) return null;

  host = host.toLowerCase();

  // ✅ Production domains
  if (host.includes('mytelth.com')) return 'mytelth';
  if (host.includes('telth.org')) return 'telth';
  if (host.includes('telth.care')) return 'telthcare';
  if (host.includes('natlife')) return 'natlife';

  // ✅ Development hosts
  if (host.includes('localhost')) return 'mytelth';
  if (host.match(/^192\.168\./)) return 'mytelth';

  return null;
};

module.exports = { getSiteFromHost };
