const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    console.log(err)
    if (err instanceof ZodError) {
      return res.status(400).json({
        msg: "Validation Error",
        errors: err.issues.map(e => ({
          field: e.path || 'body',
          message: e.message,
        })),
      });
    }

    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = validate;
