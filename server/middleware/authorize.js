module.exports = function (roles = []) {
  // roles param może być pojedynczą rolą lub tablicą ról
  if (typeof roles === "string") {
    roles = [roles];
  }

  return [
    (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ msg: "Brak autoryzacji" });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Brak uprawnień" });
      }

      next();
    },
  ];
};
