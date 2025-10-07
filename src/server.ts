import { buildApp } from './app';

const PORT = Number(process.env.PORT ?? 8080);

buildApp()
  .listen({ port: PORT, host: '0.0.0.0' })
  .then(() => console.log(`Ledger API running on http://localhost:${PORT}`))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
