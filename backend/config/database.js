const mongoose = require('mongoose');
exports.connectDatabase = () => {
    mongoose
      .connect(process.env.MONGO_DB_URL)
      .then((con) => console.log(`Database Connected: `))
      .catch((err) => console.log(err));
  };

