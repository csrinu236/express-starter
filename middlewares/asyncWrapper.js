const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next); // next will not do much role here as this controller function, end of api routes function
    } catch (error) {
      next(error);
    }
  };
};
