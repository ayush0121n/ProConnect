/**
 * Standard success response
 */
exports.sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Standard error response
 */
exports.sendError = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error: message });
};

/**
 * Paginated response
 */
exports.sendPaginated = (res, data, pagination, message = 'Success') => {
  return res.json({ success: true, message, data, pagination });
};
