const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const queries = require("../queries/auth_queries");
const pool = require("../db").promise;

function getDateTimeString() {
  const today = new Date();
  const todayLocaleDateString = today.toLocaleString();
  return todayLocaleDateString;
}

async function loginUser(emailID, password) {
  try {
    const [users] = await pool.query(queries.verifyUser, [emailID]);
    if (users.length === 0) {
      throw { status: 401, message: "User not found" };
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: "Incorrect Password!" };
    }
    const accessToken = jwt.sign(
                                  {
                                    userId: user.emp_id,
                                    roleId: user.role_id || 1, // Default to admin if role_id is null
                                    companyId: user.company_id,
                                    emailId: emailID,
                                    currDate: getDateTimeString(),
                                  },
                                  process.env.ACCESS_TOKEN_SECRET,
                                  { expiresIn: "1d" }
                                );
    const refreshToken = jwt.sign(
                                  {
                                    userId: user.emp_id,
                                    roleId: user.role_id || 1, // Default to admin if role_id is null
                                    companyId: user.company_id,
                                    emailId: emailID,
                                    currDate: getDateTimeString(),
                                  },
                                  process.env.REFRESH_TOKEN_SECRET,
                                  { expiresIn: "7d" }
                                );

    const [resp] = await pool.execute(queries.updateRefreshToken, [
      user.emp_id,
      refreshToken,
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user_name: user.first_name,
      role_id: user.role_id || 1, // Default to admin if role_id is null
      company_id: user.company_id,
    };
  } catch (error) {
    throw { status: error.status, message: error.message };
  }
}

async function logoutUser(refreshToken) {
  try {
    await pool.execute(queries.deleteRefreshToken, [refreshToken]);
  } catch (error) {
    throw new Error("Token Deletion Failed");
  }
}

async function refreshUserToken(refreshToken) {
  try {
    const [tokens] = await pool.execute(queries.getRefreshToken, [
      refreshToken,
    ]);
    if (tokens.length === 0) throw new Error("Invalid refresh token");
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            await logoutUser(refreshToken);
            throw {
              status: 403,
              message: "Refresh token expired, please log in again",
            };
          }
          throw { status: 403, message: "Invalid refresh token" };
        }

        const newAccessToken = jwt.sign(
          {
            userId: decoded.userId,
            roleId: decoded.roleId,
            emailId: decoded.emailId,
            currDate: getDateTimeString(),
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        res.json({ accessToken: newAccessToken, ok: true });
      }
    );
  } catch (error) {
    throw { status: 500, message: "Token Deletion Failed" };
  }
}

module.exports = { loginUser, logoutUser, refreshUserToken };
