import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 1000, //time windo is 1 minute
  max: 10,
  keyGenerator: (req) => {
    return req.headers["x-api-key"] || ipKeyGenerator(req);
  },
  standardHeaders: true,
  legacyHeaders: false
});
