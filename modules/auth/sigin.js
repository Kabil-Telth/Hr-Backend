const User = require('../auth/user.model');
const {
  generateAccessToken,
  generateRefreshToken
} = require('../../utils/jwt');

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const TelthaccessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken; 
    await user.save();
      console.log("Signin successful for user:", user._id);
    res.json({
      TelthaccessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = signin;
