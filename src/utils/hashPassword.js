import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  return hash;
};

// When there is only a single export from a module, prefer using default export over named export.
export default hashPassword;
