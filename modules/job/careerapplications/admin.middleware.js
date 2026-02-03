const isAdmin = (req, res, next) => {
  if (req.user?.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: 'Only admin can create job posts'
    });
  }

  next();
};

module.exports = isAdmin;
