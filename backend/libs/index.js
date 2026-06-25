import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");

export const hashPassword = async (userValue) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(userValue, salt);
};

export const comparePassword = async (userPassword, password) => {
  return bcrypt.compare(userPassword, password);
};

export const createJWT = async (id) => {
  return new SignJWT({ userId: id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
};

export const verifyJWT = async (token) => {
  const { payload } = await jwtVerify(token, getSecret());
  return payload;
};

export function getMonthName(index) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return months[index];
}
