
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV; 
const arcjetMode = isDev ? "DRY_RUN" : (process.env.ARCJET_MODE === "LIVE" ? "LIVE" : "DRY_RUN");

if (!arcjetKey) {
    throw new Error("ARCJET_KEY environment variable is not set");
}

if (isDev) {
    console.log("Arcjet running in development mode (DRY_RUN). IP warnings are expected.");
}

export const httpArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
            slidingWindow({ mode: arcjetMode, interval: '10s', max: 50 })
        ]
    }) : null;


export const wsArcjet = arcjetKey ?
    arcjet({
        key: arcjetKey,
        rules: [
            shield({ mode: arcjetMode }),
            detectBot({ mode: arcjetMode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"] }),
            slidingWindow({ mode: arcjetMode, interval: '2s', max: 5 })
        ]
    }) : null;

export function securityMiddleware() {
    return async (req, res, next) => {
        if (!httpArcjet) return next();

        try {
            if (isDev) {
                // Ensure a stable IP for Arcjet in development
                req.headers["x-forwarded-for"] =
                    req.headers["x-forwarded-for"] ||
                    req.socket?.remoteAddress ||
                    "127.0.0.1";
            }

            // Normalize IP for Arcjet
            if (!req.ip) {
                req.ip =
                    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
                    req.socket?.remoteAddress ||
                    "127.0.0.1";
            }

            const decision = await httpArcjet.protect(req);

            if (decision.isDenied()) {
                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: "too many requests- rate limit exceeded" });
                }

                return res.status(403).json({ error: "Access denied by Arcjet security middleware" });
            }


        } catch (error) {
            console.error("Arcjet Middleware Error:", error);
            return next();
        }

        next();
    }
}