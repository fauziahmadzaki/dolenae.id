process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.DOCS_ENABLED = "false";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
