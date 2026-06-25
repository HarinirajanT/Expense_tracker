import { verifyJWT } from "../libs/index.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "auth_failed", message: "Authentication failed" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyJWT(token);
    req.body.user = { userId: payload.userId };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ status: "auth_failed", message: "Authentication failed" });
  }
};

export default authMiddleware;
