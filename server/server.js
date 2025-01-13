const app = require("./app");
const connectDB = require("./config/db");

// Połącz się z bazą
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
