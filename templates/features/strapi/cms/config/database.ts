export default ({
  env,
}: {
  env: (key: string, fallback?: string) => string;
}) => ({
  connection: {
    client: env("DATABASE_CLIENT", "postgres"),
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      port: Number(env("DATABASE_PORT", "5432")),
      database: env("DATABASE_NAME", "strapi"),
      user: env("DATABASE_USERNAME", "strapi"),
      password: env("DATABASE_PASSWORD"),
      ssl: env("DATABASE_SSL", "false") === "true",
    },
    pool: { min: 2, max: 10 },
    acquireConnectionTimeout: 60000,
  },
});
