export const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message })
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({ error: "Duplicate field value" })
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
}
